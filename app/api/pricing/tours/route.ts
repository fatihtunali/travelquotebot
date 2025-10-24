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

    // Get all tours with their pricing for this organization
    const [tours]: any = await pool.query(
      `SELECT
        t.id, t.tour_name, t.tour_code, t.city, t.duration_days, t.duration_hours, t.duration_type, t.tour_type,
        t.inclusions, t.exclusions,
        t.photo_url_1, t.rating, t.user_ratings_total, t.google_maps_url,
        tp.id as pricing_id, tp.season_name, tp.start_date, tp.end_date, tp.currency,
        tp.sic_price_2_pax, tp.sic_price_4_pax, tp.sic_price_6_pax,
        tp.sic_price_8_pax, tp.sic_price_10_pax,
        tp.pvt_price_2_pax, tp.pvt_price_4_pax, tp.pvt_price_6_pax,
        tp.pvt_price_8_pax, tp.pvt_price_10_pax, tp.notes, tp.status
       FROM tours t
       LEFT JOIN tour_pricing tp ON t.id = tp.tour_id AND tp.status = 'active'
       WHERE t.organization_id = ? AND t.status = 'active'
       ORDER BY t.city, t.tour_name`,
      [decoded.organizationId]
    );

    return NextResponse.json(tours);
  } catch (error) {
    console.error('Error fetching tours:', error);
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
      tour_name, tour_code, city, duration_days, duration_hours, duration_type, tour_type,
      inclusions, exclusions,
      season_name, start_date, end_date, currency,
      sic_price_2_pax, sic_price_4_pax, sic_price_6_pax,
      sic_price_8_pax, sic_price_10_pax,
      pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax,
      pvt_price_8_pax, pvt_price_10_pax, notes
    } = body;

    // Validate required fields
    if (!tour_name || !tour_code || !city || !season_name || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert tour
    const [tourResult]: any = await pool.query(
      'INSERT INTO tours (organization_id, tour_name, tour_code, city, duration_days, duration_hours, duration_type, tour_type, inclusions, exclusions, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [decoded.organizationId, tour_name, tour_code, city, duration_days || 1, duration_hours || 8, duration_type || 'hours', tour_type || 'SIC', inclusions, exclusions, 'active']
    );

    const tourId = tourResult.insertId;

    // Insert pricing
    await pool.query(
      `INSERT INTO tour_pricing (
        tour_id, season_name, start_date, end_date, currency,
        sic_price_2_pax, sic_price_4_pax, sic_price_6_pax,
        sic_price_8_pax, sic_price_10_pax,
        pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax,
        pvt_price_8_pax, pvt_price_10_pax, notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tourId, season_name, start_date, end_date, currency || 'EUR',
        sic_price_2_pax || 0, sic_price_4_pax || 0, sic_price_6_pax || 0,
        sic_price_8_pax || 0, sic_price_10_pax || 0,
        pvt_price_2_pax || 0, pvt_price_4_pax || 0, pvt_price_6_pax || 0,
        pvt_price_8_pax || 0, pvt_price_10_pax || 0, notes, 'active', decoded.userId
      ]
    );

    return NextResponse.json({
      message: 'Tour created successfully',
      tourId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating tour:', error);
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
      tour_name, tour_code, city, duration_days, duration_hours, duration_type, tour_type,
      inclusions, exclusions,
      season_name, start_date, end_date, currency,
      sic_price_2_pax, sic_price_4_pax, sic_price_6_pax,
      sic_price_8_pax, sic_price_10_pax,
      pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax,
      pvt_price_8_pax, pvt_price_10_pax, notes
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Tour ID required' }, { status: 400 });
    }

    // Verify ownership
    const [existing]: any = await pool.query(
      'SELECT id FROM tours WHERE id = ? AND organization_id = ?',
      [id, decoded.organizationId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Update tour
    await pool.query(
      'UPDATE tours SET tour_name = ?, tour_code = ?, city = ?, duration_days = ?, duration_hours = ?, duration_type = ?, tour_type = ?, inclusions = ?, exclusions = ? WHERE id = ?',
      [tour_name, tour_code, city, duration_days, duration_hours, duration_type, tour_type, inclusions, exclusions, id]
    );

    // Update pricing if pricing_id provided
    if (pricing_id) {
      await pool.query(
        `UPDATE tour_pricing SET
          season_name = ?, start_date = ?, end_date = ?, currency = ?,
          sic_price_2_pax = ?, sic_price_4_pax = ?, sic_price_6_pax = ?,
          sic_price_8_pax = ?, sic_price_10_pax = ?,
          pvt_price_2_pax = ?, pvt_price_4_pax = ?, pvt_price_6_pax = ?,
          pvt_price_8_pax = ?, pvt_price_10_pax = ?, notes = ?
         WHERE id = ? AND tour_id = ?`,
        [
          season_name, start_date, end_date, currency,
          sic_price_2_pax, sic_price_4_pax, sic_price_6_pax,
          sic_price_8_pax, sic_price_10_pax,
          pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax,
          pvt_price_8_pax, pvt_price_10_pax, notes,
          pricing_id, id
        ]
      );
    }

    return NextResponse.json({ message: 'Tour updated successfully' });

  } catch (error) {
    console.error('Error updating tour:', error);
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
      return NextResponse.json({ error: 'Tour ID required' }, { status: 400 });
    }

    // Verify ownership
    const [existing]: any = await pool.query(
      'SELECT id FROM tours WHERE id = ? AND organization_id = ?',
      [id, decoded.organizationId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Soft delete - set status to inactive
    await pool.query(
      'UPDATE tours SET status = ? WHERE id = ?',
      ['inactive', id]
    );

    // Also archive all pricing
    await pool.query(
      'UPDATE tour_pricing SET status = ? WHERE tour_id = ?',
      ['archived', id]
    );

    return NextResponse.json({ message: 'Tour archived successfully' });

  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
