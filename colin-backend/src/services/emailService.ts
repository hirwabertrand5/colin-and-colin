import nodemailer from 'nodemailer';

const {
  BREVO_SMTP_HOST,
  BREVO_SMTP_PORT,
  BREVO_SMTP_USER,
  BREVO_SMTP_PASS,
  EMAIL_FROM,
} = process.env;

export const sendEmail = async (to: string[], subject: string, html: string) => {
  if (!BREVO_SMTP_HOST || !BREVO_SMTP_PORT || !BREVO_SMTP_USER || !BREVO_SMTP_PASS || !EMAIL_FROM) {
    console.warn('Email not sent: Brevo SMTP env vars not configured.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: BREVO_SMTP_HOST,
    port: Number(BREVO_SMTP_PORT),
    secure: Number(BREVO_SMTP_PORT) === 465, // 465 secure, 587 STARTTLS
    auth: {
      user: BREVO_SMTP_USER,
      pass: BREVO_SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
};