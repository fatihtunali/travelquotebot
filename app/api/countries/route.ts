import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch all active countries or countries for a specific organization
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');
    const status = searchParams.get('status') || 'active';

    let query = '';
    let params: any[] = [];

    if (orgId) {
      // Get countries that this organization serves
      query = `
        SELECT DISTINCT
          c.id,
          c.country_code,
          c.country_name,
          c.currency_code,
          c.flag_emoji,
          c.timezone_default,
          oc.is_primary,
          (SELECT COUNT(*) FROM hotels WHERE country_id = c.id AND organization_id = ?) as hotel_count,
          (SELECT COUNT(*) FROM tours WHERE country_id = c.id AND organization_id = ?) as tour_count
        FROM countries c
        JOIN organization_countries oc ON c.id = oc.country_id
        WHERE oc.organization_id = ?
          AND c.status = ?
        ORDER BY oc.is_primary DESC, c.country_name ASC
      `;
      params = [orgId, orgId, orgId, status];
    } else {
      // Get all active countries
      query = `
        SELECT
          id,
          country_code,
          country_name,
          currency_code,
          flag_emoji,
          timezone_default,
          status
        FROM countries
        WHERE status = ?
        ORDER BY country_name ASC
      `;
      params = [status];
    }

    const [countries] = await pool.query(query, params);

    return NextResponse.json({
      countries,
      total: Array.isArray(countries) ? countries.length : 0
    });

  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Add a country to an organization (requires authentication)
export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();

  try {
    const body = await request.json();
    const { organization_id, country_id, is_primary } = body;

    // Validation
    if (!organization_id || !country_id) {
      return NextResponse.json(
        { error: 'organization_id and country_id are required' },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // If setting as primary, unset other primaries
    if (is_primary) {
      await connection.query(
        'UPDATE organization_countries SET is_primary = FALSE WHERE organization_id = ?',
        [organization_id]
      );
    }

    // Add or update the country association
    await connection.query(
      `INSERT INTO organization_countries (organization_id, country_id, is_primary)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary)`,
      [organization_id, country_id, is_primary || false]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Country added to organization successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error adding country to organization:', error);
    return NextResponse.json(
      { error: 'Failed to add country', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// DELETE - Remove a country from an organization
export async function DELETE(request: NextRequest) {
  const connection = await pool.getConnection();

  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');
    const countryId = searchParams.get('country_id');

    if (!orgId || !countryId) {
      return NextResponse.json(
        { error: 'org_id and country_id are required' },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // Check if this is the only country for the organization
    const [existing]: any = await connection.query(
      'SELECT COUNT(*) as count FROM organization_countries WHERE organization_id = ?',
      [orgId]
    );

    if (existing[0].count <= 1) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Cannot remove the last country from an organization' },
        { status: 400 }
      );
    }

    // Delete the association
    await connection.query(
      'DELETE FROM organization_countries WHERE organization_id = ? AND country_id = ?',
      [orgId, countryId]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Country removed from organization successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error removing country from organization:', error);
    return NextResponse.json(
      { error: 'Failed to remove country', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
