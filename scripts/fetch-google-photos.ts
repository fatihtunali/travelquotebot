/**
 * Google Places Photo Fetcher
 *
 * This script fetches real photos from Google Places API for all hotels and activities
 * in the demo@demotest.com operator account.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=your_key npm run fetch-photos
 *
 * Cost: ~$3 for 124 places (one-time fetch)
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { query, execute } from '../lib/db';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const DEMO_OPERATOR_ID = '270e887b-ed9c-4216-bf56-2ae311b2a154';

interface PlaceSearchResult {
  place_id: string;
  name: string;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  location_lat: number;
  location_lng: number;
}

interface Activity {
  id: string;
  name: string;
  city: string;
  meeting_point: string;
  location_lat: number;
  location_lng: number;
}

/**
 * Search for a place in Google Places API
 */
async function searchPlace(name: string, address: string, lat?: number, lng?: number): Promise<PlaceSearchResult | null> {
  try {
    const query = `${name}, ${address}`;
    const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
    url.searchParams.append('input', query);
    url.searchParams.append('inputtype', 'textquery');
    url.searchParams.append('fields', 'place_id,name,photos');
    url.searchParams.append('key', GOOGLE_PLACES_API_KEY!);

    // Add location bias if coordinates available
    if (lat && lng) {
      url.searchParams.append('locationbias', `point:${lat},${lng}`);
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      return data.candidates[0];
    }

    console.warn(`⚠️  No place found for: ${name}`);
    return null;
  } catch (error) {
    console.error(`❌ Error searching for place "${name}":`, error);
    return null;
  }
}

/**
 * Get photo URLs from photo references
 */
function getPhotoUrls(photos: Array<{ photo_reference: string; height: number; width: number }>, maxPhotos = 3): string[] {
  return photos.slice(0, maxPhotos).map(photo => {
    const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
    url.searchParams.append('maxwidth', '800');
    url.searchParams.append('photo_reference', photo.photo_reference);
    url.searchParams.append('key', GOOGLE_PLACES_API_KEY!);
    return url.toString();
  });
}

/**
 * Fetch photos for all hotels
 */
async function fetchHotelPhotos(): Promise<void> {
  console.log('\n📸 Fetching photos for hotels...\n');

  const hotels = await query<Hotel>(
    `SELECT id, name, city, address, location_lat, location_lng
     FROM accommodations
     WHERE operator_id = ?
     ORDER BY city, name`,
    [DEMO_OPERATOR_ID]
  );

  console.log(`Found ${hotels.length} hotels to process\n`);

  let successCount = 0;
  let failCount = 0;

  for (const hotel of hotels) {
    console.log(`Processing: ${hotel.name}, ${hotel.city}`);

    // Search for place
    const place = await searchPlace(
      hotel.name,
      hotel.address,
      hotel.location_lat,
      hotel.location_lng
    );

    if (place && place.photos && place.photos.length > 0) {
      const photoUrls = getPhotoUrls(place.photos, 3);

      // Update database with photo URLs
      await execute(
        `UPDATE accommodations
         SET images = ?
         WHERE id = ?`,
        [JSON.stringify(photoUrls), hotel.id]
      );

      console.log(`  ✅ Added ${photoUrls.length} photos`);
      successCount++;
    } else {
      console.log(`  ⚠️  No photos found`);
      failCount++;
    }

    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Hotels complete: ${successCount} success, ${failCount} no photos\n`);
}

/**
 * Fetch photos for all activities
 */
async function fetchActivityPhotos(): Promise<void> {
  console.log('\n📸 Fetching photos for activities...\n');

  const activities = await query<Activity>(
    `SELECT id, name, city, meeting_point, location_lat, location_lng
     FROM activities
     WHERE operator_id = ?
     ORDER BY city, name`,
    [DEMO_OPERATOR_ID]
  );

  console.log(`Found ${activities.length} activities to process\n`);

  let successCount = 0;
  let failCount = 0;

  for (const activity of activities) {
    console.log(`Processing: ${activity.name}, ${activity.city}`);

    // For activities, use the attraction name + city
    const searchAddress = `${activity.city}, Turkey`;

    const place = await searchPlace(
      activity.name,
      searchAddress,
      activity.location_lat,
      activity.location_lng
    );

    if (place && place.photos && place.photos.length > 0) {
      const photoUrls = getPhotoUrls(place.photos, 3);

      // Update database with photo URLs
      await execute(
        `UPDATE activities
         SET images = ?
         WHERE id = ?`,
        [JSON.stringify(photoUrls), activity.id]
      );

      console.log(`  ✅ Added ${photoUrls.length} photos`);
      successCount++;
    } else {
      console.log(`  ⚠️  No photos found`);
      failCount++;
    }

    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Activities complete: ${successCount} success, ${failCount} no photos\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Google Places Photo Fetcher\n');
  console.log('=' .repeat(60));

  // Validate API key
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('❌ ERROR: GOOGLE_PLACES_API_KEY environment variable not set!');
    console.log('\nUsage:');
    console.log('  GOOGLE_PLACES_API_KEY=your_key npm run fetch-photos');
    process.exit(1);
  }

  console.log('✅ API Key detected');
  console.log(`📍 Target: demo@demotest.com (${DEMO_OPERATOR_ID})`);
  console.log('=' .repeat(60));

  try {
    // Fetch hotel photos
    await fetchHotelPhotos();

    // Fetch activity photos
    await fetchActivityPhotos();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Photo fetching complete!');
    console.log('='.repeat(60));
    console.log('\n💰 Estimated API cost: ~$3-5 (one-time)');
    console.log('📊 Check your database - images field should now contain Google photo URLs\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { fetchHotelPhotos, fetchActivityPhotos };
