require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

// City center coordinates (approximate)
const cityCoordinates = {
  // Greece
  'Athens': { lat: 37.9838, lng: 23.7275 },
  'Santorini': { lat: 36.3932, lng: 25.4615 },
  'Mykonos': { lat: 37.4467, lng: 25.3289 },

  // Egypt
  'Cairo': { lat: 30.0444, lng: 31.2357 },
  'Luxor': { lat: 25.6872, lng: 32.6396 },
  'Hurghada': { lat: 27.2579, lng: 33.8116 }
};

async function addCityCoordinates() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  });

  console.log('🌍 Connected to database:', process.env.DATABASE_NAME);
  console.log('\n📍 Adding city center coordinates for hotels...\n');

  let totalUpdated = 0;

  for (const [city, coords] of Object.entries(cityCoordinates)) {
    const [result] = await connection.execute(
      `UPDATE hotels
       SET latitude = ?, longitude = ?
       WHERE city = ?
         AND (latitude IS NULL OR longitude IS NULL)
         AND organization_id = 5`,
      [coords.lat, coords.lng, city]
    );

    if (result.affectedRows > 0) {
      console.log(`✅ ${city}: Updated ${result.affectedRows} hotels to (${coords.lat}, ${coords.lng})`);
      totalUpdated += result.affectedRows;
    } else {
      console.log(`⚠️  ${city}: No hotels found or already have coordinates`);
    }
  }

  console.log(`\n🎉 Total hotels updated: ${totalUpdated}`);

  // Verify the update
  const [counts] = await connection.query(
    `SELECT country_id,
            COUNT(*) as total,
            SUM(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 ELSE 0 END) as missing_coords
     FROM hotels
     WHERE organization_id = 5 AND status = 'active'
     GROUP BY country_id`
  );

  console.log('\n📊 Updated statistics:');
  console.log(counts);

  await connection.end();
  console.log('\n✅ Done!');
}

addCityCoordinates().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
