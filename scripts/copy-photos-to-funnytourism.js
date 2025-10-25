const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function copyPhotosToFunnyTourism() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  });

  try {
    console.log('🔍 Finding matching entrance fees between organizations...\n');

    // Get entrance fees from Org 1 (with photos)
    const [sourceEntries] = await connection.query(`
      SELECT id, site_name, city, photo_url_1, photo_url_2, photo_url_3
      FROM entrance_fees
      WHERE organization_id = 1
        AND photo_url_1 IS NOT NULL
    `);

    // Get entrance fees from Org 5 (without photos)
    const [targetEntries] = await connection.query(`
      SELECT id, site_name, city, photo_url_1
      FROM entrance_fees
      WHERE organization_id = 5
    `);

    console.log(`Found ${sourceEntries.length} source entries with photos (Org 1)`);
    console.log(`Found ${targetEntries.length} target entries (Org 5)\n`);

    let matchedCount = 0;
    let updatedCount = 0;

    for (const target of targetEntries) {
      // Try to find matching entry by site name (exact match or similar)
      const match = sourceEntries.find(source => {
        const sourceName = source.site_name.toLowerCase().trim();
        const targetName = target.site_name.toLowerCase().trim();

        // Exact match
        if (sourceName === targetName) return true;

        // Similar match (contains or vice versa)
        if (sourceName.includes(targetName) || targetName.includes(sourceName)) return true;

        // Check without special characters
        const cleanSource = sourceName.replace(/[^a-z0-9\s]/g, '');
        const cleanTarget = targetName.replace(/[^a-z0-9\s]/g, '');
        if (cleanSource === cleanTarget) return true;

        return false;
      });

      if (match) {
        matchedCount++;

        // Update target entry with photos from source
        await connection.query(`
          UPDATE entrance_fees
          SET
            photo_url_1 = ?,
            photo_url_2 = ?,
            photo_url_3 = ?
          WHERE id = ?
        `, [match.photo_url_1, match.photo_url_2, match.photo_url_3, target.id]);

        updatedCount++;
        console.log(`✅ Updated: "${target.site_name}" (ID ${target.id})`);
        console.log(`   Matched with: "${match.site_name}" (ID ${match.id})`);
        console.log(`   Photos: ${match.photo_url_1 ? '✓' : '✗'} ${match.photo_url_2 ? '✓' : '✗'} ${match.photo_url_3 ? '✓' : '✗'}\n`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Total matches found: ${matchedCount}`);
    console.log(`   Entries updated: ${updatedCount}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

// Run the script
copyPhotosToFunnyTourism()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });
