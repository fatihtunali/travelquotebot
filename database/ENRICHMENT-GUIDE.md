# Google Places Enrichment Guide

Complete guide to enriching your hotels, tours, and attractions with Google Places data.

## 🎯 What is Enrichment?

Enrichment adds real-world data from Google Places to your existing database items:

- **Photos** - Up to 3 high-quality photos from Google Places
- **Coordinates** - Latitude and longitude for maps
- **Ratings** - Google ratings and review counts
- **Website** - Official website URLs
- **Google Maps Link** - Direct link to Google Maps

## 📋 Before You Start

### Prerequisites

1. **Google Places API Key** - Already configured in `.env.local`
2. **Admin Access** - Login at `http://localhost:3003/admin/login`
3. **Database Items** - Hotels, tours, or entrance fees in your database

### Check Your Items

To see which items need enrichment:
```sql
-- Hotels needing enrichment
SELECT id, hotel_name, city FROM hotels WHERE google_place_id IS NULL;

-- Tours needing enrichment
SELECT id, tour_name, city FROM tours WHERE google_place_id IS NULL;

-- Entrance fees needing enrichment
SELECT id, site_name, city FROM entrance_fees WHERE google_place_id IS NULL;
```

## 🖥️ Method 1: Admin UI (Recommended)

### Step 1: Access the Interface

1. Login to admin panel: `http://localhost:3003/admin/login`
2. Click "Google Places" in the left sidebar
3. You'll see a dashboard with 3 cards: Hotels, Tours, Entrance Fees

### Step 2: View Items

- Each card shows the count of items needing enrichment
- Click on a card to see the full list of items
- Each item shows: Name and City

### Step 3: Enrich Items

**Option A: Enrich One Item**
1. Click on a card to view items
2. Click "Enrich" button next to any item
3. Wait for the process to complete (usually 2-3 seconds)
4. ✅ Success message will appear

**Option B: Enrich All Items**
1. Click "Enrich All" button on any card
2. Confirm the action (this uses Google API credits)
3. Wait for batch process to complete
4. View success/failure summary

### Step 4: Verify Results

After enrichment, check the database:
```sql
SELECT
  id,
  hotel_name,
  google_place_id,
  rating,
  photo_url_1
FROM hotels
WHERE id = 1;
```

## 💻 Method 2: Batch Script

For automated enrichment of all items at once.

### Step 1: Setup

Add your JWT token to `.env.local`:
```bash
# Get your token from browser localStorage after logging in
TEST_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Run Script

```bash
npx tsx scripts/enrich-all-places.ts
```

### Step 3: Monitor Progress

The script will show:
```
🗺️  Google Places Enrichment Script

=====================================

📋 Enriching hotels...
  Found 10 items needing enrichment

  Processing: Hotel Sultanahmet Palace (ID: 1)
    ✓ Success
  Processing: Cappadocia Cave Hotel (ID: 2)
    ✓ Success
  ...

  Summary: 10 successful, 0 failed

📊 Final Results

✅ Total Successful: 25
❌ Total Failed: 0
📈 Success Rate: 100%
```

## 🔧 Method 3: API Endpoints

For custom integrations.

### Check Status

```bash
curl -X GET "http://localhost:3003/api/enrich-places?table=hotels" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "table": "hotels",
  "items_needing_enrichment": 10
}
```

### Get Items List

```bash
curl -X GET "http://localhost:3003/api/enrich-places/items?table=hotels" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "table": "hotels",
  "count": 10,
  "items": [
    {
      "id": 1,
      "name": "Hotel Sultanahmet Palace",
      "city": "Istanbul"
    }
  ]
}
```

### Enrich Single Item

```bash
curl -X POST "http://localhost:3003/api/enrich-places" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"table": "hotels", "id": 1}'
```

Response:
```json
{
  "success": true,
  "message": "Updated hotels #1 with Google Places data",
  "data": {
    "name": "Hotel Sultanahmet Palace",
    "google_place_id": "ChIJ...",
    "rating": 4.5,
    "photos": 3,
    "google_maps_url": "https://maps.google.com/?cid=..."
  }
}
```

## 📊 What Gets Stored

After enrichment, each item will have:

| Column | Type | Description |
|--------|------|-------------|
| google_place_id | VARCHAR(255) | Unique Google identifier |
| latitude | DECIMAL(10,8) | GPS latitude |
| longitude | DECIMAL(11,8) | GPS longitude |
| google_maps_url | VARCHAR(500) | Google Maps link |
| photo_url_1 | VARCHAR(1000) | Primary photo URL |
| photo_url_2 | VARCHAR(1000) | Second photo URL |
| photo_url_3 | VARCHAR(1000) | Third photo URL |
| rating | DECIMAL(2,1) | Google rating (1-5) |
| user_ratings_total | INT | Number of reviews |
| website | VARCHAR(500) | Official website |

## 🚨 Troubleshooting

### Error: "No results found on Google Places"

**Cause**: Google couldn't find the place with the given name and city.

**Solutions**:
1. Check if the name is spelled correctly in database
2. Update the name to match Google's official name
3. Add more specific location details (neighborhood, landmark)

Example:
```sql
-- Before
UPDATE hotels SET hotel_name = 'Sultanahmet Hotel' WHERE id = 1;

