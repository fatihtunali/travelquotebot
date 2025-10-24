import pool from './db';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }>;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: any;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }>;
  editorial_summary?: {
    overview: string;
  };
  url?: string;
  icon?: string;
  business_status?: string;
}

/**
 * Search for places using Google Places Text Search API
 */
export async function searchPlaces(query: string, location?: string): Promise<PlaceSearchResult[]> {
  try {
    const params = new URLSearchParams({
      query: query,
      key: GOOGLE_PLACES_API_KEY!,
    });

    if (location) {
      params.append('location', location);
      params.append('radius', '50000'); // 50km radius
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status === 'OK') {
      return data.results;
    } else {
      console.error('Google Places API error:', data.status, data.error_message);
      return [];
    }
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

/**
 * Get detailed information about a place using Place Details API
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const params = new URLSearchParams({
      place_id: placeId,
      // ENHANCED: Added all fields needed for hotel classification
      fields: 'place_id,name,formatted_address,geometry,formatted_phone_number,website,opening_hours,rating,user_ratings_total,price_level,types,photos,editorial_summary,url,icon,business_status,reviews',
      key: GOOGLE_PLACES_API_KEY!,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status === 'OK') {
      console.log(`✅ Fetched place details for: ${data.result.name}`);
      if (data.result.editorial_summary) {
        console.log(`   📝 Editorial: ${data.result.editorial_summary.overview?.substring(0, 100)}...`);
      }
      if (data.result.types) {
        console.log(`   🏷️  Types: ${data.result.types.join(', ')}`);
      }
      return data.result;
    } else {
      console.error('Google Places Details API error:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

/**
 * Get photo URL from Google Places photo reference
 * H3: DO NOT embed API key in URLs saved to database
 * This function should only be used for generating on-demand URLs
 * Store only photo_reference in database, generate URLs at request time
 */
export function getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('GOOGLE_MAPS_API_KEY not configured');
    return '';
  }
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}

/**
 * Get photo reference only (for storing in database)
 * H3: Store only reference, not full URL with API key
 */
export function getPhotoReference(photo: any): string {
  return photo.photo_reference || '';
}

/**
 * Save place to database
 */
export async function savePlaceToDatabase(placeDetails: PlaceDetails): Promise<number | null> {
  try {
    // Check if place already exists
    const [existing]: any = await pool.query(
      'SELECT id FROM places WHERE place_id = ?',
      [placeDetails.place_id]
    );

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
          placeDetails.name,
          placeDetails.formatted_address,
          placeDetails.geometry.location.lat,
          placeDetails.geometry.location.lng,
          JSON.stringify(placeDetails.types || []),
          placeDetails.rating || null,
          placeDetails.user_ratings_total || null,
          placeDetails.price_level || null,
          JSON.stringify(placeDetails.opening_hours || null),
          placeDetails.formatted_phone_number || null,
          placeDetails.website || null,
          placeDetails.editorial_summary?.overview || null,
          placeDetails.url || null,
          placeDetails.icon || null,
          placeDetails.business_status || null,
          placeDetails.place_id
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
          placeDetails.place_id,
          placeDetails.name,
          placeDetails.formatted_address,
          placeDetails.geometry.location.lat,
          placeDetails.geometry.location.lng,
          JSON.stringify(placeDetails.types || []),
          placeDetails.rating || null,
          placeDetails.user_ratings_total || null,
          placeDetails.price_level || null,
          JSON.stringify(placeDetails.opening_hours || null),
          placeDetails.formatted_phone_number || null,
          placeDetails.website || null,
          placeDetails.editorial_summary?.overview || null,
          placeDetails.url || null,
          placeDetails.icon || null,
          placeDetails.business_status || null
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
 * Save place photos to database
 * H3: Store only photo_reference, not full URL with API key
 */
export async function savePlacePhotos(placeId: string, photos: PlaceDetails['photos']): Promise<void> {
  if (!photos || photos.length === 0) return;

  try {
    // Delete existing photos for this place
    await pool.query('DELETE FROM place_photos WHERE place_id = ?', [placeId]);

    // Insert new photos - store only reference, not full URL
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const isPrimary = i === 0; // First photo is primary

      await pool.query(
        `INSERT INTO place_photos (
          place_id, photo_reference, width, height,
          html_attributions, is_primary
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          placeId,
          photo.photo_reference,
          photo.width,
          photo.height,
          JSON.stringify(photo.html_attributions || []),
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

    // Save photos
    if (placeDetails.photos) {
      await savePlacePhotos(placeDetails.place_id, placeDetails.photos);
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
