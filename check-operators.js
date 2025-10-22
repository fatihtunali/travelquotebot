const mysql = require('mysql2/promise');

async function checkOperators() {
  const connection = await mysql.createConnection({
    host: '134.209.137.11',
    port: 3306,
    user: 'tqb',
    password: 'Dlr235672.-Yt',
    database: 'tqb_db'
  });

  try {
    console.log('Operators table structure:');
    const [columns] = await connection.execute('DESCRIBE operators');
    console.log(columns);

    console.log('\n---');
    console.log('All operators in database:');
    console.log('---');

    const [operators] = await connection.execute(
      'SELECT * FROM operators'
    );

    operators.forEach((op, index) => {
      console.log(`${index + 1}. Operator:`);
      console.log(JSON.stringify(op, null, 2));
      console.log('');
    });

    console.log('---');
    console.log('Transport "Cappadocia to Antalya" belongs to operator:');
    const [transport] = await connection.execute(
      `SELECT o.*, t.name as transport_name
       FROM operator_transport t
       JOIN operators o ON t.operator_id = o.id
       WHERE t.id = ?`,
      ['1a8426a2-d723-4065-9423-ccb6f0ba176c']
    );

    if (transport.length > 0) {
      console.log(JSON.stringify(transport[0], null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkOperators();
