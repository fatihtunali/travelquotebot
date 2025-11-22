/**
 * Carbon Footprint Calculator using Climatiq API
 *
 * Methodology: GHG Protocol, ISO 14064 compliant
 * Data sources: ICAO, IATA RP 1726, DEFRA, Cornell CHSB
 *
 * All emissions returned in kg CO2e (Carbon Dioxide Equivalent)
 */

const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY;
const CLIMATIQ_BASE_URL = 'https://api.climatiq.io';

// Turkish city to IATA airport code mapping
const CITY_TO_AIRPORT: Record<string, string> = {
  'istanbul': 'IST',
  'ankara': 'ESB',
  'izmir': 'ADB',
  'antalya': 'AYT',
  'cappadocia': 'NAV',
  'nevsehir': 'NAV',
  'goreme': 'NAV',
  'urgup': 'NAV',
  'bodrum': 'BJV',
  'dalaman': 'DLM',
  'fethiye': 'DLM',
  'trabzon': 'TZX',
  'gaziantep': 'GZT',
  'adana': 'ADA',
  'kayseri': 'ASR',
  'konya': 'KYA',
  'denizli': 'DNZ',
  'pamukkale': 'DNZ',
  'samsun': 'SZF',
  'van': 'VAN',
  'diyarbakir': 'DIY',
  'erzurum': 'ERZ',
  'mardin': 'MQM',
  'sanliurfa': 'GNY',
};

export interface CarbonEmission {
  category: string;
  description: string;
  co2e_kg: number;
  source: string;
}

export interface CarbonFootprintResult {
  flights: CarbonEmission[];
  vehicles: CarbonEmission[];
  hotels: CarbonEmission[];
  total_co2e_kg: number;
  per_person_kg: number;
  offset_cost_eur: number;
  methodology: string;
  disclaimer: string;
}

/**
 * Calculate flight emissions using Climatiq API
 */
export async function calculateFlightEmissions(
  origin: string,
  destination: string,
  passengers: number = 1,
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first' = 'economy'
): Promise<CarbonEmission | null> {
  if (!CLIMATIQ_API_KEY) {
    console.error('CLIMATIQ_API_KEY not configured');
    return null;
  }

  // Convert city names to airport codes
  const originCode = CITY_TO_AIRPORT[origin.toLowerCase()] || origin.toUpperCase();
  const destCode = CITY_TO_AIRPORT[destination.toLowerCase()] || destination.toUpperCase();

  try {
    const response = await fetch(`${CLIMATIQ_BASE_URL}/travel/v1-preview1/flights`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLIMATIQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        legs: [
          {
            from: originCode,
            to: destCode,
            passengers: passengers,
            class: cabinClass
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Climatiq flight API error:', error);
      return null;
    }

    const data = await response.json();

    return {
      category: 'flight',
      description: `${origin} → ${destination} (${passengers} pax)`,
      co2e_kg: data.co2e || 0,
      source: 'ICAO/Climatiq'
    };
  } catch (error) {
    console.error('Error calculating flight emissions:', error);
    return null;
  }
}

/**
 * Calculate vehicle/transfer emissions
 * Using DEFRA emission factors via Climatiq
 */
export async function calculateVehicleEmissions(
  distanceKm: number,
  vehicleType: 'car' | 'van' | 'bus' | 'minibus' = 'car',
  passengers: number = 1
): Promise<CarbonEmission | null> {
  if (!CLIMATIQ_API_KEY) {
    console.error('CLIMATIQ_API_KEY not configured');
    return null;
  }

  // Emission factors per km (kg CO2e) - based on DEFRA 2024
  const emissionFactors: Record<string, string> = {
    'car': 'passenger_vehicle-vehicle_type_car-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na',
    'van': 'passenger_vehicle-vehicle_type_van-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na',
    'bus': 'passenger_vehicle-vehicle_type_bus-fuel_source_na-distance_na-vehicle_age_na',
    'minibus': 'passenger_vehicle-vehicle_type_van-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na'
  };

  try {
    const response = await fetch(`${CLIMATIQ_BASE_URL}/estimate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLIMATIQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emission_factor: {
          activity_id: emissionFactors[vehicleType],
          data_version: '^1'
        },
        parameters: {
          distance: distanceKm,
          distance_unit: 'km'
        }
      })
    });

    if (!response.ok) {
      // Fallback to simple calculation if API fails
      const fallbackEmission = distanceKm * 0.21; // Average car emission factor
      return {
        category: 'vehicle',
        description: `${vehicleType} transfer (${distanceKm} km)`,
        co2e_kg: fallbackEmission,
        source: 'DEFRA estimate'
      };
    }

    const data = await response.json();

    return {
      category: 'vehicle',
      description: `${vehicleType} transfer (${distanceKm} km)`,
      co2e_kg: data.co2e || 0,
      source: 'DEFRA/Climatiq'
    };
  } catch (error) {
    console.error('Error calculating vehicle emissions:', error);
    // Fallback calculation
    return {
      category: 'vehicle',
      description: `${vehicleType} transfer (${distanceKm} km)`,
      co2e_kg: distanceKm * 0.21,
      source: 'DEFRA estimate'
    };
  }
}

/**
 * Calculate hotel stay emissions
 * Based on Cornell Hotel Sustainability Benchmarking Index
 */
export async function calculateHotelEmissions(
  nights: number,
  starRating: number = 4,
  country: string = 'TR'
): Promise<CarbonEmission | null> {
  if (!CLIMATIQ_API_KEY) {
    console.error('CLIMATIQ_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch(`${CLIMATIQ_BASE_URL}/estimate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLIMATIQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emission_factor: {
          activity_id: 'accommodation_type_hotel_stay',
          data_version: '^1'
        },
        parameters: {
          number: nights
        }
      })
    });

    if (!response.ok) {
      // Fallback based on Cornell CHSB average
      // Average hotel: ~12 kg CO2e per night
      const fallbackEmission = nights * 12 * (starRating / 4);
      return {
        category: 'hotel',
        description: `${starRating}-star hotel (${nights} nights)`,
        co2e_kg: fallbackEmission,
        source: 'Cornell CHSB estimate'
      };
    }

    const data = await response.json();

    return {
      category: 'hotel',
      description: `${starRating}-star hotel (${nights} nights)`,
      co2e_kg: data.co2e || 0,
      source: 'Cornell CHSB/Climatiq'
    };
  } catch (error) {
    console.error('Error calculating hotel emissions:', error);
    // Fallback calculation
    return {
      category: 'hotel',
      description: `${starRating}-star hotel (${nights} nights)`,
      co2e_kg: nights * 12 * (starRating / 4),
      source: 'Cornell CHSB estimate'
    };
  }
}

