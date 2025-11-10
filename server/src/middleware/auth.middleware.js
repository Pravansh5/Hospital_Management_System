// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return res.status(401).json({ message: "Not authorized, token missing" });

  try {
    const User = require("../models/user.model");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

const adminOrDoctorOnly = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "doctor") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admin or Doctor only" });
  }
};
module.exports = { authMiddleware, adminOrDoctorOnly };
