// src/models/appointments.model.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      startTime: { type: String, required: true }, // "10:00"
      endTime: { type: String, required: true }, // "10:30"
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    appointmentType: {
      type: String,
      enum: ["in-person", "telemedicine", "follow-up", "consultation"],
      default: "consultation",
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    specialRequirements: {
      language: String,
      accessibility: String,
      other: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    location: {
      type: String, // For in-person appointments
    },
    meetingLink: {
      type: String, // For telemedicine appointments
    },
    reminders: [
      {
        type: {
          type: String,
          enum: ["email", "sms"],
        },
        sent: { type: Boolean, default: false },
        sentAt: Date,
      },
    ],
    calendarEvents: [
      {
        provider: {
          type: String,
          enum: ["google", "outlook", "apple", "ical"],
        },
        eventId: String,
        htmlLink: String,
        syncedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient queries
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ status: 1 });

const AppointmentModel = mongoose.model("Appointment", appointmentSchema);
module.exports = AppointmentModel;
