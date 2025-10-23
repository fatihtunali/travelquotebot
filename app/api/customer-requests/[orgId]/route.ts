import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// GET - Fetch all customer itineraries for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // Build query based on status filter
    let statusCondition = '';
    if (status !== 'all') {
      statusCondition = `AND status = '${status}'`;
    }

    // Get all customer itineraries
    const [itineraries]: any = await pool.query(
      `SELECT
        id,
        customer_name,
        customer_email,
        customer_phone,
        destination,
        city_nights,
        start_date,
        end_date,
        adults,
        children,
        hotel_category,
        tour_type,
        special_requests,
        total_price,
        price_per_person,
        status,
        created_at,
        updated_at
      FROM customer_itineraries
      WHERE organization_id = ?
        ${statusCondition}
      ORDER BY created_at DESC`,
      [orgId]
    );

    // Parse JSON fields
    itineraries.forEach((itinerary: any) => {
      if (itinerary.city_nights && typeof itinerary.city_nights === 'string') {
        itinerary.city_nights = JSON.parse(itinerary.city_nights);
      }
    });

    // Calculate summary stats
    const stats = {
      total: itineraries.length,
      pending: itineraries.filter((i: any) => i.status === 'pending').length,
      confirmed: itineraries.filter((i: any) => i.status === 'confirmed').length,
      completed: itineraries.filter((i: any) => i.status === 'completed').length,
      cancelled: itineraries.filter((i: any) => i.status === 'cancelled').length
    };

    return NextResponse.json({
      itineraries,
      stats
    });

  } catch (error) {
    console.error('Error fetching customer requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer requests' },
      { status: 500 }
    );
  }
}

// PUT - Update customer itinerary status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { itineraryId, action, notes } = body;

    if (action === 'confirm') {
      await pool.query(
        `UPDATE customer_itineraries
        SET status = 'confirmed', updated_at = NOW()
        WHERE id = ? AND organization_id = ?`,
        [itineraryId, orgId]
      );
    } else if (action === 'cancel') {
      await pool.query(
        `UPDATE customer_itineraries
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = ? AND organization_id = ?`,
        [itineraryId, orgId]
      );
    } else if (action === 'complete') {
      await pool.query(
        `UPDATE customer_itineraries
        SET status = 'completed', updated_at = NOW()
        WHERE id = ? AND organization_id = ?`,
        [itineraryId, orgId]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating customer request:', error);
    return NextResponse.json(
      { error: 'Failed to update customer request' },
      { status: 500 }
    );
  }
}
