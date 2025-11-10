// src/controllers/search.controller.js
const AppointmentModel = require("../models/appointments.model");
const ProviderProfile = require("../models/providerProfile.model");
const User = require("../models/user.model");
const { sendResponse } = require("../utils/responseHelper");
const logger = require("../utils/logger");

// Advanced provider search with filters, sorting, and pagination
exports.searchProviders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialty,
      location,
      language,
      minRating,
      maxFee,
      appointmentType,
      experience,
      sortBy = "rating",
      sortOrder = "desc",
      name,
    } = req.query;

    const query = {};

    // Text-based filters
    if (specialty) query.specialty = { $regex: specialty, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };
    if (name) {
      // Search in doctor's name
      const doctors = await User.find({
        name: { $regex: name, $options: "i" },
        role: "doctor",
      }).select("_id");
      query.doctorId = { $in: doctors.map((doc) => doc._id) };
    }

    // Array-based filters
    if (language) query.languages = { $in: [language] };
    if (appointmentType) query.appointmentType = appointmentType;

    // Numeric filters
    if (minRating) query.rating = { ...query.rating, $gte: Number(minRating) };
    if (maxFee) query.consultationFee = { $lte: Number(maxFee) };
    if (experience) query.experience = { $gte: Number(experience) };

    // Sorting
    const sortOptions = {};
    const validSortFields = [
      "rating",
      "experience",
      "consultationFee",
      "createdAt",
    ];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.rating = -1; // Default sort by rating desc
    }

    const providers = await ProviderProfile.find(query)
      .populate("doctorId", "name email phone")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await ProviderProfile.countDocuments(query);

    // Add distance calculation if location coordinates are provided (future enhancement)
    // For now, we'll use text-based location matching

    sendResponse(res, 200, true, "Providers found successfully", {
      providers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProviders: total,
      },
      filters: {
        applied: {
          specialty,
          location,
          language,
          minRating,
          maxFee,
          appointmentType,
          experience,
          name,
        },
      },
    });
  } catch (error) {
    logger.error("Error searching providers:", error);
    sendResponse(res, 500, false, "Error searching providers");
  }
};

// Advanced appointment search
exports.searchAppointments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      date,
      dateFrom,
      dateTo,
      doctorId,
      patientId,
      status,
      appointmentType,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const userId = req.user.id;
    const userRole = req.user.role;

    const query = {};

    // Role-based access control
    if (userRole === "patient") {
      query.patient = userId;
    } else if (userRole === "doctor") {
      query.doctor = userId;
    }
    // Admin can see all

    // Date filters
    if (date) {
      const searchDate = new Date(date);
      const dayStart = new Date(searchDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(searchDate);
      dayEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: dayStart, $lte: dayEnd };
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    // Other filters
    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (status) query.status = status;
    if (appointmentType) query.appointmentType = appointmentType;

    // Sorting
    const sortOptions = {};
    const validSortFields = ["date", "createdAt", "status"];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.date = -1; // Default sort by date desc
    }

    const appointments = await AppointmentModel.find(query)
      .populate("patient", "name email phone")
      .populate("doctor", "name email phone")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await AppointmentModel.countDocuments(query);

    sendResponse(res, 200, true, "Appointments found successfully", {
      appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAppointments: total,
      },
      filters: {
        applied: {
          date,
          dateFrom,
          dateTo,
          doctorId,
          patientId,
          status,
          appointmentType,
        },
      },
    });
  } catch (error) {
    logger.error("Error searching appointments:", error);
    sendResponse(res, 500, false, "Error searching appointments");
  }
};

// Get popular specialties
exports.getSpecialties = async (req, res) => {
  try {
    const specialties = await ProviderProfile.aggregate([
      {
        $group: {
          _id: "$specialty",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          avgFee: { $avg: "$consultationFee" },
        },
      },
      {
        $match: {
          _id: { $ne: null },
          count: { $gte: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    sendResponse(res, 200, true, "Specialties retrieved successfully", {
      specialties,
    });
  } catch (error) {
    logger.error("Error fetching specialties:", error);
    sendResponse(res, 500, false, "Error fetching specialties");
  }
};

// Get locations with provider counts
exports.getLocations = async (req, res) => {
  try {
    const locations = await ProviderProfile.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          _id: { $ne: null },
          count: { $gte: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    sendResponse(res, 200, true, "Locations retrieved successfully", {
      locations,
    });
  } catch (error) {
    logger.error("Error fetching locations:", error);
    sendResponse(res, 500, false, "Error fetching locations");
  }
};

// Advanced search with full-text search capabilities
exports.globalSearch = async (req, res) => {
  try {
    const { q, type = "all", page = 1, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return sendResponse(
        res,
        400,
        false,
        "Search query must be at least 2 characters long"
      );
    }

    const results = {
      providers: [],
      appointments: [],
    };

    // Search providers
    if (type === "all" || type === "providers") {
      const providerQuery = {
        $or: [
          { specialty: { $regex: q, $options: "i" } },
          { location: { $regex: q, $options: "i" } },
          { bio: { $regex: q, $options: "i" } },
        ],
      };

      // Also search in doctor's name
      const doctors = await User.find({
        name: { $regex: q, $options: "i" },
        role: "doctor",
      }).select("_id");

      if (doctors.length > 0) {
        providerQuery.$or.push({
          doctorId: { $in: doctors.map((doc) => doc._id) },
        });
      }

      results.providers = await ProviderProfile.find(providerQuery)
        .populate("doctorId", "name email")
        .limit(limit)
        .select("specialty location rating consultationFee");
    }

    // Search appointments (only for authorized users)
    if (type === "all" || type === "appointments") {
      const userId = req.user.id;
      const userRole = req.user.role;

      const appointmentQuery = {
        $or: [
          { reason: { $regex: q, $options: "i" } },
          { notes: { $regex: q, $options: "i" } },
        ],
      };

      // Role-based filtering
      if (userRole === "patient") {
        appointmentQuery.patient = userId;
      } else if (userRole === "doctor") {
        appointmentQuery.doctor = userId;
      }

      results.appointments = await AppointmentModel.find(appointmentQuery)
        .populate("patient", "name")
        .populate("doctor", "name")
        .limit(limit)
        .select("date timeSlot status appointmentType");
    }

    sendResponse(res, 200, true, "Search completed successfully", {
      query: q,
      results,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error("Error performing global search:", error);
    sendResponse(res, 500, false, "Error performing search");
  }
};
