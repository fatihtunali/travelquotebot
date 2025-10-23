# Google Places API Integration

This integration allows you to fetch and store location data (places, photos, descriptions) from Google Places API for use in travel itineraries.

## Database Schema

### Tables Created

1. **`places`** - Stores location information
   - `place_id` - Unique Google Place ID
   - `name` - Place name
   - `formatted_address` - Full address
   - `latitude`, `longitude` - Coordinates
   - `place_types` - JSON array of types (e.g., ["tourist_attraction", "point_of_interest"])
   - `rating` - Google rating (0-5)
   - `user_ratings_total` - Number of reviews
   - `price_level` - Price level (0-4)
   - `opening_hours` - JSON with opening hours
   - `phone_number`, `website` - Contact info
   - `description` - Editorial summary from Google
   - `google_maps_url` - Google Maps link
   - `icon_url` - Place icon
   - `business_status` - Operating status

2. **`place_photos`** - Stores place photos
   - `place_id` - Link to places table
   - `photo_reference` - Google photo reference token
   - `photo_url` - Full photo URL
   - `width`, `height` - Dimensions
   - `html_attributions` - Required Google attributions
   - `is_primary` - Boolean for featured photo

3. **`itinerary_places`** - Links places to itineraries
   - `itinerary_id` - Quote/itinerary ID
   - `place_id` - Place ID
   - `day_number` - Which day of trip
   - `order_in_day` - Order within that day
   - `visit_duration_minutes` - Planned duration
   - `notes` - Custom notes

## API Endpoints

### Search Places
```
GET /api/places?action=search&query=Hagia+Sophia+Istanbul
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "results": [
    {
      "place_id": "ChIJtWXGHx25yhQRs0-cnE8mLcw",
      "name": "Hagia Sophia",
      "formatted_address": "Sultan Ahmet, Ayasofya Meydanı No:1, 34122 Fatih/İstanbul",
      "geometry": {
        "location": {
          "lat": 41.0086334,
          "lng": 28.9802236
        }
      },
      "rating": 4.7,
      "photos": [...]
    }
  ]
}
```

### Save Place to Database
```
POST /api/places
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "placeId": "ChIJtWXGHx25yhQRs0-cnE8mLcw"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Place saved successfully",
  "place": {
    "id": 1,
    "place_id": "ChIJtWXGHx25yhQRs0-cnE8mLcw",
    "name": "Hagia Sophia",
    "formatted_address": "...",
    "latitude": 41.0086334,
    "longitude": 28.9802236,
    "photos": [
      {
        "photo_url": "https://maps.googleapis.com/maps/api/place/photo?...",
        "is_primary": true
      }
    ]
  }
}
```

### Get Place from Database
```
GET /api/places?action=get&placeId=ChIJtWXGHx25yhQRs0-cnE8mLcw
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Usage in Code

### Import the service
```typescript
import {
  searchPlaces,
  getPlaceDetails,
  fetchAndSavePlace,
  getPlaceFromDatabase,
  getPhotoUrl
} from '@/lib/googlePlaces';
```

### Search for places
```typescript
const results = await searchPlaces('Istanbul attractions');
```

### Fetch and save a place
```typescript
const success = await fetchAndSavePlace('ChIJ...');
if (success) {
  const place = await getPlaceFromDatabase('ChIJ...');
  console.log(place.name, place.photos);
}
```

### Get photo URL
```typescript
const photoUrl = getPhotoUrl('CmRaAAAA...', 800); // 800px width
```

## Populating with Turkey Destinations

A script is provided to populate the database with famous Turkey destinations:

```bash
# First, add your JWT token to .env.local:
# TEST_JWT_TOKEN=your_jwt_token_here

