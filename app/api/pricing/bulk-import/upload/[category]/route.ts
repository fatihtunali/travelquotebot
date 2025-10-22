import { NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { execute, query } from '@/lib/db';
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

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

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

    // Read both sheets - Services and Seasonal Pricing
    const servicesSheet = workbook.Sheets['Services'] || workbook.Sheets[workbook.SheetNames[0]];
    const pricingSheet = workbook.Sheets['Seasonal Pricing'];

    if (!servicesSheet) {
      return NextResponse.json(
        { error: 'No Services sheet found in file' },
        { status: 400 }
      );
    }

    const serviceRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(servicesSheet);
    const pricingRows = pricingSheet ? XLSX.utils.sheet_to_json<Record<string, unknown>>(pricingSheet) : [];

    if (serviceRows.length === 0) {
      return NextResponse.json(
        { error: 'No data found in Services sheet' },
        { status: 400 }
      );
    }

    const operatorId = userData.operatorId;
    let servicesImported = 0;
    let servicesSkipped = 0;
    let pricesImported = 0;
    let pricesSkipped = 0;
    const errors: string[] = [];

    const addError = (message: string, isPrice = false) => {
      errors.push(message);
      if (isPrice) {
        pricesSkipped += 1;
      } else {
        servicesSkipped += 1;
      }
    };

    // Map to store service name -> ID mappings for pricing import
    const serviceNameToId: Map<string, string> = new Map();

    // STEP 1: Import Services
    switch (category) {
      case 'activities':
        for (const row of serviceRows) {
          try {
            if (!row['Activity Name'] || !row['City']) {
              addError('Service row skipped: Missing required fields (Activity Name or City)');
              continue;
            }

            const result: any = await execute(
              `INSERT INTO activities (
                operator_id, name, city, category, duration_hours, base_price, currency,
                min_participants, max_participants, description, highlights, is_active,
                created_at, updated_at
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

            serviceNameToId.set(String(row['Activity Name']), result.insertId);
            servicesImported += 1;
          } catch (error: any) {
            addError(`Error importing activity "${row['Activity Name'] || 'Unknown'}": ${error?.message || String(error)}`);
          }
        }

        // STEP 2: Import Seasonal Pricing for Activities
        for (const row of pricingRows) {
          try {
            const serviceName = String(row['Activity Name'] || '');
            if (!serviceName || !row['Season Name'] || !row['Start Date'] || !row['End Date']) {
              addError('Price row skipped: Missing required fields', true);
              continue;
            }

            // Find service ID by name
            let serviceId = serviceNameToId.get(serviceName);
            if (!serviceId) {
              const existing: any[] = await query(
                'SELECT id FROM activities WHERE name = ? AND operator_id = ? LIMIT 1',
                [serviceName, operatorId]
              );
              if (existing.length > 0) {
                serviceId = existing[0].id;
              }
            }

            if (!serviceId) {
              addError(`Price row skipped: Activity "${serviceName}" not found`, true);
              continue;
            }

            await execute(
              `INSERT INTO activity_price_variations (
                activity_id, operator_id, season_name, start_date, end_date, price, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                serviceId,
                operatorId,
                row['Season Name'],
                row['Start Date'],
                row['End Date'],
                toNumber(row['Price']),
                row['Notes'] || '',
              ]
            );

            pricesImported += 1;
          } catch (error: any) {
            addError(`Error importing activity price: ${error?.message || String(error)}`, true);
          }
        }
        break;

      case 'accommodations':
        for (const row of serviceRows) {
          try {
            if (!row['Hotel Name'] || !row['City']) {
              addError('Service row skipped: Missing required fields (Hotel Name or City)');
              continue;
            }

            const result: any = await execute(
              `INSERT INTO accommodations (
                operator_id, name, city, category, star_rating, base_price_per_night, currency,
                amenities, description, is_active, created_at, updated_at
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

            serviceNameToId.set(String(row['Hotel Name']), result.insertId);
            servicesImported += 1;
          } catch (error: any) {
            addError(`Error importing accommodation "${row['Hotel Name'] || 'Unknown'}": ${error?.message || String(error)}`);
          }
        }

        // Import Seasonal Pricing for Accommodations
        for (const row of pricingRows) {
          try {
            const serviceName = String(row['Hotel Name'] || '');
            if (!serviceName || !row['Season Name'] || !row['Start Date'] || !row['End Date']) {
              addError('Price row skipped: Missing required fields', true);
              continue;
            }

            let serviceId = serviceNameToId.get(serviceName);
            if (!serviceId) {
              const existing: any[] = await query(
                'SELECT id FROM accommodations WHERE name = ? AND operator_id = ? LIMIT 1',
                [serviceName, operatorId]
              );
              if (existing.length > 0) {
                serviceId = existing[0].id;
              }
            }

            if (!serviceId) {
              addError(`Price row skipped: Hotel "${serviceName}" not found`, true);
              continue;
            }

            await execute(
              `INSERT INTO accommodation_price_variations (
                accommodation_id, operator_id, season_name, start_date, end_date,
                price_per_night, min_stay_nights, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                serviceId,
                operatorId,
                row['Season Name'],
                row['Start Date'],
                row['End Date'],
                toNumber(row['Price Per Night']),
                toNumber(row['Min Stay Nights'], 1),
                row['Notes'] || '',
              ]
            );

            pricesImported += 1;
          } catch (error: any) {
            addError(`Error importing accommodation price: ${error?.message || String(error)}`, true);
          }
        }
        break;

      case 'guides':
        for (const row of serviceRows) {
          try {
            if (!row['Guide Name']) {
              addError('Service row skipped: Missing required field (Guide Name)');
              continue;
            }

            const result: any = await execute(
              `INSERT INTO operator_guide_services (
                operator_id, name, guide_type, languages, specialization,
                price_per_day, price_per_hour, price_half_day, currency,
                max_group_size, cities, description, is_active, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                operatorId,
                row['Guide Name'],
                (row['Guide Type'] || 'tour_guide').toString(),
                JSON.stringify(csvToArray(row['Languages'])),
                row['Specialization'] || '',
                row['Base Price Per Day'] ? toNumber(row['Base Price Per Day']) : null,
                row['Base Price Per Hour'] ? toNumber(row['Base Price Per Hour']) : null,
                row['Base Price Half Day'] ? toNumber(row['Base Price Half Day']) : null,
                row['Currency'] || 'USD',
                row['Max Group Size'] ? toNumber(row['Max Group Size']) : null,
                JSON.stringify(csvToArray(row['Cities'])),
                row['Description'] || '',
                row['Is Active'] === 'Yes' ? 1 : 0,
              ]
            );

            serviceNameToId.set(String(row['Guide Name']), result.insertId);
            servicesImported += 1;
          } catch (error: any) {
            addError(`Error importing guide "${row['Guide Name'] || 'Unknown'}": ${error?.message || String(error)}`);
          }
        }

        // Import Seasonal Pricing for Guides
        for (const row of pricingRows) {
          try {
            const serviceName = String(row['Guide Name'] || '');
            if (!serviceName || !row['Season Name'] || !row['Start Date'] || !row['End Date']) {
              addError('Price row skipped: Missing required fields', true);
              continue;
            }

            let serviceId = serviceNameToId.get(serviceName);
            if (!serviceId) {
              const existing: any[] = await query(
                'SELECT id FROM operator_guide_services WHERE name = ? AND operator_id = ? LIMIT 1',
                [serviceName, operatorId]
              );
              if (existing.length > 0) {
                serviceId = existing[0].id;
              }
            }

            if (!serviceId) {
              addError(`Price row skipped: Guide "${serviceName}" not found`, true);
              continue;
            }

            await execute(
              `INSERT INTO guide_price_variations (
                guide_id, operator_id, season_name, start_date, end_date,
                price_per_day, price_per_hour, price_half_day, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                serviceId,
                operatorId,
                row['Season Name'],
                row['Start Date'],
                row['End Date'],
                row['Price Per Day'] ? toNumber(row['Price Per Day']) : null,
                row['Price Per Hour'] ? toNumber(row['Price Per Hour']) : null,
                row['Price Half Day'] ? toNumber(row['Price Half Day']) : null,
                row['Notes'] || '',
              ]
            );

            pricesImported += 1;
          } catch (error: any) {
            addError(`Error importing guide price: ${error?.message || String(error)}`, true);
          }
        }
        break;

      case 'restaurants':
        for (const row of serviceRows) {
          try {
            if (!row['Restaurant Name'] || !row['City']) {
              addError('Service row skipped: Missing required fields (Restaurant Name or City)');
              continue;
            }

            const priceRangeRaw = typeof row['Price Range'] === 'string' ? row['Price Range'].toLowerCase() : null;
            const allowedPriceRanges = ['budget', 'mid-range', 'upscale', 'luxury'];
            const priceRange = allowedPriceRanges.includes(priceRangeRaw || '') ? priceRangeRaw : 'mid-range';

            const result: any = await execute(
              `INSERT INTO operator_restaurants (
                operator_id, name, city, cuisine_type, breakfast_price, lunch_price, dinner_price,
                currency, description, address, specialties, price_range, location_lat, location_lng,
                is_active, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                operatorId,
                row['Restaurant Name'],
                row['City'],
                row['Cuisine Type'] || 'local',
                row['Base Breakfast Price'] ? toNumber(row['Base Breakfast Price']) : null,
                row['Base Lunch Price'] ? toNumber(row['Base Lunch Price']) : null,
                row['Base Dinner Price'] ? toNumber(row['Base Dinner Price']) : null,
                row['Currency'] || 'USD',
                row['Description'] || '',
                row['Address'] || '',
                JSON.stringify(csvToArray(row['Specialties'])),
                priceRange,
                row['Latitude'] ? toNumber(row['Latitude']) : null,
                row['Longitude'] ? toNumber(row['Longitude']) : null,
                row['Is Active'] === 'Yes' ? 1 : 0,
              ]
            );

            serviceNameToId.set(String(row['Restaurant Name']), result.insertId);
            servicesImported += 1;
          } catch (error: any) {
            addError(`Error importing restaurant "${row['Restaurant Name'] || 'Unknown'}": ${error?.message || String(error)}`);
          }
        }

        // Import Seasonal Pricing for Restaurants
        for (const row of pricingRows) {
          try {
            const serviceName = String(row['Restaurant Name'] || '');
            if (!serviceName || !row['Season Name'] || !row['Start Date'] || !row['End Date']) {
              addError('Price row skipped: Missing required fields', true);
              continue;
            }

            let serviceId = serviceNameToId.get(serviceName);
            if (!serviceId) {
              const existing: any[] = await query(
                'SELECT id FROM operator_restaurants WHERE name = ? AND operator_id = ? LIMIT 1',
                [serviceName, operatorId]
              );
              if (existing.length > 0) {
                serviceId = existing[0].id;
              }
            }

            if (!serviceId) {
              addError(`Price row skipped: Restaurant "${serviceName}" not found`, true);
              continue;
            }

            await execute(
              `INSERT INTO restaurant_price_variations (
                restaurant_id, operator_id, season_name, start_date, end_date,
                breakfast_price, lunch_price, dinner_price, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                serviceId,
                operatorId,
                row['Season Name'],
                row['Start Date'],
                row['End Date'],
                row['Breakfast Price'] ? toNumber(row['Breakfast Price']) : null,
                row['Lunch Price'] ? toNumber(row['Lunch Price']) : null,
                row['Dinner Price'] ? toNumber(row['Dinner Price']) : null,
                row['Notes'] || '',
              ]
            );

            pricesImported += 1;
          } catch (error: any) {
            addError(`Error importing restaurant price: ${error?.message || String(error)}`, true);
          }
        }
        break;

      case 'transport':
        for (const row of serviceRows) {
          try {
            if (!row['Route Name']) {
              addError('Service row skipped: Missing required field (Route Name)');
              continue;
            }

            const allowedTypes = ['flight', 'bus', 'train', 'car_rental', 'private_transfer', 'ferry', 'metro', 'taxi'];
            let transportType = typeof row['Type'] === 'string' ? row['Type'].toLowerCase().replace(/\s+/g, '_') : '';
            if (!allowedTypes.includes(transportType)) {
              transportType = 'private_transfer';
            }

            const result: any = await execute(
              `INSERT INTO operator_transport (
                operator_id, name, type, from_location, to_location, distance_km, duration_minutes,
                base_price, price_per_person, currency, min_passengers, max_passengers,
                description, vehicle_type, amenities, is_active, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                operatorId,
                row['Route Name'],
                transportType,
                row['From'] || '',
                row['To'] || '',
                row['Distance (km)'] ? toNumber(row['Distance (km)']) : null,
                row['Duration (minutes)'] ? toNumber(row['Duration (minutes)']) : null,
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

            serviceNameToId.set(String(row['Route Name']), result.insertId);
            servicesImported += 1;
          } catch (error: any) {
            addError(`Error importing transport "${row['Route Name'] || 'Unknown'}": ${error?.message || String(error)}`);
          }
        }

        // Import Seasonal Pricing for Transport
        for (const row of pricingRows) {
          try {
            const serviceName = String(row['Route Name'] || '');
            if (!serviceName || !row['Season Name'] || !row['Start Date'] || !row['End Date']) {
              addError('Price row skipped: Missing required fields', true);
              continue;
            }

            let serviceId = serviceNameToId.get(serviceName);
            if (!serviceId) {
              const existing: any[] = await query(
                'SELECT id FROM operator_transport WHERE name = ? AND operator_id = ? LIMIT 1',
                [serviceName, operatorId]
              );
              if (existing.length > 0) {
                serviceId = existing[0].id;
              }
            }

            if (!serviceId) {
              addError(`Price row skipped: Transport "${serviceName}" not found`, true);
              continue;
            }

            const costPerDay = row['Cost Per Day'] ? toNumber(row['Cost Per Day']) : null;
            const costPerTransfer = row['Cost Per Transfer'] ? toNumber(row['Cost Per Transfer']) : null;
            const price = costPerTransfer || costPerDay || 0;

            await execute(
              `INSERT INTO transport_price_variations (
                transport_id, operator_id, season_name, vehicle_type, max_passengers,
                start_date, end_date, price, cost_per_day, cost_per_transfer, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                serviceId,
                operatorId,
                row['Season Name'],
                row['Vehicle Type'] || '',
                row['Max Passengers'] ? toNumber(row['Max Passengers']) : null,
                row['Start Date'],
                row['End Date'],
                price,
                costPerDay,
                costPerTransfer,
                row['Notes'] || '',
              ]
            );

            pricesImported += 1;
          } catch (error: any) {
            addError(`Error importing transport price: ${error?.message || String(error)}`, true);
          }
        }
        break;

      case 'additional':
        for (const row of serviceRows) {
          try {
            if (!row['Service Name']) {
              addError('Service row skipped: Missing required field (Service Name)');
              continue;
            }

            const serviceTypeRaw = typeof row['Service Type'] === 'string' ? row['Service Type'].toLowerCase().replace(/\s+/g, '_') : '';
            const allowedServiceTypes = ['insurance', 'visa', 'entrance_fee', 'airport_service', 'sim_card', 'equipment_rental', 'other'];
            const serviceType = allowedServiceTypes.includes(serviceTypeRaw) ? serviceTypeRaw : 'other';

            const priceTypeRaw = typeof row['Price Type'] === 'string' ? row['Price Type'].toLowerCase().replace(/\s+/g, '_') : '';
            const allowedPriceTypes = ['per_person', 'per_group', 'per_day', 'one_time'];
            const priceType = allowedPriceTypes.includes(priceTypeRaw) ? priceTypeRaw : 'per_person';

            const result: any = await execute(
              `INSERT INTO operator_additional_services (
                operator_id, name, service_type, price, price_type, currency,
                description, mandatory, included_in_packages, is_active, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                operatorId,
                row['Service Name'],
                serviceType,
                toNumber(row['Base Price']),
                priceType,
                row['Currency'] || 'USD',
                row['Description'] || '',
                row['Mandatory'] === 'Yes' ? 1 : 0,
                row['Included in Packages'] === 'Yes' ? 1 : 0,
                row['Is Active'] === 'Yes' ? 1 : 0,
              ]
            );

            serviceNameToId.set(String(row['Service Name']), result.insertId);
            servicesImported += 1;
          } catch (error: any) {
            addError(`Error importing service "${row['Service Name'] || 'Unknown'}": ${error?.message || String(error)}`);
          }
        }

        // Import Seasonal Pricing for Additional Services
        for (const row of pricingRows) {
          try {
            const serviceName = String(row['Service Name'] || '');
            if (!serviceName || !row['Season Name'] || !row['Start Date'] || !row['End Date']) {
              addError('Price row skipped: Missing required fields', true);
              continue;
            }

            let serviceId = serviceNameToId.get(serviceName);
            if (!serviceId) {
              const existing: any[] = await query(
                'SELECT id FROM operator_additional_services WHERE name = ? AND operator_id = ? LIMIT 1',
                [serviceName, operatorId]
              );
              if (existing.length > 0) {
                serviceId = existing[0].id;
              }
            }

            if (!serviceId) {
              addError(`Price row skipped: Service "${serviceName}" not found`, true);
              continue;
            }

            await execute(
              `INSERT INTO additional_service_price_variations (
                service_id, operator_id, season_name, start_date, end_date, price, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                serviceId,
                operatorId,
                row['Season Name'],
                row['Start Date'],
                row['End Date'],
                toNumber(row['Price']),
                row['Notes'] || '',
              ]
            );

            pricesImported += 1;
          } catch (error: any) {
            addError(`Error importing service price: ${error?.message || String(error)}`, true);
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
      servicesImported,
      servicesSkipped,
      pricesImported,
      pricesSkipped,
      errors,
      message: `Successfully imported ${servicesImported} services and ${pricesImported} seasonal prices${
        (servicesSkipped > 0 || pricesSkipped > 0) ? `. Skipped ${servicesSkipped} services and ${pricesSkipped} prices` : ''
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
