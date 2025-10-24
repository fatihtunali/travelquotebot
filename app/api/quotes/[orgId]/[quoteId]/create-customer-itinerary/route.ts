import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// POST - Create customer-facing itinerary from quote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; quoteId: string }> }
) {
  try {
    const { orgId, quoteId } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch quote data
    const [quotes]: any = await pool.query(
      `SELECT * FROM quotes WHERE id = ? AND organization_id = ?`,
      [quoteId, orgId]
    );

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const quote = quotes[0];

    // Parse itinerary JSON (might be string or already parsed object)
    let itinerary = null;
    if (quote.itinerary) {
      if (typeof quote.itinerary === 'string') {
        try {
          itinerary = JSON.parse(quote.itinerary);
        } catch (e) {
          return NextResponse.json({ error: 'Invalid itinerary data' }, { status: 400 });
        }
      } else if (typeof quote.itinerary === 'object') {
        // Already parsed by MySQL driver
        itinerary = quote.itinerary;
      }
    }

    console.log('Itinerary data:', itinerary);

    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      return NextResponse.json({
        error: 'No itinerary found in quote. Please ensure the quote has itinerary data.',
        debug: {
          hasItinerary: !!quote.itinerary,
          itineraryType: typeof quote.itinerary,
          hasDays: itinerary?.days !== undefined,
          daysLength: itinerary?.days?.length || 0
        }
      }, { status: 400 });
    }

    // Parse city_nights if it exists (might be string or already parsed object)
    let cityNights = [];
    if (quote.city_nights) {
      if (typeof quote.city_nights === 'string') {
        try {
          cityNights = JSON.parse(quote.city_nights);
        } catch (e) {
          console.error('Failed to parse city_nights:', e);
        }
      } else if (Array.isArray(quote.city_nights)) {
        // Already parsed by MySQL driver
        cityNights = quote.city_nights;
      }
    }

    // Calculate price per person
    const totalPeople = (quote.adults || 0) + (quote.children || 0);
    const pricePerPerson = totalPeople > 0 ? quote.total_price / totalPeople : 0;

    // Extract hotel IDs from itinerary
    const hotelIds: number[] = [];
    if (itinerary.days) {
      itinerary.days.forEach((day: any) => {
        if (day.items) {
          day.items.forEach((item: any) => {
            if (item.type === 'hotel') {
              // Try both hotel_id and id fields
              const hotelId = item.hotel_id || item.id;
              if (hotelId && !hotelIds.includes(hotelId)) {
                hotelIds.push(hotelId);
              }
            }
          });
        }
      });
    }
    console.log('Extracted hotel IDs:', hotelIds);

    // Fetch hotel details
    let hotelDetails: any[] = [];
    if (hotelIds.length > 0) {
      const hotelPlaceholders = hotelIds.map(() => '?').join(',');
      const [hotelData]: any = await pool.query(
        `SELECT
          h.id,
          h.hotel_name,
          h.city,
          h.star_rating,
          h.rating as google_rating,
          h.photo_url_1 as image_url,
          h.latitude,
          h.longitude,
          h.google_place_id
        FROM hotels h
        WHERE h.id IN (${hotelPlaceholders})
        ORDER BY h.city`,
        hotelIds
      );
      hotelDetails = hotelData;
    }

    // Extract tour IDs from itinerary
    const tourIds: number[] = [];
    if (itinerary.days) {
      itinerary.days.forEach((day: any) => {
        if (day.items) {
          day.items.forEach((item: any) => {
            if (item.type === 'tour') {
              // Try both tour_id and id fields
              const tourId = item.tour_id || item.id;
              if (tourId && !tourIds.includes(tourId)) {
                tourIds.push(tourId);
              }
            }
          });
        }
      });
    }
    console.log('Extracted tour IDs:', tourIds);

    // Fetch tour details
    let tourDetails: any[] = [];
    if (tourIds.length > 0) {
      const tourPlaceholders = tourIds.map(() => '?').join(',');
      const [tourData]: any = await pool.query(
        `SELECT
          t.id,
          t.tour_name,
          t.city,
          t.description,
          t.photo_url_1,
          t.photo_url_2,
          t.photo_url_3,
          t.google_place_id
        FROM tours t
        WHERE t.id IN (${tourPlaceholders})
        ORDER BY t.city`,
        tourIds
      );
      tourDetails = tourData;
    }

    // Create customer itinerary (source = 'manual' for operator-created)
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
        status,
        source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'manual')`,
      [
        orgId,
        quote.customer_name,
        quote.customer_email,
        quote.customer_phone || null,
        quote.destination,
        JSON.stringify(cityNights),
        quote.start_date,
        quote.end_date,
        quote.adults,
        quote.children,
        null, // hotel_category - not stored in quotes
        null, // tour_type - not stored in quotes
        null, // special_requests - not stored in quotes
        JSON.stringify({
          days: itinerary.days,
          hotels_used: hotelDetails,
          tours_visited: tourDetails
        }),
        quote.total_price,
        pricePerPerson
      ]
    );

    const itineraryId = result.insertId;

    // Fetch the UUID that was auto-generated by the trigger
    const [newItinerary]: any = await pool.query(
      'SELECT uuid FROM customer_itineraries WHERE id = ?',
      [itineraryId]
    );

    const uuid = newItinerary[0]?.uuid;

    if (!uuid) {
      console.error('Failed to retrieve UUID for new itinerary');
      return NextResponse.json({ error: 'Failed to create itinerary' }, { status: 500 });
    }

    // Use UUID in the URL for security and uniqueness
    const itineraryUrl = `/itinerary/${uuid}`;
    const followUpNote = `Customer itinerary created: ${itineraryUrl}`;

    await pool.query(
      `UPDATE quotes
       SET status = 'sent',
           sent_at = NOW(),
           follow_up_notes = CONCAT(IFNULL(follow_up_notes, ''), '\n', ?)
       WHERE id = ? AND organization_id = ?`,
      [followUpNote, quoteId, orgId]
    );

    console.log(`✅ Customer itinerary created from quote ${quoteId}: UUID ${uuid}`);
    console.log(`✅ Quote status updated to 'sent' for follow-up tracking`);

    return NextResponse.json({
      success: true,
      itinerary_id: itineraryId,
      uuid: uuid,
      url: itineraryUrl
    });

  } catch (error: any) {
    console.error('Error creating customer itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to create customer itinerary', details: error.message },
      { status: 500 }
    );
  }
}
