import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { validateCustomerInfo, validators, sanitizeText } from '@/lib/security';

interface CityNight {
  city: string;
  nights: number;
}

// POST - Save itinerary with contact info
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      destination,
      city_nights,
      start_date,
      adults,
      children,
      hotel_category,
      tour_type,
      special_requests,
      itinerary,
      total_price,
      price_per_person,
      action_type = 'save' // 'save' or 'book'
    } = body;

    // Validate customer info
    const customerValidation = validateCustomerInfo({
      customer_name: name,
      customer_email: email,
      customer_phone: phone
    });

    if (!customerValidation.valid) {
      return NextResponse.json({
        error: 'Invalid customer information',
        details: customerValidation.errors
      }, { status: 400 });
    }

    if (!itinerary) {
      return NextResponse.json({ error: 'Missing itinerary data' }, { status: 400 });
    }

    // Validate action_type
    const validActions = ['save', 'book'];
    if (!validActions.includes(action_type)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    // Validate numeric inputs
    if (!validators.positiveInteger(adults, 1, 50)) {
      return NextResponse.json({ error: 'Invalid adults count' }, { status: 400 });
    }

    if (children && !validators.positiveInteger(children, 0, 50)) {
      return NextResponse.json({ error: 'Invalid children count' }, { status: 400 });
    }

    // Calculate end date
    const totalNights = city_nights.reduce((sum: number, cn: CityNight) => sum + cn.nights, 0);
    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + totalNights);

    // Save to database
    const orgId = 1; // Default organization

    // Set status based on action type
    // 'saved' = user just wants to save for later
    // 'booking_requested' = user wants to book
    const status = action_type === 'book' ? 'booking_requested' : 'saved';

    const [result]: any = await pool.query(
      `INSERT INTO customer_itineraries (
        organization_id,
        customer_name,
        customer_email,
        customer_phone,
        destination,
        city_nights,
        start_date,
        end_date,
        adults,
        children,
        hotel_category,
        tour_type,
        special_requests,
        itinerary_data,
        total_price,
        price_per_person,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orgId,
        name,
        email,
        phone || null,
        destination,
        JSON.stringify(city_nights),
        start_date,
        endDate.toISOString().split('T')[0],
        adults,
        children,
        hotel_category,
        tour_type,
        special_requests || null,
        JSON.stringify(itinerary),
        total_price,
        price_per_person,
        status
      ]
    );

    const itineraryId = result.insertId;

    console.log(`✨ Customer itinerary ${action_type === 'book' ? 'booking request' : 'saved'}: ${itineraryId} for ${name} (${email})`);

    const message = action_type === 'book'
      ? 'Your booking request has been saved! We will contact you within 24 hours.'
      : 'Your itinerary has been saved! We\'ll email you a copy and our team will reach out to help plan your trip.';

    return NextResponse.json({
      success: true,
      itinerary_id: itineraryId,
      message
    });

  } catch (error: any) {
    console.error('Error saving itinerary:', error);
    // H6: Don't leak error details
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
