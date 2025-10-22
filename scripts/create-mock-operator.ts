import pool from '../lib/db';
import { hashPassword } from '../lib/auth';

async function createMockOperator() {
  try {
    // Create organization
    const [orgResult]: any = await pool.query(
      `INSERT INTO organizations (name, slug, email, phone, country, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Istanbul Travel Agency', 'istanbul-travel', 'info@istanbultravel.com', '+90 212 555 1234', 'Turkey', 'active']
    );

    const organizationId = orgResult.insertId;
    console.log('✓ Organization created:', organizationId);

    // Create subscription
    await pool.query(
      `INSERT INTO subscriptions (organization_id, plan_type, monthly_credits, price, status, current_period_end)
       VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      [organizationId, 'professional', 100, 99.00, 'active']
    );
    console.log('✓ Subscription created: Professional plan');

    // Create credits
    await pool.query(
      `INSERT INTO organization_credits (organization_id, credits_total, credits_used, reset_date)
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      [organizationId, 100, 25, null]
    );
    console.log('✓ Credits allocated: 100 (75 remaining)');

    // Create white label settings
    await pool.query(
      `INSERT INTO white_label_settings (organization_id, company_name, primary_color, secondary_color)
       VALUES (?, ?, ?, ?)`,
      [organizationId, 'Istanbul Travel Agency', '#3B82F6', '#1E40AF']
    );
    console.log('✓ White label settings created');

    // Create org admin user
    const adminPassword = await hashPassword('password123');
    const [adminResult]: any = await pool.query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [organizationId, 'admin@istanbultravel.com', adminPassword, 'Mehmet', 'Yilmaz', 'org_admin', 'active']
    );
    console.log('✓ Org Admin created: admin@istanbultravel.com / password123');

    // Create org user
    const userPassword = await hashPassword('password123');
    await pool.query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [organizationId, 'ayse@istanbultravel.com', userPassword, 'Ayse', 'Demir', 'org_user', 'active']
    );
    console.log('✓ Org User created: ayse@istanbultravel.com / password123');

    // Create some sample quotes
    for (let i = 1; i <= 5; i++) {
      await pool.query(
        `INSERT INTO quotes (organization_id, created_by_user_id, quote_number, customer_name, customer_email,
         destination, start_date, end_date, adults, children, total_price, status)
         VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), DATE_ADD(NOW(), INTERVAL ? DAY), ?, ?, ?, ?)`,
        [
          organizationId,
          adminResult.insertId,
          `ITA-2025-${String(i).padStart(4, '0')}`,
          `Customer ${i}`,
          `customer${i}@example.com`,
          i % 2 === 0 ? 'Istanbul & Cappadocia' : 'Antalya Beach Resort',
          i * 5,
          i * 5 + 7,
          2,
          i % 3,
          1500 + (i * 250),
          ['draft', 'sent', 'accepted'][i % 3]
        ]
      );
    }
    console.log('✓ Sample quotes created: 5 quotes');

    console.log('\n========================================');
    console.log('Mock Tour Operator Created Successfully!');
    console.log('========================================');
    console.log('\nOrganization Details:');
    console.log('  Name: Istanbul Travel Agency');
    console.log('  Slug: istanbul-travel');
    console.log('  Platform URL: https://istanbul-travel.travelquotebot.com');
    console.log('\nLogin Credentials:');
    console.log('  Admin: admin@istanbultravel.com / password123');
    console.log('  User:  ayse@istanbultravel.com / password123');
    console.log('\nSubscription:');
    console.log('  Plan: Professional');
    console.log('  Credits: 75 remaining / 100 total');
    console.log('  Status: Active');

    process.exit(0);
  } catch (error) {
    console.error('Error creating mock operator:', error);
    process.exit(1);
  }
}

createMockOperator();