# Then run:
npx tsx scripts/populate-turkey-places.ts
```

This will fetch and save 15+ famous Turkey locations including:
- Hagia Sophia
- Blue Mosque
- Cappadocia
- Pamukkale
- Ephesus
- And more...

## Using in Itineraries

To add a place to an itinerary:

```typescript
await pool.query(
  `INSERT INTO itinerary_places (
    itinerary_id, place_id, day_number, order_in_day,
    visit_duration_minutes, notes
  ) VALUES (?, ?, ?, ?, ?, ?)`,
  [quoteId, placeId, 1, 1, 120, 'Morning visit recommended']
);
```

To get all places for an itinerary:

```typescript
const [places] = await pool.query(
  `SELECT p.*, ip.day_number, ip.order_in_day, ip.notes
   FROM itinerary_places ip
   JOIN places p ON ip.place_id = p.place_id
   WHERE ip.itinerary_id = ?
   ORDER BY ip.day_number, ip.order_in_day`,
  [quoteId]
);
```

## Google API Keys

The integration uses these environment variables:
- `GOOGLE_PLACES_API_KEY` - For Places API requests
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - For photo URLs and Maps

Both are configured in `.env.local`.

## Rate Limits

Google Places API has usage limits:
- Free tier: $200 credit/month (~28,000 searches or ~100,000 photos)
- Text Search: $32 per 1000 requests
- Place Details: $17 per 1000 requests
- Place Photos: $7 per 1000 requests

Always cache place data in the database to minimize API calls!

## Example: Building an Itinerary

```typescript
// 1. Search for places
const results = await searchPlaces('Istanbul attractions');

// 2. Save selected places
for (const result of results.slice(0, 5)) {
  await fetchAndSavePlace(result.place_id);
}

// 3. Add to itinerary
for (let i = 0; i < 5; i++) {
  await pool.query(
    `INSERT INTO itinerary_places (itinerary_id, place_id, day_number, order_in_day)
     VALUES (?, ?, 1, ?)`,
    [quoteId, results[i].place_id, i + 1]
  );
}

// 4. Retrieve itinerary with places
const [itinerary] = await pool.query(
  `SELECT q.*,
    (SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'name', p.name,
        'address', p.formatted_address,
        'photo', (SELECT photo_url FROM place_photos WHERE place_id = p.place_id AND is_primary = true LIMIT 1),
        'rating', p.rating,
        'day', ip.day_number,
        'order', ip.order_in_day
      )
    ) FROM itinerary_places ip
    JOIN places p ON ip.place_id = p.place_id
    WHERE ip.itinerary_id = q.id
    ORDER BY ip.day_number, ip.order_in_day
   ) as places
   FROM quotes q
   WHERE q.id = ?`,
  [quoteId]
);
```

## Enrichment System

### Admin UI (Recommended)
Access the Google Places management interface:
```
http://localhost:3003/admin/dashboard/google-places
```

Features:
- View count of items needing enrichment per table
- Enrich individual items with one click
- Batch enrich all items in a table
- Real-time progress tracking
- Automatic rate limiting (1 second between requests)

### Batch Script
For automated enrichment of all items:
```bash
# Add JWT token to .env.local:
# TEST_JWT_TOKEN=your_token_here

# Run the script:
npx tsx scripts/enrich-all-places.ts
```

The script will:
- Process hotels, tours, and entrance_fees tables
- Show progress for each item
- Display success/failure summary
- Apply rate limiting automatically

### API Endpoints

**Get enrichment status:**
```bash
GET /api/enrich-places?table=hotels
```

**Get items needing enrichment:**
```bash
GET /api/enrich-places/items?table=hotels
```

**Enrich individual item:**
```bash
POST /api/enrich-places
Body: { "table": "hotels", "id": 1 }
```

## Next Steps

1. ✅ Enrich existing hotels, tours, and entrance fees with Google Places data
2. Display place photos in hotel/tour listings
3. Show Google ratings and reviews in item cards
4. Display Google Maps links for each location
5. Add map visualization of itinerary route
6. Build day-by-day itinerary builder with place photos
