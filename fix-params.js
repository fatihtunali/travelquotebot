const fs = require('fs');
const path = require('path');

// Files with single id param
const singleIdFiles = [
  'app/api/pricing/accommodations/[id]/route.ts',
  'app/api/pricing/accommodations/[id]/prices/route.ts',
  'app/api/pricing/activities/[id]/route.ts',
  'app/api/pricing/activities/[id]/prices/route.ts',
  'app/api/pricing/additional/[id]/route.ts',
  'app/api/pricing/additional/[id]/prices/route.ts',
  'app/api/pricing/guides/[id]/route.ts',
  'app/api/pricing/guides/[id]/prices/route.ts',
  'app/api/pricing/restaurants/[id]/route.ts',
  'app/api/pricing/restaurants/[id]/prices/route.ts',
  'app/api/pricing/transport/[id]/route.ts',
  'app/api/pricing/transport/[id]/prices/route.ts'
];

// Files with id and priceId params
const doubleIdFiles = [
  'app/api/pricing/accommodations/[id]/prices/[priceId]/route.ts',
  'app/api/pricing/activities/[id]/prices/[priceId]/route.ts',
  'app/api/pricing/additional/[id]/prices/[priceId]/route.ts',
  'app/api/pricing/guides/[id]/prices/[priceId]/route.ts',
  'app/api/pricing/restaurants/[id]/prices/[priceId]/route.ts',
  'app/api/pricing/transport/[id]/prices/[priceId]/route.ts'
];

function fixFile(filePath, isDouble) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (isDouble) {
    // Replace: const { id, priceId } = params;
    // With: const { id, priceId } = await params;
    content = content.replace(
      /const\s+\{\s*id\s*,\s*priceId\s*\}\s*=\s*params;/g,
      'const { id, priceId } = await params;'
    );
  } else {
    // Replace: const { id } = params;
    // With: const { id } = await params;
    content = content.replace(
      /const\s+\{\s*id\s*\}\s*=\s*params;/g,
      'const { id } = await params;'
    );
  }
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
}

console.log('Fixing single-id files...');
singleIdFiles.forEach(file => fixFile(file, false));

console.log('\nFixing double-id files...');
doubleIdFiles.forEach(file => fixFile(file, true));

console.log('\nDone!');
