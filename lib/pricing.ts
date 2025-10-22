import { query } from './db';

/**
 * Simplified Pricing System
 * Based on ruzgargucu's clean pricing model
 *
 * All pricing now includes:
 * - pp_dbl_rate: Per person double occupancy rate (adult price)
 * - single_supplement: Additional charge for single travelers
 * - child_0to2: Child rate 0-2.99 years
 * - child_3to5: Child rate 3-5.99 years
 * - child_6to11: Child rate 6-11.99 years
 * - start_date/end_date: Seasonal pricing periods
 */

export interface PricingResult {
  adult_price: number;
  single_supplement: number | null;
  child_0to2: number | null;
  child_3to5: number | null;
  child_6to11: number | null;
  currency: string;
  source: 'seasonal' | 'base';
  season_name?: string;
}

/**
 * Get accommodation pricing for a specific date
 */
export async function getAccommodationPrice(
  accommodationId: string,
  date: string // Format: YYYY-MM-DD
): Promise<PricingResult> {
  try {
    // First, try to get seasonal pricing
    const seasonalPricing = await query(
      `SELECT
        pp_dbl_rate,
        single_supplement,
        child_0to2,
        child_3to5,
        child_6to11,
        season_name
       FROM accommodation_pricing
       WHERE accommodation_id = ?
       AND (start_date IS NULL OR ? >= start_date)
       AND (end_date IS NULL OR ? <= end_date)
       ORDER BY start_date DESC
       LIMIT 1`,
      [accommodationId, date, date]
    );

    // Get accommodation details for currency and base price
    const accommodation = await query(
      'SELECT currency, base_price_per_night FROM accommodations WHERE id = ?',
      [accommodationId]
    );

    if (!accommodation || (accommodation as any[]).length === 0) {
      throw new Error('Accommodation not found');
    }

    const acc = (accommodation as any[])[0];
    const currency = acc.currency || 'USD';

    // Return seasonal pricing if available
    if (seasonalPricing && (seasonalPricing as any[]).length > 0) {
      const pricing = (seasonalPricing as any[])[0];
      return {
        adult_price: pricing.pp_dbl_rate,
        single_supplement: pricing.single_supplement,
        child_0to2: pricing.child_0to2,
        child_3to5: pricing.child_3to5,
        child_6to11: pricing.child_6to11,
        currency,
        source: 'seasonal',
        season_name: pricing.season_name,
      };
    }

    // Fall back to base price (no child pricing in base)
    return {
      adult_price: acc.base_price_per_night || 0,
      single_supplement: null,
      child_0to2: null,
      child_3to5: null,
      child_6to11: null,
      currency,
      source: 'base',
    };
  } catch (error) {
    console.error('Error getting accommodation price:', error);
    throw error;
  }
}

/**
 * Get activity pricing for a specific date
 */
export async function getActivityPrice(
  activityId: string,
  date: string
): Promise<PricingResult> {
  try {
    const seasonalPricing = await query(
      `SELECT
        pp_dbl_rate,
        single_supplement,
        child_0to2,
        child_3to5,
        child_6to11,
        season_name
       FROM activity_pricing
       WHERE activity_id = ?
       AND (start_date IS NULL OR ? >= start_date)
       AND (end_date IS NULL OR ? <= end_date)
       ORDER BY start_date DESC
       LIMIT 1`,
      [activityId, date, date]
    );

    const activity = await query(
      'SELECT currency, base_price FROM activities WHERE id = ?',
      [activityId]
    );

    if (!activity || (activity as any[]).length === 0) {
      throw new Error('Activity not found');
    }

    const act = (activity as any[])[0];
    const currency = act.currency || 'USD';

    if (seasonalPricing && (seasonalPricing as any[]).length > 0) {
      const pricing = (seasonalPricing as any[])[0];
      return {
        adult_price: pricing.pp_dbl_rate,
        single_supplement: pricing.single_supplement,
        child_0to2: pricing.child_0to2,
        child_3to5: pricing.child_3to5,
        child_6to11: pricing.child_6to11,
        currency,
        source: 'seasonal',
        season_name: pricing.season_name,
      };
    }

    return {
      adult_price: act.base_price || 0,
      single_supplement: null,
      child_0to2: null,
      child_3to5: null,
      child_6to11: null,
      currency,
      source: 'base',
    };
  } catch (error) {
    console.error('Error getting activity price:', error);
    throw error;
  }
}

/**
 * Get transport pricing for a specific date
 */
