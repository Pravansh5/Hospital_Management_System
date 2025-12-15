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

router.post("/", authMiddleware, adminOrDoctorOnly, createNotification);

router.get("/", authMiddleware, getNotifications);

router.patch("/:id/read", authMiddleware, markAsRead);

router.patch("/read-all", authMiddleware, markAllAsRead);

module.exports = router;
