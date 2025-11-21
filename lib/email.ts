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

// Send quote to client
export async function sendQuoteEmail(
  clientEmail: string,
  clientName: string,
  quoteNumber: string,
  destination: string,
  totalAmount: number,
  currency: string,
  expiresAt: string | null,
  organizationName: string,
  organizationEmail: string,
  organizationPhone: string
) {
  const transporter = createTransporter();

  const quoteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/quotes/view/${quoteNumber}`;
  const expiryText = expiresAt
    ? `This quote is valid until ${new Date(expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`
    : '';

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Your Travel Quote is Ready!</h2>

      <p>Dear ${clientName},</p>

      <p>Thank you for your interest in traveling with us. We're pleased to present your personalized travel quote.</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Quote Details</h3>
        <table style="width: 100%; color: #4b5563;">
          <tr>
            <td style="padding: 8px 0;"><strong>Quote Number:</strong></td>
            <td style="padding: 8px 0;">${quoteNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Destination:</strong></td>
            <td style="padding: 8px 0;">${destination}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
            <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #2563eb;">${currency} ${totalAmount.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <p>${expiryText}</p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${quoteUrl}" style="display: inline-block; padding: 14px 40px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          View Full Quote
        </a>
      </div>

      <p>Click the button above to view your complete itinerary, including accommodation details, activities, and pricing breakdown.</p>

      <p>If you have any questions or would like to make changes, please don't hesitate to contact us.</p>

      <p>Best regards,<br>
      <strong>${organizationName}</strong><br>
      ${organizationEmail}<br>
      ${organizationPhone}</p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        This quote was generated by ${organizationName} using TravelQuoteBot.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${organizationName}" <${process.env.EMAIL_FROM || 'info@travelquotebot.com'}>`,
    replyTo: organizationEmail,
    to: clientEmail,
    subject: `Your Travel Quote for ${destination} - ${quoteNumber}`,
    html: emailBody,
  });
}

// Notify operator when quote is accepted
export async function sendQuoteAcceptedNotification(
  operatorEmail: string,
  quoteNumber: string,
  clientName: string,
  clientEmail: string,
  destination: string,
  totalAmount: number,
  currency: string
) {
  const transporter = createTransporter();

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/dashboard/quotes`;

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Quote Accepted!</h2>

      <p>Great news! A client has accepted your travel quote.</p>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
        <h3 style="margin-top: 0; color: #166534;">Booking Details</h3>
        <table style="width: 100%; color: #4b5563;">
          <tr>
            <td style="padding: 8px 0;"><strong>Quote Number:</strong></td>
            <td style="padding: 8px 0;">${quoteNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Client:</strong></td>
            <td style="padding: 8px 0;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;">${clientEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Destination:</strong></td>
            <td style="padding: 8px 0;">${destination}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
            <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #16a34a;">${currency} ${totalAmount.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <p><strong>Next Steps:</strong></p>
      <ul style="color: #4b5563;">
        <li>Convert the quote to a booking</li>
        <li>Send deposit invoice to client</li>
        <li>Confirm supplier bookings</li>
      </ul>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 40px; background: #16a34a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Go to Dashboard
        </a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"TravelQuoteBot" <${process.env.EMAIL_FROM || 'info@travelquotebot.com'}>`,
    to: operatorEmail,
    subject: `Quote Accepted - ${quoteNumber} - ${clientName}`,
    html: emailBody,
  });
}

// Notify operator when quote is rejected
export async function sendQuoteRejectedNotification(
  operatorEmail: string,
  quoteNumber: string,
  clientName: string,
  destination: string,
  rejectionReason: string | null
) {
  const transporter = createTransporter();

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/dashboard/quotes`;

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Quote Declined</h2>

      <p>A client has declined your travel quote.</p>

      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #991b1b;">Quote Details</h3>
        <table style="width: 100%; color: #4b5563;">
          <tr>
            <td style="padding: 8px 0;"><strong>Quote Number:</strong></td>
            <td style="padding: 8px 0;">${quoteNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Client:</strong></td>
            <td style="padding: 8px 0;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Destination:</strong></td>
            <td style="padding: 8px 0;">${destination}</td>
          </tr>
          ${rejectionReason ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Reason:</strong></td>
            <td style="padding: 8px 0;">${rejectionReason}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <p>Consider reaching out to the client to understand their concerns or offer alternative options.</p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 40px; background: #6b7280; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          View Quote History
        </a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"TravelQuoteBot" <${process.env.EMAIL_FROM || 'info@travelquotebot.com'}>`,
    to: operatorEmail,
    subject: `Quote Declined - ${quoteNumber} - ${clientName}`,
    html: emailBody,
  });
}

