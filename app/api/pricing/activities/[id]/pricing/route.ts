import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET all pricing options for an activity
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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
    const activityId = params.id;

    // Verify activity belongs to operator
    const activity = await query(
      'SELECT id FROM activities WHERE id = ? AND operator_id = ?',
      [activityId, operatorId]
    );

    if (!activity || (activity as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    const pricing = await query(
      `SELECT
        id,
        activity_id,
        pricing_type,
        transport_cost,
        guide_cost,
        entrance_fee_adult,
        entrance_fee_child_0_2,
        entrance_fee_child_3_5,
        entrance_fee_child_6_11,
        entrance_fee_child_12_17,
        meal_cost_adult,
        meal_cost_child,
        sic_price_adult,
        sic_price_child_0_2,
        sic_price_child_3_5,
        sic_price_child_6_11,
        sic_price_child_12_17,
        min_pax,
        max_pax,
        season,
        valid_from,
        valid_until,
        currency,
        notes,
        is_active,
        created_at
      FROM activity_pricing
      WHERE activity_id = ? AND operator_id = ?
      ORDER BY pricing_type, season, min_pax`,
      [activityId, operatorId]
    );

    return NextResponse.json(pricing);
  } catch (error: any) {
    console.error('Failed to fetch activity pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity pricing' },
      { status: 500 }
    );
  }
}

// POST - Create a new pricing option for an activity
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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
    const activityId = params.id;
    const body = await request.json();

    // Verify activity belongs to operator
    const activity = await query(
      'SELECT id FROM activities WHERE id = ? AND operator_id = ?',
      [activityId, operatorId]
    );

    if (!activity || (activity as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    const {
      pricing_type = 'sic',
      transport_cost = 0,
      guide_cost = 0,
      entrance_fee_adult = 0,
      entrance_fee_child_0_2 = 0,
      entrance_fee_child_3_5 = 0,
      entrance_fee_child_6_11 = 0,
      entrance_fee_child_12_17 = 0,
      meal_cost_adult = 0,
      meal_cost_child = 0,
      sic_price_adult = 0,
      sic_price_child_0_2 = 0,
      sic_price_child_3_5 = 0,
      sic_price_child_6_11 = 0,
      sic_price_child_12_17 = 0,
      min_pax = 1,
      max_pax = null,
      season = 'standard',
      valid_from = null,
      valid_until = null,
      currency = 'USD',
      notes = '',
      is_active = true
    } = body;

    // Validation
    if (!['sic', 'private'].includes(pricing_type)) {
      return NextResponse.json(
        { error: 'Invalid pricing type. Must be "sic" or "private"' },
        { status: 400 }
      );
    }

    if (pricing_type === 'sic' && sic_price_adult <= 0) {
      return NextResponse.json(
        { error: 'SIC pricing requires adult price' },
        { status: 400 }
      );
    }

    if (pricing_type === 'private' && transport_cost <= 0 && guide_cost <= 0) {
      return NextResponse.json(
        { error: 'Private pricing requires at least transport or guide cost' },
        { status: 400 }
      );
    }

    const id = uuidv4();

    await query(
      `INSERT INTO activity_pricing (
        id,
        activity_id,
        operator_id,
        pricing_type,
        transport_cost,
        guide_cost,
        entrance_fee_adult,
        entrance_fee_child_0_2,
        entrance_fee_child_3_5,
        entrance_fee_child_6_11,
        entrance_fee_child_12_17,
        meal_cost_adult,
        meal_cost_child,
        sic_price_adult,
        sic_price_child_0_2,
        sic_price_child_3_5,
        sic_price_child_6_11,
        sic_price_child_12_17,
        min_pax,
        max_pax,
        season,
        valid_from,
        valid_until,
        currency,
        notes,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        activityId,
        operatorId,
        pricing_type,
        transport_cost,
        guide_cost,
        entrance_fee_adult,
        entrance_fee_child_0_2,
        entrance_fee_child_3_5,
        entrance_fee_child_6_11,
        entrance_fee_child_12_17,
        meal_cost_adult,
        meal_cost_child,
        sic_price_adult,
        sic_price_child_0_2,
        sic_price_child_3_5,
        sic_price_child_6_11,
        sic_price_child_12_17,
        min_pax,
        max_pax,
        season,
        valid_from,
        valid_until,
        currency,
        notes,
        is_active ? 1 : 0
      ]
    );

    return NextResponse.json({
      id,
      activity_id: activityId,
      ...body
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create activity pricing:', error);
    return NextResponse.json(
      { error: 'Failed to create activity pricing' },
      { status: 500 }
    );
  }
}
