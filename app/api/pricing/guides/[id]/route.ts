import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Fetch single guide
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

    const guides = await query(
      `SELECT
        id, name, guide_type, languages, specialization,
        price_per_day, price_per_hour, price_half_day, currency,
        max_group_size, cities, description, is_active
      FROM operator_guide_services
      WHERE id = ? AND operator_id = ?`,
      [id, operatorId]
    );

    if (!guides || (guides as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }

    const guide = (guides as any[])[0];

    return NextResponse.json({
      ...guide,
      languages: guide.languages ? JSON.parse(guide.languages) : null,
      cities: guide.cities ? JSON.parse(guide.cities) : null,
    });
  } catch (error: any) {
    console.error('Failed to fetch guide:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide' },
      { status: 500 }
    );
  }
}

// PUT - Update guide
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
      guide_type,
      languages,
      specialization,
      price_per_day,
      price_per_hour,
      price_half_day,
      currency,
      max_group_size,
      cities,
      description,
      is_active,
    } = body;

    await query(
      `UPDATE operator_guide_services
      SET name = ?, guide_type = ?, languages = ?, specialization = ?,
          price_per_day = ?, price_per_hour = ?, price_half_day = ?,
          currency = ?, max_group_size = ?, cities = ?,
          description = ?, is_active = ?, updated_at = NOW()
      WHERE id = ? AND operator_id = ?`,
      [
        name,
        guide_type,
        JSON.stringify(languages),
        specialization,
        price_per_day,
        price_per_hour,
        price_half_day,
        currency,
        max_group_size,
        JSON.stringify(cities),
        description,
        is_active,
        id,
        operatorId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update guide:', error);
    return NextResponse.json(
      { error: 'Failed to update guide' },
      { status: 500 }
    );
  }
}

// DELETE - Delete guide
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
      'DELETE FROM operator_guide_services WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete guide:', error);
    return NextResponse.json(
      { error: 'Failed to delete guide' },
      { status: 500 }
    );
  }
}
