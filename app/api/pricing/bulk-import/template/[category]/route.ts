import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET(
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

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Define service templates for each category
    const serviceTemplates: Record<string, any[]> = {
      activities: [
        {
          'Activity ID': '(Leave empty for new)',
          'Activity Name': 'Istanbul Full Day Tour',
          'City': 'Istanbul',
          'Category': 'cultural',
          'Duration (hours)': 8,
          'Base Price': 150,
          'Currency': 'USD',
          'Min Participants': 2,
          'Max Participants': 15,
          'Description': 'Explore the best of Istanbul in one day',
          'Highlights': 'Blue Mosque, Hagia Sophia, Grand Bazaar',
          'Is Active': 'Yes'
        }
      ],
      accommodations: [
        {
          'Accommodation ID': '(Leave empty for new)',
          'Hotel Name': 'Grand Hotel Istanbul',
          'City': 'Istanbul',
          'Category': 'hotel',
          'Star Rating': 5,
          'Base Price Per Night': 200,
          'Currency': 'USD',
          'Amenities': 'WiFi, Pool, Spa, Restaurant',
          'Description': 'Luxury hotel in the heart of Istanbul',
          'Is Active': 'Yes'
        }
      ],
      guides: [
        {
          'Guide ID': '(Leave empty for new)',
          'Guide Name': 'Ahmet Yilmaz',
          'Guide Type': 'tour_guide',
          'Languages': 'English, Turkish, German',
          'Specialization': 'History',
          'Base Price Per Day': 100,
          'Base Price Per Hour': 80,
          'Base Price Half Day': 80,
          'Currency': 'USD',
          'Max Group Size': 15,
          'Cities': 'Istanbul, Ankara',
          'Description': 'Expert history guide with 10 years experience',
          'Is Active': 'Yes'
        }
      ],
      restaurants: [
        {
          'Restaurant ID': '(Leave empty for new)',
          'Restaurant Name': 'Ottoman Palace Restaurant',
          'City': 'Istanbul',
          'Cuisine Type': 'local',
          'Price Range': 'mid-range',
          'Base Breakfast Price': 10,
          'Base Lunch Price': 10,
          'Base Dinner Price': 10,
          'Currency': 'USD',
          'Specialties': 'Kebab, Mezze, Baklava',
          'Description': 'Traditional Ottoman cuisine',
          'Is Active': 'Yes'
        }
      ],
      transport: [
        {
          'Transport ID': '(Leave empty for new)',
          'Route Name': 'Istanbul Airport Transfer',
          'Type': 'private_transfer',
          'From': 'Istanbul Airport',
          'To': 'Sultanahmet',
          'Distance (km)': 25,
          'Duration (minutes)': 45,
          'Base Price': 50,
          'Price Per Person': '',
          'Currency': 'USD',
          'Min Passengers': 1,
          'Capacity': 4,
          'Vehicle Type': 'sedan',
          'Amenities': 'WiFi, AC, Water',
          'Description': 'Comfortable airport transfer',
          'Is Active': 'Yes'
        }
      ],
      additional: [
        {
          'Service ID': '(Leave empty for new)',
          'Service Name': 'Travel Insurance Premium',
          'Service Type': 'insurance',
          'Base Price': 50,
          'Price Type': 'per_person',
          'Currency': 'USD',
          'Description': 'Comprehensive travel insurance coverage',
          'Mandatory': 'No',
          'Included in Packages': 'No',
          'Is Active': 'Yes'
        }
      ]
    };

    // Define seasonal pricing templates for each category
    const pricingTemplates: Record<string, any[]> = {
      activities: [
        {
          'Price ID': '(Leave empty for new)',
          'Activity Name': 'Istanbul Full Day Tour',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price': 180,
          'Notes': 'Peak season pricing'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Activity Name': 'Istanbul Full Day Tour',
          'Season Name': 'Winter 2025',
          'Start Date': '2025-12-01',
          'End Date': '2026-02-28',
          'Price': 120,
          'Notes': 'Off-season discount'
        }
      ],
      accommodations: [
        {
          'Price ID': '(Leave empty for new)',
          'Hotel Name': 'Grand Hotel Istanbul',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price Per Night': 250,
          'Min Stay Nights': 2,
          'Notes': 'High season rates'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Hotel Name': 'Grand Hotel Istanbul',
          'Season Name': 'Winter 2025',
          'Start Date': '2025-12-01',
          'End Date': '2026-02-28',
          'Price Per Night': 150,
          'Min Stay Nights': 1,
          'Notes': 'Winter special'
        }
      ],
      guides: [
        {
          'Price ID': '(Leave empty for new)',
          'Guide Name': 'Ahmet Yilmaz',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price Per Day': 120,
          'Price Per Hour': 100,
          'Price Half Day': 100,
          'Notes': 'Peak season'
        }
      ],
      restaurants: [
        {
          'Price ID': '(Leave empty for new)',
          'Restaurant Name': 'Ottoman Palace Restaurant',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Breakfast Price': 12,
          'Lunch Price': 15,
          'Dinner Price': 20,
          'Notes': 'Summer menu prices'
        }
      ],
      transport: [
        {
          'Price ID': '(Leave empty for new)',
          'Route Name': 'Istanbul Airport Transfer',
          'Season Name': 'Summer 2025',
          'Vehicle Type': 'sedan',
          'Max Passengers': 4,
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Cost Per Day': '',
          'Cost Per Transfer': 60,
          'Notes': 'Peak season rate'
        }
      ],
      additional: [
        {
          'Price ID': '(Leave empty for new)',
          'Service Name': 'Travel Insurance Premium',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price': 60,
          'Notes': 'Summer coverage'
        }
      ]
    };

    const serviceData = serviceTemplates[category];
    const pricingData = pricingTemplates[category];

    if (!serviceData) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Create Services worksheet
    const servicesWorksheet = XLSX.utils.json_to_sheet(serviceData);
    const servicesColumnWidths = Object.keys(serviceData[0]).map(key => ({
      wch: Math.max(key.length, 20)
    }));
    servicesWorksheet['!cols'] = servicesColumnWidths;
    XLSX.utils.book_append_sheet(workbook, servicesWorksheet, 'Services');

    // Create Seasonal Pricing worksheet
    const pricingWorksheet = XLSX.utils.json_to_sheet(pricingData);
    const pricingColumnWidths = Object.keys(pricingData[0]).map(key => ({
      wch: Math.max(key.length, 20)
    }));
    pricingWorksheet['!cols'] = pricingColumnWidths;
    XLSX.utils.book_append_sheet(workbook, pricingWorksheet, 'Seasonal Pricing');

    // Add instructions sheet
    const instructions = [
      ['BULK IMPORT TEMPLATE - INSTRUCTIONS'],
      [''],
      ['This template has 2 sheets for importing services and seasonal pricing:'],
      [''],
      ['SHEET 1: SERVICES'],
      ['- Main service records with base pricing information'],
      ['- Delete example rows and add your own services'],
      ['- Leave "ID" columns empty for NEW services'],
      ['- Fill in ID columns to UPDATE existing services'],
      [''],
      ['SHEET 2: SEASONAL PRICING'],
      ['- Date-based pricing variations that override base prices'],
      ['- Must reference services by exact name (e.g., "Grand Hotel Istanbul")'],
      ['- Date format MUST be: YYYY-MM-DD (e.g., 2025-06-01)'],
      ['- Can have multiple seasonal prices for the same service'],
      ['- Leave "Price ID" empty for NEW seasonal prices'],
      [''],
      ['IMPORTANT RULES:'],
      ['1. Do NOT change column headers'],
      ['2. Service names must match EXACTLY between sheets'],
      ['3. Use "Yes" or "No" for boolean fields (Is Active, Mandatory, etc.)'],
      ['4. Numbers only for price fields (no currency symbols like $)'],
      ['5. For list fields (Amenities, Languages), separate with commas'],
      ['6. Dates must be YYYY-MM-DD format'],
      [''],
      ['HOW TO USE:'],
      ['Step 1: Fill in Services sheet with your hotels/activities/guides'],
      ['Step 2: Add seasonal pricing in Seasonal Pricing sheet'],
      ['Step 3: Make sure service names match exactly in both sheets'],
      ['Step 4: Save and upload the file'],
      [''],
      ['TIPS:'],
      ['- Start with Services sheet - seasonal pricing is optional'],
      ['- You can add seasonal pricing later by exporting, editing, and re-importing'],
      ['- Seasonal pricing overrides base prices for the date ranges'],
      ['- Make sure seasonal pricing date ranges do not overlap for same service'],
      [''],
      ['For help, contact support or check the documentation.']
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
        'Content-Disposition': `attachment; filename="${category}_import_template.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Failed to generate template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
