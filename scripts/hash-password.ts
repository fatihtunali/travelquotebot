import bcrypt from 'bcryptjs';

async function hashPassword() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hash);
}

hashPassword();
