const ProviderProfile = require("../models/providerProfile.model");
const User = require("../models/user.model");
const { sendResponse } = require("../utils/responseHelper");
const logger = require("../utils/logger");

// ✅ Create or Update Provider Profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const doctorId = req.user.id; // Get doctor ID from authenticated user
    const {
      bio,
      specialty,
      experience,
      consultationFee,
      languages,
      location,
      appointmentType,
      availability,
    } = req.body;

    // Validate required fields
    if (!specialty || !experience) {
      return sendResponse(
        res,
        400,
        false,
        "Specialty and experience are required"
      );
    }

    // Validate availability format
    if (availability && !Array.isArray(availability)) {
      return sendResponse(res, 400, false, "Availability must be an array");
    }

    // Validate availability structure
    if (availability) {
      for (const slot of availability) {
        if (!slot.day || !slot.startTime || !slot.endTime) {
          return sendResponse(
            res,
            400,
            false,
            "Each availability slot must have day, startTime, and endTime"
          );
        }
      }
    }

    const profileData = {
      bio,
      specialty,
      experience,
      consultationFee: consultationFee || 0,
      languages: languages || [],
      location,
      appointmentType: appointmentType || "both",
      availability: availability || [],
    };

    const profile = await ProviderProfile.findOneAndUpdate(
      { doctorId },
      profileData,
      { new: true, upsert: true, runValidators: true }
    ).populate("doctorId", "name email phone");

    logger.info(`Provider profile created/updated for doctor ${doctorId}`);
    sendResponse(
      res,
      200,
      true,
      "Profile created/updated successfully",
      profile
    );
  } catch (error) {
    logger.error("Error creating/updating provider profile:", error);
    sendResponse(
      res,
      500,
      false,
      "Server error while creating/updating profile"
    );
  }
};

// ✅ Get Provider Profile by doctorId
exports.getProfileByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const profile = await ProviderProfile.findOne({ doctorId }).populate(
      "doctorId",
      "name email phone role"
    );

    if (!profile) {
      return sendResponse(res, 404, false, "Profile not found");
    }

    sendResponse(res, 200, true, "Profile retrieved successfully", profile);
  } catch (error) {
    logger.error("Error fetching provider profile:", error);
    sendResponse(res, 500, false, "Server error while fetching profile");
  }
};

// ✅ Get Current Doctor's Profile
exports.getMyProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const profile = await ProviderProfile.findOne({ doctorId }).populate(
      "doctorId",
      "name email phone role"
    );

    if (!profile) {
      return sendResponse(
        res,
        404,
        false,
        "Profile not found. Please create your profile first."
      );
    }

    sendResponse(res, 200, true, "Profile retrieved successfully", profile);
  } catch (error) {
    logger.error("Error fetching provider profile:", error);
    sendResponse(res, 500, false, "Server error while fetching profile");
  }
};

// ✅ Get All Providers (for search/admin)
exports.getAllProviders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialty,
      location,
      appointmentType,
      minExperience,
      maxFee,
    } = req.query;

    const filter = {};

    if (specialty) filter.specialty = { $regex: specialty, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };

    // Handle appointment type filtering properly
    if (appointmentType) {
      if (appointmentType === "in-person") {
        // Show doctors who offer in-person or both
        filter.appointmentType = { $in: ["in-person", "both"] };
      } else if (appointmentType === "telemedicine") {
        // Show doctors who offer telemedicine or both
        filter.appointmentType = { $in: ["telemedicine", "both"] };
      } else {
        // Exact match for "both" or any other value
        filter.appointmentType = appointmentType;
      }
    }

    if (minExperience) filter.experience = { $gte: parseInt(minExperience) };
    if (maxFee) filter.consultationFee = { $lte: parseInt(maxFee) };

    const profiles = await ProviderProfile.find(filter)
      .populate("doctorId", "name email phone role")
      .sort({ rating: -1, experience: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProviderProfile.countDocuments(filter);

    sendResponse(res, 200, true, "Providers retrieved successfully", {
      providers: profiles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProviders: total,
      },
    });
  } catch (error) {
    logger.error("Error fetching providers:", error);
    sendResponse(res, 500, false, "Server error while fetching providers");
  }
};

// ✅ Update Provider Profile (Admin/Doctor)
exports.updateProviderProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Check if user is admin or the doctor themselves
    if (userRole !== "admin" && userId !== id) {
      return sendResponse(res, 403, false, "Access denied");
    }

    const provider = await User.findById(id);
    if (!provider || provider.role !== "doctor") {
      return sendResponse(res, 404, false, "Provider not found");
    }

    // Allow only certain fields to be updated
    const allowedFields = ["name", "phone", "specialization"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        provider[field] = req.body[field];
      }
    });

    const updatedProvider = await provider.save();
    logger.info(`Provider ${id} updated by ${userRole} ${userId}`);
    sendResponse(
      res,
      200,
      true,
      "Provider updated successfully",
      updatedProvider
    );
  } catch (error) {
    logger.error("Error updating provider:", error);
    sendResponse(res, 500, false, "Server error");
  }
};

// ✅ Delete Provider Profile
exports.deleteProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Check permissions
    if (userRole !== "admin" && userId !== doctorId) {
      return sendResponse(res, 403, false, "Access denied");
    }

    const deleted = await ProviderProfile.findOneAndDelete({ doctorId });

    if (!deleted) {
      return sendResponse(res, 404, false, "Profile not found");
    }

    logger.info(
      `Provider profile deleted for doctor ${doctorId} by ${userRole} ${userId}`
    );
    sendResponse(res, 200, true, "Profile deleted successfully");
  } catch (error) {
    logger.error("Error deleting provider profile:", error);
    sendResponse(res, 500, false, "Server error while deleting profile");
  }
};

// ✅ Update Provider Availability
exports.updateAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { availability } = req.body;

    // Validate availability format
    if (!Array.isArray(availability)) {
      return sendResponse(res, 400, false, "Availability must be an array");
    }

    // Validate availability structure
    for (const slot of availability) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return sendResponse(
          res,
          400,
          false,
          "Each availability slot must have day, startTime, and endTime"
        );
      }
    }

    const profile = await ProviderProfile.findOneAndUpdate(
      { doctorId },
      { availability },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return sendResponse(res, 404, false, "Profile not found");
    }

    logger.info(`Availability updated for doctor ${doctorId}`);
    sendResponse(res, 200, true, "Availability updated successfully", profile);
  } catch (error) {
    logger.error("Error updating availability:", error);
    sendResponse(res, 500, false, "Server error while updating availability");
  }
};
