const mysql = require('mysql2/promise');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Database connection
const dbConfig = {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

async function downloadAndUploadImage(imageUrl, resourceType, resourceName) {
  try {
    // Add API key to Google Places photos if needed
    let finalUrl = imageUrl;
    if (imageUrl.includes('maps.googleapis.com') && !imageUrl.includes('&key=')) {
      finalUrl = `${imageUrl}&key=${GOOGLE_MAPS_API_KEY}`;
    }

    console.log(`  Downloading: ${imageUrl.substring(0, 80)}...`);

    // Download image
    const response = await fetch(finalUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `travelquotebot/${resourceType}`,
          public_id: `${resourceName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
          resource_type: 'image',
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    console.log(`  ✅ Uploaded to Cloudinary: ${uploadResult.secure_url}`);
    return uploadResult.secure_url;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return null;
  }
}

async function migrateTableImages(connection, tableName, idColumn = 'id') {
  console.log(`\n🔄 Migrating ${tableName}...`);

  // Check if table has images column
  const [columns] = await connection.execute(
    `SHOW COLUMNS FROM ${tableName} LIKE 'images'`
  );

  if (columns.length === 0) {
    console.log(`⏭️  Skipping ${tableName} - no images column`);
    return { migrated: 0, failed: 0 };
  }

  const [rows] = await connection.execute(
    `SELECT ${idColumn}, name, images FROM ${tableName} WHERE images IS NOT NULL AND images != '[]'`
  );

  console.log(`Found ${rows.length} records with images`);

  let migrated = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const images = JSON.parse(row.images);
      if (!Array.isArray(images) || images.length === 0) continue;

      console.log(`\nProcessing: ${row.name}`);
      const newImages = [];

      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];

        // Skip if already a Cloudinary URL
        if (imageUrl.includes('cloudinary.com')) {
          console.log(`  ⏭️  Already on Cloudinary, skipping`);
          newImages.push(imageUrl);
          continue;
        }

        // Download and upload to Cloudinary
        const cloudinaryUrl = await downloadAndUploadImage(
          imageUrl,
          tableName,
          `${row.name}_${i}`
        );

        if (cloudinaryUrl) {
          newImages.push(cloudinaryUrl);
        } else {
          // Keep original URL if upload failed
          newImages.push(imageUrl);
          failed++;
        }

        // Rate limit: wait 500ms between uploads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update database with new URLs
      if (newImages.length > 0) {
        await connection.execute(
          `UPDATE ${tableName} SET images = ? WHERE ${idColumn} = ?`,
          [JSON.stringify(newImages), row[idColumn]]
        );
        migrated++;
        console.log(`  ✅ Updated database with ${newImages.length} Cloudinary URLs`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${row.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 ${tableName} Results: ${migrated} migrated, ${failed} failed`);
  return { migrated, failed };
}

async function main() {
  console.log('🚀 Starting image migration to Cloudinary...\n');
  console.log('Configuration:');
  console.log(`  Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  console.log(`  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`  Google Maps API Key: ${GOOGLE_MAPS_API_KEY ? 'Configured' : 'MISSING!'}\n`);

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ Google Maps API key not found!');
    process.exit(1);
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.error('❌ Cloudinary credentials not configured!');
    process.exit(1);
  }

  const connection = await mysql.createConnection(dbConfig);

  try {
    const stats = {
      total: 0,
      migrated: 0,
      failed: 0,
    };

    // Migrate accommodations
    const accommodationsResult = await migrateTableImages(connection, 'accommodations');
    stats.migrated += accommodationsResult.migrated;
    stats.failed += accommodationsResult.failed;
    stats.total += accommodationsResult.migrated + accommodationsResult.failed;

    // Migrate activities
    const activitiesResult = await migrateTableImages(connection, 'activities');
    stats.migrated += activitiesResult.migrated;
    stats.failed += activitiesResult.failed;
    stats.total += activitiesResult.migrated + activitiesResult.failed;

    // Migrate restaurants
    const restaurantsResult = await migrateTableImages(connection, 'operator_restaurants');
    stats.migrated += restaurantsResult.migrated;
    stats.failed += restaurantsResult.failed;
    stats.total += restaurantsResult.migrated + restaurantsResult.failed;

    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`Total records processed: ${stats.total}`);
    console.log(`Successfully migrated: ${stats.migrated}`);
    console.log(`Failed: ${stats.failed}`);
    console.log('\nAll images are now hosted on Cloudinary! 🎉');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
