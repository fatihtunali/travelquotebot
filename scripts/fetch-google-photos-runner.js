// Load environment variables from .env.local
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

// Simple wrapper to run the TypeScript version with tsx
require('child_process').execSync('npx tsx scripts/fetch-google-photos.ts', {
  stdio: 'inherit',
  cwd: require('path').join(__dirname, '..'),
  env: process.env
});
