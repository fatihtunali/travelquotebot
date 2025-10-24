/**
 * Populate Turkey Hotels for Funny Tourism
 *
 * Deep search Google Places for 100+ hotels in each Turkish destination
 * Fetch FULL data: editorial_summary, place_types, ratings, photos
 * Auto-classify into categories including Special Class detection
 *
 * Usage: npx tsx scripts/populate-turkey-hotels.ts
 */

import pool from '../lib/db.js';
import { searchPlaces, getPlaceDetails } from '../lib/googlePlaces.js';
import * as fs from 'fs';
import * as path from 'path';

const ORGANIZATION_ID = 5; // Funny Tourism
const SEASON_START = '2025-11-01';
const SEASON_END = '2026-03-14';

interface Destination {
  name: string;
  name_tr: string;
  region: string;
  location: string;
  search_queries: string[];
  min_hotels: number;
}

interface HotelData {
  google_place_id: string;
  hotel_name: string;
  city: string;
  star_rating: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  contact_phone: string | null;
  website: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  photo_url_1: string | null;
  photo_url_2: string | null;
  photo_url_3: string | null;
  editorial_summary: string | null;
  place_types: string | null;
  price_level: number | null;
  business_status: string | null;
  hotel_category: string | null;
  is_boutique: boolean;
  room_count: number | null;
}

/**
 * Classify hotel based on Google data
 */
function classifyHotel(placeDetails: any): {
  category: string;
  isBoutique: boolean;
  starRating: number | null;
} {
  const rating = placeDetails.rating || 0;
  const reviewCount = placeDetails.user_ratings_total || 0;
  const priceLevel = placeDetails.price_level || 0;
  const types = placeDetails.types || [];
  const editorialSummary = placeDetails.editorial_summary?.overview?.toLowerCase() || '';

  // Check editorial summary for boutique/special class indicators
  const boutiqueKeywords = [
    'boutique', 'cave hotel', 'cave', 'historic', 'restored',
    'mansion', 'heritage', 'unique', 'traditional', 'ottoman',
    'special class', 'özel sınıf', 'butik'
  ];

  const hasBoutiqueDescription = boutiqueKeywords.some(keyword =>
    editorialSummary.includes(keyword)
  );

  // Check if place types include tourist_attraction (historic properties)
  const isHistoricAttraction = types.includes('tourist_attraction');

  // Determine star rating from price level and rating
  let starRating: number | null = null;
  if (priceLevel === 4 || (rating >= 4.7 && reviewCount > 1000)) {
    starRating = 5;
  } else if (priceLevel === 3 || (rating >= 4.5 && reviewCount > 500)) {
    starRating = 4;
  } else if (rating >= 4.0) {
    starRating = 3;
  }

  // SPECIAL CLASS detection
  if (
    hasBoutiqueDescription ||
    (isHistoricAttraction && rating >= 4.5) ||
    (rating >= 4.7 && reviewCount >= 50 && reviewCount <= 500 && priceLevel >= 3)
  ) {
    return {
      category: 'special_class',
      isBoutique: true,
      starRating: starRating || 4
    };
  }

  // LUXURY detection
  if (rating >= 4.8 && reviewCount > 5000 && priceLevel === 4) {
    return {
      category: 'luxury',
      isBoutique: false,
      starRating: 5
    };
  }

  // Standard classifications
  if (starRating === 5 || (priceLevel === 4 && rating >= 4.5)) {
    return {
      category: 'standard_5star',
      isBoutique: false,
      starRating: 5
    };
  }

  if (starRating === 4 || (priceLevel === 3 && rating >= 4.0)) {
    return {
      category: 'standard_4star',
      isBoutique: false,
      starRating: 4
    };
  }

  if (starRating === 3 || rating >= 3.5) {
    return {
      category: 'standard_3star',
      isBoutique: false,
      starRating: 3
    };
  }

  return {
    category: 'budget',
    isBoutique: false,
    starRating: 2
  };
}

/**
 * Save hotel to database
 */