// Send deposit reminder to client
export async function sendDepositReminder(
  clientEmail: string,
  clientName: string,
  bookingNumber: string,
  destination: string,
  depositAmount: number,
  currency: string,
  dueDate: string,
  organizationName: string,
  organizationEmail: string,
  organizationPhone: string
) {
  const transporter = createTransporter();

  const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Deposit Payment Reminder</h2>

      <p>Dear ${clientName},</p>

      <p>This is a friendly reminder that your deposit payment is due soon.</p>

      <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #92400e;">Payment Details</h3>
        <table style="width: 100%; color: #4b5563;">
          <tr>
            <td style="padding: 8px 0;"><strong>Booking Number:</strong></td>
            <td style="padding: 8px 0;">${bookingNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Destination:</strong></td>
            <td style="padding: 8px 0;">${destination}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Deposit Amount:</strong></td>
            <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #f59e0b;">${currency} ${depositAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Due Date:</strong></td>
            <td style="padding: 8px 0; font-weight: bold; color: #dc2626;">${dueDateFormatted}</td>
          </tr>
        </table>
      </div>

      <p>Please ensure payment is made by the due date to secure your booking.</p>

      <p>If you have already made the payment, please disregard this reminder.</p>

      <p>For payment details or any questions, please contact us.</p>

      <p>Best regards,<br>
      <strong>${organizationName}</strong><br>
      ${organizationEmail}<br>
      ${organizationPhone}</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${organizationName}" <${process.env.EMAIL_FROM || 'info@travelquotebot.com'}>`,
    replyTo: organizationEmail,
    to: clientEmail,
    subject: `Deposit Payment Reminder - ${bookingNumber} - ${destination}`,
    html: emailBody,
  });
}

// Send balance reminder to client
export async function sendBalanceReminder(
  clientEmail: string,
  clientName: string,
  bookingNumber: string,
  destination: string,
  balanceAmount: number,
  currency: string,
  dueDate: string,
  organizationName: string,
  organizationEmail: string,
  organizationPhone: string
) {
  const transporter = createTransporter();

  const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Balance Payment Reminder</h2>

      <p>Dear ${clientName},</p>

      <p>This is a reminder that your final balance payment is due soon.</p>

      <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #92400e;">Payment Details</h3>
        <table style="width: 100%; color: #4b5563;">
          <tr>
            <td style="padding: 8px 0;"><strong>Booking Number:</strong></td>
            <td style="padding: 8px 0;">${bookingNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Destination:</strong></td>
            <td style="padding: 8px 0;">${destination}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Balance Due:</strong></td>
            <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #f59e0b;">${currency} ${balanceAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Due Date:</strong></td>
            <td style="padding: 8px 0; font-weight: bold; color: #dc2626;">${dueDateFormatted}</td>
          </tr>
        </table>
      </div>

      <p>Please ensure the final payment is made by the due date to confirm all arrangements for your trip.</p>

      <p>If you have already made the payment, please disregard this reminder.</p>

      <p>We're looking forward to your upcoming trip!</p>

      <p>Best regards,<br>
      <strong>${organizationName}</strong><br>
      ${organizationEmail}<br>
      ${organizationPhone}</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${organizationName}" <${process.env.EMAIL_FROM || 'info@travelquotebot.com'}>`,
    replyTo: organizationEmail,
    to: clientEmail,
    subject: `Balance Payment Reminder - ${bookingNumber} - ${destination}`,
    html: emailBody,
  });
}

// Send booking confirmation to client
export async function sendBookingConfirmation(
  clientEmail: string,
  clientName: string,
  bookingNumber: string,
  destination: string,
  startDate: string,
  endDate: string,
  totalAmount: number,
  depositAmount: number,
  currency: string,
  organizationName: string,
  organizationEmail: string,
  organizationPhone: string
) {
  const transporter = createTransporter();

  const startDateFormatted = new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const endDateFormatted = new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Booking Confirmed!</h2>

      <p>Dear ${clientName},</p>

      <p>Thank you for booking with us! Your trip has been confirmed.</p>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
        <h3 style="margin-top: 0; color: #166534;">Booking Details</h3>
        <table style="width: 100%; color: #4b5563;">
          <tr>
            <td style="padding: 8px 0;"><strong>Booking Number:</strong></td>
            <td style="padding: 8px 0;">${bookingNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Destination:</strong></td>
            <td style="padding: 8px 0;">${destination}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Travel Dates:</strong></td>
            <td style="padding: 8px 0;">${startDateFormatted} - ${endDateFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
            <td style="padding: 8px 0;">${currency} ${totalAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Deposit Paid:</strong></td>
            <td style="padding: 8px 0;">${currency} ${depositAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Balance Due:</strong></td>
            <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #16a34a;">${currency} ${(totalAmount - depositAmount).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <p><strong>What's Next?</strong></p>
      <ul style="color: #4b5563;">
        <li>We will send your detailed itinerary closer to your departure date</li>
        <li>Balance payment reminder will be sent before the due date</li>
        <li>Travel documents and vouchers will be sent prior to departure</li>
      </ul>

      <p>If you have any questions or need to make changes to your booking, please contact us.</p>

      <p>We look forward to making your trip memorable!</p>

      <p>Best regards,<br>
      <strong>${organizationName}</strong><br>
      ${organizationEmail}<br>
      ${organizationPhone}</p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        Booking confirmation from ${organizationName}
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${organizationName}" <${process.env.EMAIL_FROM || 'info@travelquotebot.com'}>`,
    replyTo: organizationEmail,
    to: clientEmail,
    subject: `Booking Confirmed - ${bookingNumber} - ${destination}`,
    html: emailBody,
  });
}
