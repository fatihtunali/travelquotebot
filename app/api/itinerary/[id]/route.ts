import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch saved customer itinerary by ID or UUID (PUBLIC - uses UUID for security)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // C3: Support both UUID (secure) and numeric ID (legacy)
    // Check if it's a UUID format (8-4-4-4-12 hex characters)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = isUUID
      ? 'SELECT * FROM customer_itineraries WHERE uuid = ? LIMIT 1'
      : 'SELECT * FROM customer_itineraries WHERE id = ? LIMIT 1';

    const [itineraries]: any = await pool.query(query, [id]);

    if (!itineraries || itineraries.length === 0) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    const itinerary = itineraries[0];

    // H7: Add JSON.parse error handling
    try {
      if (itinerary.city_nights && typeof itinerary.city_nights === 'string') {
        itinerary.city_nights = JSON.parse(itinerary.city_nights);
      }
    } catch (e) {
      console.error('Failed to parse city_nights JSON:', e);
      itinerary.city_nights = [];
    }

    try {
      if (itinerary.itinerary_data && typeof itinerary.itinerary_data === 'string') {
        itinerary.itinerary_data = JSON.parse(itinerary.itinerary_data);
      }
    } catch (e) {
      console.error('Failed to parse itinerary_data JSON:', e);
      itinerary.itinerary_data = null;
    }

    // Extract unique hotel IDs from the itinerary
    const hotelIds: number[] = [];
    if (itinerary.itinerary_data && itinerary.itinerary_data.days) {
      itinerary.itinerary_data.days.forEach((day: any) => {
        if (day.items) {
          day.items.forEach((item: any) => {
            if (item.type === 'hotel' && item.hotel_id && !hotelIds.includes(item.hotel_id)) {
              hotelIds.push(item.hotel_id);
            }
          });
        }
      });
    }

    // Fetch full hotel details
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

    // Extract unique tour IDs used in the itinerary
    const tourIds: number[] = [];
    if (itinerary.itinerary_data && itinerary.itinerary_data.days) {
      itinerary.itinerary_data.days.forEach((day: any) => {
        if (day.items) {
          day.items.forEach((item: any) => {
            if (item.type === 'tour' && item.tour_id && !tourIds.includes(item.tour_id)) {
              tourIds.push(item.tour_id);
            }
          });
        }
      });
    }

    // Fetch full tour details with images for sightseeing gallery
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

    // Fetch organization details for white-label branding
    let organization = null;
    if (itinerary.organization_id) {
      const [orgData]: any = await pool.query(
        `SELECT name, email, phone, website, logo_url
         FROM organizations
         WHERE id = ?`,
        [itinerary.organization_id]
      );
      organization = orgData[0] || null;
    }

    // Add hotels, tours, and organization to response
    itinerary.hotels_used = hotelDetails;
    itinerary.tours_visited = tourDetails;
    itinerary.organization = organization;

    return NextResponse.json(itinerary);

  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
