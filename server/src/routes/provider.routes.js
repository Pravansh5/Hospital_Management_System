const express = require("express");
const router = express.Router();
const {
  createOrUpdateProfile,
  getProfileByDoctorId,
  getMyProfile,
  getAllProviders,
  updateProviderProfile,
  deleteProfile,
  updateAvailability,
} = require("../controllers/provider.controller");

const {
  authMiddleware,
  adminOrDoctorOnly,
} = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// 🩺 Doctor creates or updates their own profile
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["doctor"]),
  createOrUpdateProfile
);

// 📋 Get all providers with filtering (for search) - PUBLIC ACCESS
router.get("/", getAllProviders);

//  Get current doctor's profile
router.get("/my", authMiddleware, roleMiddleware(["doctor"]), getMyProfile);

// 👀 Get provider profile by doctorId (public for patients to view)
router.get("/:doctorId", getProfileByDoctorId);

//  Update provider basic info (admin/doctor)
router.put("/:id", authMiddleware, adminOrDoctorOnly, updateProviderProfile);

// 📅 Update provider availability (doctor only)
router.patch(
  "/availability",
  authMiddleware,
  roleMiddleware(["doctor"]),
  updateAvailability
);

// 🗑️ Delete profile (admin/doctor)
router.delete("/:doctorId", authMiddleware, adminOrDoctorOnly, deleteProfile);

module.exports = router;