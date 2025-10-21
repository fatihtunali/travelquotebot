# Google Places Photo Fetcher

This script automatically fetches real photos from Google Places API for all hotels and activities in the demo@demotest.com operator account.

## Setup

### 1. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Places API (New)**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### 2. Set API Key in Environment

Add to your `.env.local` file:

```bash
GOOGLE_PLACES_API_KEY=your_api_key_here
```

Or run directly with the key:

```bash
GOOGLE_PLACES_API_KEY=your_key npm run fetch-photos
```

## Usage

### Run the Script

```bash
npm run fetch-photos
```

### What It Does

1. ✅ Fetches all hotels from `accommodations` table for demo operator
2. ✅ Searches Google Places API for each hotel by name + address
3. ✅ Gets top 3 photos per hotel
4. ✅ Stores photo URLs in `images` field as JSON array
5. ✅ Repeats for all activities
6. ✅ Rate limits to 100ms between requests (API-friendly)

### Output Example

```
🚀 Google Places Photo Fetcher
============================================================
✅ API Key detected
📍 Target: demo@demotest.com (270e887b-ed9c-4216-bf56-2ae311b2a154)
============================================================

📸 Fetching photos for hotels...

Found 69 hotels to process

Processing: Four Seasons Sultanahmet, Istanbul
  ✅ Added 3 photos
Processing: Çırağan Palace Kempinski, Istanbul
  ✅ Added 3 photos
...

✅ Hotels complete: 65 success, 4 no photos

📸 Fetching photos for activities...

Found 55 activities to process

Processing: Hagia Sophia Guided Tour, Istanbul
  ✅ Added 3 photos
...

✅ Activities complete: 52 success, 3 no photos

============================================================
🎉 Photo fetching complete!
============================================================

💰 Estimated API cost: ~$3-5 (one-time)
📊 Check your database - images field should now contain Google photo URLs
```

## Cost Breakdown

| Operation | Requests | Cost per 1000 | Total Cost |
|-----------|----------|---------------|------------|
| Find Place (hotels) | 69 | $17 | $1.17 |
| Photos (hotels) | 69 | $7 | $0.48 |
| Find Place (activities) | 55 | $17 | $0.94 |
| Photos (activities) | 55 | $7 | $0.39 |
| **TOTAL** | **248** | - | **~$3.00** |

This is a **one-time cost**. Photo URLs can be cached in database for months.

## Photo URL Format

Photos are stored as JSON array in the `images` field:

```json
[
  "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=ABC123...&key=YOUR_KEY",
  "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=DEF456...&key=YOUR_KEY",
  "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=GHI789...&key=YOUR_KEY"
]
```

## Important Notes

### ✅ Legal & Licensed
- Google Places photos are properly licensed
- Safe to use in your PDFs and website
- No copyright issues

### 📸 Photo Quality
- Real photos from actual hotels/attractions
- Professional quality (not stock photos)
- Usually 3-5 photos per place

### 🔄 Refresh Schedule
- Google recommends refreshing every 30-90 days
- Run script again whenever adding new hotels/activities
- Minimal cost for updates (~$0.05 per new hotel)

### ⚠️ Troubleshooting

**No photos found for some places:**
- Some smaller hotels may not have Google Places listings
- Activities might be listed under different names
- Manual fallback needed for ~5-10% of places

**API quota exceeded:**
- Google gives $200/month free credit
- This should be more than enough
- Monitor usage in Google Cloud Console

## Next Steps

After running this script:

1. ✅ Check database to verify images are populated
2. ✅ Test PDF generation with real hotel photos
3. ✅ Optionally upload photos to Cloudinary for your own CDN
4. ✅ Set up monthly cron job to refresh photos

## Manual Override

If you want to manually set photos for specific hotels:

```sql
UPDATE accommodations
SET images = JSON_ARRAY(
  'https://your-cdn.com/hotel1.jpg',
  'https://your-cdn.com/hotel2.jpg'
)
WHERE id = 'hotel-id-here';
```

## Questions?

- Google Places API Docs: https://developers.google.com/maps/documentation/places/web-service
- Pricing Calculator: https://mapsplatform.google.com/pricing/
