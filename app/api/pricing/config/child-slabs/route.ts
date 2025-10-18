import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/pricing/config/child-slabs - Get child pricing slabs
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = verifyToken(token);
  if (!userData || !userData.operatorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const slabs = await query<any>(`
      SELECT *
      FROM operator_child_pricing
      WHERE operator_id = ?
      ORDER BY display_order, min_age
    `, [userData.operatorId]);

    return NextResponse.json(slabs);

  } catch (error) {
    console.error('Failed to fetch child slabs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch child pricing slabs' },
      { status: 500 }
    );
  }
}

// POST /api/pricing/config/child-slabs - Create new child slab
export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = verifyToken(token);
  if (!userData || !userData.operatorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      min_age,
      max_age,
      discount_type,
      discount_value,
      label,
      display_order
    } = body;

    const slabId = uuidv4();

    await execute(`
      INSERT INTO operator_child_pricing (
        id, operator_id, min_age, max_age,
        discount_type, discount_value, label,
        display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [
      slabId, userData.operatorId, min_age, max_age,
      discount_type, discount_value, label,
      display_order || 0
    ]);

    const newSlab = await queryOne<any>(`
      SELECT * FROM operator_child_pricing WHERE id = ?
    `, [slabId]);

    return NextResponse.json(newSlab);

  } catch (error) {
    console.error('Failed to create child slab:', error);
    return NextResponse.json(
      { error: 'Failed to create child pricing slab' },
      { status: 500 }
    );
  }
}

// PUT /api/pricing/config/child-slabs - Update child slab
export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = verifyToken(token);
  if (!userData || !userData.operatorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      min_age,
      max_age,
      discount_type,
      discount_value,
      label,
      display_order,
      is_active
    } = body;

    // Verify ownership
    const existing = await queryOne<any>(`
      SELECT id FROM operator_child_pricing
      WHERE id = ? AND operator_id = ?
    `, [id, userData.operatorId]);

    if (!existing) {
      return NextResponse.json({ error: 'Child slab not found' }, { status: 404 });
    }

    await execute(`
      UPDATE operator_child_pricing
      SET
        min_age = ?,
        max_age = ?,
        discount_type = ?,
        discount_value = ?,
        label = ?,
        display_order = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND operator_id = ?
    `, [
      min_age, max_age, discount_type, discount_value,
      label, display_order, is_active,
      id, userData.operatorId
    ]);

    const updatedSlab = await queryOne<any>(`
      SELECT * FROM operator_child_pricing WHERE id = ?
    `, [id]);

    return NextResponse.json(updatedSlab);

  } catch (error) {
    console.error('Failed to update child slab:', error);
    return NextResponse.json(
      { error: 'Failed to update child pricing slab' },
      { status: 500 }
    );
  }
}

// DELETE /api/pricing/config/child-slabs?id=... - Delete child slab
export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = verifyToken(token);
  if (!userData || !userData.operatorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing slab ID' }, { status: 400 });
    }

    // Verify ownership
    const existing = await queryOne<any>(`
      SELECT id FROM operator_child_pricing
      WHERE id = ? AND operator_id = ?
    `, [id, userData.operatorId]);

    if (!existing) {
      return NextResponse.json({ error: 'Child slab not found' }, { status: 404 });
    }

    await execute(`
      DELETE FROM operator_child_pricing
      WHERE id = ? AND operator_id = ?
    `, [id, userData.operatorId]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to delete child slab:', error);
    return NextResponse.json(
      { error: 'Failed to delete child pricing slab' },
      { status: 500 }
    );
  }
}
