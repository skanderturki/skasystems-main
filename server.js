const path = require('path');
const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'Academix <noreply@academix.tn>';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'contact@academix.tn';

// Optional preview password gate. When SITE_PASSWORD is empty, the gate is a
// no-op and the site is fully public. Setting SITE_PASSWORD activates HTTP
// Basic Auth on all non-/api routes.
const SITE_USERNAME = process.env.SITE_USERNAME || 'preview';
const SITE_PASSWORD = process.env.SITE_PASSWORD || '';

if (!RESEND_API_KEY) {
  console.warn('[Resend] RESEND_API_KEY is not set — /api/contact will fail in production');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Constant-time string comparison. Pads to equal length first so the early
// return on length mismatch doesn't leak via timing.
function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  const len = Math.max(ab.length, bb.length, 1);
  const ap = Buffer.alloc(len);
  const bp = Buffer.alloc(len);
  ab.copy(ap);
  bb.copy(bp);
  return crypto.timingSafeEqual(ap, bp) && ab.length === bb.length;
}

const app = express();

// Trust first proxy so rate-limiter and req.ip work behind host nginx
app.set('trust proxy', 1);

app.use(express.json({ limit: '100kb' }));

// Site-wide HTTP Basic Auth gate — activates only when SITE_PASSWORD is set.
// /api/* routes always bypass so the contact form and health checks keep
// working for monitors and form submissions from the gated preview.
if (SITE_PASSWORD) {
  console.log('[auth] Site password gate is ENABLED (user: %s)', SITE_USERNAME);
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();

    const header = req.headers.authorization || '';
    const [scheme, encoded] = header.split(' ');

    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const idx = decoded.indexOf(':');
      const user = idx >= 0 ? decoded.slice(0, idx) : '';
      const pass = idx >= 0 ? decoded.slice(idx + 1) : '';
      if (safeEqual(user, SITE_USERNAME) && safeEqual(pass, SITE_PASSWORD)) {
        return next();
      }
    }

    res.set('WWW-Authenticate', 'Basic realm="skasystems.com preview"');
    res.status(401).type('text/plain').send('Authentication required.');
  });
}

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
      <h2 style="color: #0e2a47;">New contact from academix.tn</h2>
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
      subject: `[academix.tn] ${serviceType} — ${name}`,
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
  console.log(`[academix] Main website server running on port ${PORT}`);
});
