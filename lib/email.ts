import nodemailer from 'nodemailer';

// Create reusable transporter
function createTransporter() {
  const transportConfig: any = {
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  };

  if (process.env.SMTP_PASS) {
    transportConfig.auth = {
      user: process.env.SMTP_USER || 'apikey',
      pass: process.env.SMTP_PASS,
    };
  }

  return nodemailer.createTransport(transportConfig);
}

// Send verification email
export async function sendVerificationEmail(
  userEmail: string,
  userName: string,
  organizationName: string,
  verificationToken: string
) {
  const transporter = createTransporter();

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/verify-email?token=${verificationToken}`;

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to TravelQuoteBot!</h2>

      <p>Hi ${userName},</p>

      <p>Thank you for registering <strong>${organizationName}</strong> with TravelQuoteBot. Please verify your email address to activate your account.</p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Verify Email Address
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="color: #6b7280; font-size: 12px; word-break: break-all;">
        ${verificationUrl}
      </p>

      <p style="color: #6b7280; font-size: 14px;">
        This link will expire in 24 hours.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        If you didn't create this account, please ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'TravelQuoteBot'}" <${process.env.EMAIL_FROM || 'info@travelquotebot.com'}>`,
    to: userEmail,
    bcc: 'info@travelquotebot.com',
    subject: `Verify your email - ${organizationName}`,
    html: emailBody,
  });
}

// Send welcome email after verification
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  organizationName: string
) {
  const transporter = createTransporter();

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/login`;

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🎉 Email Verified Successfully!</h2>

      <p>Hi ${userName},</p>

      <p>Your email has been verified and your account for <strong>${organizationName}</strong> is now active!</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">What's Next?</h3>
        <ul style="color: #4b5563; padding-left: 20px;">
          <li>Log in to your dashboard</li>
          <li>Set up your pricing data</li>
          <li>Start creating AI-powered travel quotes</li>
        </ul>
      </div>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${loginUrl}" style="display: inline-block; padding: 14px 40px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Go to Dashboard
        </a>
      </div>

      <p>If you have any questions, feel free to reply to this email.</p>

      <p>Best regards,<br>
      <strong>TravelQuoteBot Team</strong></p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        You're receiving this email because you registered at TravelQuoteBot.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'TravelQuoteBot'}" <${process.env.EMAIL_FROM || 'info@travelquotebot.com'}>`,
    to: userEmail,
    subject: `Welcome to TravelQuoteBot - ${organizationName}`,
    html: emailBody,
  });
}