-- After (more specific)
UPDATE hotels SET hotel_name = 'Hotel Sultanahmet Palace Istanbul' WHERE id = 1;
```

### Error: "Rate limit exceeded"

**Cause**: Too many requests to Google API.

**Solution**: Wait 1 minute and try again. The system automatically applies rate limiting (1 request per second).

### Error: "Invalid token"

**Cause**: JWT token expired or invalid.

**Solution**:
1. Login again to get new token
2. Update `TEST_JWT_TOKEN` in `.env.local`
3. Refresh the admin page

### Photos Not Loading

**Cause**: Photo URLs might be expired or invalid.

**Solution**:
```sql
-- Re-enrich the item to get fresh photo URLs
-- Use the admin UI or API to re-enrich
```

## 💰 Google API Costs

Current pricing (2024):
- Text Search: $32 per 1,000 requests
- Place Details: $17 per 1,000 requests
- Place Photos: $7 per 1,000 requests

**Example Cost Calculation:**
- 100 hotels to enrich
- Each needs: 1 search + 1 details + 3 photos = 5 requests
- Total: 500 requests
- Cost: ~$2.70

**Monthly Free Tier**: $200 credit (~7,000 enrichments)

## ✅ Best Practices

### 1. Verify Before Enriching
```sql
-- Check data quality first
SELECT id, hotel_name, city FROM hotels LIMIT 10;
```

### 2. Enrich in Batches
- Don't enrich all at once if you have 1000+ items
- Do 100-200 items per day to stay within free tier

### 3. Cache Results
- Enriched data is stored permanently in database
- Only re-enrich if data becomes outdated (once per year)

### 4. Monitor Quality
```sql
-- Check success rate
SELECT
  COUNT(*) as total,
  COUNT(google_place_id) as enriched,
  (COUNT(google_place_id) / COUNT(*) * 100) as success_rate
FROM hotels;
```

### 5. Update Names for Better Matches
If enrichment fails for an item, update its name:
```sql
UPDATE hotels
SET hotel_name = 'Four Seasons Hotel Istanbul at Sultanahmet'
WHERE hotel_name = 'Four Seasons Sultanahmet';
```

## 🎓 Using Enriched Data

### Display Photos in UI
```typescript
const hotel = await getHotel(id);
{hotel.photo_url_1 && (
  <img src={hotel.photo_url_1} alt={hotel.hotel_name} />
)}
```

### Show Ratings
```typescript
<div>
  ⭐ {hotel.rating} ({hotel.user_ratings_total} reviews)
</div>
```

### Link to Google Maps
```typescript
<a href={hotel.google_maps_url} target="_blank">
  View on Google Maps
</a>
```

### Display on Map
```typescript
<GoogleMap
  center={{ lat: hotel.latitude, lng: hotel.longitude }}
  zoom={15}
>
  <Marker position={{ lat: hotel.latitude, lng: hotel.longitude }} />
</GoogleMap>
```

## 📈 Next Steps

After enrichment:

1. **Update UI** - Display photos and ratings on hotel/tour listing pages
2. **Add Maps** - Show location maps on detail pages
3. **Itinerary Builder** - Use enriched data in day-by-day itineraries
4. **Quote PDFs** - Include photos and maps in quote PDFs
5. **SEO** - Use rich data for better search engine visibility

## 🆘 Need Help?

- Check API errors in browser console (F12)
- Review server logs: `npm run dev` output
- Verify database schema: `database/add-google-places-to-existing-tables.sql`
- Read full integration docs: `database/GOOGLE-PLACES-INTEGRATION.md`
