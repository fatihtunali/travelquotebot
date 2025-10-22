const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function fixTransportAccess() {
  const connection = await mysql.createConnection({
    host: '134.209.137.11',
    port: 3306,
    user: 'tqb',
    password: 'Dlr235672.-Yt',
    database: 'tqb_db'
  });

  try {
    const transportId = '1a8426a2-d723-4065-9423-ccb6f0ba176c';

    console.log('🔍 Analyzing Transport Access Issue');
    console.log('=' .repeat(50));
    console.log('');

    // Get transport info
    const [transport] = await connection.execute(
      `SELECT t.*, o.company_name, o.email, o.subdomain
       FROM operator_transport t
       JOIN operators o ON t.operator_id = o.id
       WHERE t.id = ?`,
      [transportId]
    );

    if (transport.length === 0) {
      console.log('❌ Transport not found in database');
      rl.close();
      await connection.end();
      return;
    }

    const t = transport[0];
    console.log('📦 Transport Details:');
    console.log(`   Name: ${t.name}`);
    console.log(`   Type: ${t.type}`);
    console.log(`   Route: ${t.from_location} → ${t.to_location}`);
    console.log('');
    console.log('👤 Current Owner:');
    console.log(`   Company: ${t.company_name}`);
    console.log(`   Email: ${t.email}`);
    console.log(`   Subdomain: ${t.subdomain}`);
    console.log(`   Operator ID: ${t.operator_id}`);
    console.log('');
    console.log('=' .repeat(50));
    console.log('');

    // Get all operators
    const [operators] = await connection.execute(
      'SELECT id, company_name, email, subdomain FROM operators ORDER BY company_name'
    );

    console.log('📋 All Operators:');
    operators.forEach((op, index) => {
      const current = op.id === t.operator_id ? ' ← CURRENT OWNER' : '';
      console.log(`   ${index + 1}. ${op.company_name} (${op.subdomain})${current}`);
      console.log(`      ID: ${op.id}`);
    });
    console.log('');
    console.log('=' .repeat(50));
    console.log('');

    console.log('💡 Solutions:');
    console.log('');
    console.log('Option 1: Login with the correct operator');
    console.log(`   → Login as: ${t.company_name} (${t.email})`);
    console.log('');
    console.log('Option 2: Transfer transport to a different operator');
    console.log('   → Type the number of the operator you want to transfer to');
    console.log('');
    console.log('Option 3: Exit without changes');
    console.log('   → Type "exit"');
    console.log('');

    const answer = await question('Enter your choice (1-3 or operator number to transfer): ');

    if (answer.toLowerCase() === 'exit' || answer === '3') {
      console.log('👋 Exiting without changes');
      rl.close();
      await connection.end();
      return;
    }

    if (answer === '1') {
      console.log('');
      console.log('✅ To login with the correct operator:');
      console.log(`   1. Go to: https://travelquotebot.com/auth/login`);
      console.log(`   2. Login with: ${t.email}`);
      console.log(`   3. Then access: https://travelquotebot.com/dashboard/pricing/transport/${transportId}`);
      rl.close();
      await connection.end();
      return;
    }

    if (answer === '2' || (parseInt(answer) >= 1 && parseInt(answer) <= operators.length)) {
      const targetIndex = answer === '2' ? -1 : parseInt(answer) - 1;

      if (targetIndex === -1) {
        console.log('');
        console.log('Which operator do you want to transfer to?');
        operators.forEach((op, index) => {
          console.log(`   ${index + 1}. ${op.company_name} (${op.subdomain})`);
        });
        console.log('');
        const targetAnswer = await question('Enter operator number: ');
        const finalIndex = parseInt(targetAnswer) - 1;

        if (finalIndex >= 0 && finalIndex < operators.length) {
          const targetOp = operators[finalIndex];
          const confirm = await question(`\n⚠️  Transfer transport to "${targetOp.company_name}"? (yes/no): `);

          if (confirm.toLowerCase() === 'yes') {
            await connection.execute(
              'UPDATE operator_transport SET operator_id = ? WHERE id = ?',
              [targetOp.id, transportId]
            );
            console.log('');
            console.log('✅ Transport transferred successfully!');
            console.log(`   New owner: ${targetOp.company_name}`);
          }
        }
      } else if (targetIndex >= 0 && targetIndex < operators.length) {
        const targetOp = operators[targetIndex];
        const confirm = await question(`\n⚠️  Transfer transport to "${targetOp.company_name}"? (yes/no): `);

        if (confirm.toLowerCase() === 'yes') {
          await connection.execute(
            'UPDATE operator_transport SET operator_id = ? WHERE id = ?',
            [targetOp.id, transportId]
          );
          console.log('');
          console.log('✅ Transport transferred successfully!');
          console.log(`   New owner: ${targetOp.company_name}`);
        }
      }
    }

    rl.close();
  } catch (error) {
    console.error('Error:', error);
    rl.close();
  } finally {
    await connection.end();
  }
}

fixTransportAccess();
