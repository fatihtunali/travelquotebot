import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Fetch all price variations for restaurant
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

    // First verify the restaurant belongs to this operator
    const restaurants = await query(
      'SELECT id FROM operator_restaurants WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    if (!restaurants || (restaurants as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const pricing = await query(
      `SELECT
        id, menu_option, season_name, start_date, end_date,
        pp_dbl_rate, single_supplement,
        child_0to2, child_3to5, child_6to11,
        created_at, updated_at
      FROM restaurant_pricing
      WHERE restaurant_id = ?
      ORDER BY menu_option ASC, start_date ASC`,
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

    // Verify the restaurant belongs to this operator
    const restaurants = await query(
      'SELECT id FROM operator_restaurants WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    if (!restaurants || (restaurants as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      menu_option,
      season_name,
      start_date,
      end_date,
      pp_dbl_rate,
      single_supplement,
      child_0to2,
      child_3to5,
      child_6to11,
    } = body;

    if (!menu_option || !pp_dbl_rate || pp_dbl_rate <= 0) {
      return NextResponse.json(
        { error: 'Menu option and per-person rate are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO restaurant_pricing
      (restaurant_id, menu_option, season_name, start_date, end_date, pp_dbl_rate, single_supplement, child_0to2, child_3to5, child_6to11)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        menu_option,
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
    console.error('Failed to create price variation:', error);
    return NextResponse.json(
      { error: 'Failed to create price variation' },
      { status: 500 }
    );
  }
}
