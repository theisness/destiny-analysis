const nodemailer = require('nodemailer');

// 解析端口与 secure：
// - 若显式设置 SMTP_SECURE=true/false，则按其值
// - 否则：端口 465 走 implicit TLS (secure=true)，其他端口默认 secure=false（支持 STARTTLS）
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const secureEnv = String(process.env.SMTP_SECURE || '').toLowerCase();
const secure = secureEnv === 'true' ? true : (secureEnv === 'false' ? false : port === 465);

const transportOptions = {
  host: process.env.SMTP_HOST,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// 可选：允许自签名或内部证书（默认 true）；将 SMTP_TLS_REJECT_UNAUTHORIZED=false 可关闭严格校验
if (String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'false') {
  transportOptions.tls = { rejectUnauthorized: false };
}

const transporter = nodemailer.createTransport(transportOptions);

async function sendMail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || '命理排盘系统 <no-reply@localhost>';
  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}

module.exports = { sendMail };