export async function getTransportPrice(
  transportId: string,
  date: string
): Promise<PricingResult & { price_per_vehicle?: number }> {
  try {
    const seasonalPricing = await query(
      `SELECT
        pp_dbl_rate,
        single_supplement,
        child_0to2,
        child_3to5,
        child_6to11,
        price_per_vehicle,
        season_name
       FROM transport_pricing
       WHERE transport_id = ?
       AND (start_date IS NULL OR ? >= start_date)
       AND (end_date IS NULL OR ? <= end_date)
       ORDER BY start_date DESC
       LIMIT 1`,
      [transportId, date, date]
    );

    const transport = await query(
      'SELECT currency, base_price FROM operator_transport WHERE id = ?',
      [transportId]
    );

    if (!transport || (transport as any[]).length === 0) {
      throw new Error('Transport not found');
    }

    const trans = (transport as any[])[0];
    const currency = trans.currency || 'USD';

    if (seasonalPricing && (seasonalPricing as any[]).length > 0) {
      const pricing = (seasonalPricing as any[])[0];
      return {
        adult_price: pricing.pp_dbl_rate,
        single_supplement: pricing.single_supplement,
        child_0to2: pricing.child_0to2,
        child_3to5: pricing.child_3to5,
        child_6to11: pricing.child_6to11,
        price_per_vehicle: pricing.price_per_vehicle,
        currency,
        source: 'seasonal',
        season_name: pricing.season_name,
      };
    }

    return {
      adult_price: trans.base_price || 0,
      single_supplement: null,
      child_0to2: null,
      child_3to5: null,
      child_6to11: null,
      currency,
      source: 'base',
    };
  } catch (error) {
    console.error('Error getting transport price:', error);
    throw error;
  }
}

/**
 * Get restaurant pricing for a specific date and menu option
 */
export async function getRestaurantPrice(
  restaurantId: string,
  menuOption: string,
  date: string
): Promise<PricingResult> {
  try {
    const seasonalPricing = await query(
      `SELECT
        pp_dbl_rate,
        single_supplement,
        child_0to2,
        child_3to5,
        child_6to11,
        season_name
       FROM restaurant_pricing
       WHERE restaurant_id = ?
       AND menu_option = ?
       AND (start_date IS NULL OR ? >= start_date)
       AND (end_date IS NULL OR ? <= end_date)
       ORDER BY start_date DESC
       LIMIT 1`,
      [restaurantId, menuOption, date, date]
    );

    const restaurant = await query(
      'SELECT id FROM operator_restaurants WHERE id = ?',
      [restaurantId]
    );

    if (!restaurant || (restaurant as any[]).length === 0) {
      throw new Error('Restaurant not found');
    }

    if (seasonalPricing && (seasonalPricing as any[]).length > 0) {
      const pricing = (seasonalPricing as any[])[0];
      return {
        adult_price: pricing.pp_dbl_rate,
        single_supplement: pricing.single_supplement,
        child_0to2: pricing.child_0to2,
        child_3to5: pricing.child_3to5,
        child_6to11: pricing.child_6to11,
        currency: 'USD',
        source: 'seasonal',
        season_name: pricing.season_name,
      };
    }

    // No base price for restaurants - must have pricing configured
    return {
      adult_price: 0,
      single_supplement: null,
      child_0to2: null,
      child_3to5: null,
      child_6to11: null,
      currency: 'USD',
      source: 'base',
    };
  } catch (error) {
    console.error('Error getting restaurant price:', error);
    throw error;
  }
}

/**
 * Get guide pricing for a specific date
 */
export async function getGuidePrice(
  guideId: string,
  date: string
): Promise<{ daily_rate: number; currency: string; source: 'seasonal' | 'base'; season_name?: string }> {
  try {
    const seasonalPricing = await query(
      `SELECT
        daily_rate,
        season_name
       FROM guide_pricing
       WHERE guide_id = ?
       AND (start_date IS NULL OR ? >= start_date)
       AND (end_date IS NULL OR ? <= end_date)
       ORDER BY start_date DESC
       LIMIT 1`,
      [guideId, date, date]
    );

    if (seasonalPricing && (seasonalPricing as any[]).length > 0) {
      const pricing = (seasonalPricing as any[])[0];
      return {
        daily_rate: pricing.daily_rate,
        currency: 'USD',
        source: 'seasonal',
        season_name: pricing.season_name,
      };
    }

    // Fall back to checking base rate in guide services table if it exists
    const guide = await query(
      'SELECT id FROM operator_guide_services WHERE id = ?',
      [guideId]
    );

    if (!guide || (guide as any[]).length === 0) {
      throw new Error('Guide not found');
    }

    return {
      daily_rate: 0,
      currency: 'USD',
      source: 'base',
    };
  } catch (error) {
    console.error('Error getting guide price:', error);
    throw error;
  }
}

