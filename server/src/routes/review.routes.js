// src/routes/review.routes.js
const express = require("express");
const router = express.Router();
const {
  createReview,
  getDoctorReviews,
  getPatientReviews,
  updateReview,
  deleteReview,
  markHelpful,
  respondToReview,
  reportReview,
} = require("../controllers/review.controller");

const {
  authMiddleware,
  adminOrDoctorOnly,
} = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Create a review (Patient only)
router.post("/", authMiddleware, roleMiddleware(["patient"]), createReview);

// Get reviews for a specific doctor (Public)
router.get("/doctor/:doctorId", authMiddleware, getDoctorReviews);

// Get current patient's reviews
router.get(
  "/my",
  authMiddleware,
  roleMiddleware(["patient"]),
  getPatientReviews
);

// Update a review (Patient only, own review)
router.put("/:id", authMiddleware, updateReview);

// Delete a review (Patient/Admin)
router.delete("/:id", authMiddleware, deleteReview);

// Mark review as helpful (Any authenticated user)
router.post("/:id/helpful", authMiddleware, markHelpful);

// Doctor responds to review (Doctor only, own reviews)
router.post(
  "/:id/response",
  authMiddleware,
  roleMiddleware(["doctor"]),
  respondToReview
);

// Report a review (Any authenticated user)
router.post("/:id/report", authMiddleware, reportReview);

module.exports = router;
