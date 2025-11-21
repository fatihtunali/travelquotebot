import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import nodemailer from 'nodemailer';

// POST - Request booking for an itinerary
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if it's a UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = isUUID
      ? 'SELECT * FROM customer_itineraries WHERE uuid = ? LIMIT 1'
      : 'SELECT * FROM customer_itineraries WHERE id = ? LIMIT 1';

    const [itineraries]: any = await pool.query(query, [id]);

    if (!itineraries || itineraries.length === 0) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    const itinerary = itineraries[0];

    // Check if already requested booking
    if (itinerary.booking_requested_at) {
      return NextResponse.json({
        success: true,
        message: 'Booking request already submitted',
        alreadyRequested: true,
        requestedAt: itinerary.booking_requested_at
      });
    }

    // Update database - mark as booking requested
    await pool.query(
      `UPDATE customer_itineraries
       SET booking_requested_at = NOW(),
           status = 'pending'
       WHERE id = ?`,
      [itinerary.id]
    );

    // Get organization details for email
    const [orgData]: any = await pool.query(
      'SELECT * FROM organizations WHERE id = ?',
      [itinerary.organization_id]
    );

    const organization = orgData[0];

    // Send email notification to organization
    if (organization && organization.email) {
      try {
        await sendBookingNotificationEmail(itinerary, organization);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Send confirmation email to customer (optional)
    if (itinerary.customer_email) {
      try {
        await sendCustomerConfirmationEmail(itinerary, organization);
      } catch (emailError) {
        console.error('Failed to send customer confirmation:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully',
      itineraryId: itinerary.id,
      uuid: itinerary.uuid
    });

  } catch (error: any) {
    console.error('Error processing booking request:', error);
    return NextResponse.json(
      { error: 'Failed to process booking request', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to send email to organization
async function sendBookingNotificationEmail(itinerary: any, organization: any) {
  // Create transporter (using environment variables for email config)
  const transportConfig: any = {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '25'),
    secure: false, // true for 465, false for other ports
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates for local Postfix
    }
  };

  // Only add auth if SMTP_PASS is provided (for authenticated SMTP servers)
  if (process.env.SMTP_PASS) {
    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
  }

  const transporter = nodemailer.createTransport(transportConfig);

  const itineraryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/itinerary/${itinerary.uuid}`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/dashboard/quotes`;

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🎉 New Booking Request!</h2>

      <p>A customer has requested to book the following itinerary:</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Itinerary Details</h3>
        <p><strong>Destination:</strong> ${itinerary.destination}</p>
        <p><strong>Dates:</strong> ${new Date(itinerary.start_date).toLocaleDateString()} - ${new Date(itinerary.end_date).toLocaleDateString()}</p>
        <p><strong>Travelers:</strong> ${itinerary.adults} Adult${itinerary.adults > 1 ? 's' : ''}${itinerary.children > 0 ? `, ${itinerary.children} Child${itinerary.children > 1 ? 'ren' : ''}` : ''}</p>
        <p><strong>Total Price:</strong> €${parseFloat(itinerary.total_price).toFixed(2)}</p>
        <p><strong>Price Per Person:</strong> €${parseFloat(itinerary.price_per_person).toFixed(2)}</p>
      </div>

      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Customer Information</h3>
        <p><strong>Name:</strong> ${itinerary.customer_name}</p>
        <p><strong>Email:</strong> <a href="mailto:${itinerary.customer_email}">${itinerary.customer_email}</a></p>
        ${itinerary.customer_phone ? `<p><strong>Phone:</strong> <a href="tel:${itinerary.customer_phone}">${itinerary.customer_phone}</a></p>` : ''}
        ${itinerary.special_requests ? `<p><strong>Special Requests:</strong> ${itinerary.special_requests}</p>` : ''}
      </div>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${itineraryUrl}" style="display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          View Itinerary
        </a>
        <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-left: 10px;">
          Go to Dashboard
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">
        Please contact the customer within 24 hours to confirm the booking and finalize arrangements.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        This is an automated notification from your Travel Quote Bot system.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || organization.name}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    replyTo: organization.email || process.env.EMAIL_FROM,
    to: organization.email,
    subject: `🎉 New Booking Request - ${itinerary.customer_name} - ${itinerary.destination}`,
    html: emailBody,
  });
}

// Helper function to send confirmation email to customer
async function sendCustomerConfirmationEmail(itinerary: any, organization: any) {
  const transportConfig: any = {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '25'),
    secure: false,
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates for local Postfix
    }
  };

  // Only add auth if SMTP_PASS is provided (for authenticated SMTP servers)
  if (process.env.SMTP_PASS) {
    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
  }

  const transporter = nodemailer.createTransport(transportConfig);

  const itineraryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/itinerary/${itinerary.uuid}`;

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Thank You for Your Booking Request!</h2>

      <p>Dear ${itinerary.customer_name},</p>

      <p>We've received your booking request for your <strong>${itinerary.destination}</strong> trip. Our travel specialists are reviewing your itinerary and will contact you within 24 hours to finalize your booking.</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Your Trip Summary</h3>
        <p><strong>Destination:</strong> ${itinerary.destination}</p>
        <p><strong>Dates:</strong> ${new Date(itinerary.start_date).toLocaleDateString()} - ${new Date(itinerary.end_date).toLocaleDateString()}</p>
        <p><strong>Travelers:</strong> ${itinerary.adults} Adult${itinerary.adults > 1 ? 's' : ''}${itinerary.children > 0 ? `, ${itinerary.children} Child${itinerary.children > 1 ? 'ren' : ''}` : ''}</p>
        <p><strong>Total Price:</strong> €${parseFloat(itinerary.total_price).toFixed(2)}</p>
      </div>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${itineraryUrl}" style="display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          View Your Itinerary
        </a>
      </div>

      <p><strong>What happens next?</strong></p>
      <ul style="color: #4b5563;">
        <li>Our team will review your itinerary details</li>
        <li>We'll contact you within 24 hours to confirm availability</li>
        <li>We'll answer any questions you may have</li>
        <li>Once confirmed, we'll send you payment and booking instructions</li>
      </ul>

      <p>If you have any urgent questions, please contact us at:</p>
      <p>
        📧 Email: <a href="mailto:${organization.email}">${organization.email}</a><br>
        ${organization.phone ? `📞 Phone: <a href="tel:${organization.phone}">${organization.phone}</a><br>` : ''}
        ${organization.website ? `🌐 Website: <a href="${organization.website}">${organization.website}</a>` : ''}
      </p>

      <p>We're excited to help you plan your perfect trip!</p>

      <p>Best regards,<br>
      <strong>${organization.name}</strong></p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        You're receiving this email because you requested to book a trip through ${organization.name}.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || organization.name}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    replyTo: organization.email || process.env.EMAIL_FROM,
    to: itinerary.customer_email,
    subject: `Booking Request Received - ${itinerary.destination} Trip`,
    html: emailBody,
  });
}
