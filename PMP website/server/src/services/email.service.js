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
  // In development, always print the code to the server console so the developer
  // can verify without waiting for email delivery (or without a Resend key at all).
  if (NODE_ENV === 'development') {
    console.log(`\n[DEV] Verification code for ${email}: ${code}\n`);
  }

  if (!resend) {
    if (NODE_ENV === 'development') return; // no key locally — console log is enough
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

// Resend's batch.send accepts up to 100 emails per request.
const BATCH_SIZE = 100;
const BULK_MAX_RECIPIENTS = 500;

// Fan-out helper: send a personalised email to each recipient using Resend's
// batch API. recipients = [{ email, firstName, lastName, ... }];
// renderHtml(recipient) returns the per-recipient HTML body.
async function sendBulkEmail({ recipients, subject, renderHtml }) {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return { sent: 0, failed: [] };
  }
  if (recipients.length > BULK_MAX_RECIPIENTS) {
    throw new Error(`Bulk email exceeds the ${BULK_MAX_RECIPIENTS}-recipient limit`);
  }
  if (!resend) {
    if (NODE_ENV === 'development') {
      console.log(`[DEV] Would send ${recipients.length} emails (subject: "${subject}")`);
      return { sent: recipients.length, failed: [] };
    }
    throw new Error('Email service not configured (RESEND_API_KEY missing)');
  }

  let sent = 0;
  const failed = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    const payload = chunk.map((r) => ({
      from: RESEND_FROM,
      to: r.email,
      subject,
      html: renderHtml(r),
    }));

    try {
      const { data, error } = await resend.batch.send(payload);
      if (error) {
        // Whole batch failed — record every recipient in the batch.
        for (const r of chunk) failed.push({ email: r.email, error: error.message || 'batch error' });
        console.error(`[Resend] Batch send failed:`, error.message || error);
      } else {
        sent += chunk.length;
        const ids = (data?.data || []).map((d) => d.id).filter(Boolean);
        console.log(`[Resend] Bulk batch sent ${chunk.length} email(s) [${ids.length} ids]`);
      }
    } catch (err) {
      for (const r of chunk) failed.push({ email: r.email, error: err.message || 'unknown error' });
      console.error(`[Resend] Batch send threw:`, err.message || err);
    }
  }

  return { sent, failed };
}

module.exports = { generateVerificationCode, sendVerificationEmail, sendBulkEmail };
