# Hotel Category System Implementation

## 🎯 Goal
Properly classify Turkish hotels including **Special Class** boutique hotels (like Museum Hotel) that can't get official star ratings due to room count or unique characteristics.

---

## 📋 Current vs Proposed Schema

### CURRENT (Limited)
```sql
hotels table:
├── star_rating INT                -- Just 3, 4, or 5
└── rating DECIMAL(2,1)           -- Google rating
```

### PROPOSED (Comprehensive)
```sql
hotels table:
├── star_rating INT                -- Official star rating (nullable)
├── hotel_category ENUM            -- NEW: Proper Turkish classification
│   ├── 'budget'                  -- 2-star level
│   ├── 'standard_3star'          -- Official 3★
│   ├── 'standard_4star'          -- Official 4★
│   ├── 'standard_5star'          -- Official 5★
│   ├── 'special_class'           -- ✨ Boutique (< 50 rooms, unique)
│   └── 'luxury'                  -- 💎 Ultra-luxury (6★ level)
├── room_count INT                 -- NEW: Key for Special Class detection
├── is_boutique BOOLEAN            -- NEW: Quick boutique indicator
└── [existing Google fields]
```

---

## 🏨 Turkish Hotel Categories

| Category | Turkish | Description | Examples |
|----------|---------|-------------|----------|
| **Special Class** | **Özel Sınıf** | **Boutique hotels < 50 rooms, or unique properties that can't get official ratings** | **Museum Hotel (30 rooms), Argos Cappadocia, Tomtom Suites** |
| Luxury | Lüks | Ultra-luxury, 6★ equivalent | Çırağan Palace, Four Seasons Bosphorus |
| Standard 5★ | 5 Yıldız | Official 5-star hotels | Most 5-star chains |
| Standard 4★ | 4 Yıldız | Official 4-star hotels | Mid-range quality |
| Standard 3★ | 3 Yıldız | Official 3-star hotels | Good standard |
| Budget | Ekonomik | 2-star level | Budget-friendly |

---

## 🔍 Special Class Detection Logic

### Method 1: Room Count (Most Reliable)
```typescript
if (room_count < 50 && star_rating >= 4) {
  return 'special_class';
}
```

### Method 2: Google Metrics (Automated)
```typescript
// High quality + Low review count = Small boutique property
if (
  rating >= 4.5 &&           // Excellent rating
  user_ratings_total >= 50 && user_ratings_total <= 500 && // Moderate reviews = smaller property
  star_rating >= 4            // Quality level
) {
  return 'special_class';
}
```

### Method 3: Google Editorial Summary (AI-Powered)
```typescript
const boutiqueKeywords = ['boutique', 'cave hotel', 'historic', 'restored', 'mansion', 'heritage'];
const editorialSummary = googleData.editorial_summary?.overview?.toLowerCase();

if (boutiqueKeywords.some(keyword => editorialSummary.includes(keyword))) {
  return 'special_class';
}
```

---

## 📊 Google API Enhancement Opportunities

### Currently Using
✅ `rating` - Google user rating (1-5)
✅ `user_ratings_total` - Review count
✅ `photos` - Hotel images
✅ `latitude/longitude` - Location
✅ `website` - Hotel website

### NOT Currently Using (but should!)
❌ `editorial_summary` - Google's AI description (mentions "boutique", "cave hotel", etc.)
❌ `types[]` - Place types (can include "tourist_attraction" for historic hotels)
❌ `price_level` - Price indication (0-4, Special Class often has 3-4)
❌ `reviews` - Actual review text (can analyze for boutique indicators)
❌ `business_status` - OPERATIONAL status

---

## 🚀 Implementation Plan

### Step 1: Database Migration
```bash
# Run on production database
mysql tqa_db < database/add-hotel-category.sql
```

**What it does:**
- Adds `hotel_category`, `room_count`, `is_boutique` columns
- Auto-classifies existing hotels based on current star_rating
- Identifies potential Special Class hotels using Google metrics
- Creates `hotel_categories` reference table

### Step 2: Enrich with Google Data
```bash
# Fetch fresh Google data and reclassify
npm run ts-node scripts/classify-hotels-with-google-data.ts enrich
```

**What it does:**
- Fetches fresh Google Places data for all hotels
- Analyzes editorial summaries for boutique keywords
- Classifies hotels using multi-factor algorithm
- Updates database with new categories

### Step 3: Manual Review
```bash
# Show identified Special Class hotels for verification
npm run ts-node scripts/classify-hotels-with-google-data.ts show-special-class
```

