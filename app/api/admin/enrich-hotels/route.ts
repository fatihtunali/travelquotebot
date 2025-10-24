import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { searchPlaces, getPlaceDetails, getPhotoUrl } from '@/lib/googlePlaces';
import { authenticateRequest } from '@/lib/security';

// POST - Enrich hotels with Google Places data (Admin only)
export async function POST(request: NextRequest) {
  try {
    // C5: Add authentication - super_admin only (expensive API calls)
    const auth = await authenticateRequest(request, {
      allowedRoles: ['super_admin']
    });

    if (!auth.authorized || !auth.user) {
      return auth.error!;
    }

    // Get hotels that need enrichment
    const [hotels]: any = await pool.query(
      `SELECT id, hotel_name, city, star_rating, google_place_id
       FROM hotels
       WHERE status = 'active'
       AND id >= 75
       ORDER BY id`
    );

    console.log(`📊 Found ${hotels.length} hotels to enrich`);

    const results = [];

    for (const hotel of hotels) {
      console.log(`\n🏨 Enriching: ${hotel.hotel_name} (${hotel.city})`);

      try {
        // Search for the hotel
        const searchQuery = `${hotel.hotel_name} ${hotel.city} Turkey hotel`;
        console.log(`   🔍 Searching: "${searchQuery}"`);

        const searchResults = await searchPlaces(searchQuery);

        if (searchResults.length === 0) {
          console.log(`   ❌ No results found`);
          results.push({ hotel_id: hotel.id, hotel_name: hotel.hotel_name, status: 'not_found' });
          continue;
        }

        // Get the first result (most relevant)
        const place = searchResults[0];
        console.log(`   ✅ Found: ${place.displayName?.text || 'Unknown'}`);

        // Get detailed information
        const details = await getPlaceDetails(place.id);

        if (!details) {
          console.log(`   ❌ Could not get details`);
          results.push({ hotel_id: hotel.id, hotel_name: hotel.hotel_name, status: 'details_failed' });
          continue;
        }

        // Extract photo URLs (up to 3)
        let photo_url_1 = null;
        let photo_url_2 = null;
        let photo_url_3 = null;

        if (details.photos && details.photos.length > 0) {
          photo_url_1 = getPhotoUrl(details.photos[0].name, 1200);
          if (details.photos.length > 1) {
            photo_url_2 = getPhotoUrl(details.photos[1].name, 1200);
          }
          if (details.photos.length > 2) {
            photo_url_3 = getPhotoUrl(details.photos[2].name, 1200);
          }
          console.log(`   📸 Found ${details.photos.length} photos`);
        }

        // Update hotel in database
        await pool.query(
          `UPDATE hotels SET
            google_place_id = ?,
            latitude = ?,
            longitude = ?,
            rating = ?,
            photo_url_1 = ?,
            photo_url_2 = ?,
            photo_url_3 = ?
          WHERE id = ?`,
          [
            details.id,
            details.location?.latitude || null,
            details.location?.longitude || null,
            details.rating || null,
            photo_url_1,
            photo_url_2,
            photo_url_3,
            hotel.id
          ]
        );

        console.log(`   ✅ Updated hotel ID ${hotel.id}`);
        console.log(`      📍 Coordinates: ${details.location?.latitude || 'N/A'}, ${details.location?.longitude || 'N/A'}`);
        console.log(`      ⭐ Rating: ${details.rating || 'N/A'}`);

        results.push({
          hotel_id: hotel.id,
          hotel_name: hotel.hotel_name,
          status: 'success',
          rating: details.rating,
          photos_count: details.photos?.length || 0
        });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error: any) {
        console.error(`   ❌ Error enriching ${hotel.hotel_name}:`, error);
        results.push({
          hotel_id: hotel.id,
          hotel_name: hotel.hotel_name,
          status: 'error',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      total: results.length,
      successful: successCount,
      failed: failCount,
      results
    });

  } catch (error: any) {
    console.error('Error enriching hotels:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
