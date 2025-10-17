require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkDatabaseData() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    console.log('Connected to database\n');

    // Check accommodations
    const [accommodations] = await connection.execute(
      'SELECT COUNT(*) as count FROM accommodations WHERE is_active = 1'
    );
    console.log(`✓ Accommodations: ${accommodations[0].count} active records`);

    const [accSample] = await connection.execute(
      'SELECT name, city, category, base_price_per_night, currency FROM accommodations WHERE is_active = 1 LIMIT 3'
    );
    if (accSample.length > 0) {
      console.log('  Sample accommodations:');
      accSample.forEach(acc => {
        console.log(`  - ${acc.name} (${acc.city}) - ${acc.category} - $${acc.base_price_per_night} ${acc.currency}/night`);
      });
    }

    // Check activities
    const [activities] = await connection.execute(
      'SELECT COUNT(*) as count FROM activities WHERE is_active = 1'
    );
    console.log(`\n✓ Activities: ${activities[0].count} active records`);

    const [actSample] = await connection.execute(
      'SELECT name, city, category, base_price, currency, duration_hours FROM activities WHERE is_active = 1 LIMIT 3'
    );
    if (actSample.length > 0) {
      console.log('  Sample activities:');
      actSample.forEach(act => {
        console.log(`  - ${act.name} (${act.city}) - ${act.category} - $${act.base_price} ${act.currency} (${act.duration_hours}h)`);
      });
    }

    // Check transport
    const [transport] = await connection.execute(
      'SELECT COUNT(*) as count FROM operator_transport WHERE is_active = 1'
    );
    console.log(`\n✓ Transport: ${transport[0].count} active records`);

    const [transSample] = await connection.execute(
      'SELECT name, type, from_location, to_location, base_price, currency FROM operator_transport WHERE is_active = 1 LIMIT 3'
    );
    if (transSample.length > 0) {
      console.log('  Sample transport:');
      transSample.forEach(t => {
        console.log(`  - ${t.name}: ${t.from_location} → ${t.to_location} (${t.type}) - $${t.base_price} ${t.currency}`);
      });
    }

    // Check restaurants
    const [restaurants] = await connection.execute(
      'SELECT COUNT(*) as count FROM operator_restaurants WHERE is_active = 1'
    );
    console.log(`\n✓ Restaurants: ${restaurants[0].count} active records`);

    const [restSample] = await connection.execute(
      'SELECT name, city, cuisine_type FROM operator_restaurants WHERE is_active = 1 LIMIT 3'
    );
    if (restSample.length > 0) {
      console.log('  Sample restaurants:');
      restSample.forEach(r => {
        console.log(`  - ${r.name} (${r.city}) - ${r.cuisine_type}`);
      });
    }

    // Check guides
    const [guides] = await connection.execute(
      'SELECT COUNT(*) as count FROM operator_guides WHERE is_active = 1'
    );
    console.log(`\n✓ Guides: ${guides[0].count} active records`);

    const [guideSample] = await connection.execute(
      'SELECT full_name, specialization, languages FROM operator_guides WHERE is_active = 1 LIMIT 3'
    );
    if (guideSample.length > 0) {
      console.log('  Sample guides:');
      guideSample.forEach(g => {
        console.log(`  - ${g.full_name} - ${g.specialization} (${g.languages})`);
      });
    }

    console.log('\n' + '='.repeat(60));
    const totalRecords = accommodations[0].count + activities[0].count +
                        transport[0].count + restaurants[0].count + guides[0].count;

    if (totalRecords === 0) {
      console.log('⚠️  WARNING: No data found in database!');
      console.log('You need to add sample data for testing.');
    } else {
      console.log(`✅ Database has ${totalRecords} total active records`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkDatabaseData();
