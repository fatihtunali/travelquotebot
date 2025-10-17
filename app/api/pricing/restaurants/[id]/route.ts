import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Fetch single restaurant
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

    const restaurants = await query(
      `SELECT
        id, name, city, cuisine_type, address, price_range,
        breakfast_price, lunch_price, dinner_price, currency,
        specialties, description, is_active
      FROM operator_restaurants
      WHERE id = ? AND operator_id = ?`,
      [id, operatorId]
    );

    if (!restaurants || (restaurants as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const restaurant = (restaurants as any[])[0];

    return NextResponse.json({
      ...restaurant,
      specialties: restaurant.specialties ? JSON.parse(restaurant.specialties) : null,
    });
  } catch (error: any) {
    console.error('Failed to fetch restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
}

// PUT - Update restaurant
export async function PUT(
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
    const body = await request.json();

    const {
      name,
      city,
      cuisine_type,
      address,
      price_range,
      breakfast_price,
      lunch_price,
      dinner_price,
      currency,
      specialties,
      description,
      is_active,
    } = body;

    await query(
      `UPDATE operator_restaurants
      SET name = ?, city = ?, cuisine_type = ?, address = ?,
          price_range = ?, breakfast_price = ?, lunch_price = ?,
          dinner_price = ?, currency = ?, specialties = ?,
          description = ?, is_active = ?, updated_at = NOW()
      WHERE id = ? AND operator_id = ?`,
      [
        name,
        city,
        cuisine_type,
        address,
        price_range,
        breakfast_price,
        lunch_price,
        dinner_price,
        currency,
        JSON.stringify(specialties),
        description,
        is_active,
        id,
        operatorId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    );
  }
}

// DELETE - Delete restaurant
export async function DELETE(
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

    await query(
      'DELETE FROM operator_restaurants WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to delete restaurant' },
      { status: 500 }
    );
  }
}
