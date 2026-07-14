const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendComplaintRegistered = async (email, complaintId, name) => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Complaint Registered - INOTEC',
      html: `
        <h2>Dear ${name},</h2>
        <p>Your complaint <strong>#${complaintId}</strong> has been registered successfully.</p>
        <p>We will assign an engineer shortly and keep you updated.</p>
        <br>
        <p>Thank you,<br>INOTEC Team</p>
      `
    });
  } catch (error) {
    console.error('Email error:', error);
  }
};