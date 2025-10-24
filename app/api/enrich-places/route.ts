import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces, getPlaceDetails, getPhotoUrl } from '@/lib/googlePlaces';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

// C6: Remove fallback - JWT_SECRET is required
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * POST /api/enrich-places
 * Body: { table: 'hotels', id: 1 }
 * Fetches Google Places data and updates the item
 */
export async function POST(request: NextRequest) {
  try {
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
    const { table, id } = body;

    if (!table || !id) {
      return NextResponse.json(
        { error: 'table and id are required' },
        { status: 400 }
      );
    }

    // Validate table name (security)
    const allowedTables = ['hotels', 'tours', 'entrance_fees'];
    if (!allowedTables.includes(table)) {
      return NextResponse.json(
        { error: 'Invalid table name' },
        { status: 400 }
      );
    }

    // Get the item from database
    let nameColumn, cityColumn;
    switch (table) {
      case 'hotels':
        nameColumn = 'hotel_name';
        cityColumn = 'city';
        break;
      case 'tours':
        nameColumn = 'tour_name';
        cityColumn = 'city';
        break;
      case 'entrance_fees':
        nameColumn = 'site_name';
        cityColumn = 'city';
        break;
    }

    const [items]: any = await pool.query(
      `SELECT id, ${nameColumn} as name, ${cityColumn} as city FROM ${table} WHERE id = ?`,
      [id]
    );

    if (items.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = items[0];

    // Search for place on Google
    const searchQuery = `${item.name} ${item.city} Turkey`;
    console.log('Searching Google Places:', searchQuery);

    const searchResults = await searchPlaces(searchQuery);

    if (searchResults.length === 0) {
      return NextResponse.json(
        { error: 'No results found on Google Places' },
        { status: 404 }
      );
    }

    const firstResult = searchResults[0];

    // Get detailed information
    const placeDetails = await getPlaceDetails(firstResult.id);

    if (!placeDetails) {
      return NextResponse.json(
        { error: 'Failed to get place details' },
        { status: 500 }
      );
    }

    // Get photo URLs (up to 3)
    const photoUrls = placeDetails.photos?.slice(0, 3).map(photo =>
      getPhotoUrl(photo.name, 1200)
    ) || [];

    // Update the database
    await pool.query(
      `UPDATE ${table} SET
        google_place_id = ?,
        latitude = ?,
        longitude = ?,
        google_maps_url = ?,
        photo_url_1 = ?,
        photo_url_2 = ?,
        photo_url_3 = ?,
        rating = ?,
        user_ratings_total = ?,
        website = ?
      WHERE id = ?`,
      [
        placeDetails.id,
        placeDetails.location?.latitude || null,
        placeDetails.location?.longitude || null,
        placeDetails.googleMapsUri || null,
        photoUrls[0] || null,
        photoUrls[1] || null,
        photoUrls[2] || null,
        placeDetails.rating || null,
        placeDetails.userRatingCount || null,
        placeDetails.websiteUri || null,
        id
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${table} #${id} with Google Places data`,
      data: {
        name: item.name,
        google_place_id: placeDetails.id,
        rating: placeDetails.rating,
        photos: photoUrls.length,
        google_maps_url: placeDetails.googleMapsUri
      }
    });

  } catch (error) {
    console.error('Error enriching place:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/enrich-places?table=hotels
 * Get count of items needing enrichment
 *
 * GET /api/enrich-places/items?table=hotels
 * Get list of items needing enrichment (used by batch script)
 */
export async function GET(request: NextRequest) {
  try {
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
    const table = searchParams.get('table');
    const getItems = searchParams.get('getItems') === 'true';

    if (!table) {
      return NextResponse.json(
        { error: 'table parameter is required' },
        { status: 400 }
      );
    }

    const allowedTables = ['hotels', 'tours', 'entrance_fees'];
    if (!allowedTables.includes(table)) {
      return NextResponse.json(
        { error: 'Invalid table name' },
        { status: 400 }
      );
    }

    // Determine column names based on table
    let nameColumn, cityColumn;
    switch (table) {
      case 'hotels':
        nameColumn = 'hotel_name';
        cityColumn = 'city';
        break;
      case 'tours':
        nameColumn = 'tour_name';
        cityColumn = 'city';
        break;
      case 'entrance_fees':
        nameColumn = 'site_name';
        cityColumn = 'city';
        break;
    }

    if (getItems) {
      // Return list of items needing enrichment
      const [items]: any = await pool.query(
        `SELECT id, ${nameColumn} as name, ${cityColumn} as city
         FROM ${table}
         WHERE google_place_id IS NULL
         ORDER BY id`,
        []
      );

      return NextResponse.json({
        table,
        count: items.length,
        items: items.map((item: any) => ({
          id: item.id,
          name: item.name,
          city: item.city
        }))
      });
    } else {
      // Return count only
      const [countResult]: any = await pool.query(
        `SELECT COUNT(*) as count FROM ${table} WHERE google_place_id IS NULL`,
        []
      );

      return NextResponse.json({
        table,
        items_needing_enrichment: countResult[0].count
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
