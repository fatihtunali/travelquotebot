import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logActivity, getClientIP } from '@/lib/activityLog';

// GET - Fetch all flights for organization
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse query parameters (country_id parsed but not filtered - table doesn't have columns yet)
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');
    // Note: countryId is parsed for future use when flight_pricing table has country columns

    const [flights] = await db.execute(
      `SELECT *
       FROM flight_pricing
       WHERE organization_id = ? AND status = 'active'
       ORDER BY from_airport, to_airport`,
      [decoded.organizationId]
    );

    return NextResponse.json(flights);
  } catch (error: any) {
    console.error('Error fetching flights:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new flight
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { from_airport, to_airport, from_city, to_city, season_name, start_date, end_date,
            price_oneway, price_roundtrip, airline, notes } = body;

    const [result]: any = await db.execute(
      `INSERT INTO flight_pricing
       (organization_id, from_airport, to_airport, from_city, to_city, season_name, start_date, end_date,
        price_oneway, price_roundtrip, airline, notes, status, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), ?)`,
      [decoded.organizationId, from_airport, to_airport, from_city, to_city, season_name, start_date, end_date,
       price_oneway, price_roundtrip, airline, notes, decoded.userId]
    );

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'flight_created',
      resourceType: 'flight',
      resourceId: result.insertId,
      details: `Flight created: ${from_airport} to ${to_airport}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      message: 'Flight created successfully',
      id: result.insertId
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating flight:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update flight
export async function PUT(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { id, from_airport, to_airport, from_city, to_city, season_name, start_date, end_date,
            price_oneway, price_roundtrip, airline, notes } = body;

    await db.execute(
      `UPDATE flight_pricing
       SET from_airport = ?, to_airport = ?, from_city = ?, to_city = ?, season_name = ?,
           start_date = ?, end_date = ?, price_oneway = ?, price_roundtrip = ?, airline = ?, notes = ?
       WHERE id = ? AND organization_id = ?`,
      [from_airport, to_airport, from_city, to_city, season_name, start_date, end_date,
       price_oneway, price_roundtrip, airline, notes, id, decoded.organizationId]
    );

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'flight_updated',
      resourceType: 'flight',
      resourceId: id,
      details: `Flight updated: ${from_airport} to ${to_airport}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({ message: 'Flight updated successfully' });
  } catch (error: any) {
    console.error('Error updating flight:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Archive flight
export async function DELETE(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Flight ID required' }, { status: 400 });
    }

    await db.execute(
      `UPDATE flight_pricing SET status = 'archived' WHERE id = ? AND organization_id = ?`,
      [id, decoded.organizationId]
    );

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'flight_deleted',
      resourceType: 'flight',
      resourceId: parseInt(id),
      details: `Flight archived: ID ${id}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({ message: 'Flight archived successfully' });
  } catch (error: any) {
    console.error('Error deleting flight:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
