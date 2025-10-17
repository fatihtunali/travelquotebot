import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET a specific pricing option
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; pricingId: string }> }
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
    const { id: activityId, pricingId } = await params;

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
      WHERE id = ? AND activity_id = ? AND operator_id = ?`,
      [pricingId, activityId, operatorId]
    );

    if (!pricing || (pricing as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Pricing option not found' },
        { status: 404 }
      );
    }

    return NextResponse.json((pricing as any[])[0]);
  } catch (error: any) {
    console.error('Failed to fetch pricing option:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing option' },
      { status: 500 }
    );
  }
}

// PUT - Update a pricing option
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; pricingId: string }> }
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
    const { id: activityId, pricingId } = await params;
    const body = await request.json();

    // Verify pricing option exists and belongs to operator
    const existing = await query(
      'SELECT id FROM activity_pricing WHERE id = ? AND activity_id = ? AND operator_id = ?',
      [pricingId, activityId, operatorId]
    );

    if (!existing || (existing as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Pricing option not found' },
        { status: 404 }
      );
    }

    const {
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
    } = body;

    await query(
      `UPDATE activity_pricing SET
        pricing_type = ?,
        transport_cost = ?,
        guide_cost = ?,
        entrance_fee_adult = ?,
        entrance_fee_child_0_2 = ?,
        entrance_fee_child_3_5 = ?,
        entrance_fee_child_6_11 = ?,
        entrance_fee_child_12_17 = ?,
        meal_cost_adult = ?,
        meal_cost_child = ?,
        sic_price_adult = ?,
        sic_price_child_0_2 = ?,
        sic_price_child_3_5 = ?,
        sic_price_child_6_11 = ?,
        sic_price_child_12_17 = ?,
        min_pax = ?,
        max_pax = ?,
        season = ?,
        valid_from = ?,
        valid_until = ?,
        currency = ?,
        notes = ?,
        is_active = ?
      WHERE id = ? AND operator_id = ?`,
      [
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
        is_active ? 1 : 0,
        pricingId,
        operatorId
      ]
    );

    return NextResponse.json({
      id: pricingId,
      activity_id: activityId,
      ...body
    });
  } catch (error: any) {
    console.error('Failed to update pricing option:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing option' },
      { status: 500 }
    );
  }
}

// DELETE a pricing option
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; pricingId: string }> }
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
    const { id: activityId, pricingId } = await params;

    const result = await query(
      'DELETE FROM activity_pricing WHERE id = ? AND activity_id = ? AND operator_id = ?',
      [pricingId, activityId, operatorId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Pricing option not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Pricing option deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete pricing option:', error);
    return NextResponse.json(
      { error: 'Failed to delete pricing option' },
      { status: 500 }
    );
  }
}