**Review and correct:**
- Museum Hotel should be Special Class ✓
- Large chain hotels (Shangri-La 186 rooms) should NOT be Special Class
- Add room_count manually for known boutique properties

### Step 4: Update UI/API
- Add category filter to hotel management
- Display category badge on hotel cards
- Update itinerary generation to respect categories
- Allow operators to override classification

---

## 💡 Key Insights

### Why Room Count is Critical
```
Museum Hotel:
- 30 rooms → Special Class ✓
- 5-star quality
- Google rating: 4.8★
- But CAN'T get official 5-star rating due to < 50 rooms

Çırağan Palace:
- 310 rooms → NOT Special Class
- Official 5-star rating
- Google rating: 4.7★
- This is "Luxury" category
```

### Why Google Metrics Help
```sql
-- Large 5-star hotel
rating: 4.7, reviews: 12,000 → standard_5star or luxury

-- Boutique Special Class
rating: 4.8, reviews: 300 → special_class
  ↳ Fewer reviews = smaller property = likely boutique
```

---

## 🎨 UI Examples

### Hotel Card Badge
```tsx
{hotel.hotel_category === 'special_class' && (
  <div className="badge badge-special">
    ✨ Special Class - Boutique
    {hotel.room_count && ` (${hotel.room_count} rooms)`}
  </div>
)}
```

### Category Filter
```tsx
<select name="hotel_category">
  <option value="">All Categories</option>
  <option value="special_class">⭐ Special Class (Boutique) - Özel Sınıf</option>
  <option value="luxury">💎 Luxury (6★) - Lüks</option>
  <option value="standard_5star">5★ Standard - 5 Yıldız</option>
  <option value="standard_4star">4★ Standard - 4 Yıldız</option>
  <option value="standard_3star">3★ Standard - 3 Yıldız</option>
  <option value="budget">Budget (2-3★) - Ekonomik</option>
</select>
```

### Info Tooltip
```
ℹ️ What is Special Class?

Special Class hotels are high-quality boutique properties that cannot
receive official star ratings due to:
• Small size (typically < 50 rooms)
• Historic building restrictions
• Unique architecture (cave hotels, restored mansions)

Examples: Museum Hotel, Argos Cappadocia, Tomtom Suites
```

---

## 📈 Expected Results

After implementation:

```
BEFORE:
Hotels: Just star_rating (3, 4, 5)
- Can't distinguish Museum Hotel from large 5-star chains
- No way to filter boutique properties

AFTER:
Hotels: Properly categorized
✅ Museum Hotel → Special Class (boutique, 30 rooms)
✅ Çırağan Palace → Luxury (5-star, 310 rooms)
✅ Standard hotels → Classified correctly
✅ Operators can filter by category
✅ Itinerary pricing considers category differences
```

---

## 🎯 Next Steps

### Option 1: Automated Approach (Recommended)
1. Run database migration
2. Run Google enrichment script
3. Manual review of Special Class hotels
4. Update UI

**Time:** ~2-3 hours
**Accuracy:** ~85% (needs manual verification)

### Option 2: Manual Approach
1. Run database migration
2. Manually tag known boutique hotels
3. Add room_count manually
4. Update UI

**Time:** ~5-10 hours
**Accuracy:** 100% (but time-consuming)

### Option 3: Hybrid (Best)
1. Run automated classification
2. Manually verify and correct Special Class hotels
3. Add room_count for all Special Class properties
4. Update UI

**Time:** ~3-4 hours
**Accuracy:** ~95%

---

## 📝 Questions to Decide

1. **Do you want to add room_count manually for key hotels?**
   - Yes = Better Special Class detection
   - No = Rely on Google metrics only

2. **Should we fetch editorial_summary from Google?**
   - Yes = Better boutique detection
   - No = Stick with current metrics

3. **Do you have a list of known Special Class hotels?**
   - Museum Hotel (Cappadocia) ✓
   - Argos in Cappadocia ✓
   - Tomtom Suites (Istanbul) ✓
   - Others?

4. **Should operators be able to override category?**
   - Yes = Manual control
   - No = Fully automated

---

## 🚀 Ready to Implement?

I've created:
1. ✅ Database migration SQL (`add-hotel-category.sql`)
2. ✅ Classification script (`classify-hotels-with-google-data.ts`)
3. ✅ Comprehensive guide (`HOTEL-CATEGORY-GUIDE.md`)

**Next:** Would you like me to:
- Run the migration on your database?
- Test the classification script?
- Update the hotel management UI?
- All of the above?

Let me know and I'll proceed! 🎯
