import { NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { execute } from '@/lib/db';
import * as XLSX from 'xlsx';

function csvToArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userData = verifyToken(token);
    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { category } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      );
    }

    const operatorId = userData.operatorId;
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    const addError = (message: string) => {
      errors.push(message);
      skipped += 1;
    };

    const toNumber = (value: unknown, fallback = 0) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : fallback;
    };

    switch (category) {
      case 'activities':
        for (const row of rows) {
          try {
            if (!row['Activity Name'] || !row['City']) {
              addError(
                'Row skipped: Missing required fields (Activity Name or City)'
              );
              continue;
            }

            await execute(
              `INSERT INTO activities (
                operator_id,
                name,
                city,
                category,
                duration_hours,
                base_price,
                currency,
                min_participants,
                max_participants,
                description,
                highlights,
                is_active,
                created_at,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                operatorId,
                row['Activity Name'],
                row['City'],
                row['Category'] || 'cultural',
                toNumber(row['Duration (hours)']),
                toNumber(row['Base Price']),
                row['Currency'] || 'USD',
                toNumber(row['Min Participants'], 1),
                toNumber(row['Max Participants'], 1),
                row['Description'] || '',
                JSON.stringify(csvToArray(row['Highlights'])),
                row['Is Active'] === 'Yes' ? 1 : 0,
              ]
            );

            imported += 1;
          } catch (error: any) {
            addError(
              `Error importing activity "${row['Activity Name'] || 'Unknown'}": ${
                error?.message || error
              }`
            );
          }
        }
        break;

      case 'accommodations':
        for (const row of rows) {
          try {
            if (!row['Hotel Name'] || !row['City']) {
              addError(
                'Row skipped: Missing required fields (Hotel Name or City)'
              );
              continue;
            }

            await execute(
              `INSERT INTO accommodations (
                operator_id,
                name,
                city,
                category,
                star_rating,
                base_price_per_night,
                currency,
                amenities,
                description,
                is_active,
                created_at,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                operatorId,
                row['Hotel Name'],
                row['City'],
                row['Category'] || 'hotel',
                toNumber(row['Star Rating'], 3),
                toNumber(row['Base Price Per Night']),
                row['Currency'] || 'USD',
                JSON.stringify(csvToArray(row['Amenities'])),
                row['Description'] || '',
                row['Is Active'] === 'Yes' ? 1 : 0,
              ]
            );

            imported += 1;
          } catch (error: any) {
            addError(
              `Error importing accommodation "${row['Hotel Name'] || 'Unknown'}": ${
                error?.message || error
              }`
            );
          }
        }
        break;

      case 'guides':
        for (const row of rows) {
          try {
            if (!row['Guide Name']) {
              addError('Row skipped: Missing required field (Guide Name)');
              continue;
            }

            const languages = JSON.stringify(csvToArray(row['Languages']));
            const cities = JSON.stringify(csvToArray(row['Cities']));

            await execute(
              `INSERT INTO operator_guide_services (
                operator_id,
                name,
                guide_type,
                languages,
                specialization,
                price_per_day,
                price_per_hour,
                price_half_day,
                currency,
                max_group_size,
                cities,
                description,
                is_active,
                created_at,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                operatorId,
                row['Guide Name'],
                (row['Guide Type'] || 'tour_guide').toString(),
                languages,
                row['Specialization'] || '',
                row['Price Per Day'] ? toNumber(row['Price Per Day']) : null,
                row['Price Per Hour'] ? toNumber(row['Price Per Hour']) : null,
                row['Price Half Day'] ? toNumber(row['Price Half Day']) : null,
                row['Currency'] || 'USD',
                row['Max Group Size'] ? toNumber(row['Max Group Size']) : null,
                cities,
                row['Description'] || '',
                row['Is Active'] === 'Yes' ? 1 : 0,
              ]
            );

            imported += 1;
          } catch (error: any) {
            addError(
              `Error importing guide "${row['Guide Name'] || 'Unknown'}": ${
                error?.message || error
              }`
            );
          }
        }
        break;

      case 'restaurants':
        for (const row of rows) {
          try {
            if (!row['Restaurant Name'] || !row['City']) {
              addError(
                'Row skipped: Missing required fields (Restaurant Name or City)'
              );
              continue;
            }

            const specialties = JSON.stringify(csvToArray(row['Specialties']));
            const priceRangeRaw =
              typeof row['Price Range'] === 'string'
                ? row['Price Range'].toLowerCase()
                : null;
            const allowedPriceRanges = [
              'budget',
              'mid-range',
              'upscale',
              'luxury',
            ];
            const priceRange = allowedPriceRanges.includes(
              priceRangeRaw || ''
            )
              ? priceRangeRaw
              : 'mid-range';

            await execute(
              `INSERT INTO operator_restaurants (
                operator_id,
                name,
                city,
                cuisine_type,
                breakfast_price,
                lunch_price,
                dinner_price,
                currency,
                description,
                address,
                specialties,
                price_range,
                location_lat,
                location_lng,
                is_active,
                created_at,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                operatorId,
                row['Restaurant Name'],
                row['City'],
                row['Cuisine Type'] || 'local',
                row['Breakfast Price'] ? toNumber(row['Breakfast Price']) : null,
                row['Lunch Price'] ? toNumber(row['Lunch Price']) : null,
                row['Dinner Price'] ? toNumber(row['Dinner Price']) : null,
                row['Currency'] || 'USD',
                row['Description'] || '',
                row['Address'] || '',
                specialties,
                priceRange,
                row['Latitude'] ? toNumber(row['Latitude']) : null,
                row['Longitude'] ? toNumber(row['Longitude']) : null,
                row['Is Active'] === 'Yes' ? 1 : 0,
              ]
            );

            imported += 1;
          } catch (error: any) {
            addError(
              `Error importing restaurant "${row['Restaurant Name'] || 'Unknown'}": ${
                error?.message || error
              }`
            );
          }
        }
        break;

      case 'transport':
        for (const row of rows) {
          try {
            if (!row['Route Name']) {
              addError('Row skipped: Missing required field (Route Name)');
              continue;
            }

            const allowedTypes = [
              'flight',
              'bus',
              'train',
              'car_rental',
              'private_transfer',
              'ferry',
              'metro',
              'taxi',
            ];

            let transportType =
              typeof row['Type'] === 'string'
                ? row['Type'].toLowerCase().replace(/\s+/g, '_')
                : '';
            if (!allowedTypes.includes(transportType)) {
              transportType = 'private_transfer';
            }

            await execute(
              `INSERT INTO operator_transport (
                operator_id,
                name,
                type,
                from_location,
                to_location,
                distance_km,
                duration_minutes,
                base_price,
                price_per_person,
                currency,
                min_passengers,
                max_passengers,
                description,
                vehicle_type,
                amenities,
                is_active,
                created_at,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                operatorId,
                row['Route Name'],
                transportType,
                row['From'] || '',
                row['To'] || '',
                row['Distance (km)'] ? toNumber(row['Distance (km)']) : null,
                row['Duration (minutes)']
                  ? toNumber(row['Duration (minutes)'])
                  : null,
                toNumber(row['Base Price']),
                row['Price Per Person'] ? toNumber(row['Price Per Person']) : null,
                row['Currency'] || 'USD',
                row['Min Passengers'] ? toNumber(row['Min Passengers']) : 1,
                row['Capacity'] ? toNumber(row['Capacity']) : null,
                row['Description'] || '',
                row['Vehicle Type'] || '',
                JSON.stringify(csvToArray(row['Amenities'])),
                row['Is Active'] === 'Yes' ? 1 : 0,
              ]
            );

            imported += 1;
          } catch (error: any) {
            addError(
              `Error importing transport "${row['Route Name'] || 'Unknown'}": ${
                error?.message || error
              }`
            );
          }
        }
        break;

      case 'additional':
        for (const row of rows) {
          try {
            if (!row['Service Name']) {
              addError('Row skipped: Missing required field (Service Name)');
              continue;
            }

            const serviceTypeRaw =
              typeof row['Service Type'] === 'string'
                ? row['Service Type'].toLowerCase().replace(/\s+/g, '_')
                : '';
            const allowedServiceTypes = [
              'insurance',
              'visa',
              'entrance_fee',
              'airport_service',
              'sim_card',
              'equipment_rental',
              'other',
            ];
            const serviceType = allowedServiceTypes.includes(serviceTypeRaw)
              ? serviceTypeRaw
              : 'other';

            const priceTypeRaw =
              typeof row['Price Type'] === 'string'
                ? row['Price Type'].toLowerCase().replace(/\s+/g, '_')
                : '';
            const allowedPriceTypes = [
              'per_person',
              'per_group',
              'per_day',
              'one_time',
            ];
            const priceType = allowedPriceTypes.includes(priceTypeRaw)
              ? priceTypeRaw
              : 'per_person';

            await execute(
              `INSERT INTO operator_additional_services (
                operator_id,
                name,
                service_type,
                price,
                price_type,
                currency,
                description,
                mandatory,
                included_in_packages,
                is_active,
                created_at,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                operatorId,
                row['Service Name'],
                serviceType,
                toNumber(row['Price']),
                priceType,
                row['Currency'] || 'USD',
                row['Description'] || '',
                row['Mandatory'] === 'Yes' ? 1 : 0,
                row['Included in Packages'] === 'Yes' ? 1 : 0,
                row['Is Active'] === 'Yes' ? 1 : 0,
              ]
            );

            imported += 1;
          } catch (error: any) {
            addError(
              `Error importing service "${row['Service Name'] || 'Unknown'}": ${
                error?.message || error
              }`
            );
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
      message: `Successfully imported ${imported} items${
        skipped > 0 ? `, skipped ${skipped} items` : ''
      }`,
    });
  } catch (error: any) {
    console.error('Failed to process upload:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
