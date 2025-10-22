import pool from '../lib/db';
import { hashPassword } from '../lib/auth';

async function updateAdminPassword() {
  try {
    const password = '123456';
    const passwordHash = await hashPassword(password);

    console.log('Generated hash:', passwordHash);

    const [result]: any = await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [passwordHash, 'admin@travelquoteai.com']
    );

    console.log('Update result:', result);
    console.log('Admin password updated successfully!');
    console.log('Email: admin@travelquoteai.com');
    console.log('Password: 123456');

    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
}

updateAdminPassword();
