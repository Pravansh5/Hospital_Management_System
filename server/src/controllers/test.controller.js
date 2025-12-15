const { sendEmail } = require("../services/emailService");
const { sendResponse } = require("../utils/responseHelper");
const logger = require("../utils/logger");

// Test email functionality
const testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return sendResponse(res, 400, false, "Email address is required");
    }

    const testSubject = "Test Email from Hospital Management System";
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Email Test Successful!</h2>
        <p>This is a test email to verify that your email configuration is working correctly.</p>
        <p>If you received this email, your SMTP settings are properly configured.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Best regards,<br>Hospital Management System</p>
      </div>
    `;

    const result = await sendEmail(email, testSubject, testHtml);
    
    if (result.success) {
      logger.info(`Test email sent successfully to ${email}`);
      sendResponse(res, 200, true, "Test email sent successfully", {
        recipient: email,
        messageId: result.messageId
      });
    } else {
      logger.error(`Test email failed for ${email}: ${result.error}`);
      sendResponse(res, 500, false, `Failed to send test email: ${result.error}`);
    }
  } catch (error) {
    logger.error("Error in test email:", error);
    sendResponse(res, 500, false, "Internal server error");
  }
};

module.exports = {
  testEmail,
};