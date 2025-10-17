import { NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import {
  verifyPassword,
  generateToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user: any = await queryOne(
      `SELECT u.*, o.company_name, o.subdomain, o.subscription_tier
       FROM users u
       JOIN operators o ON u.operator_id = o.id
       WHERE u.email = ? AND u.is_active = TRUE`,
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate token
    const userData = {
      id: user.id,
      operator_id: user.operator_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };

    const token = generateToken(userData);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
      operator: {
        id: user.operator_id,
        companyName: user.company_name,
        subdomain: user.subdomain,
        subscriptionTier: user.subscription_tier,
      },
    });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...AUTH_COOKIE_OPTIONS,
    });
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
