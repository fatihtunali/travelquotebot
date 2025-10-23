import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

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

    if (!name || !email || !itinerary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
    return NextResponse.json(
      { error: 'Failed to save itinerary', details: error.message },
      { status: 500 }
    );
  }
}
