const { Notification } = require("../models/notification.model");
const { sendNotification } = require("../services/emailService");
const User = require("../models/user.model");
const AppointmentModel = require("../models/appointments.model");
const { sendResponse } = require("../utils/responseHelper");
const logger = require("../utils/logger");

// Create and send notification
const createNotification = async (req, res) => {
  try {
    const {
      userId,
      appointmentId,
      type,
      channel = "in_app",
      title,
      message,
      scheduledFor,
      priority = "medium",
      metadata,
    } = req.body;

    const notification = new Notification({
      userId,
      appointmentId,
      type,
      channel,
      title,
      message,
      scheduledFor,
      priority,
      metadata,
    });

    await notification.save();

    // Send immediate notification if no scheduled time
    if (!scheduledFor) {
      const user = await User.findById(userId);
      if (user) {
        const recipient = channel === "email" ? user.email : user.phone;
        if (recipient) {
          const result = await sendNotification(
            channel,
            recipient,
            type,
            metadata
          );
          if (result.success) {
            notification.isSent = true;
            notification.sentAt = new Date();
            await notification.save();
          }
        }
      }
    }

    logger.info(`Notification created: ${type} for user ${userId}`);
    sendResponse(
      res,
      201,
      true,
      "Notification created successfully",
      notification
    );
  } catch (error) {
    logger.error("Error creating notification:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;
    const userId = req.user.id;

    const filter = { userId };
    if (isRead !== undefined) filter.isRead = isRead === "true";
    if (type) filter.type = type;

    const notifications = await Notification.find(filter)
      .populate("appointmentId", "date timeSlot status")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);

    sendResponse(res, 200, true, "Notifications retrieved successfully", {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
      },
    });
  } catch (error) {
    logger.error("Error fetching notifications:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendResponse(res, 404, false, "Notification not found");
    }

    sendResponse(res, 200, true, "Notification marked as read", notification);
  } catch (error) {
    logger.error("Error marking notification as read:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    sendResponse(
      res,
      200,
      true,
      `${result.modifiedCount} notifications marked as read`
    );
  } catch (error) {
    logger.error("Error marking all notifications as read:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Send appointment notification (internal function)
const sendAppointmentNotification = async (
  appointmentId,
  type,
  additionalData = {}
) => {
  try {
    const appointment = await AppointmentModel.findById(appointmentId)
      .populate("patient", "name email phone")
      .populate("doctor", "name email phone");

    if (!appointment) {
      logger.error(`Appointment ${appointmentId} not found for notification`);
      return;
    }

    const notificationData = {
      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
      date: appointment.date.toLocaleDateString(),
      time: `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`,
      appointmentType: appointment.appointmentType,
      location: appointment.location,
      meetingLink: appointment.meetingLink,
      ...additionalData,
    };

    // Create in-app notification for patient
    await createNotification(
      {
        body: {
          userId: appointment.patient._id,
          appointmentId: appointment._id,
          type,
          channel: "in_app",
          title: getNotificationTitle(type),
          message: getNotificationMessage(type, notificationData),
          metadata: notificationData,
        },
      },
      { status: () => ({ json: () => {} }) }
    ); // Mock response for internal call

    // Create in-app notification for doctor
    await createNotification(
      {
        body: {
          userId: appointment.doctor._id,
          appointmentId: appointment._id,
          type,
          channel: "in_app",
          title: getNotificationTitle(type, "doctor"),
          message: getNotificationMessage(type, notificationData, "doctor"),
          metadata: notificationData,
        },
      },
      { status: () => ({ json: () => {} }) }
    ); // Mock response for internal call

    // Send email notification to patient
    if (appointment.patient.email) {
      await sendNotification(
        "email",
        appointment.patient.email,
        type,
        notificationData
      );
    }

    // Send SMS notification to patient if phone exists
    if (appointment.patient.phone && process.env.TWILIO_ACCOUNT_SID) {
      await sendNotification(
        "sms",
        appointment.patient.phone,
        type,
        notificationData
      );
    }

    logger.info(
      `Appointment notifications sent for ${appointmentId}, type: ${type}`
    );
  } catch (error) {
    logger.error("Error sending appointment notification:", error);
  }
};

// Schedule reminder notifications
const scheduleAppointmentReminders = async (appointmentId) => {
  try {
    const appointment = await AppointmentModel.findById(appointmentId).populate(
      "patient",
      "name email phone"
    );

    if (!appointment) return;

    const appointmentDate = new Date(appointment.date);
    const reminderTimes = [
      { hours: 24, type: "appointment_reminder" }, // 1 day before
      { hours: 2, type: "appointment_reminder" }, // 2 hours before
    ];

    for (const reminder of reminderTimes) {
      const reminderDate = new Date(
        appointmentDate.getTime() - reminder.hours * 60 * 60 * 1000
      );

      if (reminderDate > new Date()) {
        await createNotification(
          {
            body: {
              userId: appointment.patient._id,
              appointmentId: appointment._id,
              type: reminder.type,
              channel: "in_app",
              title: "Appointment Reminder",
              message: `Your appointment with ${appointment.doctor.name} is in ${reminder.hours} hours`,
              scheduledFor: reminderDate,
              metadata: {
                patientName: appointment.patient.name,
                doctorName: appointment.doctor.name,
                date: appointment.date.toLocaleDateString(),
                time: `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`,
                appointmentType: appointment.appointmentType,
                location: appointment.location,
                meetingLink: appointment.meetingLink,
              },
            },
          },
          { status: () => ({ json: () => {} }) }
        ); // Mock response for internal call
      }
    }

    logger.info(
      `Reminder notifications scheduled for appointment ${appointmentId}`
    );
  } catch (error) {
    logger.error("Error scheduling appointment reminders:", error);
  }
};

// Helper functions
const getNotificationTitle = (type, recipient = "patient") => {
  const titles = {
    appointment_booked:
      recipient === "doctor" ? "New Appointment Booked" : "Appointment Booked",
    appointment_confirmed: "Appointment Confirmed",
    appointment_cancelled: "Appointment Cancelled",
    appointment_reminder: "Appointment Reminder",
    appointment_completed: "Appointment Completed",
  };
  return titles[type] || "Notification";
};

const getNotificationMessage = (type, data, recipient = "patient") => {
  const messages = {
    appointment_booked:
      recipient === "doctor"
        ? `New appointment booked with ${data.patientName} on ${data.date} at ${data.time}`
        : `Your appointment with ${data.doctorName} has been booked for ${data.date} at ${data.time}`,
    appointment_confirmed: `Your appointment with ${data.doctorName} on ${data.date} at ${data.time} has been confirmed`,
    appointment_cancelled: `Your appointment with ${data.doctorName} on ${data.date} at ${data.time} has been cancelled`,
    appointment_reminder: `Reminder: Your appointment with ${data.doctorName} is scheduled for ${data.date} at ${data.time}`,
    appointment_completed: `Your appointment with ${data.doctorName} has been completed`,
  };
  return messages[type] || "You have a new notification";
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendAppointmentNotification,
  scheduleAppointmentReminders,
};
