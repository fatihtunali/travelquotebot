import pool from './db';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Places API (New) endpoints
const PLACES_API_BASE = 'https://places.googleapis.com/v1';
const TEXT_SEARCH_ENDPOINT = `${PLACES_API_BASE}/places:searchText`;
const PLACE_DETAILS_ENDPOINT = `${PLACES_API_BASE}/places`;

// Places API (New) response types
interface PlaceSearchResult {
  id: string; // Place ID in new API
  displayName?: {
    text: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  photos?: Array<{
    name: string; // Photo resource name (used as reference)
    widthPx: number;
    heightPx: number;
    authorAttributions?: Array<{
      displayName: string;
      uri?: string;
      photoUri?: string;
    }>;
  }>;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string; // PRICE_LEVEL_UNSPECIFIED, PRICE_LEVEL_FREE, etc.
  types?: string[];
  primaryType?: string;
  businessStatus?: string;
}

interface PlaceDetails {
  id: string; // Place ID
  displayName?: {
    text: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: Array<{
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }>;
    weekdayDescriptions?: string[];
  };
  currentOpeningHours?: any;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  types?: string[];
  primaryType?: string;
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions?: Array<{
      displayName: string;
      uri?: string;
      photoUri?: string;
    }>;
  }>;
  editorialSummary?: {
    text: string;
    languageCode?: string;
  };
  reviews?: Array<{
    name: string;
    relativePublishTimeDescription: string;
    rating: number;
    text: { text: string; languageCode?: string };
    originalText: { text: string; languageCode?: string };
    authorAttribution: {
      displayName: string;
      uri?: string;
      photoUri?: string;
    };
    publishTime: string;
  }>;
  businessStatus?: string;
  viewport?: {
    low: { latitude: number; longitude: number };
    high: { latitude: number; longitude: number };
  };
}

/**
 * Search for places using Google Places API (New)
 * Uses Text Search endpoint with proper authentication
 *
 * ⚠️ DISABLED: API calls are disabled to prevent overcharges
 * Returns cached data from database only
 */
export async function searchPlaces(query: string, location?: string): Promise<PlaceSearchResult[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('⚠️ Google Places API is DISABLED - Using cached data only');
    console.warn('To enable API calls, set GOOGLE_PLACES_API_KEY in .env.local');
    return [];
  }

  console.warn('⚠️ Google Places API calls are DISABLED to prevent overcharges');
  console.warn('Search query:', query, 'Location:', location);
  console.warn('Please use cached data from the database instead');
  return [];

  /* ORIGINAL CODE DISABLED TO PREVENT API CHARGES
  try {
    // Build request body
    const requestBody: any = {
      textQuery: query,
      pageSize: 20, // Maximum results per page
    };

    // Add location bias if provided (expected format: "lat,lng")
    if (location) {
      const [lat, lng] = location.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        requestBody.locationBias = {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 50000.0, // 50km radius
          },
        };
      }
    }

    // Field mask - specify which fields to return (uses "places." prefix for search results)
    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.priceLevel',
      'places.types',
      'places.primaryType',
      'places.photos',
      'places.businessStatus',
    ].join(',');

    console.log('🔍 Searching places:', query, location ? `near ${location}` : '');

    const response = await fetch(TEXT_SEARCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Places API error:', response.status, errorText);
      return [];
    }

    const data = await response.json();

    if (data.places && Array.isArray(data.places)) {
      console.log(`✅ Found ${data.places.length} places`);
      return data.places;
    } else {
      console.warn('No places found in response');
      return [];
    }
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
  */
}

