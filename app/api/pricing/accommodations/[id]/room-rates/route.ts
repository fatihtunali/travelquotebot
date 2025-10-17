import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET all room rates for an accommodation
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
    const { id: accommodationId } = await params;

    // Verify accommodation belongs to operator
    const accommodation = await query(
      'SELECT id FROM accommodations WHERE id = ? AND operator_id = ?',
      [accommodationId, operatorId]
    );

    if (!accommodation || (accommodation as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Accommodation not found' },
        { status: 404 }
      );
    }

    const rates = await query(
      `SELECT
        id,
        accommodation_id,
        room_type,
        season,
        adult_price_double,
        single_supplement,
        third_person_price,
        child_price_0_2,
        child_price_3_5,
        child_price_6_11,
        valid_from,
        valid_until,
        min_nights,
        max_occupancy,
        breakfast_included,
        half_board_supplement,
        full_board_supplement,
        currency,
        notes,
        is_active,
        created_at
      FROM accommodation_room_rates
      WHERE accommodation_id = ? AND operator_id = ?
      ORDER BY season, room_type`,
      [accommodationId, operatorId]
    );

    return NextResponse.json(rates);
  } catch (error: any) {
    console.error('Failed to fetch room rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room rates' },
      { status: 500 }
    );
  }
}

// POST - Create a new room rate
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
    const { id: accommodationId } = await params;
    const body = await request.json();

    // Verify accommodation belongs to operator
    const accommodation = await query(
      'SELECT id FROM accommodations WHERE id = ? AND operator_id = ?',
      [accommodationId, operatorId]
    );

    if (!accommodation || (accommodation as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Accommodation not found' },
        { status: 404 }
      );
    }

    const {
      room_type,
      season = 'standard',
      adult_price_double,
      single_supplement = 0,
      third_person_price = 0,
      child_price_0_2 = 0,
      child_price_3_5 = 0,
      child_price_6_11 = 0,
      valid_from = null,
      valid_until = null,
      min_nights = 1,
      max_occupancy = 2,
      breakfast_included = true,
      half_board_supplement = 0,
      full_board_supplement = 0,
      currency = 'USD',
      notes = '',
      is_active = true
    } = body;

    if (!room_type || !adult_price_double) {
      return NextResponse.json(
        { error: 'Room type and adult price are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();

    await query(
      `INSERT INTO accommodation_room_rates (
        id,
        accommodation_id,
        operator_id,
        room_type,
        season,
        adult_price_double,
        single_supplement,
        third_person_price,
        child_price_0_2,
        child_price_3_5,
        child_price_6_11,
        valid_from,
        valid_until,
        min_nights,
        max_occupancy,
        breakfast_included,
        half_board_supplement,
        full_board_supplement,
        currency,
        notes,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        accommodationId,
        operatorId,
        room_type,
        season,
        adult_price_double,
        single_supplement,
        third_person_price,
        child_price_0_2,
        child_price_3_5,
        child_price_6_11,
        valid_from,
        valid_until,
        min_nights,
        max_occupancy,
        breakfast_included ? 1 : 0,
        half_board_supplement,
        full_board_supplement,
        currency,
        notes,
        is_active ? 1 : 0
      ]
    );

    return NextResponse.json({
      id,
      accommodation_id: accommodationId,
      room_type,
      season,
      adult_price_double,
      single_supplement,
      third_person_price,
      child_price_0_2,
      child_price_3_5,
      child_price_6_11,
      valid_from,
      valid_until,
      min_nights,
      max_occupancy,
      breakfast_included,
      half_board_supplement,
      full_board_supplement,
      currency,
      notes,
      is_active
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create room rate:', error);
    return NextResponse.json(
      { error: 'Failed to create room rate' },
      { status: 500 }
    );
  }
}
