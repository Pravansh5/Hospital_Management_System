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
            logger.info(`${channel} notification sent successfully to ${recipient}`);
          } else {
            logger.error(`Failed to send ${channel} notification to ${recipient}: ${result.error}`);
          }
        } else {
          logger.warn(`No ${channel} recipient found for user ${userId}`);
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
    const patientNotification = new Notification({
      userId: appointment.patient._id,
      appointmentId: appointment._id,
      type,
      channel: "in_app",
      title: getNotificationTitle(type),
      message: getNotificationMessage(type, notificationData),
      metadata: notificationData,
    });
    await patientNotification.save();

    // Create in-app notification for doctor
    const doctorNotification = new Notification({
      userId: appointment.doctor._id,
      appointmentId: appointment._id,
      type,
      channel: "in_app",
      title: getNotificationTitle(type, "doctor"),
      message: getNotificationMessage(type, notificationData, "doctor"),
      metadata: notificationData,
    });
    await doctorNotification.save();

    // Send email notification to patient
    if (appointment.patient.email) {
      const emailResult = await sendNotification(
        "email",
        appointment.patient.email,
        type,
        notificationData
      );
      if (!emailResult.success) {
        logger.error(`Failed to send email to patient ${appointment.patient.email}: ${emailResult.error}`);
      } else {
        logger.info(`Email sent successfully to patient ${appointment.patient.email}`);
      }
    }

    // Send SMS notification to patient if phone exists
    if (appointment.patient.phone && process.env.TWILIO_ACCOUNT_SID) {
      const smsResult = await sendNotification(
        "sms",
        appointment.patient.phone,
        type,
        notificationData
      );
      if (!smsResult.success) {
        logger.error(`Failed to send SMS to patient ${appointment.patient.phone}: ${smsResult.error}`);
      }
    }

    logger.info(
      `Appointment notifications sent for ${appointmentId}, type: ${type}`
    );
  } catch (error) {
    logger.error("Error sending appointment notification:", error);
  }
};

// Simple reminder function (no scheduling)
const scheduleAppointmentReminders = async (appointmentId) => {
  // Simplified - just log for now
  logger.info(`Reminder scheduled for appointment ${appointmentId}`);
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