/**
 * Calculate total price for travelers with different age groups
 */
export function calculateTotalPrice(
  pricing: PricingResult,
  travelers: {
    adults?: number;
    singles?: number;
    child_0to2?: number;
    child_3to5?: number;
    child_6to11?: number;
  }
): number {
  let total = 0;

  // Adults in double occupancy
  if (travelers.adults) {
    total += pricing.adult_price * travelers.adults;
  }

  // Singles (adult price + single supplement)
  if (travelers.singles && pricing.single_supplement) {
    total += (pricing.adult_price + pricing.single_supplement) * travelers.singles;
  }

  // Children
  if (travelers.child_0to2 && pricing.child_0to2) {
    total += pricing.child_0to2 * travelers.child_0to2;
  }

  if (travelers.child_3to5 && pricing.child_3to5) {
    total += pricing.child_3to5 * travelers.child_3to5;
  }

  if (travelers.child_6to11 && pricing.child_6to11) {
    total += pricing.child_6to11 * travelers.child_6to11;
  }

  return total;
}

/**
 * Get all services with pricing for an operator in a date range
 * Useful for trip planning and displaying available services
 */
export async function getServicesForOperatorWithPricing(
  operatorId: string,
  startDate: string,
  endDate: string
) {
  try {
    // Get accommodations with their pricing
    const accommodations = await query(
      `SELECT
        a.id, a.name, a.city, a.category, a.star_rating,
        a.base_price_per_night, a.currency, a.amenities, a.description,
        ap.season_name, ap.start_date, ap.end_date,
        ap.pp_dbl_rate, ap.single_supplement,
        ap.child_0to2, ap.child_3to5, ap.child_6to11
       FROM accommodations a
       LEFT JOIN accommodation_pricing ap
         ON a.id = ap.accommodation_id
         AND (ap.start_date IS NULL OR ap.start_date <= ?)
         AND (ap.end_date IS NULL OR ap.end_date >= ?)
       WHERE a.operator_id = ? AND a.is_active = 1`,
      [endDate, startDate, operatorId]
    );

    // Get activities with pricing
    const activities = await query(
      `SELECT
        a.id, a.name, a.city, a.category, a.duration_hours,
        a.base_price, a.currency, a.min_participants, a.max_participants,
        a.description, a.highlights,
        ap.season_name, ap.start_date, ap.end_date,
        ap.pp_dbl_rate, ap.single_supplement,
        ap.child_0to2, ap.child_3to5, ap.child_6to11
       FROM activities a
       LEFT JOIN activity_pricing ap
         ON a.id = ap.activity_id
         AND (ap.start_date IS NULL OR ap.start_date <= ?)
         AND (ap.end_date IS NULL OR ap.end_date >= ?)
       WHERE a.operator_id = ? AND a.is_active = 1`,
      [endDate, startDate, operatorId]
    );

    // Get transport with pricing
    const transport = await query(
      `SELECT
        t.id, t.name, t.type, t.from_location, t.to_location,
        t.base_price, t.currency, t.vehicle_type, t.capacity,
        tp.season_name, tp.start_date, tp.end_date,
        tp.pp_dbl_rate, tp.single_supplement,
        tp.child_0to2, tp.child_3to5, tp.child_6to11,
        tp.price_per_vehicle
       FROM operator_transport t
       LEFT JOIN transport_pricing tp
         ON t.id = tp.transport_id
         AND (tp.start_date IS NULL OR tp.start_date <= ?)
         AND (tp.end_date IS NULL OR tp.end_date >= ?)
       WHERE t.operator_id = ? AND t.is_active = 1`,
      [endDate, startDate, operatorId]
    );

    return {
      accommodations: (accommodations as any[]).map(acc => ({
        ...acc,
        amenities: acc.amenities ? JSON.parse(acc.amenities) : null,
        effectivePrice: acc.pp_dbl_rate || acc.base_price_per_night,
        priceSource: acc.pp_dbl_rate ? 'seasonal' : 'base',
      })),
      activities: (activities as any[]).map(act => ({
        ...act,
        highlights: act.highlights ? JSON.parse(act.highlights) : null,
        effectivePrice: act.pp_dbl_rate || act.base_price,
        priceSource: act.pp_dbl_rate ? 'seasonal' : 'base',
      })),
      transport: (transport as any[]).map(trans => ({
        ...trans,
        effectivePrice: trans.pp_dbl_rate || trans.base_price,
        priceSource: trans.pp_dbl_rate ? 'seasonal' : 'base',
      })),
    };
  } catch (error) {
    console.error('Error getting services with pricing:', error);
    throw error;
  }
}
