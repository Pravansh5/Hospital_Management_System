// src/controllers/analytics.controller.js
const AppointmentModel = require("../models/appointments.model");
const User = require("../models/user.model");
const Review = require("../models/review.model");
const ProviderProfile = require("../models/providerProfile.model");
const { sendResponse } = require("../utils/responseHelper");
const logger = require("../utils/logger");

// Get comprehensive appointment statistics
const getAppointmentStats = async (req, res) => {
  try {
    const { startDate, endDate, doctorId, patientId } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Build user filter based on role
    const userFilter = { ...dateFilter };
    if (userRole === "doctor") {
      userFilter.doctor = userId;
    } else if (userRole === "patient") {
      userFilter.patient = userId;
    }
    if (doctorId) userFilter.doctor = doctorId;
    if (patientId) userFilter.patient = patientId;

    // Get appointment counts by status
    const statusStats = await AppointmentModel.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get appointment type distribution
    const typeStats = await AppointmentModel.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: "$appointmentType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get revenue statistics
    const revenueStats = await AppointmentModel.aggregate([
      { $match: { ...userFilter, paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
          averageRevenue: { $avg: "$price" },
          minRevenue: { $min: "$price" },
          maxRevenue: { $max: "$price" },
        },
      },
    ]);

    // Get monthly trends (last 12 months)
    const monthlyTrends = await getMonthlyTrends(userFilter);

    // Calculate rates
    const totalAppointments = statusStats.reduce(
      (sum, stat) => sum + stat.count,
      0
    );
    const completedAppointments =
      statusStats.find((s) => s._id === "completed")?.count || 0;
    const cancelledAppointments =
      statusStats.find((s) => s._id === "cancelled")?.count || 0;
    const noShowAppointments =
      statusStats.find((s) => s._id === "no-show")?.count || 0;

    const stats = {
      overview: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
        completionRate:
          totalAppointments > 0
            ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
            : 0,
        cancellationRate:
          totalAppointments > 0
            ? ((cancelledAppointments / totalAppointments) * 100).toFixed(2)
            : 0,
        noShowRate:
          totalAppointments > 0
            ? ((noShowAppointments / totalAppointments) * 100).toFixed(2)
            : 0,
      },
      byStatus: statusStats,
      byType: typeStats,
      revenue: revenueStats[0] || {
        totalRevenue: 0,
        averageRevenue: 0,
        minRevenue: 0,
        maxRevenue: 0,
      },
      trends: monthlyTrends,
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    };

    sendResponse(
      res,
      200,
      true,
      "Appointment statistics retrieved successfully",
      stats
    );
  } catch (error) {
    logger.error("Error fetching appointment stats:", error);
    sendResponse(res, 500, false, "Error fetching analytics");
  }
};

// Get top performing doctors
const getTopDoctors = async (req, res) => {
  try {
    const {
      limit = 10,
      startDate,
      endDate,
      sortBy = "appointments",
    } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    let sortField;
    switch (sortBy) {
      case "revenue":
        sortField = "totalRevenue";
        break;
      case "rating":
        sortField = "averageRating";
        break;
      case "appointments":
      default:
        sortField = "totalAppointments";
    }

    const topDoctors = await AppointmentModel.aggregate([
      { $match: { ...dateFilter, status: "completed" } },
      {
        $group: {
          _id: "$doctor",
          totalAppointments: { $sum: 1 },
          totalRevenue: { $sum: "$price" },
          completedAppointments: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $lookup: {
          from: "providerprofiles",
          localField: "_id",
          foreignField: "doctorId",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          doctorId: "$_id",
          doctorName: "$doctor.name",
          email: "$doctor.email",
          specialty: "$profile.specialty",
          rating: "$profile.rating",
          reviewCount: "$profile.reviewCount",
          totalAppointments: 1,
          totalRevenue: 1,
          completedAppointments: 1,
          averageRevenue: { $divide: ["$totalRevenue", "$totalAppointments"] },
        },
      },
      { $sort: { [sortField]: -1 } },
      { $limit: parseInt(limit) },
    ]);

    sendResponse(res, 200, true, "Top doctors retrieved successfully", {
      topDoctors,
      sortBy,
      limit: parseInt(limit),
    });
  } catch (error) {
    logger.error("Error fetching top doctors:", error);
    sendResponse(res, 500, false, "Error fetching top doctors");
  }
};

// Get patient demographics and statistics
const getPatientStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Get patient appointment statistics
    const patientStats = await AppointmentModel.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$patient",
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          totalSpent: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$price", 0] },
          },
          lastAppointment: { $max: "$date" },
          firstAppointment: { $min: "$date" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" },
      {
        $project: {
          patientId: "$_id",
          patientName: "$patient.name",
          email: "$patient.email",
          phone: "$patient.phone",
          totalAppointments: 1,
          completedAppointments: 1,
          cancelledAppointments: 1,
          totalSpent: 1,
          completionRate: {
            $multiply: [
              { $divide: ["$completedAppointments", "$totalAppointments"] },
              100,
            ],
          },
          lastAppointment: 1,
          firstAppointment: 1,
          averageSpent: { $divide: ["$totalSpent", "$totalAppointments"] },
        },
      },
      { $sort: { totalAppointments: -1 } },
    ]);

    // Get new patients over time
    const newPatientsTrend = await getNewPatientsTrend(dateFilter);

    sendResponse(res, 200, true, "Patient statistics retrieved successfully", {
      patientStats,
      trends: newPatientsTrend,
    });
  } catch (error) {
    logger.error("Error fetching patient stats:", error);
    sendResponse(res, 500, false, "Error fetching patient statistics");
  }
};

