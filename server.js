const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'SKA Systems <noreply@skasystems.com>';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'skanderturki@gmail.com';

if (!RESEND_API_KEY) {
  console.warn('[Resend] RESEND_API_KEY is not set — /api/contact will fail in production');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const app = express();

// Trust first proxy so rate-limiter and req.ip work behind host nginx
app.set('trust proxy', 1);

app.use(express.json({ limit: '100kb' }));

// Rate limit the contact endpoint: 5 requests per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact requests. Please try again later.' },
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateContact(body) {
  const errors = [];
  const { name, email, serviceType, message } = body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email is required');
  }
  if (!serviceType || typeof serviceType !== 'string') {
    errors.push('Service type is required');
  }
  if (!message || typeof message !== 'string' || message.trim().length < 20) {
    errors.push('Message must be at least 20 characters');
  }

  // Cap lengths to avoid abuse
  if (name && name.length > 200) errors.push('Name is too long');
  if (email && email.length > 200) errors.push('Email is too long');
  if (serviceType && serviceType.length > 200) errors.push('Service type is too long');
  if (message && message.length > 5000) errors.push('Message is too long');

  return errors;
}

// POST /api/contact — send contact form message via Resend
app.post('/api/contact', contactLimiter, async (req, res) => {
  const errors = validateContact(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. ') });
  }

  if (!resend) {
    return res.status(503).json({ error: 'Email service not configured' });
  }

  const { name, email, organization, serviceType, message } = req.body;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0d47a1;">New contact from skasystems.com</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; font-weight: bold; width: 140px;">Name:</td><td style="padding: 8px;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Organization:</td><td style="padding: 8px;">${escapeHtml(organization || 'N/A')}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Service:</td><td style="padding: 8px;">${escapeHtml(serviceType)}</td></tr>
      </table>
      <h3 style="color: #0d47a1;">Message</h3>
      <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; white-space: pre-wrap;">${escapeHtml(message)}</div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[skasystems.com] ${serviceType} — ${name}`,
      html,
    });

    if (error) {
      console.error('[Resend] Failed to send contact email:', error.message || error);
      return res.status(502).json({ error: 'Failed to send message. Please email us directly.' });
    }

    console.log(`[Resend] Contact email sent (id=${data?.id}) from ${email}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('[Resend] Unexpected error sending contact email:', err);
    return res.status(500).json({ error: 'Unexpected error. Please try again later.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the CRA build
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// SPA fallback: any non-API route returns index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[skasystems] Main website server running on port ${PORT}`);
});
