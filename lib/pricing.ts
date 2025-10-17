import { query } from './db';

/**
 * Get the price for an accommodation on a specific date
 * Returns seasonal pricing if available, otherwise returns base price
 */
export async function getAccommodationPrice(
  accommodationId: string,
  date: string // Format: YYYY-MM-DD
): Promise<{
  price: number;
  currency: string;
  source: 'seasonal' | 'base';
  seasonName?: string;
  minStayNights?: number;
}> {
  try {
    // First, fetch all price variations for this accommodation
    const variations = await query(
      `SELECT season_name, start_date, end_date, price_per_night, min_stay_nights
       FROM accommodation_price_variations
       WHERE accommodation_id = ?
       AND ? BETWEEN start_date AND end_date
       ORDER BY start_date DESC
       LIMIT 1`,
      [accommodationId, date]
    );

    if (variations && (variations as any[]).length > 0) {
      const variation = (variations as any[])[0];
      // Get currency from base accommodation
      const accommodation = await query(
        'SELECT currency FROM accommodations WHERE id = ?',
        [accommodationId]
      );
      const currency = accommodation && (accommodation as any[]).length > 0
        ? (accommodation as any[])[0].currency
        : 'USD';

      return {
        price: variation.price_per_night,
        currency,
        source: 'seasonal',
        seasonName: variation.season_name,
        minStayNights: variation.min_stay_nights,
      };
    }

    // No seasonal pricing found, return base price
    const accommodation = await query(
      'SELECT base_price_per_night, currency FROM accommodations WHERE id = ?',
      [accommodationId]
    );

    if (!accommodation || (accommodation as any[]).length === 0) {
      throw new Error('Accommodation not found');
    }

    const acc = (accommodation as any[])[0];
    return {
      price: acc.base_price_per_night,
      currency: acc.currency || 'USD',
      source: 'base',
    };
  } catch (error) {
    console.error('Error getting accommodation price:', error);
    throw error;
  }
}

/**
 * Get the price for an activity on a specific date
 */
export async function getActivityPrice(
  activityId: string,
  date: string
): Promise<{
  price: number;
  currency: string;
  source: 'seasonal' | 'base';
  seasonName?: string;
}> {
  try {
    const variations = await query(
      `SELECT season_name, start_date, end_date, price
       FROM activity_price_variations
       WHERE activity_id = ?
       AND ? BETWEEN start_date AND end_date
       ORDER BY start_date DESC
       LIMIT 1`,
      [activityId, date]
    );

    if (variations && (variations as any[]).length > 0) {
      const variation = (variations as any[])[0];
      const activity = await query(
        'SELECT currency FROM activities WHERE id = ?',
        [activityId]
      );
      const currency = activity && (activity as any[]).length > 0
        ? (activity as any[])[0].currency
        : 'USD';

      return {
        price: variation.price,
        currency,
        source: 'seasonal',
        seasonName: variation.season_name,
      };
    }

    const activity = await query(
      'SELECT base_price, currency FROM activities WHERE id = ?',
      [activityId]
    );

    if (!activity || (activity as any[]).length === 0) {
      throw new Error('Activity not found');
    }

    const act = (activity as any[])[0];
    return {
      price: act.base_price,
      currency: act.currency || 'USD',
      source: 'base',
    };
  } catch (error) {
    console.error('Error getting activity price:', error);
    throw error;
  }
}

/**
 * Get the price for a transport service on a specific date
 */
