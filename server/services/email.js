import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

const hasSmtpConfig =
  !!env.SMTP_HOST &&
  !!env.SMTP_PORT &&
  !!env.SMTP_USER &&
  !!env.SMTP_PASS &&
  !!env.SMTP_FROM

let transporter = null

if (hasSmtpConfig) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  })
}

export async function sendVerificationEmail({ to, name, verificationLink }) {
  if (!transporter) {
    console.warn(`SMTP is not configured. Verification link for ${to}: ${verificationLink}`)
    return { sent: false }
  }

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'Verify your ResumeAI account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; line-height: 1.6; color: #0f172a;">
          <h2 style="margin-bottom: 8px;">Verify your email</h2>
          <p>Hi ${name || 'there'},</p>
          <p>Thanks for signing up for ResumeAI. Please verify your email by clicking the button below.</p>
          <p style="margin: 24px 0;">
            <a href="${verificationLink}" style="background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block;">Verify Email</a>
          </p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
      text: `Hi ${name || 'there'}, verify your ResumeAI email: ${verificationLink}`,
    })

    return { sent: true }
  } catch (error) {
    console.warn(`SMTP send failed for ${to}: ${error.message}`)
    return { sent: false, error: error.message }
  }
}
