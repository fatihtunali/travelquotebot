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

    if ((!pp_dbl_rate || pp_dbl_rate <= 0) && (!price_per_vehicle || price_per_vehicle <= 0)) {
      return NextResponse.json(
        { error: 'Either per-person rate or per-vehicle rate is required' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE transport_pricing
       SET season_name = ?, start_date = ?, end_date = ?,
           pp_dbl_rate = ?, single_supplement = ?,
           child_0to2 = ?, child_3to5 = ?, child_6to11 = ?,
           price_per_vehicle = ?
       WHERE id = ? AND transport_id = ?`,
      [
        season_name || null,
        start_date || null,
        end_date || null,
        pp_dbl_rate || 0,
        single_supplement || null,
        child_0to2 || null,
        child_3to5 || null,
        child_6to11 || null,
        price_per_vehicle || null,
        priceId,
        id
      ]
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

    // Delete the pricing
    await query(
      'DELETE FROM transport_pricing WHERE id = ? AND transport_id = ?',
      [priceId, id]
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
