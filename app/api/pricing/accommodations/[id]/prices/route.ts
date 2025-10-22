import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Fetch all pricing periods for accommodation
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

    // First verify the accommodation belongs to this operator
    const accommodations = await query(
      'SELECT id FROM accommodations WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    if (!accommodations || (accommodations as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Accommodation not found' },
        { status: 404 }
      );
    }

    const pricing = await query(
      `SELECT
        id, season_name, start_date, end_date,
        pp_dbl_rate, single_supplement,
        child_0to2, child_3to5, child_6to11,
        created_at, updated_at
      FROM accommodation_pricing
      WHERE accommodation_id = ?
      ORDER BY start_date ASC`,
      [id]
    );

    return NextResponse.json(pricing);
  } catch (error: any) {
    console.error('Failed to fetch pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}

// POST - Create new pricing period
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

    // Verify the accommodation belongs to this operator
    const accommodations = await query(
      'SELECT id FROM accommodations WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    if (!accommodations || (accommodations as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Accommodation not found' },
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
    } = body;

    // Validate required fields
    if (!pp_dbl_rate || pp_dbl_rate <= 0) {
      return NextResponse.json(
        { error: 'Adult per person rate is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO accommodation_pricing
      (accommodation_id, season_name, start_date, end_date, pp_dbl_rate, single_supplement, child_0to2, child_3to5, child_6to11)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        season_name || null,
        start_date || null,
        end_date || null,
        pp_dbl_rate,
        single_supplement || null,
        child_0to2 || null,
        child_3to5 || null,
        child_6to11 || null
      ]
    );

    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error: any) {
    console.error('Failed to create pricing:', error);
    return NextResponse.json(
      { error: 'Failed to create pricing' },
      { status: 500 }
    );
  }
}
