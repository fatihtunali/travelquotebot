const fs = require('fs');
const path = require('path');

// Pages to fix
const pages = [
  'app/dashboard/pricing/tours/page.tsx',
  'app/dashboard/pricing/vehicles/page.tsx',
  'app/dashboard/pricing/guides/page.tsx',
  'app/dashboard/pricing/entrance-fees/page.tsx',
  'app/dashboard/pricing/meals/page.tsx',
  'app/dashboard/pricing/extras/page.tsx'
];

// Helper function to format dates
const dateHelperFunction = `
  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return \`\${year}-\${month}-\${day}\`;
  };
`;

console.log('🔧 Fixing date formatting in pricing pages...\n');

for (const pagePath of pages) {
  const fullPath = path.join(process.cwd(), pagePath);

  try {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if already has the helper function
    if (content.includes('formatDateForInput')) {
      console.log(`⏭️  Skipped: ${pagePath} (already has formatDateForInput)`);
      continue;
    }

    // Find the openAddModal function and add the helper before it
    const openAddModalMatch = content.match(/(  const openAddModal = \(\) => {)/);
    if (!openAddModalMatch) {
      console.log(`⚠️  Skipped: ${pagePath} (openAddModal not found)`);
      continue;
    }

    // Insert the helper function before openAddModal
    content = content.replace(
      openAddModalMatch[0],
      dateHelperFunction + '\n' + openAddModalMatch[0]
    );

    // Replace start_date and end_date assignments in openEditModal
    content = content.replace(
      /start_date: (\w+)\.start_date,/g,
      'start_date: formatDateForInput($1.start_date),'
    );
    content = content.replace(
      /end_date: (\w+)\.end_date,/g,
      'end_date: formatDateForInput($1.end_date),'
    );

    // Replace in openDuplicateModal too (if exists)
    // This is already handled by the regex above

    // Write the fixed content
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${pagePath}`);

  } catch (error) {
    console.error(`❌ Error fixing ${pagePath}:`, error.message);
  }
}

console.log('\n✅ Date formatting fix completed!');
