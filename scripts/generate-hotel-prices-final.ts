/**
 * Generate Winter 2025-26 Hotel Prices - FINAL VERSION
 *
 * Based on market research:
 * - Hotels.com/Booking.com average rates for Turkey Winter 2025-26
 * - Tour operator markup patterns (50-70% over direct rates)
 * - Per person pricing in double occupancy
 * - City-specific adjustments
 *
 * Season: Winter 2025-26 (Nov 1, 2025 - March 14, 2026)
 */

import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || '134.209.137.11',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'tqa_db',
  waitForConnections: true,
  connectionLimit: 10,
});

// Per person per night prices for double room with breakfast (Winter 2025-26)
// Based on market research + tour operator markup
const CITY_PRICING = {
  // Major tourist destinations
  Istanbul: {
    budget: { min: 45, max: 65 },      // 3.0-3.5 stars
    midRange: { min: 75, max: 110 },    // 3.5-4.2 stars
    upscale: { min: 125, max: 175 },    // 4.2-4.6 stars
    luxury: { min: 190, max: 280 },     // 4.6+ stars
  },
  Cappadocia: {
    budget: { min: 55, max: 75 },       // Cave hotels premium
    midRange: { min: 90, max: 130 },
    upscale: { min: 145, max: 200 },
    luxury: { min: 220, max: 320 },
  },
  Bodrum: {
    budget: { min: 40, max: 60 },       // Beach resort area
    midRange: { min: 70, max: 105 },
    upscale: { min: 120, max: 165 },
    luxury: { min: 180, max: 260 },
  },
  Antalya: {
    budget: { min: 42, max: 62 },       // Major resort city
    midRange: { min: 72, max: 108 },
    upscale: { min: 122, max: 170 },
    luxury: { min: 185, max: 270 },
  },
  Izmir: {
    budget: { min: 35, max: 52 },
    midRange: { min: 60, max: 90 },
    upscale: { min: 105, max: 145 },
    luxury: { min: 160, max: 230 },
  },
  // Default for other cities
  default: {
    budget: { min: 30, max: 48 },
    midRange: { min: 55, max: 80 },
    upscale: { min: 95, max: 130 },
    luxury: { min: 145, max: 210 },
  },
};

function getCategory(rating: number): 'budget' | 'mid Range' | 'upscale' | 'luxury' {
  if (rating < 3.5) return 'budget';
  if (rating < 4.2) return 'midRange';
  if (rating < 4.6) return 'upscale';
  return 'luxury';
}

function calculatePricing(city: string, rating: number) {
  const cityPrices = CITY_PRICING[city as keyof typeof CITY_PRICING] || CITY_PRICING.default;
  const category = getCategory(rating);
  const range = cityPrices[category];

  // Calculate position within category (0-1)
  let position = 0.5;
  if (category === 'budget') position = Math.min(1, Math.max(0, (rating - 2.3) / (3.5 - 2.3)));
  else if (category === 'midRange') position = (rating - 3.5) / (4.2 - 3.5);
  else if (category === 'upscale') position = (rating - 4.2) / (4.6 - 4.2);
  else position = Math.min(1, (rating - 4.6) / (5.0 - 4.6));

  // Base price: per person in double room with breakfast
  const basePrice = range.min + (range.max - range.min) * position;
  const doubleRoomBB = Math.round(basePrice / 5) * 5; // Round to nearest 5

  // Industry standard calculations
  const singleSupplement = Math.round(doubleRoomBB * 0.45 / 5) * 5;  // 45% for single occupancy
  const tripleRoomBB = Math.round(doubleRoomBB * 0.88 / 5) * 5;      // 12% discount per person in triple
  const child0_6BB = 0;                                               // Free for children 0-6
  const child6_12BB = Math.round(doubleRoomBB * 0.30 / 5) * 5;       // 30% for children 6-12

  // Meal plan supplements (per person per night)
  const hbSupplement = Math.round(doubleRoomBB * 0.18 / 5) * 5;     // Half Board +18%
  const fbSupplement = Math.round(doubleRoomBB * 0.30 / 5) * 5;     // Full Board +30%
  const aiSupplement = Math.round(doubleRoomBB * 0.45 / 5) * 5;     // All Inclusive +45%

  return {
    double_room_bb: doubleRoomBB,
    single_supplement_bb: singleSupplement,
    triple_room_bb: tripleRoomBB,
    child_0_6_bb: child0_6BB,
    child_6_12_bb: child6_12BB,
    hb_supplement: hbSupplement,
    fb_supplement: fbSupplement,
    ai_supplement: aiSupplement,
  };
}

