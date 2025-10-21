const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendMail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || '命理排盘系统 <no-reply@localhost>';
  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}

module.exports = { sendMail };