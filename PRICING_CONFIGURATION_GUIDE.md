# Professional Pricing Configuration System

## Overview

Your TravelQuoteBot now has a **complete professional pricing configuration system** that allows you to customize:

- **Room Type Pricing** (Double, Triple, Single Supplement)
- **Hotel Category Multipliers** (3-star, 4-star, 5-star)
- **Markup & Tax Percentages**
- **Child Age Slabs** with discounts

---

## How to Access

### Main Pricing Configuration Page:
```
http://localhost:3000/dashboard/pricing/configuration
```

Or navigate:
1. Dashboard → Pricing → **⚙️ Pricing Configuration** (first card in Quick Actions)

---

## Features

### 1. Room Type Pricing

#### Single Supplement
- **Type**: Percentage or Fixed Amount
- **Example**:
  - `50%` (percentage) = Solo travelers pay 50% more
  - `$100` (fixed) = Solo travelers pay additional $100 per person

#### Triple Room Discount
- **Default**: 10% discount for triple occupancy
- **Example**: If double room is $200/person, triple is $180/person

### 2. Hotel Category Multipliers

Configure pricing for different star ratings:

- **3-Star Multiplier**: Default 0.70 (30% cheaper than 4-star)
- **4-Star Multiplier**: Default 1.00 (base price)
- **5-Star Multiplier**: Default 1.40 (40% more expensive)

**Example**:
- If 4-star costs $300/night
- 3-star = $210/night (0.70×)
- 5-star = $420/night (1.40×)

### 3. Markup & Tax

- **Default Markup**: 15% (your profit margin)
- **Tax/VAT**: 0% by default (set to 18 for Turkish KDV)
- **Currency**: USD, EUR, TRY, GBP

### 4. Child Pricing Slabs

Create age-based discounts:

**Default Slabs**:
- 0-2 years: **FREE**
- 3-6 years: **50% off**
- 7-11 years: **25% off**
- 12-17 years: **10% off**

You can:
- Add new age groups
- Edit existing slabs
- Set percentage or fixed discounts
- Activate/deactivate slabs

---

## How Pricing Works

### Quote Generation Flow:

```
Customer requests 3-day Istanbul tour for 2 people
    ↓
AI generates itinerary with expenses
    ↓
System fetches YOUR pricing configuration
    ↓
Calculates 5 pax tiers (2-3, 4-5, 6-9, 10-15, 16+)
    ↓
For each tier, calculates 3 hotel categories (3/4/5 star)
    ↓
For each category, calculates 3 room types (double, triple, single)
    ↓
Results in 5 tiers × 3 categories × 3 room types = 45 price variations!
```

### Example Output:

**2-3 Pax Tier**:
- **3-Star Double**: $280/person
- **3-Star Triple**: $252/person (10% discount)
- **3-Star Single Supplement**: +$140 (50% of double)
- **4-Star Double**: $400/person (base)
- **4-Star Triple**: $360/person
- **4-Star Single Supplement**: +$200
- **5-Star Double**: $560/person (40% premium)
- **5-Star Triple**: $504/person
- **5-Star Single Supplement**: +$280

---

## Configuration Steps

### Step 1: Set Room Pricing Rules

1. Go to **Pricing Configuration** page
2. Set **Single Supplement**: `Percentage` or `Fixed`
   - Example: `50%` means singles pay 1.5× double rate
3. Set **Triple Discount**: `10%` means triple rooms get 10% off double rate

### Step 2: Configure Hotel Categories

1. Set multipliers for each star rating
   - **3-Star**: `0.70` (budget option)
   - **4-Star**: `1.00` (standard)
   - **5-Star**: `1.40` (luxury)

### Step 3: Set Markup & Tax

1. **Markup**: Your profit margin (15% default)
2. **Tax**: VAT/KDV (18% for Turkey, 0% for international)
3. **Currency**: Select your base currency

### Step 4: Configure Child Slabs

1. Click **"+ Add Age Group"**
2. Set age range (e.g., 3-6 years)
3. Choose discount type:
   - **Free**: Children don't pay
   - **Percentage**: % off adult price
   - **Fixed**: Fixed amount discount
4. Click **Save** for each slab

