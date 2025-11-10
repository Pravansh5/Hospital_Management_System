const express = require("express");
const router = express.Router();
const {
  syncAppointment,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getICalFile,
  getProviders,
} = require("../controllers/calendar.controller");

const { authMiddleware } = require("../middleware/auth.middleware");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const CREDENTIALS_PATH = path.join(__dirname, "../config/credentials.json");
const TOKEN_PATH = path.join(__dirname, "../config/token.json");

// Sync appointment with calendar
router.post("/sync/:appointmentId", authMiddleware, syncAppointment);

// Create calendar event for appointment
router.post("/event", authMiddleware, createEvent);

// Update calendar event
router.put("/event", authMiddleware, updateEvent);

// Delete calendar event
router.delete("/event", authMiddleware, deleteEvent);

// Get calendar events
router.get("/events", authMiddleware, getEvents);

// Get iCal file for appointment
router.get("/ical/:appointmentId", authMiddleware, getICalFile);

// Get supported calendar providers
router.get("/providers", authMiddleware, getProviders);

// Google OAuth callback
router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: "Authorization code required" });
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const { tokens } = await oAuth2Client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

    res.json({ 
      success: true, 
      message: "Google Calendar connected successfully!",
      redirect: process.env.CLIENT_URL || "http://localhost:3000"
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({ error: "Failed to connect Google Calendar" });
  }
});

// Get Google OAuth URL
router.get("/google/auth", (req, res) => {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar"]
    });

    res.json({ authUrl });
  } catch (error) {
    console.error("Auth URL generation error:", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
});

module.exports = router;
