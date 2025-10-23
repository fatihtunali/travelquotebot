/**
 * Script to populate database with famous Turkey destinations using Google Places API
 * Run with: npx tsx scripts/populate-turkey-places.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Famous Turkey destinations to populate
const TURKEY_PLACES = [
  'Hagia Sophia Istanbul Turkey',
  'Blue Mosque Istanbul Turkey',
  'Topkapi Palace Istanbul Turkey',
  'Grand Bazaar Istanbul Turkey',
  'Galata Tower Istanbul Turkey',
  'Cappadocia Hot Air Balloon Turkey',
  'Pamukkale Thermal Pools Turkey',
  'Ephesus Ancient City Turkey',
  'Antalya Old Town Turkey',
  'Bodrum Castle Turkey',
  'Mount Nemrut Turkey',
  'Aspendos Theatre Turkey',
  'Sumela Monastery Turkey',
  'Troy Ancient City Turkey',
  'Pergamon Acropolis Turkey'
];

interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
}

async function searchPlace(query: string): Promise<PlaceSearchResult | null> {
  try {
    const params = new URLSearchParams({
      query: query,
      key: GOOGLE_PLACES_API_KEY!,
    });

    console.log(`Searching for: ${query}...`);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const place = data.results[0];
      console.log(`✓ Found: ${place.name} (${place.place_id})`);
      return place;
    } else {
      console.log(`✗ Not found: ${query}`);
      return null;
    }
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    return null;
  }
}

async function savePlace(placeId: string): Promise<boolean> {
  try {
    // You'll need to get a valid JWT token first
    const token = process.env.TEST_JWT_TOKEN;

    if (!token) {
      console.error('No TEST_JWT_TOKEN found in .env.local');
      return false;
    }

    const response = await fetch('http://localhost:3003/api/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ placeId })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`  ✓ Saved to database: ${data.place.name}`);
      return true;
    } else {
      const error = await response.json();
      console.error(`  ✗ Failed to save:`, error);
      return false;
    }
  } catch (error) {
    console.error('  ✗ Error saving place:', error);
    return false;
  }
}

async function main() {
  console.log('🇹🇷 Populating database with Turkey destinations...\n');

  let successCount = 0;
  let failCount = 0;

  for (const placeName of TURKEY_PLACES) {
    const result = await searchPlace(placeName);

    if (result) {
      const saved = await savePlace(result.place_id);
      if (saved) {
        successCount++;
      } else {
        failCount++;
      }
    } else {
      failCount++;
    }

    // Rate limit: Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');
  }

  console.log(`\n✅ Complete! Saved: ${successCount}, Failed: ${failCount}`);
}

main().catch(console.error);
