import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { query } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userData;
    try {
      userData = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { category } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process data based on category
    switch (category) {
      case 'activities':
        for (const row of data as any[]) {
          try {
            // Validate required fields
            if (!row['Activity Name'] || !row['City']) {
              errors.push(`Row skipped: Missing required fields (Activity Name or City)`);
              skipped++;
              continue;
            }

            // Insert activity
            const activityResult = await query(
              `INSERT INTO activities (name, city, category, duration_hours, base_price, currency, min_participants, max_participants, description, highlights, is_active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                row['Activity Name'],
                row['City'],
                row['Category'] || 'cultural',
                row['Duration (hours)'] || 0,
                row['Base Price'] || 0,
                row['Currency'] || 'USD',
                row['Min Participants'] || 1,
                row['Max Participants'] || 1,
                row['Description'] || '',
                row['Highlights'] || '',
                row['Is Active'] === 'Yes' ? 1 : 0
              ]
            );

            imported++;
          } catch (error: any) {
            errors.push(`Error importing activity "${row['Activity Name']}": ${error.message}`);
            skipped++;
          }
        }
        break;

      case 'accommodations':
        for (const row of data as any[]) {
          try {
            if (!row['Hotel Name'] || !row['City']) {
              errors.push(`Row skipped: Missing required fields (Hotel Name or City)`);
              skipped++;
              continue;
            }

            await query(
              `INSERT INTO accommodations (name, city, category, star_rating, base_price_per_night, currency, amenities, description, is_active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                row['Hotel Name'],
                row['City'],
                row['Category'] || 'hotel',
                row['Star Rating'] || 3,
                row['Base Price Per Night'] || 0,
                row['Currency'] || 'USD',
                row['Amenities'] || '',
                row['Description'] || '',
                row['Is Active'] === 'Yes' ? 1 : 0
              ]
            );

            imported++;
          } catch (error: any) {
            errors.push(`Error importing accommodation "${row['Hotel Name']}": ${error.message}`);
            skipped++;
          }
        }
        break;

      case 'guides':
        for (const row of data as any[]) {
          try {
            if (!row['Guide Name']) {
              errors.push(`Row skipped: Missing required field (Guide Name)`);
              skipped++;
              continue;
            }

            await query(
              `INSERT INTO guides (name, guide_type, languages, specialization, price_per_day, price_per_hour, price_half_day, currency, max_group_size, cities, description, is_active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                row['Guide Name'],
                row['Guide Type'] || 'tour_guide',
                row['Languages'] || '',
                row['Specialization'] || '',
                row['Price Per Day'] || 0,
                row['Price Per Hour'] || 0,
                row['Price Half Day'] || 0,
                row['Currency'] || 'USD',
                row['Max Group Size'] || 1,
                row['Cities'] || '',
                row['Description'] || '',
                row['Is Active'] === 'Yes' ? 1 : 0
              ]
            );

            imported++;
          } catch (error: any) {
            errors.push(`Error importing guide "${row['Guide Name']}": ${error.message}`);
            skipped++;
          }
        }
        break;

      case 'restaurants':
        for (const row of data as any[]) {
          try {
            if (!row['Restaurant Name'] || !row['City']) {
              errors.push(`Row skipped: Missing required fields (Restaurant Name or City)`);
              skipped++;
              continue;
            }

            await query(
              `INSERT INTO restaurants (name, city, cuisine_type, price_range, breakfast_price, lunch_price, dinner_price, specialties, description, is_active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                row['Restaurant Name'],
                row['City'],
                row['Cuisine Type'] || 'local',
                row['Price Range'] || 'moderate',
                row['Breakfast Price'] || 0,
                row['Lunch Price'] || 0,
                row['Dinner Price'] || 0,
                row['Specialties'] || '',
                row['Description'] || '',
                row['Is Active'] === 'Yes' ? 1 : 0
              ]
            );

            imported++;
          } catch (error: any) {
            errors.push(`Error importing restaurant "${row['Restaurant Name']}": ${error.message}`);
            skipped++;
          }
        }
        break;

      case 'transport':
        for (const row of data as any[]) {
          try {
            if (!row['Route Name']) {
              errors.push(`Row skipped: Missing required field (Route Name)`);
              skipped++;
              continue;
            }

            await query(
              `INSERT INTO transport (route_name, from_location, to_location, vehicle_type, capacity, duration_minutes, base_price, currency, description, is_active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                row['Route Name'],
                row['From'] || '',
                row['To'] || '',
                row['Vehicle Type'] || 'sedan',
                row['Capacity'] || 4,
                row['Duration (minutes)'] || 0,
                row['Base Price'] || 0,
                row['Currency'] || 'USD',
                row['Description'] || '',
                row['Is Active'] === 'Yes' ? 1 : 0
              ]
            );

            imported++;
          } catch (error: any) {
            errors.push(`Error importing transport "${row['Route Name']}": ${error.message}`);
            skipped++;
          }
        }
        break;

      case 'additional':
        for (const row of data as any[]) {
          try {
            if (!row['Service Name']) {
              errors.push(`Row skipped: Missing required field (Service Name)`);
              skipped++;
              continue;
            }

            await query(
              `INSERT INTO additional_services (service_name, service_type, price, price_type, currency, description, mandatory, included_in_packages, is_active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                row['Service Name'],
                row['Service Type'] || 'insurance',
                row['Price'] || 0,
                row['Price Type'] || 'per_person',
                row['Currency'] || 'USD',
                row['Description'] || '',
                row['Mandatory'] === 'Yes' ? 1 : 0,
                row['Included in Packages'] || '',
                row['Is Active'] === 'Yes' ? 1 : 0
              ]
            );

            imported++;
          } catch (error: any) {
            errors.push(`Error importing service "${row['Service Name']}": ${error.message}`);
            skipped++;
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
      message: `Successfully imported ${imported} items${skipped > 0 ? `, skipped ${skipped} items` : ''}`
    });

  } catch (error: any) {
    console.error('Failed to process upload:', error);
    return NextResponse.json(
      { error: 'Failed to process upload', details: error.message },
      { status: 500 }
    );
  }
}
