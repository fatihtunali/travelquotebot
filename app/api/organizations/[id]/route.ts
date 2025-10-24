import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

// C6: Remove fallback - JWT_SECRET is required
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get organization details
    const [organizations]: any = await pool.query(
      `SELECT
        id, name, slug, email, phone, country, status,
        logo_url, logo_dark_url, favicon_url, website,
        primary_color, secondary_color, created_at, updated_at
      FROM organizations
      WHERE id = ?`,
      [id]
    );

    if (organizations.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(organizations[0]);

  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify user belongs to this organization
    if (decoded.organizationId !== parseInt(id)) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update your own organization' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      website,
      email,
      phone,
      country,
      logo_url,
      logo_dark_url,
      favicon_url,
      primary_color,
      secondary_color
    } = body;

    // Update organization
    await pool.query(
      `UPDATE organizations
      SET
        name = ?,
        website = ?,
        email = ?,
        phone = ?,
        country = ?,
        logo_url = ?,
        logo_dark_url = ?,
        favicon_url = ?,
        primary_color = ?,
        secondary_color = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        name,
        website || null,
        email,
        phone || null,
        country || null,
        logo_url || null,
        logo_dark_url || null,
        favicon_url || null,
        primary_color || '#3B82F6',
        secondary_color || '#6366F1',
        id
      ]
    );

    // Get updated organization
    const [organizations]: any = await pool.query(
      `SELECT
        id, name, slug, email, phone, country, status,
        logo_url, logo_dark_url, favicon_url, website,
        primary_color, secondary_color, created_at, updated_at
      FROM organizations
      WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      message: 'Organization updated successfully',
      organization: organizations[0]
    });

  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}
