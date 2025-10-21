import { NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15
    const { id } = await params;

    // Verify authentication
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

    // Fetch itinerary with operator information
    const itinerary: any = await queryOne(
      `SELECT i.*, o.company_name, o.logo_url
       FROM itineraries i
       LEFT JOIN operators o ON i.operator_id = o.id
       WHERE i.id = ? AND i.operator_id = ?`,
      [id, userData.operatorId]
    );

    if (!itinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedPreferences = itinerary.preferences
      ? JSON.parse(itinerary.preferences)
      : {};

    // Fetch pricing tiers
    const pricingTiers: any[] = await query(
      `SELECT * FROM pricing_tiers WHERE itinerary_id = ? ORDER BY min_pax`,
      [id]
    );

    // Fetch enriched service details from quote_expenses with full service data
    const quoteExpenses: any[] = await query(
      `SELECT
        qe.*,
        qd.day_number,
        qd.date as day_date,
        qd.city as day_city,
        qd.title as day_title,
        -- Accommodation details
        acc.name as acc_name,
        acc.address as acc_address,
        acc.city as acc_city,
        acc.star_rating as acc_star_rating,
        acc.amenities as acc_amenities,
        acc.images as acc_images,
        acc.location_lat as acc_lat,
        acc.location_lng as acc_lng,
        acc.phone as acc_phone,
        acc.description as acc_description,
        -- Activity details
        act.name as act_name,
        act.description as act_description,
        act.category as act_category,
        act.duration_hours as act_duration,
        act.meeting_point as act_meeting_point,
        act.images as act_images,
        act.location_lat as act_lat,
        act.location_lng as act_lng,
        act.city as act_city,
        -- Restaurant details
        rest.name as rest_name,
        rest.address as rest_address,
        rest.cuisine_type as rest_cuisine,
        NULL as rest_images,
        rest.location_lat as rest_lat,
        rest.location_lng as rest_lng,
        rest.phone as rest_phone,
        -- Guide details
        guide.name as guide_name,
        guide.languages as guide_languages,
        guide.specialization as guide_specialization,
        guide.phone as guide_phone,
        -- Transport details
        trans.name as trans_name,
        trans.type as trans_type,
        trans.vehicle_type as trans_vehicle_type,
        trans.capacity as trans_capacity
      FROM quote_expenses qe
      INNER JOIN quote_days qd ON qe.quote_day_id = qd.id
      LEFT JOIN accommodations acc ON COALESCE(qe.service_type, qe.category) = 'accommodation' AND qe.service_id = acc.id
      LEFT JOIN activities act ON COALESCE(qe.service_type, qe.category) = 'activity' AND qe.service_id = act.id
      LEFT JOIN operator_restaurants rest ON COALESCE(qe.service_type, qe.category) = 'restaurant' AND qe.service_id = rest.id
      LEFT JOIN operator_guide_services guide ON COALESCE(qe.service_type, qe.category) = 'guide' AND qe.service_id = guide.id
      LEFT JOIN operator_transport trans ON COALESCE(qe.service_type, qe.category) = 'transport' AND qe.service_id = trans.id
      WHERE qd.itinerary_id = ?
      ORDER BY qd.day_number, qe.created_at`,
      [id]
    );

    // Group expenses by day and enrich with full service data
    const enrichedDays: Record<number, any> = {};

    for (const expense of quoteExpenses) {
      const dayNum = expense.day_number;

      if (!enrichedDays[dayNum]) {
        enrichedDays[dayNum] = {
          dayNumber: dayNum,
          date: expense.day_date,
          city: expense.day_city,
          accommodations: [],
          activities: [],
          restaurants: [],
          guides: [],
          transports: []
        };
      }

      // Add accommodation with Google Places data
      const serviceType = expense.service_type || expense.category;

      if (serviceType === 'accommodation' && expense.acc_name) {
        enrichedDays[dayNum].accommodations.push({
          id: expense.service_id,
          name: expense.acc_name,
          address: expense.acc_address,
          city: expense.acc_city,
          starRating: expense.acc_star_rating,
          amenities: expense.acc_amenities ? JSON.parse(expense.acc_amenities) : [],
          images: expense.acc_images ? JSON.parse(expense.acc_images) : [],
          location: {
            lat: expense.acc_lat,
            lng: expense.acc_lng
          },
          phone: expense.acc_phone,
          description: expense.acc_description,
          pricePerNight: expense.price_per_person,
          nights: expense.quantity
        });
      }

      // Add activity with Google Places data
      if (serviceType === 'activity' && expense.act_name) {
        enrichedDays[dayNum].activities.push({
          id: expense.service_id,
          name: expense.act_name,
          description: expense.act_description,
          category: expense.act_category,
          duration: expense.act_duration,
          meetingPoint: expense.act_meeting_point,
          images: expense.act_images ? JSON.parse(expense.act_images) : [],
          location: {
            lat: expense.act_lat,
            lng: expense.act_lng
          },
          city: expense.act_city,
          pricePerPerson: expense.price_per_person
        });
      }

      // Add restaurant with Google Places data
      if (serviceType === 'restaurant' && expense.rest_name) {
        enrichedDays[dayNum].restaurants.push({
          id: expense.service_id,
          name: expense.rest_name,
          address: expense.rest_address,
          cuisineType: expense.rest_cuisine,
          images: expense.rest_images ? JSON.parse(expense.rest_images) : [],
          location: {
            lat: expense.rest_lat,
            lng: expense.rest_lng
          },
          phone: expense.rest_phone,
          pricePerPerson: expense.price_per_person
        });
      }

      // Add guide
      if (serviceType === 'guide' && expense.guide_name) {
        enrichedDays[dayNum].guides.push({
          id: expense.service_id,
          name: expense.guide_name,
          languages: expense.guide_languages ? JSON.parse(expense.guide_languages) : [],
          specialization: expense.guide_specialization,
          phone: expense.guide_phone,
          pricePerPerson: expense.price_per_person
        });
      }

      // Add transport
      if (serviceType === 'transport' && expense.trans_name) {
        enrichedDays[dayNum].transports.push({
          id: expense.service_id,
          name: expense.trans_name,
          type: expense.trans_type,
          vehicleType: expense.trans_vehicle_type,
          capacity: expense.trans_capacity,
          pricePerPerson: expense.price_per_person
        });
      }
    }

    const response = {
      ...itinerary,
      preferences: parsedPreferences,
      itineraryData: JSON.parse(itinerary.itinerary_data || '{}'),
      enrichedDays: Object.values(enrichedDays),
      interests: parsedPreferences?.interests || [],
      pricingTiers,
    };

    // Remove the raw JSON string field
    delete response.itinerary_data;

    return NextResponse.json({
      success: true,
      itinerary: response,
    });
  } catch (error: any) {
    console.error('Fetch itinerary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itinerary' },
      { status: 500 }
    );
  }
}
