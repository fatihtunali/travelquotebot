/**
 * Classify Hotels Using Google Places API Data
 *
 * This script enriches hotel records with better category classification
 * by analyzing Google Places data including:
 * - User ratings and review counts
 * - Place types
 * - Editorial summaries
 * - Price levels
 *
 * Special focus on identifying "Special Class" boutique hotels.
 */

import pool from '../lib/db';
import { getPlaceDetails } from '../lib/googlePlaces';

interface Hotel {
  id: number;
  hotel_name: string;
  city: string;
  star_rating: number | null;
  google_place_id: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  hotel_category: string | null;
  room_count: number | null;
}

interface EnrichmentResult {
  total: number;
  updated: number;
  special_class_identified: number;
  luxury_identified: number;
  errors: number;
}

/**
 * Classify hotel category based on Google and manual data
 */
function classifyHotel(hotel: Hotel, googleData?: any): string {
  const rating = googleData?.rating || hotel.rating || 0;
  const reviewCount = googleData?.user_ratings_total || hotel.user_ratings_total || 0;
  const starRating = hotel.star_rating || 0;
  const roomCount = hotel.room_count || 999; // Assume large if unknown
  const types = googleData?.types || [];
  const editorialSummary = googleData?.editorial_summary?.overview?.toLowerCase() || '';

  // Manual override: Small room count = Special Class
  if (roomCount > 0 && roomCount < 50) {
    console.log(`  ✨ ${hotel.hotel_name}: Special Class (${roomCount} rooms)`);
    return 'special_class';
  }

  // Check editorial summary for boutique indicators
  const boutiqueKeywords = ['boutique', 'cave hotel', 'historic', 'restored', 'mansion', 'heritage'];
  const isBoutiqueDescription = boutiqueKeywords.some(keyword => editorialSummary.includes(keyword));

  if (isBoutiqueDescription && starRating >= 4) {
    console.log(`  ✨ ${hotel.hotel_name}: Special Class (boutique description)`);
    return 'special_class';
  }

  // Ultra-luxury: 5-star with exceptional ratings and many reviews
  if (starRating === 5 && rating >= 4.7 && reviewCount > 5000) {
    console.log(`  💎 ${hotel.hotel_name}: Luxury (${rating}★, ${reviewCount} reviews)`);
    return 'luxury';
  }

  // Special Class: High quality boutique indicators
  // - High rating (4.5+)
  // - Moderate review count (50-500) suggests smaller property
  // - Quality level (4-5 star)
  if (
    rating >= 4.5 &&
    reviewCount >= 50 &&
    reviewCount <= 500 &&
    starRating >= 4
  ) {
    console.log(`  ✨ ${hotel.hotel_name}: Special Class (boutique metrics: ${rating}★, ${reviewCount} reviews)`);
    return 'special_class';
  }

  // Standard classifications based on star rating
  if (starRating === 5) return 'standard_5star';
  if (starRating === 4) return 'standard_4star';
  if (starRating === 3) return 'standard_3star';
  if (starRating <= 2) return 'budget';

  // Default fallback
  return 'standard_3star';
}

/**
 * Check if hotel is boutique based on Google data
 */
function isBoutiqueHotel(googleData: any, roomCount?: number): boolean {
  if (roomCount && roomCount < 50) return true;

  const editorialSummary = googleData?.editorial_summary?.overview?.toLowerCase() || '';
  const boutiqueKeywords = ['boutique', 'cave hotel', 'historic', 'restored', 'mansion', 'heritage', 'unique'];

  return boutiqueKeywords.some(keyword => editorialSummary.includes(keyword));
}

/**
 * Enrich a single hotel with Google Places data
 */
