import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const [users]: any = await pool.query(
      `SELECT u.*, o.name as organization_name, o.slug
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.verification_token = ? AND u.status = 'pending'`,
      [token]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Check if token has expired
    if (new Date(user.verification_token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update user status to active and clear verification token
    await pool.query(
      `UPDATE users
       SET status = 'active',
           email_verified_at = NOW(),
           verification_token = NULL,
           verification_token_expires_at = NULL
       WHERE id = ?`,
      [user.id]
    );

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.first_name, user.organization_name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Generate JWT token for automatic login
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        slug: user.slug
      }
    });

  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify email' },
      { status: 500 }
    );
  }
}

// GET - For resending verification email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Import here to avoid circular dependency
    const crypto = await import('crypto');
    const { sendVerificationEmail } = await import('@/lib/email');

    // Find pending user
    const [users]: any = await pool.query(
      `SELECT u.*, o.name as organization_name
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.email = ? AND u.status = 'pending'`,
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No pending verification found for this email' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    // Update user with new token
    await pool.query(
      `UPDATE users
       SET verification_token = ?,
           verification_token_expires_at = ?
       WHERE id = ?`,
      [verificationToken, tokenExpiry.toISOString().slice(0, 19).replace('T', ' '), user.id]
    );

    // Send new verification email
    await sendVerificationEmail(user.email, user.first_name, user.organization_name, verificationToken);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });

  } catch (error: any) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
