import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logActivity, getClientIP } from '@/lib/activityLog';

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

    // Get filter parameters
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');
    const city = (searchParams.get('city') || '').trim();

    // Build WHERE clause
    let whereClause = 'g.organization_id = ? AND g.status = ?';
    const params: any[] = [decoded.organizationId, 'active'];

    if (countryId && countryId !== 'all') {
      whereClause += ' AND g.country_id = ?';
      params.push(parseInt(countryId));
    }

    if (city && city !== 'All') {
      whereClause += ' AND g.city = ?';
      params.push(city);
    }

    // Get all guides with their pricing for this organization
    const [guides]: any = await pool.query(
      `SELECT
        g.id, g.city, g.country_id, g.language,
        gp.id as pricing_id, gp.season_name, gp.start_date, gp.end_date, gp.currency,
        gp.full_day_price as fullDay, gp.half_day_price as halfDay,
        gp.night_price as night, gp.notes, gp.status
       FROM guides g
       LEFT JOIN guide_pricing gp ON g.id = gp.guide_id AND gp.status = 'active'
       WHERE ${whereClause}
       ORDER BY g.city, g.language`,
      params
    );

    // Get all unique countries for this organization
    const [countries]: any = await pool.query(
      `SELECT DISTINCT g.country_id, c.country_name, c.flag_emoji
       FROM guides g
       JOIN countries c ON g.country_id = c.id
       WHERE g.organization_id = ? AND g.status = 'active'
       ORDER BY c.country_name`,
      [decoded.organizationId]
    );

    // Get all unique cities for this organization
    const [citiesResult]: any = await pool.query(
      `SELECT DISTINCT city FROM guides
       WHERE organization_id = ? AND status = 'active' AND city IS NOT NULL
       ORDER BY city`,
      [decoded.organizationId]
    );
    const cities = citiesResult.map((row: any) => row.city);

    return NextResponse.json({
      data: guides,
      filters: {
        countries: countries,
        cities: cities
      }
    });
  } catch (error) {
    console.error('Error fetching guides:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

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
      city, language,
      season_name, start_date, end_date, currency,
      full_day_price, half_day_price, night_price, notes
    } = body;

    // Validate required fields
    if (!city || !language || !season_name || !start_date || !end_date || !full_day_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert guide
    const [guideResult]: any = await pool.query(
      'INSERT INTO guides (organization_id, city, language, status) VALUES (?, ?, ?, ?)',
      [decoded.organizationId, city, language, 'active']
    );

    const guideId = guideResult.insertId;

    // Insert pricing
    await pool.query(
      `INSERT INTO guide_pricing (
        guide_id, season_name, start_date, end_date, currency,
        full_day_price, half_day_price, night_price, notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        guideId, season_name, start_date, end_date, currency || 'EUR',
        full_day_price, half_day_price, night_price, notes, 'active', decoded.userId
      ]
    );

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'guide_created',
      resourceType: 'guide',
      resourceId: guideId,
      details: `Guide created: ${language} in ${city}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      message: 'Guide created successfully',
      guideId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating guide:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const clientIP = getClientIP(request);

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
      city, language,
      season_name, start_date, end_date, currency,
      full_day_price, half_day_price, night_price, notes
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Guide ID required' }, { status: 400 });
    }

    // Verify ownership
    const [existing]: any = await pool.query(
      'SELECT id FROM guides WHERE id = ? AND organization_id = ?',
      [id, decoded.organizationId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Update guide
    await pool.query(
      'UPDATE guides SET city = ?, language = ? WHERE id = ?',
      [city, language, id]
    );

    // Update pricing if pricing_id provided
    if (pricing_id) {
      await pool.query(
        `UPDATE guide_pricing SET
          season_name = ?, start_date = ?, end_date = ?, currency = ?,
          full_day_price = ?, half_day_price = ?, night_price = ?, notes = ?
         WHERE id = ? AND guide_id = ?`,
        [
          season_name, start_date, end_date, currency,
          full_day_price, half_day_price, night_price, notes,
          pricing_id, id
        ]
      );
    }

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'guide_updated',
      resourceType: 'guide',
      resourceId: id,
      details: `Guide updated: ${language} in ${city}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({ message: 'Guide updated successfully' });

  } catch (error) {
    console.error('Error updating guide:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const clientIP = getClientIP(request);

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
      return NextResponse.json({ error: 'Guide ID required' }, { status: 400 });
    }

    // Verify ownership
    const [existing]: any = await pool.query(
      'SELECT id FROM guides WHERE id = ? AND organization_id = ?',
      [id, decoded.organizationId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Soft delete - set status to inactive
    await pool.query(
      'UPDATE guides SET status = ? WHERE id = ?',
      ['inactive', id]
    );

    // Also archive all pricing
    await pool.query(
      'UPDATE guide_pricing SET status = ? WHERE guide_id = ?',
      ['archived', id]
    );

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'guide_deleted',
      resourceType: 'guide',
      resourceId: parseInt(id),
      details: `Guide archived: ID ${id}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({ message: 'Guide archived successfully' });

  } catch (error) {
    console.error('Error deleting guide:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
