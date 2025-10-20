// Geocoding utility to convert city names to coordinates
// Uses OpenStreetMap Nominatim API (free, no API key required)

interface GeocodingResult {
  lat: number;
  lng: number;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

// Cache to avoid repeated API calls for the same city
const geocodeCache = new Map<string, GeocodingResult>();

// Common Turkish cities coordinates (fallback)
const TURKEY_CITIES: Record<string, GeocodingResult> = {
  'istanbul': { lat: 41.0082, lng: 28.9784 },
  'ankara': { lat: 39.9334, lng: 32.8597 },
  'izmir': { lat: 38.4192, lng: 27.1287 },
  'antalya': { lat: 36.8969, lng: 30.7133 },
  'cappadocia': { lat: 38.6431, lng: 34.8289 },
  'kapadokya': { lat: 38.6431, lng: 34.8289 },
  'pamukkale': { lat: 37.9203, lng: 29.1211 },
  'bodrum': { lat: 37.0345, lng: 27.4305 },
  'fethiye': { lat: 36.6211, lng: 29.1164 },
  'trabzon': { lat: 41.0027, lng: 39.7168 },
  'konya': { lat: 37.8746, lng: 32.4932 },
  'bursa': { lat: 40.1826, lng: 29.0665 },
  'kusadasi': { lat: 37.8588, lng: 27.2614 },
  'ephesus': { lat: 37.9395, lng: 27.3408 },
  'efes': { lat: 37.9395, lng: 27.3408 },
  'goreme': { lat: 38.6431, lng: 34.8289 },
  'urgup': { lat: 38.6274, lng: 34.9110 },
  'ürgüp': { lat: 38.6274, lng: 34.9110 },
  'nevsehir': { lat: 38.6244, lng: 34.7239 },
  'nevşehir': { lat: 38.6244, lng: 34.7239 },
};

/**
 * Geocode a city name to coordinates
 * @param cityName - Name of the city to geocode
 * @param country - Country to search in (default: 'Turkey')
 * @returns Promise with lat/lng coordinates
 */
export async function geocodeCity(
  cityName: string,
  country: string = 'Turkey'
): Promise<GeocodingResult> {
  // Normalize city name
  const normalizedCity = cityName.toLowerCase().trim();

  // Check cache first
  const cacheKey = `${normalizedCity}-${country.toLowerCase()}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // Check hardcoded Turkish cities
  if (TURKEY_CITIES[normalizedCity]) {
    const result = TURKEY_CITIES[normalizedCity];
    geocodeCache.set(cacheKey, result);
    return result;
  }

  // Try Nominatim API
  try {
    const searchQuery = `${cityName}, ${country}`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery)}` +
      `&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'TripPlannerAI/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data: NominatimResponse[] = await response.json();

    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.error(`Geocoding error for ${cityName}:`, error);
  }

  // Fallback: center of Turkey if all else fails
  const fallback = { lat: 39.0, lng: 35.0 };
  console.warn(`Using fallback coordinates for ${cityName}`);
  return fallback;
}

/**
 * Geocode multiple cities in parallel
 * @param cities - Array of city names
 * @param country - Country to search in
 * @returns Promise with array of coordinates
 */
export async function geocodeCities(
  cities: string[],
  country: string = 'Turkey'
): Promise<GeocodingResult[]> {
  // Use Promise.all for parallel requests, but add delay between requests
  // to respect Nominatim's usage policy (max 1 request per second)
  const results: GeocodingResult[] = [];

  for (let i = 0; i < cities.length; i++) {
    const result = await geocodeCity(cities[i], country);
    results.push(result);

    // Add delay between requests (only if not from cache)
    if (i < cities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Extract unique cities from itinerary data
 * @param itineraryData - The itinerary data object
 * @returns Array of unique city names
 */
export function extractCitiesFromItinerary(itineraryData: any): string[] {
  const cities = new Set<string>();

  if (itineraryData?.days) {
    itineraryData.days.forEach((day: any) => {
      if (day.city) {
        cities.add(day.city);
      }
    });
  }

  return Array.from(cities);
}
