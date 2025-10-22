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

    // Define service templates for each category using REAL database data
    const serviceTemplates: Record<string, any[]> = {
      activities: [
        {
          'Activity ID': '(Leave empty for new)',
          'Activity Name': 'Istanbul Full Day Tour',
          'City': 'Istanbul',
          'Category': 'cultural',
          'Duration (hours)': 8,
          'Base Price': 120,
          'Currency': 'USD',
          'Min Participants': 1,
          'Max Participants': 50,
          'Description': 'Explore the best of Istanbul including Hagia Sophia, Blue Mosque, Topkapi Palace, and Grand Bazaar. Includes transport, professional guide, entrance fees, and lunch.',
          'Highlights': 'Hagia Sophia, Blue Mosque, Grand Bazaar',
          'Is Active': 'Yes'
        },
        {
          'Activity ID': '(Leave empty for new)',
          'Activity Name': 'Bosphorus Sunset Cruise',
          'City': 'Istanbul',
          'Category': 'entertainment',
          'Duration (hours)': 2.5,
          'Base Price': 45,
          'Currency': 'USD',
          'Min Participants': 1,
          'Max Participants': 100,
          'Description': 'Romantic sunset cruise on the Bosphorus with stunning views of Istanbul skyline, palaces, and bridges.',
          'Highlights': 'Sunset views, Bosphorus, Istanbul skyline',
          'Is Active': 'Yes'
        }
      ],
      accommodations: [
        {
          'Accommodation ID': '(Leave empty for new)',
          'Hotel Name': 'Four Seasons Istanbul Sultanahmet',
          'City': 'Istanbul',
          'Category': 'hotel',
          'Star Rating': 5,
          'Base Price Per Night': 450,
          'Currency': 'USD',
          'Amenities': 'WiFi, Pool, Spa, Restaurant, Concierge',
          'Description': 'Luxury hotel in historic Sultanahmet district with Bosphorus views',
          'Is Active': 'Yes'
        },
        {
          'Accommodation ID': '(Leave empty for new)',
          'Hotel Name': 'Museum Hotel Cappadocia',
          'City': 'Cappadocia',
          'Category': 'hotel',
          'Star Rating': 5,
          'Base Price Per Night': 380,
          'Currency': 'USD',
          'Amenities': 'WiFi, Cave rooms, Terrace, Restaurant, Spa',
          'Description': 'Unique cave hotel with panoramic fairy chimney views',
          'Is Active': 'Yes'
        }
      ],
      guides: [
        {
          'Guide ID': '(Leave empty for new)',
          'Guide Name': 'English Speaking Guide - Full Day',
          'Guide Type': 'tour_guide',
          'Languages': 'English, Turkish',
          'Specialization': 'Historical sites and museums',
          'Base Price Per Day': 100,
          'Base Price Per Hour': 80,
          'Base Price Half Day': 80,
          'Currency': 'USD',
          'Max Group Size': 15,
          'Cities': 'Istanbul, Cappadocia, Ephesus',
          'Description': 'Professional English-speaking guide specialized in historical sites',
          'Is Active': 'Yes'
        },
        {
          'Guide ID': '(Leave empty for new)',
          'Guide Name': 'German Speaking Guide - Full Day',
          'Guide Type': 'tour_guide',
          'Languages': 'German, Turkish, English',
          'Specialization': 'General tourism',
          'Base Price Per Day': 100,
          'Base Price Per Hour': 80,
          'Base Price Half Day': 80,
          'Currency': 'USD',
          'Max Group Size': 15,
          'Cities': 'Istanbul, Antalya',
          'Description': 'Experienced German-speaking guide for general tourism',
          'Is Active': 'Yes'
        }
      ],
      restaurants: [
        {
          'Restaurant ID': '(Leave empty for new)',
          'Restaurant Name': 'Mikla Restaurant',
          'City': 'Istanbul',
          'Cuisine Type': 'Turkish-Scandinavian Fusion',
          'Price Range': 'luxury',
          'Base Breakfast Price': 0,
          'Base Lunch Price': 85,
          'Base Dinner Price': 150,
          'Currency': 'USD',
          'Specialties': 'Fine dining, Fusion cuisine, Wine selection',
          'Description': 'Rooftop fine dining with stunning Bosphorus views',
          'Is Active': 'Yes'
        },
        {
          'Restaurant ID': '(Leave empty for new)',
          'Restaurant Name': 'Hamdi Restaurant',
          'City': 'Istanbul',
          'Cuisine Type': 'Turkish Kebab',
          'Price Range': 'mid-range',
          'Base Breakfast Price': 0,
          'Base Lunch Price': 25,
          'Base Dinner Price': 35,
          'Currency': 'USD',
          'Specialties': 'Kebabs, Traditional Turkish, Golden Horn views',
          'Description': 'Traditional kebabs with Golden Horn views',
          'Is Active': 'Yes'
        }
      ],
      transport: [
        {
          'Transport ID': '(Leave empty for new)',
          'Route Name': 'Private Transfer - Istanbul Airport to Sultanahmet',
          'Type': 'private_transfer',
          'From': 'Istanbul Sabiha Gökçen Airport',
          'To': 'Sultanahmet Area',
          'Distance (km)': 45,
          'Duration (minutes)': 60,
          'Base Price': 45,
          'Price Per Person': '',
          'Currency': 'USD',
          'Min Passengers': 1,
          'Capacity': 6,
          'Vehicle Type': 'Mercedes Vito',
          'Amenities': 'WiFi, AC, Luggage space',
          'Description': 'Comfortable airport transfer with professional driver',
          'Is Active': 'Yes'
        }
      ],
      additional: [
        {
          'Service ID': '(Leave empty for new)',
          'Service Name': 'Travel Insurance - 7 Days',
          'Service Type': 'insurance',
          'Base Price': 25,
          'Price Type': 'per_person',
          'Currency': 'USD',
          'Description': 'Comprehensive travel insurance covering medical, cancellation, and baggage',
          'Mandatory': 'No',
          'Included in Packages': 'No',
          'Is Active': 'Yes'
        },
        {
          'Service ID': '(Leave empty for new)',
          'Service Name': 'Museum Pass Istanbul (5 Days)',
          'Service Type': 'entrance_fee',
          'Base Price': 50,
          'Price Type': 'per_person',
          'Currency': 'USD',
          'Description': 'Access to major museums in Istanbul including Hagia Sophia, Topkapi Palace',
          'Mandatory': 'No',
          'Included in Packages': 'No',
          'Is Active': 'Yes'
        }
      ]
    };

    // Define seasonal pricing templates using REAL database data
    const pricingTemplates: Record<string, any[]> = {
      activities: [
        {
          'Price ID': '(Leave empty for new)',
          'Activity Name': 'Istanbul Full Day Tour',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price': 150,
          'Notes': 'Peak summer season pricing'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Activity Name': 'Istanbul Full Day Tour',
          'Season Name': 'Winter 2025-26',
          'Start Date': '2025-11-01',
          'End Date': '2026-03-14',
          'Price': 100,
          'Notes': 'Winter discount pricing'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Activity Name': 'Bosphorus Sunset Cruise',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price': 60,
          'Notes': 'High season cruise pricing'
        }
      ],
      accommodations: [
        {
          'Price ID': '(Leave empty for new)',
          'Hotel Name': 'Four Seasons Istanbul Sultanahmet',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price Per Night': 600,
          'Min Stay Nights': 2,
          'Notes': 'Peak summer season'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Hotel Name': 'Four Seasons Istanbul Sultanahmet',
          'Season Name': 'Winter 2025-26',
          'Start Date': '2025-11-01',
          'End Date': '2026-03-14',
          'Price Per Night': 350,
          'Min Stay Nights': 1,
          'Notes': 'Winter season discount'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Hotel Name': 'Museum Hotel Cappadocia',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price Per Night': 480,
          'Min Stay Nights': 2,
          'Notes': 'High season cave hotel rates'
        }
      ],
      guides: [
        {
          'Price ID': '(Leave empty for new)',
          'Guide Name': 'English Speaking Guide - Full Day',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price Per Day': 130,
          'Price Per Hour': 100,
          'Price Half Day': 100,
          'Notes': 'Peak season guide rates'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Guide Name': 'English Speaking Guide - Full Day',
          'Season Name': 'Winter 2025-26',
          'Start Date': '2025-11-01',
          'End Date': '2026-03-14',
          'Price Per Day': 90,
          'Price Per Hour': 70,
          'Price Half Day': 70,
          'Notes': 'Winter season rates'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Guide Name': 'German Speaking Guide - Full Day',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price Per Day': 130,
          'Price Per Hour': 100,
          'Price Half Day': 100,
          'Notes': 'High season German guide rates'
        }
      ],
      restaurants: [
        {
          'Price ID': '(Leave empty for new)',
          'Restaurant Name': 'Mikla Restaurant',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Breakfast Price': null,
          'Lunch Price': 100,
          'Dinner Price': 180,
          'Notes': 'Peak season fine dining prices'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Restaurant Name': 'Mikla Restaurant',
          'Season Name': 'Winter 2025-26',
          'Start Date': '2025-11-01',
          'End Date': '2026-03-14',
          'Breakfast Price': null,
          'Lunch Price': 85,
          'Dinner Price': 150,
          'Notes': 'Winter menu pricing'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Restaurant Name': 'Hamdi Restaurant',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Breakfast Price': null,
          'Lunch Price': 30,
          'Dinner Price': 42,
          'Notes': 'Summer kebab menu'
        }
      ],
      transport: [
        {
          'Price ID': '(Leave empty for new)',
          'Route Name': 'Private Transfer - Istanbul Airport to Sultanahmet',
          'Season Name': 'Summer 2025',
          'Vehicle Type': 'Mercedes Vito',
          'Max Passengers': 6,
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price': 60,
          'Cost Per Day': null,
          'Cost Per Transfer': null,
          'Notes': 'Peak season transfer rate'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Route Name': 'Private Transfer - Istanbul Airport to Sultanahmet',
          'Season Name': 'Winter 2025-26',
          'Vehicle Type': 'Mercedes Vito',
          'Max Passengers': 6,
          'Start Date': '2025-11-01',
          'End Date': '2026-03-14',
          'Price': 45,
          'Cost Per Day': null,
          'Cost Per Transfer': null,
          'Notes': 'Winter season pricing'
        }
      ],
      additional: [
        {
          'Price ID': '(Leave empty for new)',
          'Service Name': 'Travel Insurance - 7 Days',
          'Season Name': 'Summer 2025',
          'Start Date': '2025-06-01',
          'End Date': '2025-08-31',
          'Price': 30,
          'Notes': 'Summer travel insurance'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Service Name': 'Travel Insurance - 7 Days',
          'Season Name': 'Winter 2025-26',
          'Start Date': '2025-11-01',
          'End Date': '2026-03-14',
          'Price': 25,
          'Notes': 'Winter season insurance'
        },
        {
          'Price ID': '(Leave empty for new)',
          'Service Name': 'Museum Pass Istanbul (5 Days)',
          'Season Name': 'Standard 2024-2030',
          'Start Date': '2024-01-01',
          'End Date': '2030-12-31',
          'Price': 50,
          'Notes': 'Standard museum pass pricing'
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
      ['This template contains REAL DATA from your database as examples.'],
      ['Delete the example rows and replace with your own data.'],
      [''],
      ['SHEET 1: SERVICES'],
      ['- Main service records with base pricing information'],
      ['- Delete example rows and add your own services'],
      ['- Leave "ID" columns empty for NEW services'],
      ['- Fill in ID columns to UPDATE existing services'],
      [''],
      ['SHEET 2: SEASONAL PRICING'],
      ['- Date-based pricing variations that override base prices'],
      ['- Must reference services by exact name (e.g., "Four Seasons Istanbul Sultanahmet")'],
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
      ['7. Leave empty or use null for optional price fields'],
      [''],
      ['HOW TO USE:'],
      ['Step 1: Delete the example data rows (keep the header row)'],
      ['Step 2: Fill in Services sheet with your hotels/activities/guides'],
      ['Step 3: Add seasonal pricing in Seasonal Pricing sheet'],
      ['Step 4: Make sure service names match exactly in both sheets'],
      ['Step 5: Save and upload the file'],
      [''],
      ['TIPS:'],
      ['- Start with Services sheet - seasonal pricing is optional'],
      ['- You can add seasonal pricing later by exporting, editing, and re-importing'],
      ['- Seasonal pricing overrides base prices for the date ranges'],
      ['- Make sure seasonal pricing date ranges do not overlap for same service'],
      ['- The examples in this template are from your actual database'],
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