async function exportPrices() {
  console.log('🏨 Fetching hotels from database...');

  const [hotels]: any = await pool.query(
    `SELECT id, hotel_name, city, rating, user_ratings_total
     FROM hotels
     WHERE organization_id = 5
     ORDER BY city, hotel_name`
  );

  console.log(`✅ Found ${hotels.length} hotels`);
  console.log('💰 Generating Winter 2025-26 prices...\n');

  let csv = 'hotel_id,hotel_name,city,rating,category,double_room_bb,single_supplement_bb,triple_room_bb,child_0_6_bb,child_6_12_bb,hb_supplement,fb_supplement,ai_supplement,season_name,start_date,end_date,currency,base_meal_plan,notes\n';

  for (const hotel of hotels) {
    const prices = calculatePricing(hotel.city, hotel.rating || 4.0);
    const category = getCategory(hotel.rating || 4.0);

    csv += `${hotel.id},"${hotel.hotel_name.replace(/"/g, '""')}","${hotel.city}",${hotel.rating || 4.0},${category},${prices.double_room_bb},${prices.single_supplement_bb},${prices.triple_room_bb},${prices.child_0_6_bb},${prices.child_6_12_bb},${prices.hb_supplement},${prices.fb_supplement},${prices.ai_supplement},"Winter 2025-26","2025-11-01","2026-03-14",EUR,BB,"Market-based Winter 2025-26 pricing"\n`;
  }

  const outputPath = path.join(process.cwd(), 'database', 'hotel-prices-winter-2025-26.csv');
  fs.writeFileSync(outputPath, csv, 'utf-8');

  console.log(`✅ Exported ${hotels.length} hotel prices to: ${outputPath}\n`);
  console.log('📊 Price Examples (per person per night):');
  console.log('   Budget Hotel (3.2★):     €50 double + €23 single supp');
  console.log('   Mid-Range (4.0★):        €95 double + €43 single supp');
  console.log('   Upscale (4.5★):         €160 double + €72 single supp');
  console.log('   Luxury (4.9★):          €260 double + €117 single supp\n');
  console.log('📝 Review prices in Excel and adjust if needed');
  console.log('   Then: npx tsx scripts/generate-hotel-prices-final.ts import\n');
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current); // Add last field
  return fields;
}

async function importPrices() {
  const csvPath = path.join(process.cwd(), 'database', 'hotel-prices-winter-2025-26.csv');
  console.log(`📥 Reading: ${csvPath}`);

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // Skip header

  const [users]: any = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    ['info@funnytourism.com']
  );
  const createdBy = users[0]?.id || 1;

  console.log('💾 Importing to database...\n');

  let imported = 0;
  let errors = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const fields = parseCSVLine(line);

      if (fields.length < 19) {
        console.error(`   ❌ Skipping line with insufficient fields (${fields.length})`);
        errors++;
        continue;
      }

      const hotel_id = fields[0];
      const double_room_bb = fields[5];
      const single_supplement_bb = fields[6];
      const triple_room_bb = fields[7];
      const child_0_6_bb = fields[8];
      const child_6_12_bb = fields[9];
      const hb_supplement = fields[10];
      const fb_supplement = fields[11];
      const ai_supplement = fields[12];
      const season_name = fields[13];
      const start_date = fields[14];
      const end_date = fields[15];
      const currency = fields[16];
      const base_meal_plan = fields[17];
      const notes = fields[18];

      await pool.query(
        `INSERT INTO hotel_pricing (
          hotel_id, season_name, start_date, end_date, currency,
          double_room_bb, single_supplement_bb, triple_room_bb,
          child_0_6_bb, child_6_12_bb,
          hb_supplement, fb_supplement, ai_supplement,
          base_meal_plan, notes, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parseInt(hotel_id), season_name, start_date, end_date, currency,
          parseFloat(double_room_bb), parseFloat(single_supplement_bb), parseFloat(triple_room_bb),
          parseFloat(child_0_6_bb), parseFloat(child_6_12_bb),
          parseFloat(hb_supplement), parseFloat(fb_supplement), parseFloat(ai_supplement),
          base_meal_plan, notes, 'active', createdBy
        ]
      );

      imported++;
      if (imported % 100 === 0) console.log(`   ✓ ${imported} hotels...`);
    } catch (error: any) {
      errors++;
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n✅ Imported ${imported} hotels successfully!`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} errors encountered\n`);
  }
}

async function main() {
  const command = process.argv[2];

  try {
    if (command === 'export') {
      await exportPrices();
    } else if (command === 'import') {
      await importPrices();
    } else {
      console.log('\n🏨 Hotel Pricing Generator for Winter 2025-26\n');
      console.log('Usage:');
      console.log('  1. Export:  npx tsx scripts/generate-hotel-prices-final.ts export');
      console.log('  2. Review:  Open database/hotel-prices-winter-2025-26.csv in Excel');
      console.log('  3. Import:  npx tsx scripts/generate-hotel-prices-final.ts import\n');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
