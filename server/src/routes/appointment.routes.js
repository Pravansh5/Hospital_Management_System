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

router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllAppointments);

router.get("/my", authMiddleware, getUserAppointments);

router.get("/available/:doctorId/:date", authMiddleware, getAvailableSlots);

router.patch("/:id/status", authMiddleware, updateAppointmentStatus);

router.delete("/:id", authMiddleware, deleteAppointment);

module.exports = router;
