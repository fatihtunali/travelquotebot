const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testApiCall() {
  console.log('🧪 Testing Transport API Call');
  console.log('=' .repeat(50));
  console.log('');
  console.log('To test the API, I need your JWT token.');
  console.log('');
  console.log('How to get your token:');
  console.log('1. Open browser Developer Tools (F12)');
  console.log('2. Go to Application > Local Storage > http://localhost:3000');
  console.log('3. Find "token" key and copy its value');
  console.log('');
  console.log('OR check cookies:');
  console.log('1. Application > Cookies > http://localhost:3000');
  console.log('2. Find "tqb_token" cookie and copy its value');
  console.log('');

  const token = await question('Paste your JWT token here: ');

  if (!token) {
    console.log('❌ No token provided');
    rl.close();
    return;
  }

  console.log('');
  console.log('Testing API call...');
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/pricing/transport/1a8426a2-d723-4065-9423-ccb6f0ba176c', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    console.log('');

    const data = await response.json();
    console.log('Response Data:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  rl.close();
}

testApiCall();
