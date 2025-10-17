const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all route files that have [id] in their path
const files = glob.sync('app/api/pricing/**/\[*\]/**.ts', { cwd: process.cwd() });

console.log(`Found ${files.length} files to fix\n`);

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  
  // Fix all function signatures with params
  // Pattern 1: Single id param
  const singleIdPattern = /(\s+\{\s*params\s*\}:\s*\{\s*params:\s*)\{\s*id:\s*string\s*\}/g;
  if (content.match(singleIdPattern)) {
    content = content.replace(singleIdPattern, '$1Promise<{ id: string }>');
    changed = true;
  }
  
  // Pattern 2: Double id and priceId params
  const doubleIdPattern = /(\s+\{\s*params\s*\}:\s*\{\s*params:\s*)\{\s*id:\s*string;\s*priceId:\s*string\s*\}/g;
  if (content.match(doubleIdPattern)) {
    content = content.replace(doubleIdPattern, '$1Promise<{ id: string; priceId: string }>');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Fixed ${file}`);
  } else {
    console.log(`- Skipped ${file} (no changes needed)`);
  }
});

console.log('\nDone!');
