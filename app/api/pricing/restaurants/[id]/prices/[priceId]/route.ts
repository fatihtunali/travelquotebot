import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// PUT - Update price variation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; priceId: string }> }
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
    const { id, priceId } = await params;

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

    // Update the price variation (ensure it belongs to this operator)
    await query(
      `UPDATE restaurant_price_variations
      SET season_name = ?, start_date = ?, end_date = ?,
          breakfast_price = ?, lunch_price = ?, dinner_price = ?, notes = ?
      WHERE id = ? AND restaurant_id = ? AND operator_id = ?`,
      [season_name, start_date, end_date, breakfast_price, lunch_price, dinner_price, notes || '', priceId, id, operatorId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update price variation:', error);
    return NextResponse.json(
      { error: 'Failed to update price variation' },
      { status: 500 }
    );
  }
}

// DELETE - Delete price variation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; priceId: string }> }
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
    const { id, priceId } = await params;

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

    // Delete the price variation (ensure it belongs to this operator)
    await query(
      'DELETE FROM restaurant_price_variations WHERE id = ? AND restaurant_id = ? AND operator_id = ?',
      [priceId, id, operatorId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete price variation:', error);
    return NextResponse.json(
      { error: 'Failed to delete price variation' },
      { status: 500 }
    );
  }
}
