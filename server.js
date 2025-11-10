const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'nagwas@positivedisciplinedxb.com';
const LOGO_PATH = path.join(__dirname, 'assets', 'logo.png');

let transporter = null;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

initializeTransporter();

app.post('/api/forms/submit', ensureTransporter, async (req, res) => {
  try {
    const { formType, formName, data } = req.body;

    if (!formType || !data) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload. Missing form type or data.'
      });
    }

    if (!data.email) {
      return res.status(400).json({
        success: false,
        message: 'The form must include an email address.'
      });
    }

    const submitterName = data.name || 'there';
    const adminMailOptions = buildAdminEmail({
      formType,
      formName,
      data
    });

    const welcomeMailOptions = buildWelcomeEmail({
      to: data.email,
      name: submitterName,
      logoPath: fs.existsSync(LOGO_PATH) ? LOGO_PATH : null
    });

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(welcomeMailOptions)
    ]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to process form submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to send emails at this time. Please try again later.'
    });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Positive Discipline server running on http://localhost:${PORT}`);
});

function initializeTransporter() {
  const { SMTP_HOST, SMTP_PORT = 587, SMTP_SECURE = 'false', SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP credentials are not fully configured. Email sending will be disabled until environment variables are set.');
    return;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  transporter.verify((error) => {
    if (error) {
      console.error('Failed to verify SMTP configuration:', error);
    } else {
      console.log('SMTP configuration verified successfully.');
    }
  });
}

function ensureTransporter(req, res, next) {
  if (!transporter) {
    return res.status(500).json({
      success: false,
      message: 'Email transport is not configured. Please contact the site administrator.'
    });
  }
  next();
}

function buildAdminEmail({ formType, formName, data }) {
  const subject = `[Positive Discipline] New ${formName || formType} submission`;
  const submittedAt = data.submittedAt ? new Date(data.submittedAt).toLocaleString() : new Date().toLocaleString();

  const rows = Object.entries(data)
    .filter(([key]) => !['submittedAt'].includes(key))
    .map(([key, value]) => (
      `<tr>
        <th style="text-align:left; padding:8px; background:#f7f9fa; border-bottom:1px solid #e1e7eb;">${formatKey(key)}</th>
        <td style="padding:8px; border-bottom:1px solid #e1e7eb;">${formatValue(value)}</td>
      </tr>`
    ))
    .join('');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #264653;">
      <h2 style="color:#1f8a89; font-weight:700;">New ${escapeHtml(formName || formType)} submission</h2>
      <p style="margin-bottom:16px;">Received on <strong>${submittedAt}</strong>.</p>
      <table style="width:100%; border-collapse:collapse; background:#ffffff; border-radius:12px; overflow:hidden;">
        ${rows}
      </table>
    </div>
  `;

  return {
    to: ADMIN_EMAIL,
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    subject,
    html
  };
}

function buildWelcomeEmail({ to, name, logoPath }) {
  const escapedName = escapeHtml(name);
  const cid = 'pd-logo@positive-discipline';
  const paymentLink = process.env.PAYMENT_URL || 'https://positivedisciplinedxb.com/payment';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color:#264653; line-height:1.6;">
      ${logoPath ? `<div style="text-align:center; margin-bottom:24px;">
        <img src="cid:${cid}" alt="Positive Discipline DXB" style="max-width:200px; height:auto;" />
      </div>` : ''}
      <p>Hello ${escapedName}, and welcome to Our Positive Discipline Family.</p>
      <p>I am <strong>Nagwa El Saadani</strong>, a certified and licensed Positive Discipline educator and the facilitator of the Positive Discipline workshops.</p>
      <p>Congratulations on taking the first step towards transforming your parenting journey.</p>
      <p>If you've secured your spot already by completing the payment process, please fill out the questionnaire below to help me get to know you better:</p>
      <ol style="padding-left:20px; margin:16px 0;">
        <li>How many children do you have?</li>
        <li>What are their ages?</li>
        <li>What is the age of the child you have the most challenges with?</li>
        <li>What is your biggest parenting challenge right now?</li>
        <li>What are you hoping to learn in the workshop?</li>
        <li>Have you attended other parenting workshops before? If yes, which?</li>
      </ol>
      <p>If you didn't yet, complete the payment process <a href="${paymentLink}" style="color:#1f8a89; font-weight:600;">here</a> for direct payment, or if you have chosen to pay in 4 installments with Tabby, you will receive a payment link shortly. It is a small, cozy setup, so limited spots are available.</p>
      <p>I cannot wait to meet you all in person soon.</p>
      <p style="margin-top:24px;">Warmly,<br/>Nagwa El Saadani</p>
    </div>
  `;

  const mailOptions = {
    to,
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    subject: 'Welcome to Positive Discipline DXB',
    html
  };

  if (logoPath) {
    mailOptions.attachments = [
      {
        filename: path.basename(logoPath),
        path: logoPath,
        cid
      }
    ];
  }

  return mailOptions;
}

function formatKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item)).join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return `<pre style="font-family: Consolas, 'Courier New', monospace; background:#f4f6f8; padding:12px; border-radius:8px;">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
  }
  return escapeHtml(String(value || ''));
}

function escapeHtml(value) {
  const str = value == null ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

