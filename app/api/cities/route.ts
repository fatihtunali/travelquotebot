import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { validators } from '@/lib/security';

/**
 * GET /api/cities?search=ist&country_id=1&country_code=TR&country_ids=1,2,9
 * Returns distinct cities from pricing tables, optionally filtered by country
 * Supports single country (country_id) or multiple countries (country_ids)
 * Public endpoint - no auth required for trip planning
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const countryId = searchParams.get('country_id');
    const countryIds = searchParams.get('country_ids'); // New: comma-separated IDs
    const countryCode = searchParams.get('country_code');

    // C4: Validate search input
    if (search && !validators.searchQuery(search)) {
      return NextResponse.json({ error: 'Invalid search parameter' }, { status: 400 });
    }

    // Build country filter
    let countryFilter = '';
    let countryJoin = '';
    const queryParams: any[] = [];

    if (countryIds) {
      // Multiple countries (new multi-country support)
      const ids = countryIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        countryFilter = `AND country_id IN (${placeholders})`;
        queryParams.push(...ids);
      }
    } else if (countryId) {
      // Single country (backward compatibility)
      countryFilter = 'AND country_id = ?';
      queryParams.push(parseInt(countryId));
    } else if (countryCode) {
      countryFilter = 'AND country_id = (SELECT id FROM countries WHERE country_code = ?)';
      queryParams.push(countryCode.toUpperCase());
    }

    // Get distinct cities from all pricing tables with country info
    const query = `
      SELECT DISTINCT
        all_cities.city,
        c.country_name,
        c.country_code,
        c.flag_emoji
      FROM (
        SELECT city, country_id FROM hotels WHERE status = 'active' AND city IS NOT NULL ${countryFilter}
        UNION
        SELECT city, country_id FROM tours WHERE status = 'active' AND city IS NOT NULL ${countryFilter}
        UNION
        SELECT city, country_id FROM guides WHERE status = 'active' AND city IS NOT NULL ${countryFilter}
        UNION
        SELECT city, country_id FROM entrance_fees WHERE status = 'active' AND city IS NOT NULL ${countryFilter}
        UNION
        SELECT city, country_id FROM vehicles WHERE status = 'active' AND city IS NOT NULL ${countryFilter}
      ) AS all_cities
      LEFT JOIN countries c ON all_cities.country_id = c.id
      WHERE all_cities.city LIKE ?
      ORDER BY c.country_name, all_cities.city
      LIMIT 20
    `;

    // Add search parameter for each UNION (5 times) + final LIKE
    const searchPattern = `%${search}%`;
    const finalParams = [...queryParams, ...queryParams, ...queryParams, ...queryParams, ...queryParams, searchPattern];

    const [rows] = await pool.query(query, finalParams);

    // For backward compatibility, also return simple cities array
    const cities = (rows as any[]).map(row => row.city);

    return NextResponse.json({
      cities,          // Simple array for backward compatibility
      citiesWithInfo: rows  // Detailed info with country
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
