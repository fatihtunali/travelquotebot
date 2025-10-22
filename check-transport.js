const mysql = require('mysql2/promise');

async function checkTransport() {
  const connection = await mysql.createConnection({
    host: '134.209.137.11',
    port: 3306,
    user: 'tqb',
    password: 'Dlr235672.-Yt',
    database: 'tqb_db'
  });

  try {
    const transportId = '1a8426a2-d723-4065-9423-ccb6f0ba176c';

    console.log('Checking transport with ID:', transportId);
    console.log('---');

    const [rows] = await connection.execute(
      'SELECT id, operator_id, name, type, from_location, to_location FROM operator_transport WHERE id = ?',
      [transportId]
    );

    if (rows.length === 0) {
      console.log('❌ Transport NOT FOUND in database');
    } else {
      console.log('✅ Transport FOUND:');
      console.log(JSON.stringify(rows[0], null, 2));
    }

    console.log('\n---');
    console.log('All transports in database:');
    const [allTransports] = await connection.execute(
      'SELECT id, operator_id, name, type FROM operator_transport LIMIT 10'
    );
    console.log(JSON.stringify(allTransports, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkTransport();
