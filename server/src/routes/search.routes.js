// src/routes/search.routes.js
const express = require("express");
const router = express.Router();
const {
  searchProviders,
  searchAppointments,
  getSpecialties,
  getLocations,
  globalSearch,
} = require("../controllers/search.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// Advanced provider search
router.get("/providers", authMiddleware, searchProviders);

// Advanced appointment search
router.get("/appointments", authMiddleware, searchAppointments);

// Global search across providers and appointments
router.get("/global", authMiddleware, globalSearch);

// Get available specialties
router.get("/specialties", authMiddleware, getSpecialties);

// Get available locations
router.get("/locations", authMiddleware, getLocations);

module.exports = router;