async function saveHotel(hotelData: HotelData): Promise<number | null> {
  try {
    // Check if hotel already exists
    const [existing]: any = await pool.query(
      'SELECT id FROM hotels WHERE google_place_id = ?',
      [hotelData.google_place_id]
    );

    if (existing.length > 0) {
      console.log(`  ⏭️  ${hotelData.hotel_name}: Already exists, skipping`);
      return existing[0].id;
    }

    // Insert hotel
    const [result]: any = await pool.query(
      `INSERT INTO hotels (
        organization_id, google_place_id, hotel_name, city, star_rating,
        address, latitude, longitude, google_maps_url, contact_phone, website,
        rating, user_ratings_total, photo_url_1, photo_url_2, photo_url_3,
        editorial_summary, place_types, price_level, business_status,
        hotel_category, is_boutique, room_count, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        ORGANIZATION_ID,
        hotelData.google_place_id,
        hotelData.hotel_name,
        hotelData.city,
        hotelData.star_rating,
        hotelData.address,
        hotelData.latitude,
        hotelData.longitude,
        hotelData.google_maps_url,
        hotelData.contact_phone,
        hotelData.website,
        hotelData.rating,
        hotelData.user_ratings_total,
        hotelData.photo_url_1,
        hotelData.photo_url_2,
        hotelData.photo_url_3,
        hotelData.editorial_summary,
        hotelData.place_types,
        hotelData.price_level,
        hotelData.business_status,
        hotelData.hotel_category,
        hotelData.is_boutique ? 1 : 0,
        hotelData.room_count
      ]
    );

    const categoryIcon = hotelData.is_boutique ? '✨' :
                         hotelData.hotel_category === 'luxury' ? '💎' :
                         hotelData.hotel_category === 'standard_5star' ? '⭐⭐⭐' :
                         hotelData.hotel_category === 'standard_4star' ? '⭐⭐' :
                         hotelData.hotel_category === 'standard_3star' ? '⭐' : '💰';

    console.log(`  ✅ ${categoryIcon} ${hotelData.hotel_name} (${hotelData.hotel_category}) - ${hotelData.rating}★`);

    return result.insertId;

  } catch (error: any) {
    console.error(`  ❌ Error saving ${hotelData.hotel_name}:`, error.message || error);
    if (error.sql) {
      console.error(`  SQL: ${error.sql}`);
    }
    return null;
  }
}

/**
 * Search and fetch hotels for a destination
 */
async function fetchHotelsForDestination(destination: Destination): Promise<number> {
  let totalHotels = 0;
  const uniquePlaceIds = new Set<string>();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🏨 ${destination.name} (${destination.name_tr})`);
  console.log(`📍 Target: ${destination.min_hotels}+ hotels`);
  console.log(`${'='.repeat(80)}\n`);

  for (const query of destination.search_queries) {
    console.log(`\n🔍 Searching: "${query}"`);

    const results = await searchPlaces(query, destination.location);
    console.log(`   Found ${results.length} results`);

    for (const result of results) {
      // Skip if already processed
      if (uniquePlaceIds.has(result.place_id)) {
        continue;
      }
      uniquePlaceIds.add(result.place_id);

      // Fetch full details
      const details = await getPlaceDetails(result.place_id);

      if (!details) {
        console.log(`  ⚠️  ${result.name}: Could not fetch details`);
        continue;
      }

      // Classify hotel
      const classification = classifyHotel(details);

      // Prepare hotel data
      const hotelData: HotelData = {
        google_place_id: details.place_id,
        hotel_name: details.name,
        city: destination.name,
        star_rating: classification.starRating,
        address: details.formatted_address || null,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        google_maps_url: details.url || null,
        contact_phone: details.formatted_phone_number || null,
        website: details.website || null,
        rating: details.rating || null,
        user_ratings_total: details.user_ratings_total || null,
        photo_url_1: details.photos?.[0]?.photo_reference ?
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${details.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}` : null,
        photo_url_2: details.photos?.[1]?.photo_reference ?
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${details.photos[1].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}` : null,
        photo_url_3: details.photos?.[2]?.photo_reference ?
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${details.photos[2].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}` : null,
        editorial_summary: details.editorial_summary?.overview || null,
        place_types: JSON.stringify(details.types || []),
        price_level: details.price_level || null,
        business_status: details.business_status || null,
        hotel_category: classification.category,
        is_boutique: classification.isBoutique,
        room_count: null // Will be populated manually later
      };

      // Save to database
      const hotelId = await saveHotel(hotelData);
      if (hotelId) {
        totalHotels++;
      }

      // Rate limiting: 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));

      // Stop if we have enough hotels
      if (totalHotels >= destination.min_hotels) {
        console.log(`\n✅ Reached target of ${destination.min_hotels} hotels for ${destination.name}`);
        break;
      }
    }

    // Stop if we have enough hotels
    if (totalHotels >= destination.min_hotels) {
      break;
    }

    // Rate limiting between queries
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 ${destination.name}: ${totalHotels} hotels added\n`);
  return totalHotels;
}

/**
 * Main function
 */
async function populateAllHotels() {
  try {
    console.log('\n🚀 TURKEY HOTEL POPULATION SCRIPT');
    console.log(`Organization: Funny Tourism (ID: ${ORGANIZATION_ID})`);
    console.log(`Season: ${SEASON_START} to ${SEASON_END}\n`);

    // Load destinations
    const destinationsPath = path.join(__dirname, '../config/turkey-destinations.json');
    const destinationsData = JSON.parse(fs.readFileSync(destinationsPath, 'utf-8'));
    const destinations: Destination[] = destinationsData.destinations;

    console.log(`📍 ${destinations.length} destinations to process\n`);

    const stats = {
      totalDestinations: destinations.length,
      processedDestinations: 0,
      totalHotels: 0,
      specialClassHotels: 0,
      luxuryHotels: 0,
      errors: 0
    };

    // Process each destination
    for (const destination of destinations) {
      try {
        const hotelsAdded = await fetchHotelsForDestination(destination);
        stats.totalHotels += hotelsAdded;
        stats.processedDestinations++;
      } catch (error: any) {
        console.error(`❌ Error processing ${destination.name}:`, error.message);
        stats.errors++;
      }
    }

    // Get category distribution
    const [distribution]: any = await pool.query(
      `SELECT
        hotel_category,
        COUNT(*) as count,
        ROUND(AVG(rating), 1) as avg_rating
      FROM hotels
      WHERE organization_id = ?
      GROUP BY hotel_category
      ORDER BY FIELD(hotel_category, 'luxury', 'special_class', 'standard_5star', 'standard_4star', 'standard_3star', 'budget')`,
      [ORGANIZATION_ID]
    );

    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log(`Destinations Processed: ${stats.processedDestinations}/${stats.totalDestinations}`);
    console.log(`Total Hotels Added:     ${stats.totalHotels}`);
    console.log(`Errors:                 ${stats.errors}`);
    console.log('\n📈 CATEGORY DISTRIBUTION:');
    console.log('-'.repeat(80));

    distribution.forEach((row: any) => {
      const icon = row.hotel_category === 'special_class' ? '✨' :
                   row.hotel_category === 'luxury' ? '💎' :
                   row.hotel_category === 'standard_5star' ? '⭐⭐⭐' :
                   row.hotel_category === 'standard_4star' ? '⭐⭐' :
                   row.hotel_category === 'standard_3star' ? '⭐' : '💰';

      console.log(`${icon} ${row.hotel_category?.toUpperCase().padEnd(20)} ${String(row.count).padEnd(10)} (Avg: ${row.avg_rating}★)`);

      if (row.hotel_category === 'special_class') {
        stats.specialClassHotels = row.count;
      } else if (row.hotel_category === 'luxury') {
        stats.luxuryHotels = row.count;
      }
    });

    console.log('='.repeat(80));
    console.log(`✨ Special Class Hotels: ${stats.specialClassHotels}`);
    console.log(`💎 Luxury Hotels:        ${stats.luxuryHotels}`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  populateAllHotels();
}

export { populateAllHotels };
