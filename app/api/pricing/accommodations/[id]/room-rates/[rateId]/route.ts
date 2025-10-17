import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET a specific room rate
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; rateId: string }> }
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
    const { id: accommodationId, rateId } = await params;

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
      WHERE id = ? AND accommodation_id = ? AND operator_id = ?`,
      [rateId, accommodationId, operatorId]
    );

    if (!rates || (rates as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Room rate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json((rates as any[])[0]);
  } catch (error: any) {
    console.error('Failed to fetch room rate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room rate' },
      { status: 500 }
    );
  }
}

// PUT - Update a room rate
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; rateId: string }> }
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
    const { id: accommodationId, rateId } = await params;
    const body = await request.json();

    // Verify room rate exists and belongs to operator
    const existing = await query(
      'SELECT id FROM accommodation_room_rates WHERE id = ? AND accommodation_id = ? AND operator_id = ?',
      [rateId, accommodationId, operatorId]
    );

    if (!existing || (existing as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Room rate not found' },
        { status: 404 }
      );
    }

    const {
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
    } = body;

    await query(
      `UPDATE accommodation_room_rates SET
        room_type = ?,
        season = ?,
        adult_price_double = ?,
        single_supplement = ?,
        third_person_price = ?,
        child_price_0_2 = ?,
        child_price_3_5 = ?,
        child_price_6_11 = ?,
        valid_from = ?,
        valid_until = ?,
        min_nights = ?,
        max_occupancy = ?,
        breakfast_included = ?,
        half_board_supplement = ?,
        full_board_supplement = ?,
        currency = ?,
        notes = ?,
        is_active = ?
      WHERE id = ? AND operator_id = ?`,
      [
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
        is_active ? 1 : 0,
        rateId,
        operatorId
      ]
    );

    return NextResponse.json({
      id: rateId,
      accommodation_id: accommodationId,
      ...body
    });
  } catch (error: any) {
    console.error('Failed to update room rate:', error);
    return NextResponse.json(
      { error: 'Failed to update room rate' },
      { status: 500 }
    );
  }
}

// DELETE a room rate
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; rateId: string }> }
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
    const { id: accommodationId, rateId } = await params;

    const result = await query(
      'DELETE FROM accommodation_room_rates WHERE id = ? AND accommodation_id = ? AND operator_id = ?',
      [rateId, accommodationId, operatorId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Room rate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Room rate deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete room rate:', error);
    return NextResponse.json(
      { error: 'Failed to delete room rate' },
      { status: 500 }
    );
  }
}
