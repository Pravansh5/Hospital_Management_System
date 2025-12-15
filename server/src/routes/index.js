// backend/src/routes/index.js
const express = require("express");
const router = express.Router();

// Simple test route
router.get("/test", (req, res) => {
  res.json({ message: "Test route works" });
});

const authRoutes = require("./auth.routes");
const appointmentRoutes = require("./appointment.routes");
const notificationRoutes = require("./notification.routes");
const providerRoutes = require("./provider.routes");
const reviewRoutes = require("./review.routes");
const testRoutes = require("./test.routes");

const { authMiddleware } = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

router.use("/auth", authRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/notification", notificationRoutes);
router.use("/provider", providerRoutes);
router.use("/review", reviewRoutes);
router.use("/test", testRoutes);

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
