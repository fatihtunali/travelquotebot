import { NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { query } from '@/lib/db';

export async function GET(
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
    const operatorId = userData.operatorId;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    let data: any[] = [];
    let fileName = '';

    // Query actual data from database based on category
    switch (category) {
      case 'activities':
        const activities: any[] = await query(
          `SELECT
            name as 'Activity Name',
            city as 'City',
            category as 'Category',
            duration_hours as 'Duration (hours)',
            base_price as 'Base Price',
            currency as 'Currency',
            min_participants as 'Min Participants',
            max_participants as 'Max Participants',
            description as 'Description',
            highlights as 'Highlights',
            CASE WHEN is_active = 1 THEN 'Yes' ELSE 'No' END as 'Is Active'
          FROM activities
          WHERE operator_id = ?
          ORDER BY created_at DESC`,
          [operatorId]
        );

        // Parse JSON highlights back to comma-separated string
        data = activities.map(row => ({
          ...row,
          'Highlights': Array.isArray(row.Highlights)
            ? row.Highlights.join(', ')
            : row.Highlights
        }));
        fileName = 'activities_export.xlsx';
        break;

      case 'accommodations':
        const accommodations: any[] = await query(
          `SELECT
            name as 'Hotel Name',
            city as 'City',
            category as 'Category',
            star_rating as 'Star Rating',
            base_price_per_night as 'Base Price Per Night',
            currency as 'Currency',
            amenities as 'Amenities',
            description as 'Description',
            CASE WHEN is_active = 1 THEN 'Yes' ELSE 'No' END as 'Is Active'
          FROM accommodations
          WHERE operator_id = ?
          ORDER BY created_at DESC`,
          [operatorId]
        );

        // Parse JSON amenities back to comma-separated string
        data = accommodations.map(row => ({
          ...row,
          'Amenities': Array.isArray(row.Amenities)
            ? row.Amenities.join(', ')
            : row.Amenities
        }));
        fileName = 'accommodations_export.xlsx';
        break;

      case 'guides':
        const guides: any[] = await query(
          `SELECT
            name as 'Guide Name',
            guide_type as 'Guide Type',
            languages as 'Languages',
            specialization as 'Specialization',
            price_per_day as 'Price Per Day',
            price_per_hour as 'Price Per Hour',
            price_half_day as 'Price Half Day',
            currency as 'Currency',
            max_group_size as 'Max Group Size',
            cities as 'Cities',
            description as 'Description',
            CASE WHEN is_active = 1 THEN 'Yes' ELSE 'No' END as 'Is Active'
          FROM operator_guide_services
          WHERE operator_id = ?
          ORDER BY created_at DESC`,
          [operatorId]
        );

        // Parse JSON arrays back to comma-separated strings
        data = guides.map(row => ({
          ...row,
          'Languages': Array.isArray(row.Languages)
            ? row.Languages.join(', ')
            : row.Languages,
          'Cities': Array.isArray(row.Cities)
            ? row.Cities.join(', ')
            : row.Cities
        }));
        fileName = 'guides_export.xlsx';
        break;

      case 'restaurants':
        const restaurants: any[] = await query(
          `SELECT
            name as 'Restaurant Name',
            city as 'City',
            cuisine_type as 'Cuisine Type',
            price_range as 'Price Range',
            breakfast_price as 'Breakfast Price',
            lunch_price as 'Lunch Price',
            dinner_price as 'Dinner Price',
            currency as 'Currency',
            specialties as 'Specialties',
            description as 'Description',
            CASE WHEN is_active = 1 THEN 'Yes' ELSE 'No' END as 'Is Active'
          FROM operator_restaurants
          WHERE operator_id = ?
          ORDER BY created_at DESC`,
          [operatorId]
        );

        // Parse JSON specialties back to comma-separated string
        data = restaurants.map(row => ({
          ...row,
          'Specialties': Array.isArray(row.Specialties)
            ? row.Specialties.join(', ')
            : row.Specialties
        }));
        fileName = 'restaurants_export.xlsx';
        break;

      case 'transport':
        const transport: any[] = await query(
          `SELECT
            name as 'Route Name',
            type as 'Type',
            from_location as 'From',
            to_location as 'To',
            distance_km as 'Distance (km)',
            duration_minutes as 'Duration (minutes)',
            base_price as 'Base Price',
            price_per_person as 'Price Per Person',
            currency as 'Currency',
            min_passengers as 'Min Passengers',
            max_passengers as 'Capacity',
            vehicle_type as 'Vehicle Type',
            amenities as 'Amenities',
            description as 'Description',
            CASE WHEN is_active = 1 THEN 'Yes' ELSE 'No' END as 'Is Active'
          FROM operator_transport
          WHERE operator_id = ?
          ORDER BY created_at DESC`,
          [operatorId]
        );

        // Parse JSON amenities back to comma-separated string
        data = transport.map(row => ({
          ...row,
          'Amenities': Array.isArray(row.Amenities)
            ? row.Amenities.join(', ')
            : row.Amenities
        }));
        fileName = 'transport_export.xlsx';
        break;

      case 'additional':
        const additional: any[] = await query(
          `SELECT
            name as 'Service Name',
            service_type as 'Service Type',
            price as 'Price',
            price_type as 'Price Type',
            currency as 'Currency',
            description as 'Description',
            CASE WHEN mandatory = 1 THEN 'Yes' ELSE 'No' END as 'Mandatory',
            CASE WHEN included_in_packages = 1 THEN 'Yes' ELSE 'No' END as 'Included in Packages',
            CASE WHEN is_active = 1 THEN 'Yes' ELSE 'No' END as 'Is Active'
          FROM operator_additional_services
          WHERE operator_id = ?
          ORDER BY created_at DESC`,
          [operatorId]
        );

        data = additional;
        fileName = 'additional_services_export.xlsx';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No data found to export' },
        { status: 404 }
      );
    }

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const columnWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(key.length, 20)
    }));
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exported Data');

    // Add instructions sheet
    const instructions = [
      ['EXPORTED DATA INFORMATION'],
      [''],
      [`Export Date: ${new Date().toISOString().split('T')[0]}`],
      [`Category: ${category}`],
      [`Total Records: ${data.length}`],
      [''],
      ['INSTRUCTIONS:'],
      ['1. This file contains your actual pricing data from the system'],
      ['2. You can review and edit the data offline'],
      ['3. To import changes back, use the Bulk Import feature'],
      ['4. Make sure to keep the same column headers when re-importing'],
      ['5. Use "Yes" or "No" for boolean fields (Is Active, Mandatory, etc.)'],
      [''],
      ['Note: Some fields may show as JSON - these are exported as comma-separated values for easy editing']
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return file as download
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Failed to export data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