export async function getTransportPrice(
  transportId: string,
  date: string
): Promise<{
  price: number;
  currency: string;
  source: 'seasonal' | 'base';
  seasonName?: string;
}> {
  try {
    const variations = await query(
      `SELECT season_name, start_date, end_date, price
       FROM transport_price_variations
       WHERE transport_id = ?
       AND ? BETWEEN start_date AND end_date
       ORDER BY start_date DESC
       LIMIT 1`,
      [transportId, date]
    );

    if (variations && (variations as any[]).length > 0) {
      const variation = (variations as any[])[0];
      const transport = await query(
        'SELECT currency FROM operator_transport WHERE id = ?',
        [transportId]
      );
      const currency = transport && (transport as any[]).length > 0
        ? (transport as any[])[0].currency
        : 'USD';

      return {
        price: variation.price,
        currency,
        source: 'seasonal',
        seasonName: variation.season_name,
      };
    }

    const transport = await query(
      'SELECT base_price, currency FROM operator_transport WHERE id = ?',
      [transportId]
    );

    if (!transport || (transport as any[]).length === 0) {
      throw new Error('Transport not found');
    }

    const trans = (transport as any[])[0];
    return {
      price: trans.base_price,
      currency: trans.currency || 'USD',
      source: 'base',
    };
  } catch (error) {
    console.error('Error getting transport price:', error);
    throw error;
  }
}

/**
 * Get all pricing details for services in date range
 * This is useful for trip planning where you need prices across multiple dates
 */
export async function getServicesForOperatorWithPricing(
  operatorId: string,
  startDate: string,
  endDate: string
) {
  try {
    // Get accommodations with their pricing for the date range
    const accommodations = await query(
      `SELECT
        a.id, a.name, a.city, a.category, a.star_rating,
        a.base_price_per_night, a.currency, a.amenities, a.description,
        apv.season_name, apv.start_date, apv.end_date,
        apv.price_per_night as seasonal_price, apv.min_stay_nights
       FROM accommodations a
       LEFT JOIN accommodation_price_variations apv
         ON a.id = apv.accommodation_id
         AND apv.start_date <= ? AND apv.end_date >= ?
       WHERE a.operator_id = ? AND a.is_active = 1`,
      [endDate, startDate, operatorId]
    );

    // Get activities with their pricing
    const activities = await query(
      `SELECT
        a.id, a.name, a.city, a.category, a.duration_hours,
        a.base_price, a.currency, a.min_participants, a.max_participants,
        a.description, a.highlights,
        apv.season_name, apv.start_date, apv.end_date,
        apv.price as seasonal_price
       FROM activities a
       LEFT JOIN activity_price_variations apv
         ON a.id = apv.activity_id
         AND apv.start_date <= ? AND apv.end_date >= ?
       WHERE a.operator_id = ? AND a.is_active = 1`,
      [endDate, startDate, operatorId]
    );

    // Get transport with pricing
    const transport = await query(
      `SELECT
        t.id, t.name, t.type, t.from_location, t.to_location,
        t.base_price, t.currency, t.vehicle_type, t.capacity,
        tpv.season_name, tpv.start_date, tpv.end_date,
        tpv.price as seasonal_price
       FROM operator_transport t
       LEFT JOIN transport_price_variations tpv
         ON t.id = tpv.transport_id
         AND tpv.start_date <= ? AND tpv.end_date >= ?
       WHERE t.operator_id = ? AND t.is_active = 1`,
      [endDate, startDate, operatorId]
    );

    return {
      accommodations: (accommodations as any[]).map(acc => ({
        ...acc,
        amenities: acc.amenities ? JSON.parse(acc.amenities) : null,
        effectivePrice: acc.seasonal_price || acc.base_price_per_night,
        priceSource: acc.seasonal_price ? 'seasonal' : 'base',
      })),
      activities: (activities as any[]).map(act => ({
        ...act,
        highlights: act.highlights ? JSON.parse(act.highlights) : null,
        effectivePrice: act.seasonal_price || act.base_price,
        priceSource: act.seasonal_price ? 'seasonal' : 'base',
      })),
      transport: (transport as any[]).map(trans => ({
        ...trans,
        effectivePrice: trans.seasonal_price || trans.base_price,
        priceSource: trans.seasonal_price ? 'seasonal' : 'base',
      })),
    };
  } catch (error) {
    console.error('Error getting services with pricing:', error);
    throw error;
  }
}
