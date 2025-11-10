const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    categories: {
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
      punctuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      environment: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    isVerified: {
      type: Boolean,
      default: false, // Verified if appointment was completed
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    reported: {
      type: Boolean,
      default: false,
    },
    response: {
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        maxlength: 500,
      },
      respondedAt: Date,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
reviewSchema.index({ doctor: 1, createdAt: -1 });
reviewSchema.index({ patient: 1, doctor: 1 }); // One review per patient per doctor
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVerified: 1 });

// Compound index to ensure one review per appointment
reviewSchema.index({ appointment: 1 }, { unique: true });

// Virtual for average category rating
reviewSchema.virtual("averageCategoryRating").get(function () {
  const categories = this.categories;
  const values = Object.values(categories).filter((val) => val != null);
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
});

// Pre-save middleware to check if appointment was completed
reviewSchema.pre("save", async function (next) {
  if (this.isNew) {
    const Appointment = mongoose.model("Appointment");
    const appointment = await Appointment.findById(this.appointment);

    if (appointment && appointment.status === "completed") {
      this.isVerified = true;
    }
  }
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = { Review };
