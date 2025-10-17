import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import {
  hashPassword,
  generateSubdomain,
  generateToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
} from '@/lib/auth';
import { createCreditAccount, addCredits } from '@/lib/credits';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, email, password, fullName } = body;

    // Validation
    if (!companyName || !email || !password || !fullName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Generate subdomain
    const subdomain = generateSubdomain(companyName);

    // Check if subdomain exists
    const existingSubdomain = await query(
      'SELECT id FROM operators WHERE subdomain = ?',
      [subdomain]
    );

    if (existingSubdomain.length > 0) {
      return NextResponse.json(
        { error: 'Company name too similar to existing operator' },
        { status: 400 }
      );
    }

    // Create operator
    const operatorId = uuidv4();
    const brandColors = JSON.stringify({
      primary: '#3b82f6',
      secondary: '#8b5cf6',
    });

    await execute(
      `INSERT INTO operators
       (id, company_name, email, subdomain, subscription_tier, monthly_quota, brand_colors, is_active)
       VALUES (?, ?, ?, ?, 'basic', 100, ?, TRUE)`,
      [operatorId, companyName, email, subdomain, brandColors]
    );

    // Create user
    const userId = uuidv4();
    const hashedPassword = await hashPassword(password);

    await execute(
      `INSERT INTO users
       (id, operator_id, email, password_hash, full_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'admin', TRUE)`,
      [userId, operatorId, email, hashedPassword, fullName]
    );

    // Create credit account with welcome bonus
    await createCreditAccount(operatorId, 0); // Create account with 0 balance
    await addCredits(
      operatorId,
      10, // ₺10 welcome bonus
      'Welcome bonus - Try TravelQuoteBot free!',
      'bonus',
      {
        notes: 'New operator registration bonus',
      }
    );

    // Generate token
    const user = {
      id: userId,
      operator_id: operatorId,
      email,
      full_name: fullName,
      role: 'admin',
    };

    const token = generateToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Operator registered successfully',
      user: {
        id: userId,
        email,
        fullName,
        role: 'admin',
      },
      operator: {
        id: operatorId,
        companyName,
        subdomain,
        subscriptionTier: 'basic',
      },
    });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...AUTH_COOKIE_OPTIONS,
    });
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
