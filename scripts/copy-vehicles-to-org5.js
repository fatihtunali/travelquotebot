const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function copyVehiclesToOrg5() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  });

  try {
    console.log('🚗 Copying Vehicles from Organization 1 to Organization 5\n');
    console.log('═'.repeat(60) + '\n');

    // Get the user ID for info@funnytourism.com
    const [users] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      ['info@funnytourism.com']
    );

    if (users.length === 0) {
      throw new Error('User info@funnytourism.com not found');
    }

    const createdBy = users[0].id;
    console.log(`✓ Found user: info@funnytourism.com (ID: ${createdBy})\n`);

    // Get all vehicles from Org 1
    const [sourceVehicles] = await connection.query(`
      SELECT id, vehicle_type, max_capacity, city, description, status
      FROM vehicles
      WHERE organization_id = 1
      ORDER BY max_capacity
    `);

    console.log(`Found ${sourceVehicles.length} vehicles to copy from Org 1\n`);

    let vehiclesCopied = 0;
    let pricingCopied = 0;

    for (const sourceVehicle of sourceVehicles) {
      // Insert vehicle for Org 5
      const [vehicleResult] = await connection.query(`
        INSERT INTO vehicles (
          organization_id, vehicle_type, max_capacity, city, description, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        5, // Organization 5
        sourceVehicle.vehicle_type,
        sourceVehicle.max_capacity,
        sourceVehicle.city,
        sourceVehicle.description,
        sourceVehicle.status
      ]);

      const newVehicleId = vehicleResult.insertId;
      vehiclesCopied++;

      console.log(`✅ Vehicle: ${sourceVehicle.vehicle_type} (${sourceVehicle.max_capacity} pax, ${sourceVehicle.city})`);
      console.log(`   Old ID: ${sourceVehicle.id} → New ID: ${newVehicleId}`);

      // Get all pricing for this vehicle
      const [sourcePricing] = await connection.query(`
        SELECT
          season_name, start_date, end_date, currency,
          price_per_day, price_half_day,
          airport_to_hotel, hotel_to_airport, airport_roundtrip,
          notes, status
        FROM vehicle_pricing
        WHERE vehicle_id = ?
        ORDER BY start_date
      `, [sourceVehicle.id]);

      // Copy all pricing
      for (const pricing of sourcePricing) {
        await connection.query(`
          INSERT INTO vehicle_pricing (
            vehicle_id, season_name, start_date, end_date, currency,
            price_per_day, price_half_day,
            airport_to_hotel, hotel_to_airport, airport_roundtrip,
            created_by, notes, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          newVehicleId,
          pricing.season_name,
          pricing.start_date,
          pricing.end_date,
          pricing.currency,
          pricing.price_per_day,
          pricing.price_half_day,
          pricing.airport_to_hotel,
          pricing.hotel_to_airport,
          pricing.airport_roundtrip,
          createdBy,
          pricing.notes,
          pricing.status
        ]);

        pricingCopied++;
        console.log(`   → ${pricing.season_name}: €${pricing.price_per_day}/day`);
      }

      console.log('');
    }

    console.log('═'.repeat(60));
    console.log('📊 Summary:');
    console.log(`   Vehicles copied: ${vehiclesCopied}`);
    console.log(`   Pricing entries copied: ${pricingCopied}`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
copyVehiclesToOrg5()
  .then(() => {
    console.log('\n✅ Vehicles copied successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });
