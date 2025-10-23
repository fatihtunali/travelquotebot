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

    // Get all entrance fees with their pricing for this organization
    const [fees]: any = await pool.query(
      `SELECT
        ef.id, ef.site_name as siteName, ef.city,
        ef.photo_url_1, ef.rating, ef.user_ratings_total, ef.google_maps_url,
        efp.id as pricing_id, efp.season_name as seasonName, efp.start_date as startDate,
        efp.end_date as endDate, efp.currency,
        efp.adult_price as adultPrice, efp.child_price as childPrice,
        efp.student_price as studentPrice, efp.notes, efp.status
       FROM entrance_fees ef
       LEFT JOIN entrance_fee_pricing efp ON ef.id = efp.entrance_fee_id AND efp.status = 'active'
       WHERE ef.organization_id = ? AND ef.status = 'active'
       ORDER BY ef.city, ef.site_name`,
      [decoded.organizationId]
    );

    return NextResponse.json(fees);
  } catch (error) {
    console.error('Error fetching entrance fees:', error);
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
      site_name, city,
      season_name, start_date, end_date, currency,
      adult_price, child_price, student_price, notes
    } = body;

    // Validate required fields
    if (!site_name || !city || !season_name || !start_date || !end_date || !adult_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert entrance fee
    const [feeResult]: any = await pool.query(
      'INSERT INTO entrance_fees (organization_id, site_name, city, status) VALUES (?, ?, ?, ?)',
      [decoded.organizationId, site_name, city, 'active']
    );

    const feeId = feeResult.insertId;

    // Insert pricing
    await pool.query(
      `INSERT INTO entrance_fee_pricing (
        entrance_fee_id, season_name, start_date, end_date, currency,
        adult_price, child_price, student_price, notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        feeId, season_name, start_date, end_date, currency || 'EUR',
        adult_price, child_price || 0, student_price || 0, notes, 'active', decoded.userId
      ]
    );

    return NextResponse.json({
      message: 'Entrance fee created successfully',
      feeId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating entrance fee:', error);
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
      site_name, city,
      season_name, start_date, end_date, currency,
      adult_price, child_price, student_price, notes
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Entrance fee ID required' }, { status: 400 });
    }

    // Verify ownership
    const [existing]: any = await pool.query(
      'SELECT id FROM entrance_fees WHERE id = ? AND organization_id = ?',
      [id, decoded.organizationId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Entrance fee not found' }, { status: 404 });
    }

    // Update entrance fee
    await pool.query(
      'UPDATE entrance_fees SET site_name = ?, city = ? WHERE id = ?',
      [site_name, city, id]
    );

    // Update pricing if pricing_id provided
    if (pricing_id) {
      await pool.query(
        `UPDATE entrance_fee_pricing SET
          season_name = ?, start_date = ?, end_date = ?, currency = ?,
          adult_price = ?, child_price = ?, student_price = ?, notes = ?
         WHERE id = ? AND entrance_fee_id = ?`,
        [
          season_name, start_date, end_date, currency,
          adult_price, child_price, student_price, notes,
          pricing_id, id
        ]
      );
    }

    return NextResponse.json({ message: 'Entrance fee updated successfully' });

  } catch (error) {
    console.error('Error updating entrance fee:', error);
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
      return NextResponse.json({ error: 'Entrance fee ID required' }, { status: 400 });
    }

    // Verify ownership
    const [existing]: any = await pool.query(
      'SELECT id FROM entrance_fees WHERE id = ? AND organization_id = ?',
      [id, decoded.organizationId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Entrance fee not found' }, { status: 404 });
    }

    // Soft delete - set status to inactive
    await pool.query(
      'UPDATE entrance_fees SET status = ? WHERE id = ?',
      ['inactive', id]
    );

    // Also archive all pricing
    await pool.query(
      'UPDATE entrance_fee_pricing SET status = ? WHERE entrance_fee_id = ?',
      ['archived', id]
    );

    return NextResponse.json({ message: 'Entrance fee archived successfully' });

  } catch (error) {
    console.error('Error deleting entrance fee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