### Step 5: Save Configuration

Click **"Save Configuration"** button at the bottom

---

## Database Tables

### `operator_pricing_config`
Stores main configuration:
- Single supplement (type & value)
- Triple room discount
- Hotel category multipliers (3/4/5 star)
- Default markup & tax percentages
- Currency

### `operator_child_pricing`
Stores child age slabs:
- Age range (min/max)
- Discount type & value
- Label (display name)
- Active status

### `pricing_tiers`
Generated for each quote:
- 5 pax tiers
- 3 hotel categories (per tier)
- 3 room types (per category)
- Complete cost breakdown

---

## API Endpoints

### Get Configuration
```
GET /api/pricing/config
Authorization: Bearer <token>
```

### Update Configuration
```
PUT /api/pricing/config
Content-Type: application/json

{
  "single_supplement_type": "percentage",
  "single_supplement_value": 50.00,
  "triple_room_discount_percentage": 10.00,
  "three_star_multiplier": 0.70,
  "four_star_multiplier": 1.00,
  "five_star_multiplier": 1.40,
  "default_markup_percentage": 15.00,
  "default_tax_percentage": 18.00,
  "currency": "USD"
}
```

### Child Slabs
```
GET    /api/pricing/config/child-slabs
POST   /api/pricing/config/child-slabs
PUT    /api/pricing/config/child-slabs
DELETE /api/pricing/config/child-slabs?id=<slab-id>
```

---

## Testing

### Verify Configuration Was Applied:

```bash
node test-professional-quote.js
```

Check the output for:
- ✅ Pricing tiers using YOUR configured markup
- ✅ Room types with YOUR configured supplements
- ✅ Hotel categories with YOUR configured multipliers

---

## Migration Details

**Migration 04**: `database_migrations/04_pricing_configuration.sql`

Created:
- `operator_pricing_config` table (one per operator)
- `operator_child_pricing` table (multiple slabs per operator)
- Default configurations for all existing operators
- Default child slabs (4 age groups)

Run migration:
```bash
node scripts/run-migration-04.js
```

---

## Best Practices

### 1. Set Realistic Markup
- Budget tours: 10-15%
- Standard tours: 15-20%
- Luxury tours: 20-30%

### 2. Configure Hotel Multipliers
- Research competitor pricing for each star category
- Adjust multipliers based on actual cost differences

### 3. Child Discounts
- Infants (0-2): Always free
- Young children (3-6): 50% off is standard
- Older children (7-11): 25% off
- Teens (12-17): 10% off

### 4. Single Supplement
- Industry standard: 30-50% extra
- Luxury tours: Can be 100% (full double rate)

### 5. Triple Rooms
- Usually 5-15% cheaper per person
- Reflects shared room costs

---

## Troubleshooting

### Q: My pricing config isn't being applied?

A: Check that:
1. Configuration was saved successfully
2. You're generating NEW itineraries (not viewing old ones)
3. Migration 04 ran successfully

### Q: Can I have different configs for different seasons?

A: Not yet. Currently one config per operator. Seasonal pricing should be handled via `accommodation_price_variations` table.

### Q: Can child pricing be applied automatically?

A: Child pricing configuration is stored and ready for use. You'll need to update the quote generation logic to apply child discounts when travelers include children.

---

## Next Steps

### Optional Enhancements:

1. **Seasonal Configuration**
   - High season markup (summer: +20%)
   - Low season discount (winter: -10%)

2. **Group Size Discounts**
   - Auto-adjust markup for large groups
   - Special rates for 20+ pax

3. **Quote Comparison UI**
   - Show all pricing tiers side-by-side
   - Let customers select hotel category
   - Display child pricing options

4. **PDF Export**
   - Generate professional quote PDFs
   - Include all pricing tiers
   - Custom branding

---

## Summary

✅ **Database**: 2 new tables created
✅ **UI**: Complete configuration page
✅ **API**: 2 endpoints (config + child slabs)
✅ **Integration**: Pricing calculation updated
✅ **Testing**: Verification script available

**Access Now**: http://localhost:3000/dashboard/pricing/configuration

🎉 **Your pricing system is now fully professional and configurable!**
