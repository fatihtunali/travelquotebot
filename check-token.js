const jwt = require('jsonwebtoken');

// Read JWT_SECRET from env
const JWT_SECRET = 'your_jwt_secret_here_change_in_production';

// Get token from command line argument
const token = process.argv[2];

if (!token) {
  console.log('Usage: node check-token.js <your-jwt-token>');
  console.log('\nTo get your token:');
  console.log('1. Open Developer Tools in browser (F12)');
  console.log('2. Go to Application > Cookies > http://localhost:3000');
  console.log('3. Find "tqb_token" cookie and copy its value');
  console.log('\nOR check localStorage:');
  console.log('1. Go to Application > Local Storage');
  console.log('2. Find "token" key and copy its value');
  process.exit(1);
}

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Token decoded successfully:');
  console.log(JSON.stringify(decoded, null, 2));
  console.log('\nYour operator_id:', decoded.operatorId);
} catch (error) {
  console.error('Error decoding token:', error.message);
}
