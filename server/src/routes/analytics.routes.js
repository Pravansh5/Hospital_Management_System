// src/routes/analytics.routes.js
const express = require("express");
const router = express.Router();
const {
  getAppointmentStats,
  getTopDoctors,
  getPatientStats,
  getReviewStats,
  getDashboardOverview,
} = require("../controllers/analytics.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Appointment statistics - accessible by all authenticated users
router.get("/stats", authMiddleware, getAppointmentStats);

// Top doctors - accessible by all authenticated users
router.get("/top-doctors", authMiddleware, getTopDoctors);

// Patient statistics - admin only
router.get(
  "/patient-stats",
  authMiddleware,
  roleMiddleware(["admin"]),
  getPatientStats
);

// Review statistics - accessible by all authenticated users
router.get("/review-stats", authMiddleware, getReviewStats);

// Dashboard overview - admin only
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["admin"]),
  getDashboardOverview
);

module.exports = router;
