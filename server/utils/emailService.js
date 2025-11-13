const nodemailer = require('nodemailer');

let transporter = null;
let useResend = false;

if (process.env.RESEND_API_KEY) {
  useResend = true;
  console.log('Email service: Using Resend API');
} else if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  });
  console.log('Email service: Using Gmail SMTP');
}

const sendOTPEmail = async (email, otp) => {
  try {
    if (useResend) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const result = await resend.emails.send({
        from: 'onboarding@resend.dev',
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

      if (result.error) {
        console.error('Resend error:', result.error);
        return false;
      }

      console.log('Email sent successfully via Resend:', result.data.id);
      return true;
    } else if (transporter) {
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

      console.log('Email sent successfully via Gmail:', result.messageId);
      return true;
    } else {
      console.error('No email service configured');
      return false;
    }
  } catch (error) {
    console.error('Email sending error:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

module.exports = { sendOTPEmail };
