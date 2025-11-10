// backend/src/routes/index.js
const express = require("express");
const router = express.Router();

// Simple test route
router.get("/test", (req, res) => {
  res.json({ message: "Test route works" });
});

const authRoutes = require("./auth.routes");
const analyticsRoutes = require("./analytics.routes");
const appointmentRoutes = require("./appointment.routes");
const calendarRoutes = require("./calendar.routes");
const notificationRoutes = require("./notification.routes");
const providerRoutes = require("./provider.routes");
const reviewRoutes = require("./review.routes");
const searchRoutes = require("./search.routes");

const { authMiddleware } = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

router.use("/auth", authRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/calendar", calendarRoutes);
router.use("/notification", notificationRoutes);
router.use("/provider", providerRoutes);
router.use("/review", reviewRoutes);
router.use("/search", searchRoutes);

// Example protected route
router.get(
  "/admin/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({ message: `Welcome Admin ${req.user.name}` });
  }
);

module.exports = router;
