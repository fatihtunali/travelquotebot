import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // First check if user exists regardless of status
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Check password first
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (user.status === 'pending') {
      return NextResponse.json(
        {
          error: 'Please verify your email before logging in. Check your inbox for the verification link.',
          requiresVerification: true,
          email: user.email
        },
        { status: 403 }
      );
    }

    // Check if account is inactive
    if (user.status === 'inactive') {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: user.organization_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
