import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Fetch all price variations for transport
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userData;
    try {
      userData = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 }
      );
    }

    const operatorId = userData.operatorId;
    const { id } = await params;

    // First verify the transport belongs to this operator
    const transports = await query(
      'SELECT id FROM operator_transport WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    if (!transports || (transports as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Transport not found' },
        { status: 404 }
      );
    }

    const priceVariations = await query(
      `SELECT
        id, season_name, vehicle_type, max_passengers, start_date, end_date,
        cost_per_day, cost_per_transfer, notes, created_at
      FROM transport_price_variations
      WHERE transport_id = ?
      ORDER BY start_date ASC, max_passengers ASC`,
      [id]
    );

    return NextResponse.json(priceVariations);
  } catch (error: any) {
    console.error('Failed to fetch price variations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price variations' },
      { status: 500 }
    );
  }
}

// POST - Create new price variation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userData;
    try {
      userData = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 }
      );
    }

    const operatorId = userData.operatorId;
    const { id } = await params;

    // Verify the transport belongs to this operator
    const transports = await query(
      'SELECT id FROM operator_transport WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    if (!transports || (transports as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Transport not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      season_name,
      vehicle_type,
      max_passengers,
      start_date,
      end_date,
      cost_per_day,
      cost_per_transfer,
      notes,
    } = body;

    // Set price field for backward compatibility (use cost_per_transfer or cost_per_day)
    const price = cost_per_transfer || cost_per_day || 0;

    const result = await query(
      `INSERT INTO transport_price_variations
      (transport_id, season_name, vehicle_type, max_passengers, start_date, end_date, price, cost_per_day, cost_per_transfer, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, season_name, vehicle_type, max_passengers, start_date, end_date, price, cost_per_day, cost_per_transfer, notes || '']
    );

    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error: any) {
    console.error('Failed to create price variation:', error);
    return NextResponse.json(
      { error: 'Failed to create price variation' },
      { status: 500 }
    );
  }
}
