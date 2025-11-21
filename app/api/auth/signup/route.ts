import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

// C6: Remove fallback - JWT_SECRET is required
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export async function POST(request: NextRequest) {
  try {
    const {
      organizationName,
      slug,
      firstName,
      lastName,
      email,
      password,
      planType
    } = await request.json();

    // Validation
    if (!organizationName || !slug || !firstName || !lastName || !email || !password || !planType) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if email already exists
      const [existingUsers]: any = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }

      // Check if slug already exists
      const [existingOrgs]: any = await connection.query(
        'SELECT id FROM organizations WHERE slug = ?',
        [slug]
      );

      if (existingOrgs.length > 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          { error: 'Subdomain already taken. Please choose another.' },
          { status: 400 }
        );
      }

      // 1. Create organization
      const [orgResult]: any = await connection.query(
        `INSERT INTO organizations (name, slug, email, status, created_at)
         VALUES (?, ?, ?, 'active', NOW())`,
        [organizationName, slug, email]
      );

      const organizationId = orgResult.insertId;

      // 2. Create subscription
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

      // Define credits and pricing for each plan
      const planDetails: { [key: string]: { credits: number; price: number } } = {
        starter: { credits: 50, price: 0 },
        professional: { credits: 200, price: 99 },
        enterprise: { credits: 1000, price: 299 }
      };

      const selectedPlan = planDetails[planType] || planDetails.starter;

      const [subResult]: any = await connection.query(
        `INSERT INTO subscriptions (organization_id, plan_type, monthly_credits, price, status, trial_ends_at, current_period_start, current_period_end, created_at)
         VALUES (?, ?, ?, ?, 'trial', ?, NOW(), ?, NOW())`,
        [organizationId, planType, selectedPlan.credits, selectedPlan.price, trialEndDate.toISOString().slice(0, 19).replace('T', ' '), trialEndDate.toISOString().slice(0, 19).replace('T', ' ')]
      );

      // 3. Create credits based on plan
      await connection.query(
        `INSERT INTO organization_credits (organization_id, credits_total, credits_used, reset_date)
         VALUES (?, ?, 0, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
        [organizationId, selectedPlan.credits]
      );

      // 4. Create admin user with pending status
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hour expiry

      const [userResult]: any = await connection.query(
        `INSERT INTO users (organization_id, first_name, last_name, email, password_hash, role, status, verification_token, verification_token_expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, 'org_admin', 'pending', ?, ?, NOW())`,
        [organizationId, firstName, lastName, email, hashedPassword, verificationToken, tokenExpiry.toISOString().slice(0, 19).replace('T', ' ')]
      );

      const userId = userResult.insertId;

      await connection.commit();
      connection.release();

      // Send verification email with BCC to info@travelquotebot.com
      try {
        await sendVerificationEmail(email, firstName, organizationName, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails - they can request resend
      }

      // Return success without token - user must verify email first
      return NextResponse.json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        requiresVerification: true,
        user: {
          id: userId,
          email,
          firstName,
          lastName,
          organizationName
        }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
