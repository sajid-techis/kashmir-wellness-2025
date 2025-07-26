// src/utils/sendEmail.js
// This file provides a utility function for sending emails using Nodemailer.
// It can be configured with various SMTP services or transactional email APIs.

const nodemailer = require('nodemailer');

/**
 * @desc Sends an email using Nodemailer.
 * @param {Object} options - Email options.
 * @param {string} options.email - Recipient's email address.
 * @param {string} options.subject - Subject of the email.
 * @param {string} options.message - Plain text body of the email.
 * @param {string} [options.html] - HTML body of the email (optional).
 */
const sendEmail = async (options) => {
  // 1. Create a transporter object
  // Configure this with your SMTP server details.
  // For development, you can use Ethereal Email (https://ethereal.email/) for testing.
  // For production, consider services like SendGrid, Mailjet, Brevo (Sendinblue), Mailgun, etc.
  // Example for generic SMTP:
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports (STARTTLS)
    auth: {
      user: process.env.SMTP_EMAIL, // Your email address
      pass: process.env.SMTP_PASSWORD, // Your email password or app-specific password
    },
    // Optional: If you encounter issues with self-signed certificates in development,
    // you might add this, but AVOID IN PRODUCTION:
    // tls: {
    //   rejectUnauthorized: false
    // }
  });

  // 2. Define email options
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // Sender address
    to: options.email, // List of recipients
    subject: options.subject, // Subject line
    text: options.message, // Plain text body
    html: options.html || options.message.replace(/\n/g, '<br>'), // HTML body (or convert plain text to basic HTML)
  };

  // 3. Send the email
  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    // For Ethereal, you can get a preview URL: console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent'); // Re-throw to be caught by controller's try/catch
  }
};

module.exports = sendEmail;
