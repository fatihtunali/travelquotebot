import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Fetch all intercity transfers for organization
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');

    // Build query with optional country filter
    let query = `SELECT
        it.id,
        it.from_city,
        it.to_city,
        it.from_country_id,
        it.to_country_id,
        it.season_name,
        it.start_date,
        it.end_date,
        it.price_oneway,
        it.price_roundtrip,
        it.estimated_duration_hours,
        it.notes,
        v.vehicle_type,
        v.max_capacity
      FROM intercity_transfers it
      JOIN vehicles v ON it.vehicle_id = v.id
      WHERE it.organization_id = ? AND it.status = 'active'`;

    const queryParams: (string | number)[] = [decoded.organizationId];

    // Add country filter if specified
    if (countryId && countryId !== 'all') {
      query += ` AND (it.from_country_id = ? OR it.to_country_id = ?)`;
      queryParams.push(parseInt(countryId), parseInt(countryId));
    }

    query += ` ORDER BY it.from_city, it.to_city, v.vehicle_type`;

    const [transfers] = await db.execute(query, queryParams);

    // Fetch available countries for the organization
    const [countries] = await db.execute(
      `SELECT DISTINCT c.id, c.name, c.code
       FROM countries c
       INNER JOIN intercity_transfers it ON (it.from_country_id = c.id OR it.to_country_id = c.id)
       WHERE it.organization_id = ? AND it.status = 'active'
       ORDER BY c.name`,
      [decoded.organizationId]
    );

    return NextResponse.json({
      transfers,
      countries
    });
  } catch (error: any) {
    console.error('Error fetching intercity transfers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new intercity transfer
export async function POST(request: NextRequest) {
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
    const { vehicle_type, max_capacity, from_city, to_city, season_name, start_date, end_date,
            price_oneway, price_roundtrip, estimated_duration_hours, notes } = body;

    // Find or create vehicle
    let vehicleId;
    const [existingVehicle]: any = await db.execute(
      `SELECT id FROM vehicles
       WHERE organization_id = ? AND vehicle_type = ? AND max_capacity = ? AND city = 'Any'
       LIMIT 1`,
      [decoded.organizationId, vehicle_type, max_capacity]
    );

    if (existingVehicle.length > 0) {
      vehicleId = existingVehicle[0].id;
    } else {
      const [vehicleResult]: any = await db.execute(
        `INSERT INTO vehicles (organization_id, vehicle_type, max_capacity, city, status, created_at)
         VALUES (?, ?, ?, 'Any', 'active', NOW())`,
        [decoded.organizationId, vehicle_type, max_capacity]
      );
      vehicleId = vehicleResult.insertId;
    }

    // Create intercity transfer
    const [result]: any = await db.execute(
      `INSERT INTO intercity_transfers
       (organization_id, vehicle_id, from_city, to_city, season_name, start_date, end_date,
        price_oneway, price_roundtrip, estimated_duration_hours, notes, status, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), ?)`,
      [decoded.organizationId, vehicleId, from_city, to_city, season_name, start_date, end_date,
       price_oneway, price_roundtrip, estimated_duration_hours, notes, decoded.userId]
    );

    return NextResponse.json({
      message: 'Intercity transfer created successfully',
      id: result.insertId
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating intercity transfer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update intercity transfer
export async function PUT(request: NextRequest) {
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
    const { id, from_city, to_city, season_name, start_date, end_date,
            price_oneway, price_roundtrip, estimated_duration_hours, notes } = body;

    await db.execute(
      `UPDATE intercity_transfers
       SET from_city = ?, to_city = ?, season_name = ?, start_date = ?, end_date = ?,
           price_oneway = ?, price_roundtrip = ?, estimated_duration_hours = ?, notes = ?
       WHERE id = ? AND organization_id = ?`,
      [from_city, to_city, season_name, start_date, end_date, price_oneway, price_roundtrip,
       estimated_duration_hours, notes, id, decoded.organizationId]
    );

    return NextResponse.json({ message: 'Intercity transfer updated successfully' });
  } catch (error: any) {
    console.error('Error updating intercity transfer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Archive intercity transfer
export async function DELETE(request: NextRequest) {
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
      return NextResponse.json({ error: 'Transfer ID required' }, { status: 400 });
    }

    await db.execute(
      `UPDATE intercity_transfers SET status = 'archived' WHERE id = ? AND organization_id = ?`,
      [id, decoded.organizationId]
    );

    return NextResponse.json({ message: 'Intercity transfer archived successfully' });
  } catch (error: any) {
    console.error('Error deleting intercity transfer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
