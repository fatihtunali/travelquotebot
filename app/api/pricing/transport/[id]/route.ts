import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Fetch single transport
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

    console.log('[DEBUG] Fetching transport:', { id, operatorId });

    const transports = await query(
      `SELECT
        id, name, type, from_location, to_location,
        base_price, currency, vehicle_type, max_passengers,
        amenities, description, is_active
      FROM operator_transport
      WHERE id = ? AND operator_id = ?`,
      [id, operatorId]
    );

    console.log('[DEBUG] Query result:', transports);

    if (!transports || (transports as any[]).length === 0) {
      console.log('[DEBUG] Transport not found - returning 404');
      return NextResponse.json(
        { error: 'Transport not found' },
        { status: 404 }
      );
    }

    const transport = (transports as any[])[0];

    return NextResponse.json({
      ...transport,
      amenities: transport.amenities ? JSON.parse(transport.amenities) : null,
    });
  } catch (error: any) {
    console.error('Failed to fetch transport:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transport' },
      { status: 500 }
    );
  }
}

// PUT - Update transport
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
      type,
      from_location,
      to_location,
      base_price,
      currency,
      vehicle_type,
      max_passengers,
      amenities,
      description,
      is_active,
    } = body;

    await query(
      `UPDATE operator_transport
      SET name = ?, type = ?, from_location = ?, to_location = ?,
          base_price = ?, currency = ?, vehicle_type = ?, max_passengers = ?,
          amenities = ?, description = ?, is_active = ?, updated_at = NOW()
      WHERE id = ? AND operator_id = ?`,
      [
        name,
        type,
        from_location,
        to_location,
        base_price,
        currency,
        vehicle_type,
        max_passengers,
        JSON.stringify(amenities),
        description,
        is_active,
        id,
        operatorId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update transport:', error);
    return NextResponse.json(
      { error: 'Failed to update transport' },
      { status: 500 }
    );
  }
}

// DELETE - Delete transport
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
      'DELETE FROM operator_transport WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete transport:', error);
    return NextResponse.json(
      { error: 'Failed to delete transport' },
      { status: 500 }
    );
  }
}
