import pool from '../lib/db';
import { searchPlaces, getPlaceDetails, getPhotoUrl } from '../lib/googlePlaces';

interface Hotel {
  id: number;
  hotel_name: string;
  city: string;
  star_rating: number;
  google_place_id: string | null;
}

async function enrichHotel(hotel: Hotel) {
  console.log(`\n🏨 Enriching: ${hotel.hotel_name} (${hotel.city})`);

  try {
    // Search for the hotel
    const searchQuery = `${hotel.hotel_name} ${hotel.city} Turkey hotel`;
    console.log(`   🔍 Searching: "${searchQuery}"`);

    const results = await searchPlaces(searchQuery);

    if (results.length === 0) {
      console.log(`   ❌ No results found for ${hotel.hotel_name}`);
      return false;
    }

    // Get the first result (most relevant)
    const place = results[0];
    console.log(`   ✅ Found: ${place.name}`);

    // Get detailed information
    const details = await getPlaceDetails(place.place_id);

    if (!details) {
      console.log(`   ❌ Could not get details for ${place.name}`);
      return false;
    }

    // Extract photo URLs (up to 3)
    let photo_url_1 = null;
    let photo_url_2 = null;
    let photo_url_3 = null;

    if (details.photos && details.photos.length > 0) {
      photo_url_1 = getPhotoUrl(details.photos[0].photo_reference, 1200);
      if (details.photos.length > 1) {
        photo_url_2 = getPhotoUrl(details.photos[1].photo_reference, 1200);
      }
      if (details.photos.length > 2) {
        photo_url_3 = getPhotoUrl(details.photos[2].photo_reference, 1200);
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
        details.place_id,
        details.geometry.location.lat,
        details.geometry.location.lng,
        details.rating || null,
        photo_url_1,
        photo_url_2,
        photo_url_3,
        hotel.id
      ]
    );

    console.log(`   ✅ Updated hotel ID ${hotel.id} with Google data`);
    console.log(`      📍 Coordinates: ${details.geometry.location.lat}, ${details.geometry.location.lng}`);
    console.log(`      ⭐ Rating: ${details.rating || 'N/A'}`);

    // Add a small delay to avoid hitting API rate limits
    await new Promise(resolve => setTimeout(resolve, 300));

    return true;
  } catch (error) {
    console.error(`   ❌ Error enriching ${hotel.hotel_name}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting hotel enrichment with Google Places data...\n');

  try {
    // Get hotels that need enrichment (new ones without google_place_id)
    const [hotels]: any = await pool.query(
      `SELECT id, hotel_name, city, star_rating, google_place_id
       FROM hotels
       WHERE status = 'active'
       AND id >= 75
       ORDER BY id`
    );

    console.log(`📊 Found ${hotels.length} hotels to enrich\n`);

    let successCount = 0;
    let failCount = 0;

    for (const hotel of hotels) {
      const success = await enrichHotel(hotel);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Successfully enriched: ${successCount} hotels`);
    console.log(`❌ Failed: ${failCount} hotels`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
