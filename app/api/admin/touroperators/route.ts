import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [organizations]: any = await pool.query(
      'SELECT * FROM organizations ORDER BY created_at DESC'
    );

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching tour operators:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, slug, email, phone, country } = await request.json();

    if (!name || !slug || !email) {
      return NextResponse.json(
        { error: 'Name, slug, and email are required' },
        { status: 400 }
      );
    }

    // Create tour operator
    const [result]: any = await pool.query(
      'INSERT INTO organizations (name, slug, email, phone, country, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, slug, email, phone, country, 'active']
    );

    const organizationId = result.insertId;

    // Initialize credits for the tour operator
    await pool.query(
      'INSERT INTO organization_credits (organization_id, credits_total, credits_used) VALUES (?, ?, ?)',
      [organizationId, 0, 0]
    );

    // Create default admin user for the tour operator
    const defaultPassword = await hashPassword('123456');
    await pool.query(
      'INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [organizationId, email, defaultPassword, 'Admin', 'User', 'org_admin', 'active']
    );

    // Create white label settings
    await pool.query(
      'INSERT INTO white_label_settings (organization_id, company_name) VALUES (?, ?)',
      [organizationId, name]
    );

    return NextResponse.json({
      success: true,
      organizationId,
      message: 'Tour operator created successfully. Default admin password is 123456'
    });
  } catch (error: any) {
    console.error('Error creating tour operator:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Tour operator slug or email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
