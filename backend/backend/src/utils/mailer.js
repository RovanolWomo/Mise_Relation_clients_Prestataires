const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log('[Mail] Not configured, skipping:', subject, '->', to);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Prestolink" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to, subject, html,
    });
    console.log('[Mail] Sent:', subject, '->', to);
  } catch (e) {
    console.warn('[Mail] Failed:', e.message);
  }
}

module.exports = { sendMail };
