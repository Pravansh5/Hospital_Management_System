// src/routes/appointments.routes.js
const express = require("express");
const {
  createAppointment,
  getAllAppointments,
  getUserAppointments,
  updateAppointmentStatus,
  getAvailableSlots,
  deleteAppointment,
} = require("../controllers/appointment.controller");

const { authMiddleware } = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const router = express.Router();

// ✅ Create appointment (Patient)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["patient"]),
  createAppointment
);

// ✅ Get all appointments (Admin only)
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllAppointments);

// ✅ Get user's own appointments (Patient or Doctor)
router.get("/my", authMiddleware, getUserAppointments);

// ✅ Get available time slots for a doctor (Public - for booking)
router.get("/available/:doctorId/:date", authMiddleware, getAvailableSlots);

// ✅ Update appointment status (Doctor/Patient - doctors can confirm/complete, patients can cancel)
router.patch("/:id/status", authMiddleware, updateAppointmentStatus);

// ✅ Delete appointment (Doctor/Patient - only pending appointments)
router.delete("/:id", authMiddleware, deleteAppointment);

module.exports = router;
