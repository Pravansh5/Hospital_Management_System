const express = require("express");
const { testEmail } = require("../controllers/test.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

// Test email endpoint (protected)
router.post("/email", authMiddleware, testEmail);

module.exports = router;