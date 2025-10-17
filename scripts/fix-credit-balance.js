require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function fixCreditBalance() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    console.log('Connected to database');

    // Find the user by email
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['fatihtunali@funnytourism.com']
    );

    if (users.length === 0) {
      console.error('User not found');
      return;
    }

    const user = users[0];
    console.log('Found user:', { id: user.id, email: user.email, operator_id: user.operator_id });

    // Check credit account
    const [accounts] = await connection.execute(
      'SELECT * FROM credit_accounts WHERE operator_id = ?',
      [user.operator_id]
    );

    let creditAccount;
    if (accounts.length === 0) {
      // Create credit account
      const accountId = uuidv4();
      await connection.execute(
        `INSERT INTO credit_accounts (id, operator_id, balance, total_purchased, total_spent)
         VALUES (?, ?, ?, ?, ?)`,
        [accountId, user.operator_id, 0, 0, 0]
      );
      console.log('Created new credit account');

      const [newAccounts] = await connection.execute(
        'SELECT * FROM credit_accounts WHERE operator_id = ?',
        [user.operator_id]
      );
      creditAccount = newAccounts[0];
    } else {
      creditAccount = accounts[0];
      console.log('Found credit account:', {
        id: creditAccount.id,
        balance: creditAccount.balance,
        total_purchased: creditAccount.total_purchased,
        total_spent: creditAccount.total_spent
      });
    }

    // Check existing transactions
    const [transactions] = await connection.execute(
      'SELECT * FROM credit_transactions WHERE operator_id = ? ORDER BY created_at DESC',
      [user.operator_id]
    );

    console.log('\nExisting transactions:');
    transactions.forEach(tx => {
      console.log(`- ${tx.type}: ₺${tx.amount}, Balance after: ₺${tx.balance_after}, Description: ${tx.description}`);
    });

    // Check if welcome bonus already exists
    const welcomeBonusExists = transactions.some(tx =>
      tx.description && tx.description.includes('Welcome bonus')
    );

    if (welcomeBonusExists) {
      console.log('\n⚠️ Welcome bonus transaction already exists!');
      console.log('Checking if balance needs recalculation...');

      // Recalculate balance from transactions
      let calculatedBalance = 0;
      const sortedTx = transactions.sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );

      for (const tx of sortedTx) {
        calculatedBalance += Number(tx.amount);
      }

      console.log(`\nCalculated balance from transactions: ₺${calculatedBalance}`);
      console.log(`Current database balance: ₺${creditAccount.balance}`);

      if (Math.abs(calculatedBalance - Number(creditAccount.balance)) > 0.01) {
        console.log('\n🔧 Fixing balance mismatch...');
        await connection.execute(
          `UPDATE credit_accounts
           SET balance = ?,
               total_purchased = (SELECT COALESCE(SUM(amount), 0) FROM credit_transactions WHERE operator_id = ? AND type IN ('deposit', 'bonus', 'refund')),
               total_spent = (SELECT COALESCE(SUM(ABS(amount)), 0) FROM credit_transactions WHERE operator_id = ? AND type = 'usage'),
               updated_at = NOW()
           WHERE operator_id = ?`,
          [calculatedBalance, user.operator_id, user.operator_id, user.operator_id]
        );
        console.log('✅ Balance fixed!');
      } else {
        console.log('✅ Balance is correct, no fix needed');
      }
    } else {
      // Add welcome bonus
      console.log('\n💰 Adding ₺10 welcome bonus...');

      const balanceBefore = Number(creditAccount.balance);
      const bonusAmount = 10.00;
      const balanceAfter = balanceBefore + bonusAmount;

      const transactionId = uuidv4();
      await connection.execute(
        `INSERT INTO credit_transactions
         (id, credit_account_id, operator_id, type, amount, balance_before, balance_after, description)
         VALUES (?, ?, ?, 'bonus', ?, ?, ?, 'Welcome bonus - ₺10 free credits')`,
        [transactionId, creditAccount.id, user.operator_id, bonusAmount, balanceBefore, balanceAfter]
      );

      await connection.execute(
        `UPDATE credit_accounts
         SET balance = ?,
             total_purchased = total_purchased + ?,
             updated_at = NOW()
         WHERE operator_id = ?`,
        [balanceAfter, bonusAmount, user.operator_id]
      );

      console.log('✅ Welcome bonus added successfully!');
    }

    // Display final state
    const [finalAccount] = await connection.execute(
      'SELECT * FROM credit_accounts WHERE operator_id = ?',
      [user.operator_id]
    );

    console.log('\n📊 Final Credit Account State:');
    console.log(`   Balance: ₺${Number(finalAccount[0].balance).toFixed(2)}`);
    console.log(`   Total Purchased: ₺${Number(finalAccount[0].total_purchased).toFixed(2)}`);
    console.log(`   Total Spent: ₺${Number(finalAccount[0].total_spent).toFixed(2)}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
    console.log('\nDatabase connection closed');
  }
}

fixCreditBalance();
