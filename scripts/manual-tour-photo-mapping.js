const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Manual mappings: Org 1 tour name → Org 5 tour name(s)
const TOUR_MAPPINGS = {
  // Bosphorus tours
  'Bosphorus Cruise & Asian Side': [
    'Full Day Bosphorus Tour',
    'Afternoon Bosphorus Tour',
    'Morning Bosphorus Tour'
  ],

  // Istanbul tours
  'Istanbul Classic City Tour': [
    'Full Day Istanbul Classic Tour',
    'Imperial Tour',
    'Ottoman Splendours Tour'
  ],

  // Ephesus tours
  'Ephesus & Virgin Mary House': [
    'Full Day Ephesus - Virgin Mary House from Izmir',
    'Full Day Ephesus Ancient City  / Virgin Mary House',
    'Full Day Ephesus - Sirince Tour from Izmir'
  ],

  'Biblical Ephesus Tour': [
    'Full Day Ephesus Ancient City  / Sirince Village',
    'Full Day Ephesus - Sirince Tour from Izmir'
  ],

  // Cappadocia tours
  'Cappadocia North Tour': [
    'Full Day Cappadocia - Open Air Museum',
    'Full Day Cappadocia - Mustafapasa - Damsa'
  ],

  'Cappadocia Hot Air Balloon': [
    'Hot Air Balloon Flight',
    'Hot Air Balloon Tour'
  ],

  'Hot Air Balloon Flight Standard': [
    'Hot Air Balloon Flight',
    'Hot Air Balloon Tour'
  ],

  // Pamukkale tours
  'Pamukkale & Hierapolis Tour': [
    'Full Day Pamukkale Tour from Izmir',
    'Full Day Pamukkale Tour from Kusadasi'
  ],

  // Antalya tours
  'Antalya City & Waterfalls Tour': [
    'Full Day Antalya City Tour'
  ],

  // Shows
  'Whirling Dervishes Show': [
    'Whirling Dervishes Ceremony',
    'Whirling Dervish Show'
  ],

  'Ottoman Dinner & Show': [
    'Turkish Night Show',
    'Istanbul by Night Tour - Turkish Night Show'
  ],

  'Turkish Night Dinner Show': [
    'Istanbul by Night Tour - Turkish Night Show',
    'Turkish Night Show'
  ]
};

async function mapTourPhotos() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  });

  try {
    console.log('🗺️  Manual Tour Photo Mapping\n');
    console.log('═'.repeat(60) + '\n');

    let mappedCount = 0;
    let tourCount = 0;

    for (const [sourceName, targetNames] of Object.entries(TOUR_MAPPINGS)) {
      // Get source tour with photos (Org 1)
      const [sourceRows] = await connection.query(`
        SELECT id, tour_name, photo_url_1, photo_url_2, photo_url_3
        FROM tours
        WHERE organization_id = 1
          AND tour_name = ?
          AND photo_url_1 IS NOT NULL
        LIMIT 1
      `, [sourceName]);

      if (sourceRows.length === 0) {
        console.log(`⚠️  Source not found: "${sourceName}"`);
        continue;
      }

      const source = sourceRows[0];

      // Update all matching target tours (Org 5)
      for (const targetName of targetNames) {
        const [result] = await connection.query(`
          UPDATE tours
          SET
            photo_url_1 = ?,
            photo_url_2 = ?,
            photo_url_3 = ?
          WHERE organization_id = 5
            AND tour_name LIKE ?
        `, [
          source.photo_url_1,
          source.photo_url_2,
          source.photo_url_3,
          `%${targetName}%`
        ]);

        if (result.affectedRows > 0) {
          mappedCount++;
          tourCount += result.affectedRows;
          console.log(`✅ Mapped "${sourceName}"`);
          console.log(`   → to ${result.affectedRows} tour(s): "${targetName}"`);
          console.log(`   → Photos: ${countPhotos(source)}\n`);
        }
      }
    }

    console.log('═'.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Source mappings processed: ${Object.keys(TOUR_MAPPINGS).length}`);
    console.log(`   Successful mappings: ${mappedCount}`);
    console.log(`   Total tours updated: ${tourCount}`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

function countPhotos(item) {
  let count = 0;
  if (item.photo_url_1) count++;
  if (item.photo_url_2) count++;
  if (item.photo_url_3) count++;
  return `${count} photo${count !== 1 ? 's' : ''}`;
}

// Run the script
mapTourPhotos()
  .then(() => {
    console.log('\n✅ Manual mapping completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });
