const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

const sendOTPEmail = async (email, otp) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      console.error('Gmail credentials not configured');
      return false;
    }

    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Blog App - OTP Verification',
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP for Blog App is:</p>
        <h1 style="color: #667eea; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>Do not share this OTP with anyone.</p>
      `
    });
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

module.exports = { sendOTPEmail };
