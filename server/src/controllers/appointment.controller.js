// src/controllers/appointments.controller.js
const AppointmentModel = require("../models/appointments.model");
const User = require("../models/user.model");
const { sendResponse } = require("../utils/responseHelper");
const logger = require("../utils/logger");
const {
  sendAppointmentNotification,
  scheduleAppointmentReminders,
} = require("./notification.controller");

// 🟢 Create Appointment
const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      date,
      timeSlot,
      appointmentType = "consultation",
      reason,
      specialRequirements,
      duration = 30,
    } = req.body;

    const patientId = req.user.id;

    // Validate required fields
    if (!doctorId || !date || !timeSlot?.startTime || !timeSlot?.endTime) {
      return sendResponse(res, 400, false, "Missing required fields");
    }

    // Check if doctor exists and is a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return sendResponse(res, 404, false, "Doctor not found");
    }

    // Check if patient is trying to book for themselves
    if (patientId === doctorId) {
      return sendResponse(
        res,
        400,
        false,
        "Cannot book appointment with yourself"
      );
    }

    // Parse and validate date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return sendResponse(res, 400, false, "Invalid date format");
    }

    // Check if appointment is in the past
    if (appointmentDate < new Date()) {
      return sendResponse(
        res,
        400,
        false,
        "Cannot book appointments in the past"
      );
    }

    // Check for conflicting appointments
    logger.info(`Checking for conflicts: doctor=${doctorId}, date=${appointmentDate.toISOString()}, timeSlot=${JSON.stringify(timeSlot)}`);
    
    const conflictingAppointment = await AppointmentModel.findOne({
      doctor: doctorId,
      date: appointmentDate,
      $and: [
        {
          $or: [
            {
              "timeSlot.startTime": { $lt: timeSlot.endTime },
              "timeSlot.endTime": { $gt: timeSlot.startTime },
            },
          ],
        },
      ],
      status: { $in: ["pending", "confirmed"] },
    });
    
    if (conflictingAppointment) {
      logger.info(`Conflict found: ${JSON.stringify(conflictingAppointment.timeSlot)}`);
    }

    if (conflictingAppointment) {
      return sendResponse(res, 409, false, "Time slot not available");
    }

    // Create appointment
    const appointment = new AppointmentModel({
      patient: patientId,
      doctor: doctorId,
      date: appointmentDate,
      timeSlot,
      duration,
      appointmentType,
      reason,
      specialRequirements,
    });

    await appointment.save();

    // Populate doctor and patient info
    await appointment.populate("patient", "name email");
    await appointment.populate("doctor", "name email");

    // Send notifications
    await sendAppointmentNotification(appointment._id, "appointment_booked");

    // Schedule reminder notifications
    await scheduleAppointmentReminders(appointment._id);

    logger.info(
      `Appointment created: ${appointment._id} by patient ${patientId}`
    );
    sendResponse(
      res,
      201,
      true,
      "Appointment booked successfully",
      appointment
    );
  } catch (error) {
    logger.error("Error creating appointment:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// 🟡 Get All Appointments (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, doctor, patient, date } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (doctor) filter.doctor = doctor;
    if (patient) filter.patient = patient;
    if (date) filter.date = new Date(date);

    const appointments = await AppointmentModel.find(filter)
      .populate("patient", "name email phone")
      .populate("doctor", "name email phone")
      .sort({ date: -1, "timeSlot.startTime": 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AppointmentModel.countDocuments(filter);

    sendResponse(res, 200, true, "Appointments retrieved successfully", {
      appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAppointments: total,
      },
    });
  } catch (error) {
    logger.error("Error fetching appointments:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// 🔵 Get Appointments by User (Patient or Doctor)
const getUserAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, upcoming } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const filter = {};
    if (userRole === "patient") {
      filter.patient = userId;
    } else if (userRole === "doctor") {
      filter.doctor = userId;
    }

    if (status) filter.status = status;

    if (upcoming === "true") {
      filter.date = { $gte: new Date() };
      filter.status = { $in: ["pending", "confirmed"] };
    }

    const appointments = await AppointmentModel.find(filter)
      .populate("patient", "name email phone")
      .populate("doctor", "name email phone")
      .sort({ date: upcoming === "true" ? 1 : -1, "timeSlot.startTime": 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AppointmentModel.countDocuments(filter);

    sendResponse(res, 200, true, "Appointments retrieved successfully", {
      appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAppointments: total,
      },
    });
  } catch (error) {
    logger.error("Error fetching user appointments:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// 🟠 Update Appointment Status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      return sendResponse(res, 404, false, "Appointment not found");
    }

    // Check permissions
    if (userRole === "patient" && appointment.patient.toString() !== userId) {
      return sendResponse(res, 403, false, "Access denied");
    }
    if (userRole === "doctor" && appointment.doctor.toString() !== userId) {
      return sendResponse(res, 403, false, "Access denied");
    }

    // Validate status transitions
    const validStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "no-show",
    ];
    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, false, "Invalid status");
    }

    // Business rules for status changes
    if (userRole === "patient" && !["cancelled"].includes(status)) {
      return sendResponse(
        res,
        400,
        false,
        "Patients can only cancel appointments"
      );
    }

    if (
      userRole === "doctor" &&
      !["confirmed", "completed", "no-show", "cancelled"].includes(status)
    ) {
      return sendResponse(res, 400, false, "Invalid status change for doctor");
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;

    await appointment.save();
    await appointment.populate("patient", "name email");
    await appointment.populate("doctor", "name email");

    // Send notification for status change
    if (status === "confirmed") {
      await sendAppointmentNotification(
        appointment._id,
        "appointment_confirmed"
      );
    } else if (status === "cancelled") {
      await sendAppointmentNotification(
        appointment._id,
        "appointment_cancelled"
      );
    }

    logger.info(
      `Appointment ${id} status updated to ${status} by ${userRole} ${userId}`
    );
    sendResponse(
      res,
      200,
      true,
      "Appointment updated successfully",
      appointment
    );
  } catch (error) {
    logger.error("Error updating appointment:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Get available time slots for a doctor on a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    if (!doctorId || !date) {
      return sendResponse(res, 400, false, "Doctor ID and date are required");
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return sendResponse(res, 400, false, "Invalid date format");
    }

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return sendResponse(res, 404, false, "Doctor not found");
    }

    // Get all booked appointments for this doctor on this date
    const bookedAppointments = await AppointmentModel.find({
      doctor: doctorId,
      date: appointmentDate,
      status: { $in: ["pending", "confirmed"] },
    }).select("timeSlot");

    // Define working hours (9 AM to 5 PM, 30-minute slots)
    const workingHours = {
      start: "09:00",
      end: "17:00",
      slotDuration: 30, // minutes
    };

    const availableSlots = generateAvailableSlots(
      workingHours,
      bookedAppointments
    );

    sendResponse(res, 200, true, "Available slots retrieved successfully", {
      date,
      doctor: { id: doctor._id, name: doctor.name },
      availableSlots,
    });
  } catch (error) {
    logger.error("Error fetching available slots:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

// Helper function to generate available time slots
const generateAvailableSlots = (workingHours, bookedAppointments) => {
  const slots = [];
  const startTime = new Date(`2000-01-01T${workingHours.start}:00`);
  const endTime = new Date(`2000-01-01T${workingHours.end}:00`);
  const slotDuration = workingHours.slotDuration * 60 * 1000; // Convert to milliseconds

  // Convert booked appointments to time ranges
  const bookedSlots = bookedAppointments.map((apt) => {
    // Handle both HH:MM and HH:MM:SS formats
    const startTimeStr = apt.timeSlot.startTime.length === 5 
      ? `${apt.timeSlot.startTime}:00` 
      : apt.timeSlot.startTime;
    const endTimeStr = apt.timeSlot.endTime.length === 5 
      ? `${apt.timeSlot.endTime}:00` 
      : apt.timeSlot.endTime;
    
    return {
      start: new Date(`2000-01-01T${startTimeStr}`),
      end: new Date(`2000-01-01T${endTimeStr}`),
    };
  });

  // Generate all possible time slots
  for (
    let time = startTime.getTime();
    time < endTime.getTime();
    time += slotDuration
  ) {
    const slotStart = new Date(time);
    const slotEnd = new Date(time + slotDuration);

    // Check if this slot overlaps with any booked appointment
    const isBooked = bookedSlots.some(
      (booked) => {
        // Two time ranges overlap if: start1 < end2 && start2 < end1
        return slotStart < booked.end && slotEnd > booked.start;
      }
    );

    if (!isBooked) {
      slots.push({
        startTime: slotStart.toTimeString().slice(0, 5),
        endTime: slotEnd.toTimeString().slice(0, 5),
      });
    }
  }

  return slots;
};

// 🔴 Delete Appointment
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      return sendResponse(res, 404, false, "Appointment not found");
    }

    // Check permissions
    if (userRole === "patient" && appointment.patient.toString() !== userId) {
      return sendResponse(res, 403, false, "Access denied");
    }
    if (userRole === "doctor" && appointment.doctor.toString() !== userId) {
      return sendResponse(res, 403, false, "Access denied");
    }

    // Only allow deletion of pending appointments
    if (appointment.status !== "pending") {
      return sendResponse(
        res,
        400,
        false,
        "Can only delete pending appointments"
      );
    }

    await AppointmentModel.findByIdAndDelete(id);

    logger.info(`Appointment ${id} deleted by ${userRole} ${userId}`);
    sendResponse(res, 200, true, "Appointment deleted successfully");
  } catch (error) {
    logger.error("Error deleting appointment:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getUserAppointments,
  updateAppointmentStatus,
  getAvailableSlots,
  deleteAppointment,
};
