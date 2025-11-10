// src/controllers/review.controller.js
const { Review } = require("../models/review.model");
const AppointmentModel = require("../models/appointments.model");
const ProviderProfile = require("../models/providerProfile.model");
const { sendResponse } = require("../utils/responseHelper");
const logger = require("../utils/logger");

// Create a new review
const createReview = async (req, res) => {
  try {
    const {
      appointmentId,
      rating,
      title,
      comment,
      categories,
      isAnonymous = false,
    } = req.body;
    const patientId = req.user.id;

    // Validate required fields
    if (!appointmentId || !rating || !title || !comment) {
      return sendResponse(res, 400, false, "Missing required fields");
    }

    // Check if appointment exists and belongs to the patient
    const appointment = await AppointmentModel.findById(appointmentId)
      .populate("patient", "name")
      .populate("doctor", "name");

    if (!appointment) {
      return sendResponse(res, 404, false, "Appointment not found");
    }

    if (appointment.patient.toString() !== patientId) {
      return sendResponse(res, 403, false, "Access denied");
    }

    // Check if appointment is completed
    if (appointment.status !== "completed") {
      return sendResponse(
        res,
        400,
        false,
        "Can only review completed appointments"
      );
    }

    // Check if review already exists for this appointment
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      return sendResponse(
        res,
        409,
        false,
        "Review already exists for this appointment"
      );
    }

    // Create review
    const review = new Review({
      patient: patientId,
      doctor: appointment.doctor,
      appointment: appointmentId,
      rating,
      title,
      comment,
      categories,
      isAnonymous,
      isVerified: true, // Since appointment is completed
    });

    await review.save();
    await review.populate("patient", "name");
    await review.populate("doctor", "name");

    // Update doctor's average rating
    await updateDoctorRating(appointment.doctor);

    logger.info(
      `Review created for appointment ${appointmentId} by patient ${patientId}`
    );
    sendResponse(res, 201, true, "Review submitted successfully", review);
  } catch (error) {
    logger.error("Error creating review:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Get reviews for a doctor
const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, rating, verified = true } = req.query;

    const filter = { doctor: doctorId };
    if (verified === "true") filter.isVerified = true;
    if (rating) filter.rating = parseInt(rating);

    const reviews = await Review.find(filter)
      .populate("patient", "name")
      .populate("appointment", "date appointmentType")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    // Get rating statistics
    const stats = await getDoctorReviewStats(doctorId);

    sendResponse(res, 200, true, "Reviews retrieved successfully", {
      reviews,
      statistics: stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
      },
    });
  } catch (error) {
    logger.error("Error fetching doctor reviews:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Get patient's reviews
const getPatientReviews = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ patient: patientId })
      .populate("doctor", "name")
      .populate("appointment", "date appointmentType status")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ patient: patientId });

    sendResponse(res, 200, true, "Reviews retrieved successfully", {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
      },
    });
  } catch (error) {
    logger.error("Error fetching patient reviews:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, categories, isAnonymous } = req.body;
    const patientId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return sendResponse(res, 404, false, "Review not found");
    }

    if (review.patient.toString() !== patientId) {
      return sendResponse(res, 403, false, "Access denied");
    }

    // Only allow updates within 30 days
    const daysSinceCreation =
      (Date.now() - review.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 30) {
      return sendResponse(
        res,
        400,
        false,
        "Reviews can only be edited within 30 days"
      );
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (categories) review.categories = categories;
    if (isAnonymous !== undefined) review.isAnonymous = isAnonymous;

    await review.save();
    await review.populate("patient", "name");
    await review.populate("doctor", "name");

    // Update doctor's average rating
    await updateDoctorRating(review.doctor);

    logger.info(`Review ${id} updated by patient ${patientId}`);
    sendResponse(res, 200, true, "Review updated successfully", review);
  } catch (error) {
    logger.error("Error updating review:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const review = await Review.findById(id);
    if (!review) {
      return sendResponse(res, 404, false, "Review not found");
    }

    // Check permissions
    if (userRole !== "admin" && review.patient.toString() !== userId) {
      return sendResponse(res, 403, false, "Access denied");
    }

    await Review.findByIdAndDelete(id);

    // Update doctor's average rating
    await updateDoctorRating(review.doctor);

    logger.info(`Review ${id} deleted by ${userRole} ${userId}`);
    sendResponse(res, 200, true, "Review deleted successfully");
  } catch (error) {
    logger.error("Error deleting review:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return sendResponse(res, 404, false, "Review not found");
    }

    sendResponse(res, 200, true, "Review marked as helpful", review);
  } catch (error) {
    logger.error("Error marking review as helpful:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Doctor responds to a review
const respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const doctorId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return sendResponse(res, 404, false, "Review not found");
    }

    if (review.doctor.toString() !== doctorId) {
      return sendResponse(res, 403, false, "Access denied");
    }

    review.response = {
      by: doctorId,
      comment,
      respondedAt: new Date(),
    };

    await review.save();
    await review.populate("response.by", "name");

    logger.info(`Doctor ${doctorId} responded to review ${id}`);
    sendResponse(res, 200, true, "Response added successfully", review);
  } catch (error) {
    logger.error("Error responding to review:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Report a review
const reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { reported: true },
      { new: true }
    );

    if (!review) {
      return sendResponse(res, 404, false, "Review not found");
    }

    // In a real application, you might want to log the report reason
    logger.info(`Review ${id} reported. Reason: ${reason}`);
    sendResponse(res, 200, true, "Review reported successfully");
  } catch (error) {
    logger.error("Error reporting review:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Helper function to update doctor's average rating
const updateDoctorRating = async (doctorId) => {
  try {
    const result = await Review.aggregate([
      { $match: { doctor: doctorId, isVerified: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    if (result.length > 0) {
      const { averageRating, totalReviews, ratingDistribution } = result[0];

      // Count ratings by star
      const ratingCounts = {};
      for (let i = 1; i <= 5; i++) {
        ratingCounts[i] = ratingDistribution.filter(
          (rating) => rating === i
        ).length;
      }

      await ProviderProfile.findOneAndUpdate(
        { doctorId },
        {
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          reviewCount: totalReviews,
          ratingDistribution: ratingCounts,
        },
        { upsert: true }
      );
    }
  } catch (error) {
    logger.error("Error updating doctor rating:", error);
  }
};

// Helper function to get doctor review statistics
const getDoctorReviewStats = async (doctorId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { doctor: doctorId, isVerified: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
          averageCategories: {
            communication: { $avg: "$categories.communication" },
            professionalism: { $avg: "$categories.professionalism" },
            punctuality: { $avg: "$categories.punctuality" },
            environment: { $avg: "$categories.environment" },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        averageCategories: {
          communication: 0,
          professionalism: 0,
          punctuality: 0,
          environment: 0,
        },
      };
    }

    const {
      averageRating,
      totalReviews,
      ratingDistribution,
      averageCategories,
    } = stats[0];

    // Count ratings by star
    const ratingCounts = {};
    for (let i = 1; i <= 5; i++) {
      ratingCounts[i] = ratingDistribution.filter(
        (rating) => rating === i
      ).length;
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution: ratingCounts,
      averageCategories,
    };
  } catch (error) {
    logger.error("Error getting doctor review stats:", error);
    return null;
  }
};

module.exports = {
  createReview,
  getDoctorReviews,
  getPatientReviews,
  updateReview,
  deleteReview,
  markHelpful,
  respondToReview,
  reportReview,
};
