import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';

// GET - Fetch all team members for the organization
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only org_admin can manage team members
    if (decoded.role !== 'org_admin') {
      return NextResponse.json({ error: 'Only administrators can manage team members' }, { status: 403 });
    }

    const [members] = await pool.query(
      `SELECT id, email, first_name, last_name, role, status, last_login, created_at
       FROM users
       WHERE organization_id = ?
       ORDER BY created_at DESC`,
      [decoded.organizationId]
    );

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a new team member
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only org_admin can add team members
    if (decoded.role !== 'org_admin') {
      return NextResponse.json({ error: 'Only administrators can add team members' }, { status: 403 });
    }

    const { email, first_name, last_name, password, role } = await request.json();

    if (!email || !first_name || !last_name || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'org_admin' && role !== 'org_user') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    await pool.query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [decoded.organizationId, email, passwordHash, first_name, last_name, role, 'active']
    );

    return NextResponse.json({
      success: true,
      message: 'Team member added successfully'
    });
  } catch (error: any) {
    console.error('Error adding team member:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'A user with this email already exists in your organization' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
