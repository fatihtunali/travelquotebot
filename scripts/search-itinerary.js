const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function searchItinerary() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    // Get the most recent itinerary
    const [rows] = await connection.execute(
      'SELECT id, customer_name, itinerary_data FROM itineraries ORDER BY created_at DESC LIMIT 1'
    );

    if (rows.length === 0) {
      console.log('No itineraries found in database');
      return;
    }

    const itinerary = rows[0];
    console.log('\n=== ITINERARY FOUND ===');
    console.log('ID:', itinerary.id);
    console.log('Customer:', itinerary.customer_name);

    // Parse and display the structure
    const data = JSON.parse(itinerary.itinerary_data);
    console.log('\n=== DATA STRUCTURE ===');
    console.log('Title:', data.title);
    console.log('Days count:', data.days?.length || 0);

    if (data.days && data.days.length > 0) {
      console.log('\n=== FIRST DAY STRUCTURE ===');
      console.log('Keys in first day:', Object.keys(data.days[0]));
      console.log('\nFirst day data:');
      console.log(JSON.stringify(data.days[0], null, 2));
    } else {
      console.log('\nNo days found in itinerary data!');
    }

    // Also check quote_days table
    const [quoteDays] = await connection.execute(
      'SELECT day_number, city, title FROM quote_days WHERE itinerary_id = ? ORDER BY day_number',
      [itinerary.id]
    );

    if (quoteDays.length > 0) {
      console.log('\n=== QUOTE_DAYS TABLE ===');
      quoteDays.forEach(day => {
        console.log(`Day ${day.day_number}: ${day.city} - ${day.title}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

searchItinerary();
