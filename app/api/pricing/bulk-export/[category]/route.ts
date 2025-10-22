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
    let mainData: any[] = [];
    let priceData: any[] = [];
    let fileName = '';

    // Query actual data from database based on category
    switch (category) {
      case 'activities':
        const activities: any[] = await query(
          `SELECT
            id as 'Activity ID',
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

        mainData = activities.map(row => ({
          ...row,
          'Highlights': Array.isArray(row.Highlights)
            ? row.Highlights.join(', ')
            : row.Highlights
        }));

        // Get all price variations
        const activityPrices: any[] = await query(
          `SELECT
            apv.id as 'Price ID',
            a.name as 'Activity Name',
            apv.season_name as 'Season Name',
            DATE_FORMAT(apv.start_date, '%Y-%m-%d') as 'Start Date',
            DATE_FORMAT(apv.end_date, '%Y-%m-%d') as 'End Date',
            apv.price as 'Price',
            apv.notes as 'Notes'
          FROM activity_price_variations apv
          JOIN activities a ON apv.activity_id = a.id
          WHERE apv.operator_id = ?
          ORDER BY a.name, apv.start_date`,
          [operatorId]
        );
        priceData = activityPrices;
        fileName = 'activities_export.xlsx';
        break;

      case 'accommodations':
        const accommodations: any[] = await query(
          `SELECT
            id as 'Accommodation ID',
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

        mainData = accommodations.map(row => ({
          ...row,
          'Amenities': Array.isArray(row.Amenities)
            ? row.Amenities.join(', ')
            : row.Amenities
        }));

        // Get all price variations
        const accommodationPrices: any[] = await query(
          `SELECT
            apv.id as 'Price ID',
            a.name as 'Hotel Name',
            apv.season_name as 'Season Name',
            DATE_FORMAT(apv.start_date, '%Y-%m-%d') as 'Start Date',
            DATE_FORMAT(apv.end_date, '%Y-%m-%d') as 'End Date',
            apv.price_per_night as 'Price Per Night',
            apv.min_stay_nights as 'Min Stay Nights',
            apv.notes as 'Notes'
          FROM accommodation_price_variations apv
          JOIN accommodations a ON apv.accommodation_id = a.id
          WHERE apv.operator_id = ?
          ORDER BY a.name, apv.start_date`,
          [operatorId]
        );
        priceData = accommodationPrices;
        fileName = 'accommodations_export.xlsx';
        break;

      case 'guides':
        const guides: any[] = await query(
          `SELECT
            id as 'Guide ID',
            name as 'Guide Name',
            guide_type as 'Guide Type',
            languages as 'Languages',
            specialization as 'Specialization',
            price_per_day as 'Base Price Per Day',
            price_per_hour as 'Base Price Per Hour',
            price_half_day as 'Base Price Half Day',
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

        mainData = guides.map(row => ({
          ...row,
          'Languages': Array.isArray(row.Languages)
            ? row.Languages.join(', ')
            : row.Languages,
          'Cities': Array.isArray(row.Cities)
            ? row.Cities.join(', ')
            : row.Cities
        }));

        // Get all price variations
        const guidePrices: any[] = await query(
          `SELECT
            gpv.id as 'Price ID',
            g.name as 'Guide Name',
            gpv.season_name as 'Season Name',
            DATE_FORMAT(gpv.start_date, '%Y-%m-%d') as 'Start Date',
            DATE_FORMAT(gpv.end_date, '%Y-%m-%d') as 'End Date',
            gpv.price_per_day as 'Price Per Day',
            gpv.price_per_hour as 'Price Per Hour',
            gpv.price_half_day as 'Price Half Day',
            gpv.notes as 'Notes'
          FROM guide_price_variations gpv
          JOIN operator_guide_services g ON gpv.guide_id = g.id
          WHERE gpv.operator_id = ?
          ORDER BY g.name, gpv.start_date`,
          [operatorId]
        );
        priceData = guidePrices;
        fileName = 'guides_export.xlsx';
        break;

      case 'restaurants':
        const restaurants: any[] = await query(
          `SELECT
            id as 'Restaurant ID',
            name as 'Restaurant Name',
            city as 'City',
            cuisine_type as 'Cuisine Type',
            price_range as 'Price Range',
            breakfast_price as 'Base Breakfast Price',
            lunch_price as 'Base Lunch Price',
            dinner_price as 'Base Dinner Price',
            currency as 'Currency',
            specialties as 'Specialties',
            description as 'Description',
            CASE WHEN is_active = 1 THEN 'Yes' ELSE 'No' END as 'Is Active'
          FROM operator_restaurants
          WHERE operator_id = ?
          ORDER BY created_at DESC`,
          [operatorId]
        );

        mainData = restaurants.map(row => ({
          ...row,
          'Specialties': Array.isArray(row.Specialties)
            ? row.Specialties.join(', ')
            : row.Specialties
        }));

        // Get all price variations
        const restaurantPrices: any[] = await query(
          `SELECT
            rpv.id as 'Price ID',
            r.name as 'Restaurant Name',
            rpv.season_name as 'Season Name',
            DATE_FORMAT(rpv.start_date, '%Y-%m-%d') as 'Start Date',
            DATE_FORMAT(rpv.end_date, '%Y-%m-%d') as 'End Date',
            rpv.breakfast_price as 'Breakfast Price',
            rpv.lunch_price as 'Lunch Price',
            rpv.dinner_price as 'Dinner Price',
            rpv.notes as 'Notes'
          FROM restaurant_price_variations rpv
          JOIN operator_restaurants r ON rpv.restaurant_id = r.id
          WHERE rpv.operator_id = ?
          ORDER BY r.name, rpv.start_date`,
          [operatorId]
        );
        priceData = restaurantPrices;
        fileName = 'restaurants_export.xlsx';
        break;

      case 'transport':
        const transport: any[] = await query(
          `SELECT
            id as 'Transport ID',
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

        mainData = transport.map(row => ({
          ...row,
          'Amenities': Array.isArray(row.Amenities)
            ? row.Amenities.join(', ')
            : row.Amenities
        }));

        // Get all price variations
        const transportPrices: any[] = await query(
          `SELECT
            tpv.id as 'Price ID',
            t.name as 'Route Name',
            tpv.season_name as 'Season Name',
            tpv.vehicle_type as 'Vehicle Type',
            tpv.max_passengers as 'Max Passengers',
            DATE_FORMAT(tpv.start_date, '%Y-%m-%d') as 'Start Date',
            DATE_FORMAT(tpv.end_date, '%Y-%m-%d') as 'End Date',
            tpv.cost_per_day as 'Cost Per Day',
            tpv.cost_per_transfer as 'Cost Per Transfer',
            tpv.notes as 'Notes'
          FROM transport_price_variations tpv
          JOIN operator_transport t ON tpv.transport_id = t.id
          WHERE tpv.operator_id = ?
          ORDER BY t.name, tpv.start_date`,
          [operatorId]
        );
        priceData = transportPrices;
        fileName = 'transport_export.xlsx';
        break;

      case 'additional':
        const additional: any[] = await query(
          `SELECT
            id as 'Service ID',
            name as 'Service Name',
            service_type as 'Service Type',
            price as 'Base Price',
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

        mainData = additional;

        // Get all price variations
        const additionalPrices: any[] = await query(
          `SELECT
            apv.id as 'Price ID',
            s.name as 'Service Name',
            apv.season_name as 'Season Name',
            DATE_FORMAT(apv.start_date, '%Y-%m-%d') as 'Start Date',
            DATE_FORMAT(apv.end_date, '%Y-%m-%d') as 'End Date',
            apv.price as 'Price',
            apv.notes as 'Notes'
          FROM additional_service_price_variations apv
          JOIN operator_additional_services s ON apv.service_id = s.id
          WHERE apv.operator_id = ?
          ORDER BY s.name, apv.start_date`,
          [operatorId]
        );
        priceData = additionalPrices;
        fileName = 'additional_services_export.xlsx';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
    }

    if (mainData.length === 0) {
      return NextResponse.json(
        { error: 'No data found to export' },
        { status: 404 }
      );
    }

    // Create main services worksheet
    const mainWorksheet = XLSX.utils.json_to_sheet(mainData);
    const mainColumnWidths = Object.keys(mainData[0]).map(key => ({
      wch: Math.max(key.length, 20)
    }));
    mainWorksheet['!cols'] = mainColumnWidths;
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, 'Services');

    // Create seasonal pricing worksheet
    if (priceData.length > 0) {
      const priceWorksheet = XLSX.utils.json_to_sheet(priceData);
      const priceColumnWidths = Object.keys(priceData[0]).map(key => ({
        wch: Math.max(key.length, 20)
      }));
      priceWorksheet['!cols'] = priceColumnWidths;
      XLSX.utils.book_append_sheet(workbook, priceWorksheet, 'Seasonal Pricing');
    }

    // Add instructions sheet
    const instructions = [
      ['BULK EXPORT - SERVICES AND SEASONAL PRICING'],
      [''],
      [`Export Date: ${new Date().toISOString().split('T')[0]}`],
      [`Category: ${category}`],
      [`Total Services: ${mainData.length}`],
      [`Total Seasonal Prices: ${priceData.length}`],
      [''],
      ['STRUCTURE:'],
      ['- Sheet 1: Services - Main service records with base pricing'],
      ['- Sheet 2: Seasonal Pricing - Date-based pricing variations'],
      [''],
      ['IMPORTANT INSTRUCTIONS FOR IMPORT:'],
      ['1. KEEP THE SERVICE ID COLUMNS - They are used to link pricing to services'],
      ['2. To add NEW services: Add rows to Services sheet'],
      ['3. To add NEW seasonal prices: Add rows to Seasonal Pricing sheet with matching service name'],
      ['4. To UPDATE existing data: Modify the values but keep the ID columns'],
      ['5. Date format MUST be: YYYY-MM-DD (e.g., 2025-06-01)'],
      ['6. Use "Yes" or "No" for boolean fields'],
      ['7. The import will match seasonal pricing to services by service name'],
      [''],
      ['TIPS:'],
      ['- You can delete the ID columns for new entries (system will create them)'],
      ['- Seasonal pricing overrides base prices for the specified date ranges'],
      ['- Make sure seasonal pricing date ranges do not overlap for the same service'],
      ['- Currency codes: USD, EUR, TRY, GBP, etc.'],
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
