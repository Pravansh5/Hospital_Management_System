const { google } = require("googleapis");
const ical = require("ical-generator");
const path = require("path");
const fs = require("fs");
const AppointmentModel = require("../models/appointments.model");
const User = require("../models/user.model");
const logger = require("../utils/logger");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = path.join(__dirname, "../config/token.json");
const CREDENTIALS_PATH = path.join(__dirname, "../config/credentials.json");

// Calendar provider configurations
const CALENDAR_PROVIDERS = {
  google: "google",
  outlook: "outlook",
  apple: "apple",
  ical: "ical",
};

function authorizeGoogle() {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
      oAuth2Client.setCredentials(token);
    } else {
      logger.warn(
        "No Google Calendar token found. Google Calendar features will be disabled."
      );
    }

    return oAuth2Client;
  } catch (error) {
    logger.error("Error authorizing Google Calendar:", error);
    return null;
  }
}

let googleCalendar = null;

function getGoogleCalendarClient() {
  if (!googleCalendar) {
    const auth = authorizeGoogle();
    if (auth) {
      googleCalendar = google.calendar({ version: "v3", auth });
    }
  }
  return googleCalendar;
}

// Create calendar event for appointment
async function createAppointmentEvent(appointmentId, provider = "google") {
  try {
    const appointment = await AppointmentModel.findById(appointmentId)
      .populate("patient", "name email")
      .populate("doctor", "name email");

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const eventData = {
      title: `Appointment with ${appointment.doctor.name}`,
      description: `Medical appointment - ${
        appointment.appointmentType
      }\nReason: ${appointment.reason || "Not specified"}\nPatient: ${
        appointment.patient.name
      }`,
      startTime: new Date(appointment.date),
      endTime: new Date(
        appointment.date.getTime() + (appointment.duration || 30) * 60 * 1000
      ),
      location: appointment.location || "Clinic",
      attendees: [
        { email: appointment.patient.email, name: appointment.patient.name },
        { email: appointment.doctor.email, name: appointment.doctor.name },
      ],
      appointmentId,
    };

    switch (provider) {
      case CALENDAR_PROVIDERS.google:
        return await createGoogleEvent(eventData);

      case CALENDAR_PROVIDERS.outlook:
        return await createOutlookEvent(eventData);

      case CALENDAR_PROVIDERS.apple:
        return await createAppleEvent(eventData);

      case CALENDAR_PROVIDERS.ical:
        return await createICalEvent(eventData);

      default:
        throw new Error(`Unsupported calendar provider: ${provider}`);
    }
  } catch (error) {
    logger.error(
      `Error creating calendar event for appointment ${appointmentId}:`,
      error
    );
    throw error;
  }
}

// Google Calendar implementation
async function createGoogleEvent(eventData) {
  const calendar = getGoogleCalendarClient();
  if (!calendar) {
    throw new Error("Google Calendar not configured");
  }

  const event = {
    summary: eventData.title,
    description: eventData.description,
    location: eventData.location,
    start: {
      dateTime: eventData.startTime.toISOString(),
      timeZone: process.env.TIMEZONE || "UTC",
    },
    end: {
      dateTime: eventData.endTime.toISOString(),
      timeZone: process.env.TIMEZONE || "UTC",
    },
    attendees: eventData.attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 }, // 1 day before
        { method: "popup", minutes: 30 }, // 30 minutes before
      ],
    },
    extendedProperties: {
      private: {
        appointmentId: eventData.appointmentId,
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  return {
    provider: "google",
    eventId: response.data.id,
    htmlLink: response.data.htmlLink,
    data: response.data,
  };
}

// Outlook Calendar implementation (placeholder)
async function createOutlookEvent(eventData) {
  // Implementation for Microsoft Graph API would go here
  // For now, return a placeholder
  logger.info("Outlook calendar integration not yet implemented");
  return {
    provider: "outlook",
    eventId: `outlook_${Date.now()}`,
    message: "Outlook integration not implemented yet",
  };
}

// Apple Calendar implementation (placeholder)
async function createAppleEvent(eventData) {
  // Apple Calendar integration would require iCloud API
  logger.info("Apple calendar integration not yet implemented");
  return {
    provider: "apple",
    eventId: `apple_${Date.now()}`,
    message: "Apple Calendar integration not implemented yet",
  };
}

// iCal file generation
async function createICalEvent(eventData) {
  const calendar = ical({
    name: "Medical Appointments",
    timezone: process.env.TIMEZONE || "UTC",
  });

  calendar.createEvent({
    summary: eventData.title,
    description: eventData.description,
    location: eventData.location,
    start: eventData.startTime,
    end: eventData.endTime,
    attendees: eventData.attendees.map((attendee) => ({
      email: attendee.email,
      name: attendee.name,
    })),
  });

  const icalString = calendar.toString();

  return {
    provider: "ical",
    eventId: `ical_${Date.now()}`,
    icalData: icalString,
    filename: `appointment_${eventData.appointmentId}.ics`,
  };
}

// Update calendar event
async function updateAppointmentEvent(appointmentId, provider = "google") {
  try {
    // First, find existing calendar events for this appointment
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment || !appointment.calendarEvents) {
      throw new Error("No calendar events found for this appointment");
    }

    const eventData = {
      title: `Updated: Appointment with ${appointment.doctor.name}`,
      description: `Updated medical appointment`,
      startTime: new Date(appointment.date),
      endTime: new Date(
        appointment.date.getTime() + (appointment.duration || 30) * 60 * 1000
      ),
      appointmentId,
    };

    const results = [];

    for (const calendarEvent of appointment.calendarEvents) {
      try {
        switch (calendarEvent.provider) {
          case CALENDAR_PROVIDERS.google:
            const result = await updateGoogleEvent(
              calendarEvent.eventId,
              eventData
            );
            results.push(result);
            break;
          default:
            logger.warn(
              `Update not supported for provider: ${calendarEvent.provider}`
            );
        }
      } catch (error) {
        logger.error(`Error updating ${calendarEvent.provider} event:`, error);
      }
    }

    return results;
  } catch (error) {
    logger.error(
      `Error updating calendar events for appointment ${appointmentId}:`,
      error
    );
    throw error;
  }
}