/**
 * Get detailed information about a place using Google Places API (New)
 * Uses Place Details endpoint with proper authentication
 *
 * ⚠️ DISABLED: API calls are disabled to prevent overcharges
 * Use getPlaceFromDatabase() instead to retrieve cached data
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('⚠️ Google Places API is DISABLED - Use getPlaceFromDatabase() for cached data');
    return null;
  }

  console.warn('⚠️ Google Places API calls are DISABLED to prevent overcharges');
  console.warn('Place ID:', placeId);
  console.warn('Use getPlaceFromDatabase() to retrieve cached data instead');
  return null;

  /* ORIGINAL CODE DISABLED TO PREVENT API CHARGES
  try {
    // Field mask - specify which fields to return (NO "places." prefix for details)
    const fieldMask = [
      'id',
      'displayName',
      'formattedAddress',
      'location',
      'rating',
      'userRatingCount',
      'priceLevel',
      'types',
      'primaryType',
      'photos',
      'editorialSummary',
      'reviews',
      'businessStatus',
      'internationalPhoneNumber',
      'nationalPhoneNumber',
      'websiteUri',
      'googleMapsUri',
      'regularOpeningHours',
      'currentOpeningHours',
      'viewport',
    ].join(',');

    console.log(`🔍 Fetching place details for: ${placeId}`);

    const response = await fetch(`${PLACE_DETAILS_ENDPOINT}/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Place Details API error:', response.status, errorText);
      return null;
    }

    const place: PlaceDetails = await response.json();

    console.log(`✅ Fetched place details for: ${place.displayName?.text || 'Unknown'}`);

    if (place.editorialSummary) {
      console.log(`   📝 Editorial: ${place.editorialSummary.text?.substring(0, 100)}...`);
    }
    if (place.types) {
      console.log(`   🏷️  Types: ${place.types.join(', ')}`);
    }

    return place;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
  */
}

/**
 * Get photo URL from Google Places photo resource name (New API)
 *
 * In the new API, photos have a "name" field like:
 * "places/ChIJj61dQgK6j4AR4GeTYWZsKWw/photos/AelY_CvnKbFRPTejwZYmJZGcvNp5sJI8LXZZJZ8f"
 *
 * To get the actual photo, construct: https://places.googleapis.com/v1/{name}/media
 *
 * DO NOT embed API key in URLs saved to database.
 * Store only the photo name/resource, generate URLs at request time.
 *
 * ⚠️ DISABLED: Returns empty string to prevent API photo requests
 * Use locally cached photos or placeholder images instead
 */
export function getPhotoUrl(photoName: string, maxWidthPx: number = 800, maxHeightPx?: number): string {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('⚠️ Google Places API is DISABLED - Photo URLs cannot be generated');
    return '';
  }

  console.warn('⚠️ Google Places Photo API is DISABLED to prevent charges');
  console.warn('Photo name:', photoName);
  return '';

  /* ORIGINAL CODE DISABLED TO PREVENT API CHARGES
  // Build the photo media URL
  let url = `https://places.googleapis.com/v1/${photoName}/media?key=${GOOGLE_PLACES_API_KEY}&maxWidthPx=${maxWidthPx}`;

  if (maxHeightPx) {
    url += `&maxHeightPx=${maxHeightPx}`;
  }

  return url;
  */
}

/**
 * Get photo reference/name only (for storing in database)
 * In the new API, store the photo "name" field
 */
export function getPhotoReference(photo: any): string {
  return photo.name || '';
}

/**
 * Save place to database (updated for new API format)
 */
