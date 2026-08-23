const nodemailer = require('nodemailer');

function createTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendContactEmail({ name, phone, email, message }) {
  const transport = createTransport();
  const to = process.env.CONTACT_TO_EMAIL || 'tanlocha45@gmail.com';

  if (!transport) {
    console.warn('[mailer] SMTP chưa được cấu hình — bỏ qua gửi email, chỉ ghi log.');
    console.log('[contact-form]', { name, phone, email, message });
    return { delivered: false };
  }

  await transport.sendMail({
    from: `"Website Tan Loc Advertising" <${process.env.SMTP_USER}>`,
    to,
    replyTo: email || undefined,
    subject: `[Liên hệ website] Yêu cầu mới từ ${name}`,
    text: `Họ tên: ${name}\nSĐT: ${phone}\nEmail: ${email || 'Không cung cấp'}\n\nNội dung:\n${message}`,
    html: `
      <h3>Yêu cầu liên hệ mới từ website</h3>
      <p><strong>Họ tên:</strong> ${escapeHtml(name)}</p>
      <p><strong>SĐT:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email || 'Không cung cấp')}</p>
      <p><strong>Nội dung:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
    `
  });

  return { delivered: true };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendContactEmail };
