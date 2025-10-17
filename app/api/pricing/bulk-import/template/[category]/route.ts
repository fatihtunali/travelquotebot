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

    // Define templates for each category
    const templates: Record<string, any[]> = {
      activities: [
        {
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
        },
        {
          'Activity Name': 'Bosphorus Cruise',
          'City': 'Istanbul',
          'Category': 'nature',
          'Duration (hours)': 2,
          'Base Price': 50,
          'Currency': 'USD',
          'Min Participants': 1,
          'Max Participants': 50,
          'Description': 'Scenic cruise along the Bosphorus',
          'Highlights': 'Bosphorus Bridge, Dolmabahce Palace',
          'Is Active': 'Yes'
        }
      ],
      accommodations: [
        {
          'Hotel Name': 'Grand Hotel Istanbul',
          'City': 'Istanbul',
          'Category': 'hotel',
          'Star Rating': 5,
          'Base Price Per Night': 200,
          'Currency': 'USD',
          'Amenities': 'WiFi, Pool, Spa, Restaurant',
          'Description': 'Luxury hotel in the heart of Istanbul',
          'Is Active': 'Yes'
        },
        {
          'Hotel Name': 'Boutique Cappadocia',
          'City': 'Cappadocia',
          'Category': 'boutique',
          'Star Rating': 4,
          'Base Price Per Night': 150,
          'Currency': 'USD',
          'Amenities': 'WiFi, Breakfast, Cave Room',
          'Description': 'Unique cave hotel experience',
          'Is Active': 'Yes'
        }
      ],
      guides: [
        {
          'Guide Name': 'Ahmet Yilmaz',
          'Guide Type': 'tour_guide',
          'Languages': 'English, Turkish, German',
          'Specialization': 'History',
          'Price Per Day': 150,
          'Price Per Hour': 25,
          'Price Half Day': 80,
          'Currency': 'USD',
          'Max Group Size': 15,
          'Cities': 'Istanbul, Ankara',
          'Description': 'Expert history guide with 10 years experience',
          'Is Active': 'Yes'
        }
      ],
      restaurants: [
        {
          'Restaurant Name': 'Ottoman Palace Restaurant',
          'City': 'Istanbul',
          'Cuisine Type': 'local',
          'Price Range': 'expensive',
          'Breakfast Price': 25,
          'Lunch Price': 45,
          'Dinner Price': 65,
          'Specialties': 'Kebab, Mezze, Baklava',
          'Description': 'Traditional Ottoman cuisine',
          'Is Active': 'Yes'
        }
      ],
      transport: [
        {
          'Route Name': 'Istanbul Airport Transfer',
          'From': 'Istanbul Airport',
          'To': 'Sultanahmet',
          'Vehicle Type': 'sedan',
          'Capacity': 4,
          'Duration (minutes)': 45,
          'Base Price': 50,
          'Currency': 'USD',
          'Description': 'Comfortable airport transfer',
          'Is Active': 'Yes'
        }
      ],
      additional: [
        {
          'Service Name': 'Travel Insurance Premium',
          'Service Type': 'insurance',
          'Price': 50,
          'Price Type': 'per_person',
          'Currency': 'USD',
          'Description': 'Comprehensive travel insurance coverage',
          'Mandatory': 'No',
          'Included in Packages': 'Premium, Deluxe',
          'Is Active': 'Yes'
        }
      ]
    };

    const data = templates[category];
    if (!data) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Add instructions sheet
    const instructions = [
      ['INSTRUCTIONS FOR BULK IMPORT'],
      [''],
      ['1. Fill in your data in the "Data" sheet'],
      ['2. Do not change column headers'],
      ['3. Delete the example rows and add your own data'],
      ['4. Save the file and upload it back to the system'],
      [''],
      ['IMPORTANT NOTES:'],
      ['- Text fields: Enter as plain text'],
      ['- Yes/No fields: Use "Yes" or "No"'],
      ['- Price fields: Enter numbers only (no currency symbols)'],
      ['- Date fields: Use format YYYY-MM-DD'],
      ['- List fields (like Amenities): Separate items with commas'],
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
        'Content-Disposition': `attachment; filename="${category}_template.xlsx"`,
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