// Update Google Calendar event
async function updateGoogleEvent(eventId, eventData) {
  const calendar = getGoogleCalendarClient();
  if (!calendar) {
    throw new Error("Google Calendar not configured");
  }

  const event = {
    summary: eventData.title,
    description: eventData.description,
    start: {
      dateTime: eventData.startTime.toISOString(),
      timeZone: process.env.TIMEZONE || "UTC",
    },
    end: {
      dateTime: eventData.endTime.toISOString(),
      timeZone: process.env.TIMEZONE || "UTC",
    },
  };

  const response = await calendar.events.update({
    calendarId: "primary",
    eventId,
    resource: event,
  });

  return {
    provider: "google",
    eventId: response.data.id,
    htmlLink: response.data.htmlLink,
    data: response.data,
  };
}

// Delete calendar event
async function deleteAppointmentEvent(appointmentId, provider = "google") {
  try {
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment || !appointment.calendarEvents) {
      return { message: "No calendar events to delete" };
    }

    const results = [];

    for (const calendarEvent of appointment.calendarEvents) {
      try {
        switch (calendarEvent.provider) {
          case CALENDAR_PROVIDERS.google:
            await deleteGoogleEvent(calendarEvent.eventId);
            results.push({
              provider: "google",
              eventId: calendarEvent.eventId,
              deleted: true,
            });
            break;
          default:
            logger.warn(
              `Delete not supported for provider: ${calendarEvent.provider}`
            );
        }
      } catch (error) {
        logger.error(`Error deleting ${calendarEvent.provider} event:`, error);
        results.push({
          provider: calendarEvent.provider,
          eventId: calendarEvent.eventId,
          deleted: false,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    logger.error(
      `Error deleting calendar events for appointment ${appointmentId}:`,
      error
    );
    throw error;
  }
}

// Delete Google Calendar event
async function deleteGoogleEvent(eventId) {
  const calendar = getGoogleCalendarClient();
  if (!calendar) {
    throw new Error("Google Calendar not configured");
  }

  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  });
}

// Get calendar events
async function getCalendarEvents(provider = "google", timeMin = new Date()) {
  try {
    switch (provider) {
      case CALENDAR_PROVIDERS.google:
        return await getGoogleEvents(timeMin);

      default:
        throw new Error(
          `Provider ${provider} not supported for listing events`
        );
    }
  } catch (error) {
    logger.error(`Error fetching calendar events:`, error);
    throw error;
  }
}

// Get Google Calendar events
async function getGoogleEvents(timeMin) {
  const calendar = getGoogleCalendarClient();
  if (!calendar) {
    throw new Error("Google Calendar not configured");
  }

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: timeMin.toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: "startTime",
  });

  return response.data.items.map((event) => ({
    id: event.id,
    title: event.summary,
    description: event.description,
    start: event.start.dateTime,
    end: event.end.dateTime,
    location: event.location,
    htmlLink: event.htmlLink,
    appointmentId: event.extendedProperties?.private?.appointmentId,
  }));
}

// Sync appointment with calendar
async function syncAppointmentWithCalendar(
  appointmentId,
  providers = ["google"]
) {
  try {
    const results = [];

    for (const provider of providers) {
      try {
        const result = await createAppointmentEvent(appointmentId, provider);
        results.push(result);

        // Store calendar event reference in appointment
        await AppointmentModel.findByIdAndUpdate(appointmentId, {
          $push: {
            calendarEvents: {
              provider,
              eventId: result.eventId,
              htmlLink: result.htmlLink,
              syncedAt: new Date(),
            },
          },
        });
      } catch (error) {
        logger.error(`Failed to sync with ${provider}:`, error);
        results.push({ provider, error: error.message });
      }
    }

    return results;
  } catch (error) {
    logger.error(
      `Error syncing appointment ${appointmentId} with calendar:`,
      error
    );
    throw error;
  }
}

module.exports = {
  createAppointmentEvent,
  updateAppointmentEvent,
  deleteAppointmentEvent,
  getCalendarEvents,
  syncAppointmentWithCalendar,
  CALENDAR_PROVIDERS,
};
