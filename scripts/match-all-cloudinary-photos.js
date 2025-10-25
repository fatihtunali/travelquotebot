const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function matchPhotos() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  });

  try {
    console.log('🔍 Searching for all Cloudinary photos to match...\n');

    // ========== MATCH TOURS ==========
    console.log('═'.repeat(60));
    console.log('📍 MATCHING TOURS');
    console.log('═'.repeat(60) + '\n');

    const [sourceTours] = await connection.query(`
      SELECT id, tour_name, city, photo_url_1, photo_url_2, photo_url_3
      FROM tours
      WHERE organization_id = 1 AND photo_url_1 IS NOT NULL
    `);

    const [targetTours] = await connection.query(`
      SELECT id, tour_name, city, photo_url_1
      FROM tours
      WHERE organization_id = 5
    `);

    console.log(`Source tours with photos (Org 1): ${sourceTours.length}`);
    console.log(`Target tours (Org 5): ${targetTours.length}\n`);

    let toursMatched = 0;
    for (const target of targetTours) {
      const match = findMatch(target, sourceTours);
      if (match) {
        await connection.query(`
          UPDATE tours
          SET photo_url_1 = ?, photo_url_2 = ?, photo_url_3 = ?
          WHERE id = ?
        `, [match.photo_url_1, match.photo_url_2, match.photo_url_3, target.id]);

        toursMatched++;
        console.log(`✅ ${target.tour_name} (${target.city})`);
        console.log(`   → Matched with: ${match.tour_name}`);
        console.log(`   → Photos: ${countPhotos(match)}\n`);
      }
    }

    // ========== MATCH ENTRANCE FEES ==========
    console.log('═'.repeat(60));
    console.log('🏛️  MATCHING ENTRANCE FEES');
    console.log('═'.repeat(60) + '\n');

    const [sourceEntries] = await connection.query(`
      SELECT id, site_name, city, photo_url_1, photo_url_2, photo_url_3
      FROM entrance_fees
      WHERE organization_id = 1 AND photo_url_1 IS NOT NULL
    `);

    const [targetEntries] = await connection.query(`
      SELECT id, site_name, city, photo_url_1
      FROM entrance_fees
      WHERE organization_id = 5
    `);

    console.log(`Source entrance fees with photos (Org 1): ${sourceEntries.length}`);
    console.log(`Target entrance fees (Org 5): ${targetEntries.length}\n`);

    let entriesMatched = 0;
    let entriesUpdated = 0;
    for (const target of targetEntries) {
      // Skip if already has photos
      if (target.photo_url_1) {
        entriesMatched++;
        console.log(`⏭️  Skipped: "${target.site_name}" (already has photos)`);
        continue;
      }

      const match = findMatch(target, sourceEntries);
      if (match) {
        await connection.query(`
          UPDATE entrance_fees
          SET photo_url_1 = ?, photo_url_2 = ?, photo_url_3 = ?
          WHERE id = ?
        `, [match.photo_url_1, match.photo_url_2, match.photo_url_3, target.id]);

        entriesMatched++;
        entriesUpdated++;
        console.log(`✅ ${target.site_name} (${target.city})`);
        console.log(`   → Matched with: ${match.site_name}`);
        console.log(`   → Photos: ${countPhotos(match)}\n`);
      }
    }

    // ========== MATCH HOTELS (if needed) ==========
    console.log('═'.repeat(60));
    console.log('🏨 CHECKING HOTELS');
    console.log('═'.repeat(60) + '\n');

    const [sourceHotels] = await connection.query(`
      SELECT id, hotel_name, city, photo_url_1, photo_url_2, photo_url_3
      FROM hotels
      WHERE organization_id = 1 AND photo_url_1 IS NOT NULL
      LIMIT 100
    `);

    const [targetHotels] = await connection.query(`
      SELECT id, hotel_name, city, photo_url_1
      FROM hotels
      WHERE organization_id = 5 AND photo_url_1 IS NULL
      LIMIT 100
    `);

    console.log(`Source hotels with photos (Org 1): ${sourceHotels.length}`);
    console.log(`Target hotels without photos (Org 5): ${targetHotels.length}\n`);

    let hotelsMatched = 0;
    for (const target of targetHotels) {
      const match = findMatch(target, sourceHotels);
      if (match) {
        await connection.query(`
          UPDATE hotels
          SET photo_url_1 = ?, photo_url_2 = ?, photo_url_3 = ?
          WHERE id = ?
        `, [match.photo_url_1, match.photo_url_2, match.photo_url_3, target.id]);

        hotelsMatched++;
        console.log(`✅ ${target.hotel_name} (${target.city})`);
        console.log(`   → Matched with: ${match.hotel_name}`);
        console.log(`   → Photos: ${countPhotos(match)}\n`);
      }
    }

    // ========== SUMMARY ==========
    console.log('\n' + '═'.repeat(60));
    console.log('📊 FINAL SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Tours matched:          ${toursMatched}`);
    console.log(`Entrance fees matched:  ${entriesMatched} (${entriesUpdated} newly updated)`);
    console.log(`Hotels matched:         ${hotelsMatched}`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Helper function to find matching entries
function findMatch(target, sources) {
  const targetName = cleanName(target.tour_name || target.site_name || target.hotel_name);

  return sources.find(source => {
    const sourceName = cleanName(source.tour_name || source.site_name || source.hotel_name);

    // Exact match
    if (sourceName === targetName) return true;

    // Contains match
    if (sourceName.includes(targetName) || targetName.includes(sourceName)) {
      // Must be at least 50% similar for contains
      if (similarity(sourceName, targetName) > 0.5) return true;
    }

    // Very similar (fuzzy match)
    if (similarity(sourceName, targetName) > 0.8) return true;

    return false;
  });
}

// Clean name for comparison
function cleanName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

// Calculate similarity (simple Jaccard similarity on words)
function similarity(str1, str2) {
  const words1 = new Set(str1.split(' '));
  const words2 = new Set(str2.split(' '));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// Count photos
function countPhotos(item) {
  let count = 0;
  if (item.photo_url_1) count++;
  if (item.photo_url_2) count++;
  if (item.photo_url_3) count++;
  return `${count} photo${count !== 1 ? 's' : ''}`;
}

// Run the script
matchPhotos()
  .then(() => {
    console.log('\n✅ All photos matched successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });
