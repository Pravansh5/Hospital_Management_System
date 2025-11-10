const {
  createAppointmentEvent,
  updateAppointmentEvent,
  deleteAppointmentEvent,
  getCalendarEvents,
  syncAppointmentWithCalendar,
  CALENDAR_PROVIDERS,
} = require("../services/calendarService");
const AppointmentModel = require("../models/appointments.model");
const { sendResponse } = require("../utils/responseHelper");
const logger = require("../utils/logger");

// Sync appointment with calendar
const syncAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { providers = ["google"] } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if appointment exists and user has access
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return sendResponse(res, 404, false, "Appointment not found");
    }

    // Check permissions
    if (
      userRole !== "admin" &&
      appointment.patient.toString() !== userId &&
      appointment.doctor.toString() !== userId
    ) {
      return sendResponse(res, 403, false, "Access denied");
    }

    const results = await syncAppointmentWithCalendar(appointmentId, providers);

    logger.info(
      `Appointment ${appointmentId} synced with calendars: ${providers.join(
        ", "
      )}`
    );
    sendResponse(
      res,
      200,
      true,
      "Appointment synced with calendar successfully",
      { results }
    );
  } catch (error) {
    logger.error("Error syncing appointment with calendar:", error);
    sendResponse(res, 500, false, "Error syncing with calendar");
  }
};

// Create calendar event for appointment
const createEvent = async (req, res) => {
  try {
    const { appointmentId, provider = "google" } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if appointment exists and user has access
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return sendResponse(res, 404, false, "Appointment not found");
    }

    // Check permissions
    if (
      userRole !== "admin" &&
      appointment.patient.toString() !== userId &&
      appointment.doctor.toString() !== userId
    ) {
      return sendResponse(res, 403, false, "Access denied");
    }

    const result = await createAppointmentEvent(appointmentId, provider);

    // Store calendar event reference
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

    logger.info(
      `Calendar event created for appointment ${appointmentId} with provider ${provider}`
    );
    sendResponse(res, 201, true, "Calendar event created successfully", result);
  } catch (error) {
    logger.error("Error creating calendar event:", error);
    sendResponse(res, 500, false, "Error creating calendar event");
  }
};

// Update calendar event
const updateEvent = async (req, res) => {
  try {
    const { appointmentId, provider = "google" } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if appointment exists and user has access
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return sendResponse(res, 404, false, "Appointment not found");
    }

    // Check permissions
    if (
      userRole !== "admin" &&
      appointment.patient.toString() !== userId &&
      appointment.doctor.toString() !== userId
    ) {
      return sendResponse(res, 403, false, "Access denied");
    }

    const results = await updateAppointmentEvent(appointmentId, provider);

    logger.info(`Calendar events updated for appointment ${appointmentId}`);
    sendResponse(res, 200, true, "Calendar events updated successfully", {
      results,
    });
  } catch (error) {
    logger.error("Error updating calendar event:", error);
    sendResponse(res, 500, false, "Error updating calendar event");
  }
};

// Delete calendar event
const deleteEvent = async (req, res) => {
  try {
    const { appointmentId, provider = "google" } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if appointment exists and user has access
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return sendResponse(res, 404, false, "Appointment not found");
    }

    // Check permissions
    if (
      userRole !== "admin" &&
      appointment.patient.toString() !== userId &&
      appointment.doctor.toString() !== userId
    ) {
      return sendResponse(res, 403, false, "Access denied");
    }

    const results = await deleteAppointmentEvent(appointmentId, provider);

    // Remove calendar event references
    await AppointmentModel.findByIdAndUpdate(appointmentId, {
      $pull: {
        calendarEvents: { provider },
      },
    });

    logger.info(`Calendar events deleted for appointment ${appointmentId}`);
    sendResponse(res, 200, true, "Calendar events deleted successfully", {
      results,
    });
  } catch (error) {
    logger.error("Error deleting calendar event:", error);
    sendResponse(res, 500, false, "Error deleting calendar event");
  }
};

// Get calendar events
const getEvents = async (req, res) => {
  try {
    const { provider = "google", timeMin } = req.query;
    const userId = req.user.id;

    const timeMinDate = timeMin ? new Date(timeMin) : new Date();
    const events = await getCalendarEvents(provider, timeMinDate);

    // Filter events to only show those related to user's appointments
    const userAppointments = await AppointmentModel.find({
      $or: [{ patient: userId }, { doctor: userId }],
    }).select("_id");

    const appointmentIds = userAppointments.map((apt) => apt._id.toString());
    const filteredEvents = events.filter(
      (event) =>
        event.appointmentId && appointmentIds.includes(event.appointmentId)
    );

    sendResponse(res, 200, true, "Calendar events retrieved successfully", {
      events: filteredEvents,
      provider,
      timeMin: timeMinDate,
    });
  } catch (error) {
    logger.error("Error fetching calendar events:", error);
    sendResponse(res, 500, false, "Error fetching calendar events");
  }
};

// Get iCal file for appointment
const getICalFile = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if appointment exists and user has access
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return sendResponse(res, 404, false, "Appointment not found");
    }

    // Check permissions
    if (
      userRole !== "admin" &&
      appointment.patient.toString() !== userId &&
      appointment.doctor.toString() !== userId
    ) {
      return sendResponse(res, 403, false, "Access denied");
    }

    const result = await createAppointmentEvent(
      appointmentId,
      CALENDAR_PROVIDERS.ical
    );

    res.setHeader("Content-Type", "text/calendar");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`
    );
    res.send(result.icalData);
  } catch (error) {
    logger.error("Error generating iCal file:", error);
    sendResponse(res, 500, false, "Error generating calendar file");
  }
};

// Get supported calendar providers
const getProviders = async (req, res) => {
  sendResponse(res, 200, true, "Calendar providers retrieved successfully", {
    providers: Object.values(CALENDAR_PROVIDERS),
    descriptions: {
      google: "Google Calendar - Requires OAuth setup",
      outlook: "Microsoft Outlook - Coming soon",
      apple: "Apple Calendar - Coming soon",
      ical: "iCal file download - Always available",
    },
  });
};

module.exports = {
  syncAppointment,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getICalFile,
  getProviders,
};
