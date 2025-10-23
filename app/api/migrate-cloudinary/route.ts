import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface MigrationResult {
  table: string;
  id: number;
  name: string;
  photoNum: number;
  success: boolean;
  cloudinaryUrl?: string;
  error?: string;
}

async function uploadToCloudinary(
  googlePhotoUrl: string,
  folder: string,
  publicId: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(googlePhotoUrl, {
    folder,
    public_id: publicId,
    overwrite: true,
    transformation: [
      { width: 1200, height: 900, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
    ]
  });
  return result.secure_url;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.role !== 'super_admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const results: MigrationResult[] = [];
    const tables = ['hotels', 'tours', 'entrance_fees'];

    for (const table of tables) {
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
          continue;
      }

      // Get items with Google Photos
      const [items]: any = await pool.query(
        `SELECT id, ${nameColumn} as name, photo_url_1, photo_url_2, photo_url_3
         FROM ${table}
         WHERE photo_url_1 IS NOT NULL AND photo_url_1 LIKE '%googleapis.com%'
         LIMIT 10`, // Process 10 at a time to avoid timeout
        []
      );

      for (const item of items) {
        for (let photoNum = 1; photoNum <= 3; photoNum++) {
          const photoUrlKey = `photo_url_${photoNum}`;
          const googlePhotoUrl = item[photoUrlKey];

          if (!googlePhotoUrl || !googlePhotoUrl.includes('googleapis.com')) {
            continue;
          }

          const publicId = `${table}_${item.id}_photo_${photoNum}`;
          const folder = `tqa/${table}`;

          try {
            const cloudinaryUrl = await uploadToCloudinary(googlePhotoUrl, folder, publicId);

            await pool.query(
              `UPDATE ${table} SET ${photoUrlKey} = ? WHERE id = ?`,
              [cloudinaryUrl, item.id]
            );

            results.push({
              table,
              id: item.id,
              name: item.name,
              photoNum,
              success: true,
              cloudinaryUrl,
            });
          } catch (error) {
            results.push({
              table,
              id: item.id,
              name: item.name,
              photoNum,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }

          // Small delay to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      total: results.length,
      successCount,
      failCount,
      results,
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tables = ['hotels', 'tours', 'entrance_fees'];
    const status: any = {};

    for (const table of tables) {
      const [googlePhotos]: any = await pool.query(
        `SELECT COUNT(*) as count FROM ${table}
         WHERE photo_url_1 IS NOT NULL AND photo_url_1 LIKE '%googleapis.com%'`,
        []
      );

      const [cloudinaryPhotos]: any = await pool.query(
        `SELECT COUNT(*) as count FROM ${table}
         WHERE photo_url_1 IS NOT NULL AND photo_url_1 LIKE '%cloudinary.com%'`,
        []
      );

      status[table] = {
        googlePhotos: googlePhotos[0].count,
        cloudinaryPhotos: cloudinaryPhotos[0].count,
      };
    }

    return NextResponse.json({ status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