export async function savePlaceToDatabase(placeDetails: PlaceDetails): Promise<number | null> {
  try {
    // Check if place already exists
    const [existing]: any = await pool.query(
      'SELECT id FROM places WHERE place_id = ?',
      [placeDetails.id]
    );

    // Extract scalar values from new API format
    const name = placeDetails.displayName?.text || 'Unknown';
    const formattedAddress = placeDetails.formattedAddress || '';
    const latitude = placeDetails.location?.latitude || null;
    const longitude = placeDetails.location?.longitude || null;
    const rating = placeDetails.rating || null;
    const userRatingCount = placeDetails.userRatingCount || null;
    const phoneNumber = placeDetails.internationalPhoneNumber || placeDetails.nationalPhoneNumber || null;
    const website = placeDetails.websiteUri || null;
    const description = placeDetails.editorialSummary?.text || null;
    const googleMapsUrl = placeDetails.googleMapsUri || null;
    const businessStatus = placeDetails.businessStatus || null;

    // Convert priceLevel from string enum to number (for backwards compatibility)
    let priceLevelNumber = null;
    if (placeDetails.priceLevel) {
      const priceLevelMap: { [key: string]: number } = {
        'PRICE_LEVEL_FREE': 0,
        'PRICE_LEVEL_INEXPENSIVE': 1,
        'PRICE_LEVEL_MODERATE': 2,
        'PRICE_LEVEL_EXPENSIVE': 3,
        'PRICE_LEVEL_VERY_EXPENSIVE': 4,
      };
      priceLevelNumber = priceLevelMap[placeDetails.priceLevel] || null;
    }

    if (existing.length > 0) {
      // Update existing place
      await pool.query(
        `UPDATE places SET
          name = ?,
          formatted_address = ?,
          latitude = ?,
          longitude = ?,
          place_types = ?,
          rating = ?,
          user_ratings_total = ?,
          price_level = ?,
          opening_hours = ?,
          phone_number = ?,
          website = ?,
          description = ?,
          google_maps_url = ?,
          icon_url = ?,
          business_status = ?,
          updated_at = NOW()
        WHERE place_id = ?`,
        [
          name,
          formattedAddress,
          latitude,
          longitude,
          JSON.stringify(placeDetails.types || []),
          rating,
          userRatingCount,
          priceLevelNumber,
          JSON.stringify(placeDetails.regularOpeningHours || null),
          phoneNumber,
          website,
          description,
          googleMapsUrl,
          null, // icon_url (not provided in new API)
          businessStatus,
          placeDetails.id
        ]
      );
      return existing[0].id;
    } else {
      // Insert new place
      const [result]: any = await pool.query(
        `INSERT INTO places (
          place_id, name, formatted_address, latitude, longitude,
          place_types, rating, user_ratings_total, price_level,
          opening_hours, phone_number, website, description,
          google_maps_url, icon_url, business_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          placeDetails.id,
          name,
          formattedAddress,
          latitude,
          longitude,
          JSON.stringify(placeDetails.types || []),
          rating,
          userRatingCount,
          priceLevelNumber,
          JSON.stringify(placeDetails.regularOpeningHours || null),
          phoneNumber,
          website,
          description,
          googleMapsUrl,
          null, // icon_url
          businessStatus
        ]
      );
      return result.insertId;
    }
  } catch (error) {
    console.error('Error saving place to database:', error);
    return null;
  }
}

/**
 * Save place photos to database (updated for new API format)
 * Store only photo name/resource, not full URL with API key
 */
export async function savePlacePhotos(placeId: string, photos: PlaceDetails['photos']): Promise<void> {
  if (!photos || photos.length === 0) return;

  try {
    // Delete existing photos for this place
    await pool.query('DELETE FROM place_photos WHERE place_id = ?', [placeId]);

    // Insert new photos - store only the photo name (resource reference), not full URL
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const isPrimary = i === 0; // First photo is primary

      // Build attributions from authorAttributions
      const attributions = photo.authorAttributions?.map(attr => attr.displayName) || [];

      await pool.query(
        `INSERT INTO place_photos (
          place_id, photo_reference, width, height,
          html_attributions, is_primary
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          placeId,
          photo.name, // Store the photo resource name (e.g., "places/.../photos/...")
          photo.widthPx,
          photo.heightPx,
          JSON.stringify(attributions),
          isPrimary
        ]
      );
    }
  } catch (error) {
    console.error('Error saving place photos:', error);
  }
}

/**
 * Fetch place from Google and save to database (complete workflow)
 */
export async function fetchAndSavePlace(placeId: string): Promise<boolean> {
  try {
    // Get place details from Google
    const placeDetails = await getPlaceDetails(placeId);

    if (!placeDetails) {
      return false;
    }

    // Save place to database
    const savedPlaceId = await savePlaceToDatabase(placeDetails);

    if (!savedPlaceId) {
      return false;
    }

    // Save photos (use .id from new API format)
    if (placeDetails.photos) {
      await savePlacePhotos(placeDetails.id, placeDetails.photos);
    }

    return true;
  } catch (error) {
    console.error('Error in fetchAndSavePlace:', error);
    return false;
  }
}

/**
 * Get place from database
 */
export async function getPlaceFromDatabase(placeId: string) {
  try {
    const [places]: any = await pool.query(
      `SELECT * FROM places WHERE place_id = ?`,
      [placeId]
    );

    if (places.length === 0) {
      return null;
    }

    const place = places[0];

    // Get photos
    const [photos]: any = await pool.query(
      `SELECT * FROM place_photos WHERE place_id = ? ORDER BY is_primary DESC, id ASC`,
      [placeId]
    );

    return {
      ...place,
      photos: photos
    };
  } catch (error) {
    console.error('Error getting place from database:', error);
    return null;
  }
}
