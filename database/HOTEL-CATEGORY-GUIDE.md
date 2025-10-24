# Turkish Hotel Category Classification System

## Overview

Turkey has a unique hotel classification system that includes **Special Class** hotels - boutique properties that meet high standards but cannot receive official star ratings due to room count or unique characteristics (e.g., historic buildings, cave hotels).

## Hotel Categories

### 1. Budget (2-3★)
- **Turkish**: Ekonomik
- Budget-friendly accommodations
- Basic amenities

### 2. Standard 3-Star
- **Turkish**: 3 Yıldız Standart
- Official Ministry of Tourism 3-star rating
- Good quality, standard amenities

### 3. Standard 4-Star
- **Turkish**: 4 Yıldız Standart
- Official Ministry of Tourism 4-star rating
- Superior quality, enhanced amenities

### 4. Standard 5-Star
- **Turkish**: 5 Yıldız Standart
- Official Ministry of Tourism 5-star rating
- High quality, luxury amenities

### 5. **Special Class (Özel Sınıf)** ⭐ KEY CATEGORY
- **Turkish**: Özel Sınıf / Butik Otel
- Boutique hotels that cannot get official star rating due to:
  - **Room count < 50** (most common reason)
  - Historic building preservation requirements
  - Unique architectural features (cave hotels, mansions)
  - Heritage site restrictions

**Examples:**
- **Museum Hotel (Cappadocia)** - 30 rooms, cave hotel
- **Argos in Cappadocia** - Historic mansion conversion
- **Tomtom Suites (Istanbul)** - 20 rooms, historic building
- **Vault Karakoy** - Boutique conversion of historic bank

**Characteristics:**
- Usually 5-star quality or higher
- Personalized service
- Unique design/architecture
- Higher price point than standard hotels
- Excellent Google ratings (4.5+)
- Fewer rooms (typically 10-50)

### 6. Luxury (6★ Equivalent)
- **Turkish**: Lüks
- Ultra-luxury beyond 5-star standard
- Examples: Çırağan Palace Kempinski, Four Seasons Bosphorus

---

## Using Google Places API to Identify Hotel Categories

### Key Google API Fields

```typescript
interface HotelGoogleData {
  rating: number;              // 1-5 stars (user rating)
  user_ratings_total: number;  // Number of reviews
  price_level: number;         // 0-4 ($$$ indicator)
  types: string[];             // Place types
  // NEW - we should fetch these:
  opening_hours?: any;
  editorial_summary?: string;
  reviews?: Review[];
}
```

### Classification Logic

#### Special Class Detection Algorithm

```sql
-- Criteria for Special Class:
1. High Google rating (≥ 4.5)
2. Moderate review count (50-500) - indicates smaller property
3. Star rating 4-5 (quality level)
4. OR manually tagged as boutique
5. OR room_count < 50
```

**Code Example:**
```typescript
function classifyHotel(hotel: any): HotelCategory {
  // Manual override
  if (hotel.is_boutique || hotel.room_count < 50) {
    return 'special_class';
  }

  // Ultra-luxury
  if (hotel.star_rating === 5 && hotel.rating >= 4.7 && hotel.user_ratings_total > 5000) {
    return 'luxury';
  }

  // Special Class (boutique indicators)
  if (
    hotel.rating >= 4.5 &&
    hotel.user_ratings_total >= 50 &&
    hotel.user_ratings_total <= 500 &&
    hotel.star_rating >= 4
  ) {
    return 'special_class';
  }

  // Standard classifications
  if (hotel.star_rating === 5) return 'standard_5star';
  if (hotel.star_rating === 4) return 'standard_4star';
  if (hotel.star_rating === 3) return 'standard_3star';

  return 'budget';
}
```

### Additional Google API Data to Fetch

To better identify Special Class hotels, we should enrich our data with:

#### 1. **Place Types**
Google provides types like:
- `lodging`
- `hotel`
- `resort`
- `spa`
- `tourist_attraction` (for historic properties)

Special Class hotels often have multiple types including `tourist_attraction` or `point_of_interest`.

#### 2. **Editorial Summary**
Google's AI-generated description often mentions:
- "boutique"
- "historic"
- "cave hotel"
- "restored mansion"
- "unique architecture"

