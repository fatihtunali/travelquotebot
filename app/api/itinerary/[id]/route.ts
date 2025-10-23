import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch saved customer itinerary by ID (PUBLIC)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [itineraries]: any = await pool.query(
      `SELECT * FROM customer_itineraries WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!itineraries || itineraries.length === 0) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    const itinerary = itineraries[0];

    // Parse JSON fields
    if (itinerary.city_nights && typeof itinerary.city_nights === 'string') {
      itinerary.city_nights = JSON.parse(itinerary.city_nights);
    }

    if (itinerary.itinerary_data && typeof itinerary.itinerary_data === 'string') {
      itinerary.itinerary_data = JSON.parse(itinerary.itinerary_data);
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

    // Add hotels and tours to response
    itinerary.hotels_used = hotelDetails;
    itinerary.tours_visited = tourDetails;

    return NextResponse.json(itinerary);

  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itinerary' },
      { status: 500 }
    );
  }
}
