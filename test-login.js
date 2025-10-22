const mysql = require('mysql2/promise');

async function testLogin() {
  const connection = await mysql.createConnection({
    host: '134.209.137.11',
    port: 3306,
    user: 'tqb',
    password: 'Dlr235672.-Yt',
    database: 'tqb_db'
  });

  try {
    console.log('🔐 Checking Demo Tour login...\n');

    // Get Demo Tour operator
    const [operators] = await connection.execute(
      'SELECT id, company_name, email, subdomain FROM operators WHERE company_name = ?',
      ['Demo Tour']
    );

    if (operators.length === 0) {
      console.log('❌ Demo Tour operator not found');
      return;
    }

    const operator = operators[0];
    console.log('✅ Demo Tour Operator Found:');
    console.log(`   ID: ${operator.id}`);
    console.log(`   Email: ${operator.email}`);
    console.log(`   Subdomain: ${operator.subdomain}`);
    console.log('');

    // Get users for this operator
    const [users] = await connection.execute(
      'SELECT id, email, role FROM users WHERE operator_id = ?',
      [operator.id]
    );

    console.log(`📋 Users for Demo Tour (${users.length} total):`);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} (${user.role})`);
    });
    console.log('');

    // Check transport ownership
    const transportId = '1a8426a2-d723-4065-9423-ccb6f0ba176c';
    const [transports] = await connection.execute(
      'SELECT id, name, operator_id FROM operator_transport WHERE id = ?',
      [transportId]
    );

    if (transports.length > 0) {
      const transport = transports[0];
      const ownsTransport = transport.operator_id === operator.id;

      console.log('🚗 Transport "Cappadocia to Antalya":');
      console.log(`   Belongs to operator: ${transport.operator_id}`);
      console.log(`   Demo Tour operator: ${operator.id}`);
      console.log(`   ${ownsTransport ? '✅ MATCH - Demo Tour owns this transport' : '❌ MISMATCH - Demo Tour does NOT own this transport'}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testLogin();