// Get review and rating analytics
const getReviewStats = async (req, res) => {
  try {
    const { doctorId, startDate, endDate } = req.query;

    const matchFilter = {};
    if (doctorId) matchFilter.doctor = doctorId;
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }

    const reviewStats = await Review.aggregate([
      { $match: { ...matchFilter, isVerified: true } },
      {
        $group: {
          _id: "$doctor",
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
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
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          doctorId: "$_id",
          doctorName: "$doctor.name",
          totalReviews: 1,
          averageRating: { $round: ["$averageRating", 1] },
          ratingDistribution: 1,
          averageCategories: 1,
        },
      },
      { $sort: { averageRating: -1 } },
    ]);

    // Calculate rating distribution counts
    reviewStats.forEach((stat) => {
      const distribution = {};
      for (let i = 1; i <= 5; i++) {
        distribution[i] = stat.ratingDistribution.filter(
          (rating) => rating === i
        ).length;
      }
      stat.ratingDistribution = distribution;
    });

    sendResponse(res, 200, true, "Review statistics retrieved successfully", {
      reviewStats,
      overall: {
        totalReviews: reviewStats.reduce(
          (sum, stat) => sum + stat.totalReviews,
          0
        ),
        averageRating:
          reviewStats.length > 0
            ? reviewStats.reduce((sum, stat) => sum + stat.averageRating, 0) /
              reviewStats.length
            : 0,
      },
    });
  } catch (error) {
    logger.error("Error fetching review stats:", error);
    sendResponse(res, 500, false, "Error fetching review statistics");
  }
};

// Get dashboard overview (for admin)
const getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Today's appointments
    const todayAppointments = await AppointmentModel.countDocuments({
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        ),
      },
    });

    // This month's revenue
    const monthlyRevenue = await AppointmentModel.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
        },
      },
    ]);

    // Total users by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent appointments
    const recentAppointments = await AppointmentModel.find()
      .populate("patient", "name")
      .populate("doctor", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("date timeSlot status appointmentType createdAt");

    const overview = {
      todayAppointments,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      userStats: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      recentAppointments,
    };

    sendResponse(
      res,
      200,
      true,
      "Dashboard overview retrieved successfully",
      overview
    );
  } catch (error) {
    logger.error("Error fetching dashboard overview:", error);
    sendResponse(res, 500, false, "Error fetching dashboard overview");
  }
};

// Helper function to get monthly trends
const getMonthlyTrends = async (filter) => {
  try {
    const trends = await AppointmentModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalAppointments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          revenue: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$price", 0] },
          },
        },
      },
      {
        $project: {
          period: {
            $dateToString: {
              format: "%Y-%m",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: 1,
                },
              },
            },
          },
          totalAppointments: 1,
          completed: 1,
          cancelled: 1,
          revenue: 1,
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    return trends;
  } catch (error) {
    logger.error("Error getting monthly trends:", error);
    return [];
  }
};

// Helper function to get new patients trend
const getNewPatientsTrend = async (filter) => {
  try {
    const trends = await AppointmentModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            patient: "$patient",
          },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          newPatients: { $sum: 1 },
        },
      },
      {
        $project: {
          period: {
            $dateToString: {
              format: "%Y-%m",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: 1,
                },
              },
            },
          },
          newPatients: 1,
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    return trends;
  } catch (error) {
    logger.error("Error getting new patients trend:", error);
    return [];
  }
};

module.exports = {
  getAppointmentStats,
  getTopDoctors,
  getPatientStats,
  getReviewStats,
  getDashboardOverview,
};