#### 3. **Reviews Analysis**
Common themes in Special Class hotel reviews:
- "unique experience"
- "personalized service"
- "historic building"
- "boutique feel"
- "cave rooms" (for Cappadocia)

#### 4. **Price Level**
- Special Class hotels typically have `price_level: 3-4` (expensive)
- But not always (some boutique properties are affordable)

---

## Implementation Steps

### Step 1: Database Migration
```bash
mysql tqa_db < database/add-hotel-category.sql
```

### Step 2: Enrich Hotels with Google Data
Run the enrichment script to fetch additional Google Places data:

```bash
node scripts/enrich-hotels-with-categories.ts
```

### Step 3: Manual Review
Special Class hotels should be manually verified because:
- Google data is not always accurate
- Room count is the definitive indicator
- Local knowledge matters (Museum Hotel is famous)

### Step 4: Update UI
Add category filter to hotel selection:
- Search/filter by category
- Display category badge on hotel cards
- Explain Special Class to operators

---

## Example Hotels by Category

### Special Class Hotels in Turkey

**Cappadocia:**
- Museum Hotel (30 rooms)
- Argos in Cappadocia (51 rooms - borderline)
- Hezen Cave Hotel (10 rooms)
- Sultan Cave Suites (17 rooms)

**Istanbul:**
- Tomtom Suites (20 rooms)
- Vault Karakoy (16 rooms)
- Shangri-La Bosphorus (186 rooms - NOT Special Class despite luxury)
- Georges Hotel Galata (20 rooms)

**Antalya:**
- Tuvana Hotel (historic mansion)
- Alp Pasa Hotel (restored Ottoman house)

**Key Insight:**
- Room count is the PRIMARY indicator
- Google rating helps but isn't definitive
- Manual tagging is essential for accuracy

---

## API Response Format

### Hotel with Category

```json
{
  "id": 1,
  "hotel_name": "Museum Hotel",
  "city": "Cappadocia",
  "star_rating": 5,
  "hotel_category": "special_class",
  "is_boutique": true,
  "room_count": 30,
  "rating": 4.8,
  "user_ratings_total": 450,
  "category_display": {
    "en": "Special Class (Boutique)",
    "tr": "Özel Sınıf (Butik)"
  }
}
```

---

## UI/UX Recommendations

### 1. Category Filter
```tsx
<select name="hotel_category">
  <option value="">All Categories</option>
  <option value="special_class">⭐ Special Class (Boutique)</option>
  <option value="luxury">💎 Luxury (6★)</option>
  <option value="standard_5star">5-Star Standard</option>
  <option value="standard_4star">4-Star Standard</option>
  <option value="standard_3star">3-Star Standard</option>
  <option value="budget">Budget (2-3★)</option>
</select>
```

### 2. Category Badge
```tsx
{hotel.hotel_category === 'special_class' && (
  <span className="badge badge-special">
    ✨ Special Class - Boutique Hotel
  </span>
)}
```

### 3. Tooltip/Info
Explain Special Class category to users:
> "Special Class hotels are boutique properties that offer 5-star quality but cannot receive official star ratings due to their small size (usually < 50 rooms) or unique characteristics like historic buildings or cave architecture."

---

## Data Quality Checklist

- [ ] All hotels have `hotel_category` assigned
- [ ] Special Class hotels have `is_boutique = TRUE`
- [ ] Special Class hotels have `room_count` populated
- [ ] Google ratings fetched for all hotels
- [ ] Manual verification of famous boutique hotels (Museum Hotel, etc.)
- [ ] Category metadata table populated
- [ ] UI updated to show categories
- [ ] Filters working correctly

---

## Future Enhancements

### 1. Auto-Classification from Google Reviews
Use AI to analyze Google reviews for keywords:
- "boutique"
- "cave hotel"
- "historic"
- "restored"
- "unique"

### 2. Turkish Ministry of Tourism API
If available, integrate official hotel classification data.

### 3. Room Count Data Source
Fetch room count from:
- Hotel website
- Booking.com API
- Manual data entry during hotel creation

### 4. Special Class Sub-Categories
- Cave Hotels (Cappadocia)
- Historic Mansions (Istanbul)
- Coastal Boutiques (Antalya)
- Thermal Spa Hotels (Pamukkale)
