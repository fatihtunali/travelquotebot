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

    const priceVariations = await query(
      `SELECT
        id, season_name, start_date, end_date,
        breakfast_price, lunch_price, dinner_price, notes, created_at
      FROM restaurant_price_variations
      WHERE restaurant_id = ?
      ORDER BY start_date ASC`,
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
      season_name,
      start_date,
      end_date,
      breakfast_price,
      lunch_price,
      dinner_price,
      notes,
    } = body;

    const result = await query(
      `INSERT INTO restaurant_price_variations
      (restaurant_id, season_name, start_date, end_date, breakfast_price, lunch_price, dinner_price, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, season_name, start_date, end_date, breakfast_price, lunch_price, dinner_price, notes || '']
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
