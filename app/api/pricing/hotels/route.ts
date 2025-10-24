import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pagination and filter parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const city = searchParams.get('city') || '';
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'h.organization_id = ? AND h.status = ?';
    const params: any[] = [decoded.organizationId, 'active'];

    if (city) {
      whereClause += ' AND h.city = ?';
      params.push(city);
    }

    if (search) {
      whereClause += ' AND h.hotel_name LIKE ?';
      params.push(`%${search}%`);
    }

    // Get total count
    const [countResult]: any = await pool.query(
      `SELECT COUNT(DISTINCT h.id) as total FROM hotels h WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get paginated hotels with pricing
    const [hotels]: any = await pool.query(
      `SELECT
        h.id, h.hotel_name, h.city, h.star_rating,
        h.photo_url_1, h.rating, h.user_ratings_total, h.google_maps_url,
        hp.id as pricing_id, hp.season_name, hp.start_date, hp.end_date, hp.currency,
        hp.double_room_bb, hp.single_supplement_bb, hp.triple_room_bb,
        hp.child_0_6_bb, hp.child_6_12_bb, hp.base_meal_plan,
        hp.hb_supplement, hp.fb_supplement, hp.ai_supplement, hp.notes, hp.status
       FROM hotels h
       LEFT JOIN hotel_pricing hp ON h.id = hp.hotel_id AND hp.status = 'active'
       WHERE ${whereClause}
       ORDER BY h.city, h.hotel_name
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      data: hotels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      hotel_name, city, star_rating,
      season_name, start_date, end_date, currency,
      double_room_bb, single_supplement_bb, triple_room_bb,
      child_0_6_bb, child_6_12_bb, base_meal_plan,
      hb_supplement, fb_supplement, ai_supplement, notes
    } = body;

    // Validate required fields
    if (!hotel_name || !city || !season_name || !start_date || !end_date || !double_room_bb) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert hotel
    const [hotelResult]: any = await pool.query(
      'INSERT INTO hotels (organization_id, hotel_name, city, star_rating, status) VALUES (?, ?, ?, ?, ?)',
      [decoded.organizationId, hotel_name, city, star_rating || 3, 'active']
    );

    const hotelId = hotelResult.insertId;

    // Insert pricing
    await pool.query(
      `INSERT INTO hotel_pricing (
        hotel_id, season_name, start_date, end_date, currency,
        double_room_bb, single_supplement_bb, triple_room_bb,
        child_0_6_bb, child_6_12_bb, base_meal_plan,
        hb_supplement, fb_supplement, ai_supplement, notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hotelId, season_name, start_date, end_date, currency || 'EUR',
        double_room_bb, single_supplement_bb, triple_room_bb,
        child_0_6_bb || 0, child_6_12_bb || 0, base_meal_plan || 'BB',
        hb_supplement, fb_supplement, ai_supplement, notes, 'active', decoded.userId
      ]
    );

    return NextResponse.json({
      message: 'Hotel created successfully',
      hotelId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating hotel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id, pricing_id,
      hotel_name, city, star_rating,
      season_name, start_date, end_date, currency,
      double_room_bb, single_supplement_bb, triple_room_bb,
      child_0_6_bb, child_6_12_bb, base_meal_plan,
      hb_supplement, fb_supplement, ai_supplement, notes
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Hotel ID required' }, { status: 400 });
    }

    // Verify ownership
    const [existing]: any = await pool.query(
      'SELECT id FROM hotels WHERE id = ? AND organization_id = ?',
      [id, decoded.organizationId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    // Update hotel
    await pool.query(
      'UPDATE hotels SET hotel_name = ?, city = ?, star_rating = ? WHERE id = ?',
      [hotel_name, city, star_rating, id]
    );

    // Update pricing if pricing_id provided
    if (pricing_id) {
      await pool.query(
        `UPDATE hotel_pricing SET
          season_name = ?, start_date = ?, end_date = ?, currency = ?,
          double_room_bb = ?, single_supplement_bb = ?, triple_room_bb = ?,
          child_0_6_bb = ?, child_6_12_bb = ?, base_meal_plan = ?,
          hb_supplement = ?, fb_supplement = ?, ai_supplement = ?, notes = ?
         WHERE id = ? AND hotel_id = ?`,
        [
          season_name, start_date, end_date, currency,
          double_room_bb, single_supplement_bb, triple_room_bb,
          child_0_6_bb, child_6_12_bb, base_meal_plan,
          hb_supplement, fb_supplement, ai_supplement, notes,
          pricing_id, id
        ]
      );
    }

    return NextResponse.json({ message: 'Hotel updated successfully' });

  } catch (error) {
    console.error('Error updating hotel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Hotel ID required' }, { status: 400 });
    }

    // Verify ownership
    const [existing]: any = await pool.query(
      'SELECT id FROM hotels WHERE id = ? AND organization_id = ?',
      [id, decoded.organizationId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    // Soft delete - set status to inactive
    await pool.query(
      'UPDATE hotels SET status = ? WHERE id = ?',
      ['inactive', id]
    );

    // Also archive all pricing
    await pool.query(
      'UPDATE hotel_pricing SET status = ? WHERE hotel_id = ?',
      ['archived', id]
    );

    return NextResponse.json({ message: 'Hotel archived successfully' });

  } catch (error) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
