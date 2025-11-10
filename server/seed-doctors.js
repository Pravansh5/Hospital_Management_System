const mongoose = require("mongoose");
const User = require("./src/models/user.model");
const ProviderProfile = require("./src/models/providerProfile.model");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/hospital_management",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Dummy doctors data
const dummyDoctors = [
  {
    user: {
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0101",
      specialization: "Cardiologist",
    },
    profile: {
      bio: "Board-certified cardiologist with over 15 years of experience in treating heart conditions. Specializes in preventive cardiology and interventional procedures.",
      specialty: "Cardiologist",
      experience: 15,
      consultationFee: 250,
      languages: ["English", "Spanish"],
      location: "New York, NY",
      rating: 4.8,
      reviewCount: 127,
      appointmentType: "both",
      availability: [
        { day: "Monday", startTime: "09:00", endTime: "17:00" },
        { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
        { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
        { day: "Thursday", startTime: "09:00", endTime: "17:00" },
        { day: "Friday", startTime: "09:00", endTime: "15:00" },
      ],
    },
  },
  {
    user: {
      name: "Dr. Michael Chen",
      email: "michael.chen@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0102",
      specialization: "Dermatologist",
    },
    profile: {
      bio: "Experienced dermatologist specializing in cosmetic dermatology, skin cancer screening, and medical dermatology. Committed to helping patients achieve healthy, beautiful skin.",
      specialty: "Dermatologist",
      experience: 12,
      consultationFee: 180,
      languages: ["English", "Mandarin"],
      location: "Los Angeles, CA",
      rating: 4.6,
      reviewCount: 89,
      appointmentType: "both",
      availability: [
        { day: "Monday", startTime: "08:00", endTime: "16:00" },
        { day: "Tuesday", startTime: "08:00", endTime: "16:00" },
        { day: "Wednesday", startTime: "08:00", endTime: "16:00" },
        { day: "Thursday", startTime: "08:00", endTime: "16:00" },
        { day: "Friday", startTime: "08:00", endTime: "14:00" },
      ],
    },
  },
  {
    user: {
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0103",
      specialization: "Pediatrician",
    },
    profile: {
      bio: "Dedicated pediatrician with a passion for children's health. Specializes in preventive care, developmental milestones, and managing chronic conditions in children.",
      specialty: "Pediatrician",
      experience: 10,
      consultationFee: 150,
      languages: ["English", "Spanish"],
      location: "Miami, FL",
      rating: 4.9,
      reviewCount: 156,
      appointmentType: "both",
      availability: [
        { day: "Monday", startTime: "08:30", endTime: "17:30" },
        { day: "Tuesday", startTime: "08:30", endTime: "17:30" },
        { day: "Wednesday", startTime: "08:30", endTime: "17:30" },
        { day: "Thursday", startTime: "08:30", endTime: "17:30" },
        { day: "Friday", startTime: "08:30", endTime: "15:30" },
      ],
    },
  },
  {
    user: {
      name: "Dr. David Thompson",
      email: "david.thompson@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0104",
      specialization: "Neurologist",
    },
    profile: {
      bio: "Neurologist specializing in the diagnosis and treatment of neurological disorders including epilepsy, Parkinson's disease, and multiple sclerosis.",
      specialty: "Neurologist",
      experience: 18,
      consultationFee: 300,
      languages: ["English"],
      location: "Boston, MA",
      rating: 4.7,
      reviewCount: 98,
      appointmentType: "both",
      availability: [
        { day: "Monday", startTime: "09:00", endTime: "17:00" },
        { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
        { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
        { day: "Thursday", startTime: "09:00", endTime: "17:00" },
        { day: "Friday", startTime: "09:00", endTime: "15:00" },
      ],
    },
  },
  {
    user: {
      name: "Dr. Lisa Park",
      email: "lisa.park@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0105",
      specialization: "Psychiatrist",
    },
    profile: {
      bio: "Board-certified psychiatrist specializing in mental health treatment for adults and adolescents. Experienced in medication management and psychotherapy.",
      specialty: "Psychiatrist",
      experience: 14,
      consultationFee: 200,
      languages: ["English", "Korean"],
      location: "Seattle, WA",
      rating: 4.5,
      reviewCount: 73,
      appointmentType: "telemedicine",
      availability: [
        { day: "Monday", startTime: "10:00", endTime: "18:00" },
        { day: "Tuesday", startTime: "10:00", endTime: "18:00" },
        { day: "Wednesday", startTime: "10:00", endTime: "18:00" },
        { day: "Thursday", startTime: "10:00", endTime: "18:00" },
        { day: "Friday", startTime: "10:00", endTime: "16:00" },
      ],
    },
  },
];

// Function to seed the database
async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    for (const doctorData of dummyDoctors) {
      // Create user
      const user = new User(doctorData.user);
      const savedUser = await user.save();
      console.log(`Created user: ${savedUser.name}`);

      // Create provider profile
      const profile = new ProviderProfile({
        ...doctorData.profile,
        doctorId: savedUser._id,
      });
      await profile.save();
      console.log(`Created profile for: ${savedUser.name}`);
    }

    console.log("Database seeding completed successfully!");
    console.log(`Created ${dummyDoctors.length} doctors with profiles.`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
seedDatabase();
