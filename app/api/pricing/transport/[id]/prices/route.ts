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

    const pricing = await query(
      `SELECT
        id, season_name, start_date, end_date,
        pp_dbl_rate, single_supplement,
        child_0to2, child_3to5, child_6to11,
        price_per_vehicle,
        created_at, updated_at
      FROM transport_pricing
      WHERE transport_id = ?
      ORDER BY start_date ASC`,
      [id]
    );

    return NextResponse.json(pricing);
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
      start_date,
      end_date,
      pp_dbl_rate,
      single_supplement,
      child_0to2,
      child_3to5,
      child_6to11,
      price_per_vehicle,
    } = body;

    // Require either per-person rate or per-vehicle rate
    if ((!pp_dbl_rate || pp_dbl_rate <= 0) && (!price_per_vehicle || price_per_vehicle <= 0)) {
      return NextResponse.json(
        { error: 'Either per-person rate or per-vehicle rate is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO transport_pricing
      (transport_id, season_name, start_date, end_date, pp_dbl_rate, single_supplement, child_0to2, child_3to5, child_6to11, price_per_vehicle)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        season_name || null,
        start_date || null,
        end_date || null,
        pp_dbl_rate || 0,
        single_supplement || null,
        child_0to2 || null,
        child_3to5 || null,
        child_6to11 || null,
        price_per_vehicle || null
      ]
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
