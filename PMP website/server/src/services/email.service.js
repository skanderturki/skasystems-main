const nodemailer = require('nodemailer');
const { NODE_ENV } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: `"PMP Learn" <${process.env.SMTP_USER || 'noreply@pmplearn.com'}>`,
    to: email,
    subject: 'Verify your PMP Learn account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5; text-align: center;">PMP Learn</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e1b4b;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  if (NODE_ENV === 'development' && !process.env.SMTP_USER) {
    console.log(`\n[DEV] Verification code for ${email}: ${code}\n`);
    return;
  }

  await transporter.sendMail(mailOptions);
}

module.exports = { generateVerificationCode, sendVerificationEmail };
