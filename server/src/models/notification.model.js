const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    type: {
      type: String,
      enum: [
        "appointment_booked",
        "appointment_confirmed",
        "appointment_cancelled",
        "appointment_reminder",
        "appointment_rescheduled",
        "appointment_completed",
        "system_update",
        "payment_reminder",
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ["email", "sms", "push", "in_app"],
      default: "in_app",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
    scheduledFor: Date, // For scheduled notifications
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Additional data like appointment details
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, isSent: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
