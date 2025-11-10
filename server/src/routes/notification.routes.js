// src/routes/notification.routes.js
const express = require("express");
const router = express.Router();
const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notification.controller");

const {
  authMiddleware,
  adminOrDoctorOnly,
} = require("../middleware/auth.middleware");

// Create notification (Admin/Doctor)
router.post("/", authMiddleware, adminOrDoctorOnly, createNotification);

// Get user's notifications
router.get("/", authMiddleware, getNotifications);

// Mark single notification as read
router.patch("/:id/read", authMiddleware, markAsRead);

// Mark all notifications as read
router.patch("/read-all", authMiddleware, markAllAsRead);

module.exports = router;