async function enrichHotel(hotel: Hotel): Promise<boolean> {
  try {
    if (!hotel.google_place_id) {
      console.log(`  ⚠️  ${hotel.hotel_name}: No Google Place ID, skipping`);
      return false;
    }

    console.log(`  🔍 Fetching Google data for: ${hotel.hotel_name}`);

    // Fetch fresh Google Places data
    const googleData = await getPlaceDetails(hotel.google_place_id);

    if (!googleData) {
      console.log(`  ❌ ${hotel.hotel_name}: Could not fetch Google data`);
      return false;
    }

    // Classify hotel
    const category = classifyHotel(hotel, googleData);
    const isBoutique = isBoutiqueHotel(googleData, hotel.room_count || undefined);

    // Update hotel record
    await pool.query(
      `UPDATE hotels SET
        hotel_category = ?,
        is_boutique = ?,
        rating = ?,
        user_ratings_total = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        category,
        isBoutique ? 1 : 0,
        googleData.rating || null,
        googleData.user_ratings_total || null,
        hotel.id
      ]
    );

    console.log(`  ✅ ${hotel.hotel_name}: ${category} (Boutique: ${isBoutique})`);
    return true;

  } catch (error) {
    console.error(`  ❌ Error enriching ${hotel.hotel_name}:`, error);
    return false;
  }
}

/**
 * Main enrichment function
 */
async function enrichAllHotels(organizationId?: number): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    total: 0,
    updated: 0,
    special_class_identified: 0,
    luxury_identified: 0,
    errors: 0
  };

  try {
    // Fetch all active hotels
    const whereClause = organizationId ? 'WHERE organization_id = ? AND status = "active"' : 'WHERE status = "active"';
    const params = organizationId ? [organizationId] : [];

    const [hotels]: any = await pool.query(
      `SELECT id, hotel_name, city, star_rating, google_place_id,
              rating, user_ratings_total, hotel_category, room_count
       FROM hotels
       ${whereClause}
       ORDER BY city, hotel_name`,
      params
    );

    result.total = hotels.length;
    console.log(`\n🏨 Found ${result.total} hotels to process\n`);

    // Process each hotel
    for (const hotel of hotels) {
      console.log(`\n📍 ${hotel.city} - ${hotel.hotel_name}`);

      const success = await enrichHotel(hotel);

      if (success) {
        result.updated++;

        // Fetch updated category
        const [updated]: any = await pool.query(
          'SELECT hotel_category FROM hotels WHERE id = ?',
          [hotel.id]
        );

        if (updated[0]?.hotel_category === 'special_class') {
          result.special_class_identified++;
        } else if (updated[0]?.hotel_category === 'luxury') {
          result.luxury_identified++;
        }
      } else {
        result.errors++;
      }

      // Rate limiting: Wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 ENRICHMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Hotels:           ${result.total}`);
    console.log(`Successfully Updated:   ${result.updated}`);
    console.log(`Special Class Found:    ${result.special_class_identified} ✨`);
    console.log(`Luxury Hotels Found:    ${result.luxury_identified} 💎`);
    console.log(`Errors:                 ${result.errors}`);
    console.log('='.repeat(60) + '\n');

    // Show category distribution
    const [distribution]: any = await pool.query(
      `SELECT
        hotel_category,
        COUNT(*) as count,
        ROUND(AVG(rating), 1) as avg_google_rating,
        ROUND(AVG(user_ratings_total), 0) as avg_reviews
      FROM hotels
      WHERE status = 'active'
      GROUP BY hotel_category
      ORDER BY FIELD(hotel_category, 'budget', 'standard_3star', 'standard_4star', 'standard_5star', 'special_class', 'luxury')`
    );

    console.log('\n📊 CATEGORY DISTRIBUTION');
    console.log('='.repeat(80));
    console.log('Category'.padEnd(25) + 'Count'.padEnd(10) + 'Avg Rating'.padEnd(15) + 'Avg Reviews');
    console.log('-'.repeat(80));
    distribution.forEach((row: any) => {
      const category = row.hotel_category || 'unknown';
      const displayName = category.replace(/_/g, ' ').toUpperCase();
      console.log(
        displayName.padEnd(25) +
        String(row.count).padEnd(10) +
        String(row.avg_google_rating || '-').padEnd(15) +
        String(row.avg_reviews || '-')
      );
    });
    console.log('='.repeat(80) + '\n');

    return result;

  } catch (error) {
    console.error('Error in enrichAllHotels:', error);
    throw error;
  }
}

/**
 * Show Special Class hotels
 */
async function showSpecialClassHotels() {
  const [hotels]: any = await pool.query(
    `SELECT
      h.id,
      h.hotel_name,
      h.city,
      h.star_rating,
      h.hotel_category,
      h.is_boutique,
      h.room_count,
      h.rating as google_rating,
      h.user_ratings_total as google_reviews
    FROM hotels h
    WHERE h.hotel_category = 'special_class' AND h.status = 'active'
    ORDER BY h.city, h.hotel_name`
  );

  console.log('\n✨ SPECIAL CLASS HOTELS');
  console.log('='.repeat(100));
  console.log(
    'ID'.padEnd(6) +
    'Hotel Name'.padEnd(35) +
    'City'.padEnd(15) +
    'Rooms'.padEnd(10) +
    'Rating'.padEnd(10) +
    'Reviews'
  );
  console.log('-'.repeat(100));

  hotels.forEach((hotel: any) => {
    console.log(
      String(hotel.id).padEnd(6) +
      hotel.hotel_name.substring(0, 32).padEnd(35) +
      hotel.city.padEnd(15) +
      String(hotel.room_count || '-').padEnd(10) +
      String(hotel.google_rating || '-').padEnd(10) +
      String(hotel.google_reviews || '-')
    );
  });

  console.log('='.repeat(100) + '\n');
}

// CLI Usage
const args = process.argv.slice(2);
const command = args[0];

if (command === 'enrich') {
  const orgId = args[1] ? parseInt(args[1]) : undefined;
  enrichAllHotels(orgId)
    .then(() => {
      console.log('✅ Enrichment complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Enrichment failed:', error);
      process.exit(1);
    });
} else if (command === 'show-special-class') {
  showSpecialClassHotels()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
} else {
  console.log(`
🏨 Hotel Category Classification Tool

Usage:
  npm run ts-node scripts/classify-hotels-with-google-data.ts enrich [orgId]
    Enrich all hotels with Google data and classify by category
    Optional: Specify organization ID to process only one org's hotels

  npm run ts-node scripts/classify-hotels-with-google-data.ts show-special-class
    Show all Special Class hotels

Examples:
  npm run ts-node scripts/classify-hotels-with-google-data.ts enrich
  npm run ts-node scripts/classify-hotels-with-google-data.ts enrich 1
  npm run ts-node scripts/classify-hotels-with-google-data.ts show-special-class
  `);
  process.exit(0);
}
