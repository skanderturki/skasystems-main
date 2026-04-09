const { Resend } = require('resend');
const { NODE_ENV } = require('../config/env');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'PMP Learn <noreply@skasystems.com>';

if (!RESEND_API_KEY) {
  console.warn('[Resend] RESEND_API_KEY is not set — verification emails will fail in production');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, code) {
  // Dev fallback: print the code to the console when Resend isn't configured,
  // so local development works without a live API key.
  if (!resend) {
    if (NODE_ENV === 'development') {
      console.log(`\n[DEV] Verification code for ${email}: ${code}\n`);
      return;
    }
    throw new Error('Email service not configured (RESEND_API_KEY missing)');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5; text-align: center;">PMP Learn</h2>
      <p>Your verification code is:</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e1b4b;">${code}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: RESEND_FROM,
    to: email,
    subject: 'Verify your PMP Learn account',
    html,
  });

  if (error) {
    console.error('[Resend] Failed to send verification email:', error.message || error);
    throw new Error(`Failed to send verification email: ${error.message || 'unknown error'}`);
  }

  console.log(`[Resend] Verification email sent to ${email} (id=${data?.id})`);
}

module.exports = { generateVerificationCode, sendVerificationEmail };
