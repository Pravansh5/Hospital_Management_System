const nodemailer = require("nodemailer");
const twilio = require("twilio");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Twilio client for SMS
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Smart Scheduler" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Email send failed:", error);
    return { success: false, error: error.message };
  }
};

const sendSMS = async (to, message) => {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    console.log(`✅ SMS sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("❌ SMS send failed:", error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  appointment_booked: (data) => ({
    subject: "Appointment Booked Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Appointment Booked Successfully</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your appointment has been successfully booked with ${
          data.doctorName
        }.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
          <p><strong>Type:</strong> ${data.appointmentType}</p>
          ${
            data.location
              ? `<p><strong>Location:</strong> ${data.location}</p>`
              : ""
          }
          ${
            data.meetingLink
              ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>`
              : ""
          }
        </div>
        <p>Please arrive 15 minutes early for your appointment.</p>
        <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
        <p>Best regards,<br>Smart Scheduler Team</p>
      </div>
    `,
  }),

  appointment_reminder: (data) => ({
    subject: "Appointment Reminder",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">Appointment Reminder</h2>
        <p>Dear ${data.patientName},</p>
        <p>This is a friendly reminder of your upcoming appointment.</p>
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Doctor:</strong> ${data.doctorName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
          <p><strong>Type:</strong> ${data.appointmentType}</p>
          ${
            data.location
              ? `<p><strong>Location:</strong> ${data.location}</p>`
              : ""
          }
          ${
            data.meetingLink
              ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>`
              : ""
          }
        </div>
        <p>Please ensure you have all necessary documents and arrive on time.</p>
        <p>Best regards,<br>Smart Scheduler Team</p>
      </div>
    `,
  }),

  appointment_cancelled: (data) => ({
    subject: "Appointment Cancelled",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">Appointment Cancelled</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your appointment with ${data.doctorName} scheduled for ${data.date} at ${data.time} has been cancelled.</p>
        <p>If you would like to reschedule, please book a new appointment through our platform.</p>
        <p>We apologize for any inconvenience caused.</p>
        <p>Best regards,<br>Smart Scheduler Team</p>
      </div>
    `,
  }),

  appointment_confirmed: (data) => ({
    subject: "Appointment Confirmed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Appointment Confirmed</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your appointment with ${data.doctorName} has been confirmed.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
          <p><strong>Type:</strong> ${data.appointmentType}</p>
          ${
            data.location
              ? `<p><strong>Location:</strong> ${data.location}</p>`
              : ""
          }
          ${
            data.meetingLink
              ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>`
              : ""
          }
        </div>
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>Smart Scheduler Team</p>
      </div>
    `,
  }),
};

// SMS templates
const smsTemplates = {
  appointment_reminder: (data) =>
    `Reminder: Your appointment with ${data.doctorName} is tomorrow at ${data.time}. Please arrive 15 minutes early.`,

  appointment_booked: (data) =>
    `Appointment booked with ${data.doctorName} on ${data.date} at ${data.time}. Confirmation sent to your email.`,

  appointment_cancelled: (data) =>
    `Your appointment with ${data.doctorName} on ${data.date} at ${data.time} has been cancelled.`,
};

const sendNotification = async (channel, recipient, type, data) => {
  const template =
    channel === "email" ? emailTemplates[type] : smsTemplates[type];
  if (!template) {
    console.error(`Template not found for type: ${type}`);
    return { success: false, error: "Template not found" };
  }

  const content = typeof template === "function" ? template(data) : template;

  if (channel === "email") {
    return await sendEmail(recipient, content.subject, content.html);
  } else if (channel === "sms") {
    return await sendSMS(recipient, content);
  }

  return { success: false, error: "Unsupported channel" };
};

module.exports = {
  sendEmail,
  sendSMS,
  sendNotification,
  emailTemplates,
  smsTemplates,
};