/**
 * Calculate total carbon footprint for an itinerary
 */
export async function calculateItineraryFootprint(
  itinerary: {
    flights?: Array<{ origin: string; destination: string; passengers: number }>;
    transfers?: Array<{ distanceKm: number; vehicleType: string }>;
    hotelNights?: number;
    hotelStars?: number;
    totalPassengers: number;
  }
): Promise<CarbonFootprintResult> {
  const flights: CarbonEmission[] = [];
  const vehicles: CarbonEmission[] = [];
  const hotels: CarbonEmission[] = [];
  let totalEmissions = 0;

  // Calculate flight emissions
  if (itinerary.flights) {
    for (const flight of itinerary.flights) {
      const emission = await calculateFlightEmissions(
        flight.origin,
        flight.destination,
        flight.passengers
      );
      if (emission) {
        flights.push(emission);
        totalEmissions += emission.co2e_kg;
      }
    }
  }

  // Calculate vehicle emissions
  if (itinerary.transfers) {
    for (const transfer of itinerary.transfers) {
      const emission = await calculateVehicleEmissions(
        transfer.distanceKm,
        transfer.vehicleType as any
      );
      if (emission) {
        vehicles.push(emission);
        totalEmissions += emission.co2e_kg;
      }
    }
  }

  // Calculate hotel emissions
  if (itinerary.hotelNights && itinerary.hotelNights > 0) {
    const emission = await calculateHotelEmissions(
      itinerary.hotelNights,
      itinerary.hotelStars || 4
    );
    if (emission) {
      hotels.push(emission);
      totalEmissions += emission.co2e_kg;
    }
  }

  // Calculate per person and offset cost
  const perPerson = itinerary.totalPassengers > 0
    ? totalEmissions / itinerary.totalPassengers
    : totalEmissions;

  // Offset cost: approximately €25 per tonne CO2e (Gold Standard average)
  const offsetCost = (totalEmissions / 1000) * 25;

  return {
    flights,
    vehicles,
    hotels,
    total_co2e_kg: Math.round(totalEmissions * 10) / 10,
    per_person_kg: Math.round(perPerson * 10) / 10,
    offset_cost_eur: Math.round(offsetCost * 100) / 100,
    methodology: 'GHG Protocol, ISO 14064 compliant',
    disclaimer: 'Carbon emissions are estimates based on ICAO/IATA methodologies and Climatiq emission factors. Actual emissions may vary based on aircraft type, load factors, and operational conditions. Data provided for informational purposes only.'
  };
}

/**
 * Simple estimation for quick calculations
 * Use when detailed data is not available
 */
export function estimateSimpleFootprint(
  days: number,
  hasFlights: boolean,
  totalKm: number,
  passengers: number
): CarbonFootprintResult {
  let total = 0;
  const flights: CarbonEmission[] = [];
  const vehicles: CarbonEmission[] = [];
  const hotels: CarbonEmission[] = [];

  // Estimate flights (average domestic Turkish flight ~100kg per person)
  if (hasFlights) {
    const flightEmission = passengers * 100;
    flights.push({
      category: 'flight',
      description: `Domestic flight(s) (${passengers} pax)`,
      co2e_kg: flightEmission,
      source: 'ICAO average estimate'
    });
    total += flightEmission;
  }

  // Estimate vehicle transfers
  if (totalKm > 0) {
    const vehicleEmission = totalKm * 0.21;
    vehicles.push({
      category: 'vehicle',
      description: `Ground transfers (~${totalKm} km)`,
      co2e_kg: vehicleEmission,
      source: 'DEFRA estimate'
    });
    total += vehicleEmission;
  }

  // Estimate hotel stays
  if (days > 0) {
    const hotelEmission = days * 12;
    hotels.push({
      category: 'hotel',
      description: `Hotel stays (${days} nights)`,
      co2e_kg: hotelEmission,
      source: 'Cornell CHSB estimate'
    });
    total += hotelEmission;
  }

  const perPerson = passengers > 0 ? total / passengers : total;
  const offsetCost = (total / 1000) * 25;

  return {
    flights,
    vehicles,
    hotels,
    total_co2e_kg: Math.round(total * 10) / 10,
    per_person_kg: Math.round(perPerson * 10) / 10,
    offset_cost_eur: Math.round(offsetCost * 100) / 100,
    methodology: 'GHG Protocol, ISO 14064 compliant',
    disclaimer: 'Carbon emissions are estimates based on industry average factors. Actual emissions may vary. Data provided for informational purposes only.'
  };
}
