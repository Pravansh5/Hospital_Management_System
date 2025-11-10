const mongoose = require("mongoose");

const providerProfileSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  bio: { type: String },
  specialty: { type: String },
  experience: { type: Number }, // years
  consultationFee: { type: Number, default: 0 },
  languages: [{ type: String }],
  location: { type: String },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 },
  },
  appointmentType: {
    type: String,
    enum: ["in-person", "telemedicine", "both"],
    default: "both",
  },
  availability: [
    {
      day: String, // e.g., Monday
      startTime: String, // e.g., "09:00"
      endTime: String, // e.g., "17:00"
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const ProviderProfile = mongoose.model(
  "ProviderProfile",
  providerProfileSchema
);
module.exports = ProviderProfile;
