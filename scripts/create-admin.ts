import pool from '../lib/db';
import { hashPassword } from '../lib/auth';

async function createAdmin() {
  try {
    const email = 'admin@travelquoteai.com';
    const password = 'Admin123!';
    const passwordHash = await hashPassword(password);

    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, organization_id)
       VALUES (?, ?, ?, ?, ?, NULL)`,
      [email, passwordHash, 'Super', 'Admin', 'super_admin']
    );

    console.log('Super admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
