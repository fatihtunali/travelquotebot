/**
 * Script to migrate Google Places photos to Cloudinary
 * Run with: npx tsx scripts/migrate-photos-to-cloudinary.ts
 */

import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import mysql from 'mysql2/promise';

dotenv.config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create remote database connection
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || '134.209.137.11',
  user: process.env.DATABASE_USER || 'tqa',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'tqa_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

interface PhotoMigration {
  table: string;
  id: number;
  name: string;
  photoNumber: number;
  googleUrl: string;
  cloudinaryUrl?: string;
  success: boolean;
  error?: string;
}

async function uploadToCloudinary(
  googlePhotoUrl: string,
  folder: string,
  publicId: string
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(googlePhotoUrl, {
      folder,
      public_id: publicId,
      overwrite: true,
      transformation: [
        { width: 1200, height: 900, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    throw error;
  }
}

async function migrateTablePhotos(table: string): Promise<PhotoMigration[]> {
  console.log(`\n📋 Migrating photos for ${table}...`);

  const results: PhotoMigration[] = [];
  let nameColumn: string;

  switch (table) {
    case 'hotels':
      nameColumn = 'hotel_name';
      break;
    case 'tours':
      nameColumn = 'tour_name';
      break;
    case 'entrance_fees':
      nameColumn = 'site_name';
      break;
    default:
      throw new Error(`Invalid table: ${table}`);
  }

  // Get all items with Google Places photos
  const [items]: any = await pool.query(
    `SELECT id, ${nameColumn} as name, photo_url_1, photo_url_2, photo_url_3
     FROM ${table}
     WHERE photo_url_1 IS NOT NULL AND photo_url_1 LIKE '%googleapis.com%'`,
    []
  );

  console.log(`  Found ${items.length} items with Google Photos\n`);

  for (const item of items) {
    // Process each photo (1, 2, 3)
    for (let photoNum = 1; photoNum <= 3; photoNum++) {
      const photoUrlKey = `photo_url_${photoNum}`;
      const googlePhotoUrl = item[photoUrlKey];

      if (!googlePhotoUrl || !googlePhotoUrl.includes('googleapis.com')) {
        continue;
      }

      const publicId = `${table}_${item.id}_photo_${photoNum}`;
      const folder = `tqa/${table}`;

      console.log(`  Migrating: ${item.name} - Photo ${photoNum}`);

      try {
        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(googlePhotoUrl, folder, publicId);

        // Update database
        await pool.query(
          `UPDATE ${table} SET ${photoUrlKey} = ? WHERE id = ?`,
          [cloudinaryUrl, item.id]
        );

        console.log(`    ✅ Success: ${cloudinaryUrl.substring(0, 60)}...`);

        results.push({
          table,
          id: item.id,
          name: item.name,
          photoNumber: photoNum,
          googleUrl: googlePhotoUrl,
          cloudinaryUrl,
          success: true,
        });

        // Rate limit: 0.5 second delay between uploads
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`    ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

        results.push({
          table,
          id: item.id,
          name: item.name,
          photoNumber: photoNum,
          googleUrl: googlePhotoUrl,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  return results;
}

async function main() {
  console.log('📸 Photo Migration: Google Places → Cloudinary\n');
  console.log('='.repeat(60));

  const tables = ['hotels', 'tours', 'entrance_fees'];
  const allResults: PhotoMigration[] = [];
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const table of tables) {
    const results = await migrateTablePhotos(table);
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    totalSuccess += successCount;
    totalFailed += failCount;
    allResults.push(...results);

    console.log(`\n  ✅ ${successCount} photos migrated`);
    console.log(`  ❌ ${failCount} photos failed\n`);
  }

  // Final summary
  console.log('='.repeat(60));
  console.log('\n📊 Migration Summary\n');
  console.log(`✅ Total Successful: ${totalSuccess}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log(`📈 Success Rate: ${totalSuccess + totalFailed > 0 ? ((totalSuccess / (totalSuccess + totalFailed)) * 100).toFixed(1) : 0}%`);

  if (totalFailed > 0) {
    console.log('\n❌ Failed Photos:');
    allResults
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.table}: ${r.name} - Photo ${r.photoNumber}`);
        console.log(`    Error: ${r.error}`);
      });
  }

  console.log('\n✅ Migration complete!\n');

  // Close database connection
  await pool.end();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
