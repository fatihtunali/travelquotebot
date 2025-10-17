# Operator Pricing Strategy

**Date:** October 17, 2025

---

## Business Model: Operator-Managed Pricing

Each tour operator maintains their own pricing database for all services they provide. This allows:

1. **Profit Control** - Operators set their own margins
2. **No API Costs** - All pricing is stored locally
3. **Fast Generation** - No external API calls needed
4. **Custom Packages** - Operators can create unique offerings
5. **Competitive Pricing** - Each operator can price differently

---

## Database Schema Enhancement

### Current Tables (Already Exist)
✅ `accommodations` - Hotels/lodging (currently shared)
✅ `activities` - Tours/experiences (currently shared)

### Required Changes

#### 1. Add `operator_id` to Existing Tables

**Accommodations Table - Add operator_id:**
```sql
ALTER TABLE accommodations
ADD COLUMN operator_id CHAR(36) NULL AFTER id,
ADD FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE;

CREATE INDEX idx_operator_accommodations ON accommodations(operator_id);
```

**Activities Table - Add operator_id:**
```sql
ALTER TABLE activities
ADD COLUMN operator_id CHAR(36) NULL AFTER id,
ADD FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE;

CREATE INDEX idx_operator_activities ON activities(operator_id);
```

#### 2. New Table: `operator_transport` (Transportation Services)

```sql
CREATE TABLE operator_transport (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  operator_id CHAR(36) NOT NULL,

  -- Transport details
  name VARCHAR(255) NOT NULL COMMENT 'e.g., "Private Transfer Istanbul Airport to Hotel"',
  type ENUM('flight', 'bus', 'train', 'car_rental', 'private_transfer', 'ferry', 'metro') NOT NULL,

  -- Route
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  distance_km DECIMAL(8,2) NULL,
  duration_minutes INT NULL,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  price_per_person DECIMAL(10,2) NULL COMMENT 'If applicable (e.g., bus tickets)',
  currency VARCHAR(3) DEFAULT 'USD',

  -- Capacity
  min_passengers INT DEFAULT 1,
  max_passengers INT NULL,

  -- Details
  description TEXT NULL,
  vehicle_type VARCHAR(100) NULL COMMENT 'e.g., "Mercedes Vito", "Tourist Bus"',
  amenities JSON NULL COMMENT '["WiFi", "AC", "Luggage space"]',

  -- Meta
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_operator (operator_id),
  INDEX idx_type (type),
  INDEX idx_route (from_location, to_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3. New Table: `operator_guide_services` (Tour Guides)

```sql
CREATE TABLE operator_guide_services (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  operator_id CHAR(36) NOT NULL,

  -- Guide details
  name VARCHAR(255) NOT NULL COMMENT 'e.g., "English Speaking Guide - Full Day"',
  guide_type ENUM('tour_guide', 'driver_guide', 'specialist', 'translator') NOT NULL,

  -- Languages
  languages JSON NOT NULL COMMENT '["English", "German", "Turkish"]',

  -- Specialization
  specialization VARCHAR(255) NULL COMMENT 'e.g., "Archaeological sites", "Wine tours"',

  -- Pricing
  price_per_day DECIMAL(10,2) NULL,
  price_per_hour DECIMAL(10,2) NULL,
  price_half_day DECIMAL(10,2) NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Capacity
  max_group_size INT NULL,

  -- Availability
  cities JSON NULL COMMENT '["Istanbul", "Cappadocia"]',
  description TEXT NULL,

  -- Meta
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_operator (operator_id),
  INDEX idx_type (guide_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4. New Table: `operator_restaurants` (Meal Pricing)

```sql
CREATE TABLE operator_restaurants (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  operator_id CHAR(36) NOT NULL,

  -- Restaurant details
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  cuisine_type VARCHAR(100) NULL COMMENT 'e.g., "Turkish", "Mediterranean", "International"',

  -- Meal types and pricing
  breakfast_price DECIMAL(10,2) NULL,
  lunch_price DECIMAL(10,2) NULL,
  dinner_price DECIMAL(10,2) NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Details
  description TEXT NULL,
  address TEXT NULL,
  specialties JSON NULL COMMENT '["Kebab", "Baklava"]',
  price_range ENUM('budget', 'mid-range', 'upscale', 'luxury') NULL,

  -- Location
  location_lat DECIMAL(10,8) NULL,
  location_lng DECIMAL(11,8) NULL,

  -- Meta
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_operator (operator_id),
  INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5. New Table: `operator_additional_services` (Extras)

```sql
CREATE TABLE operator_additional_services (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  operator_id CHAR(36) NOT NULL,

  -- Service details
  name VARCHAR(255) NOT NULL,
  service_type ENUM('insurance', 'visa', 'entrance_fee', 'airport_service', 'sim_card', 'other') NOT NULL,

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  price_type ENUM('per_person', 'per_group', 'per_day', 'one_time') NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Details
  description TEXT NULL,
  mandatory TINYINT(1) DEFAULT 0 COMMENT 'Is this service mandatory?',

  -- Meta
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_operator (operator_id),
  INDEX idx_type (service_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Sample Data Structure

### Example: Funny Tourism Operator Pricing

#### Accommodations (operator_id = 'ed58206d-f600-483b-b98a-79805310e9be')
```json
{
  "name": "Four Seasons Sultanahmet",
  "city": "Istanbul",
  "category": "hotel",
  "star_rating": 5.0,
  "base_price_per_night": 450.00,
  "operator_margin": 50.00,
  "cost_to_operator": 400.00,
  "selling_price": 450.00
}
```

#### Transport Services
```json
{
  "name": "Private Transfer - Istanbul Airport to Hotel",
  "type": "private_transfer",
  "from_location": "Istanbul Sabiha Gökçen Airport",
  "to_location": "Sultanahmet Area",
  "vehicle_type": "Mercedes Vito",
  "max_passengers": 6,
  "base_price": 45.00,
  "amenities": ["WiFi", "AC", "Luggage space"]
}
```

#### Guide Services
```json
{
  "name": "English Speaking Guide - Full Day",
  "guide_type": "tour_guide",
  "languages": ["English", "Turkish"],
  "price_per_day": 150.00,
  "max_group_size": 15,
  "cities": ["Istanbul", "Cappadocia"]
}
```

#### Restaurant/Meals
```json
{
  "name": "Sultanahmet Köftecisi",
  "city": "Istanbul",
  "cuisine_type": "Turkish",
  "lunch_price": 20.00,
  "dinner_price": 25.00,
  "price_range": "mid-range"
}
```

#### Additional Services
```json
{
  "name": "Travel Insurance - 7 Days",
  "service_type": "insurance",
  "price": 25.00,
  "price_type": "per_person",
  "mandatory": false
}
```

---

## Dashboard Features Needed

### 1. Pricing Management Dashboard
Location: `/dashboard/pricing`

**Sections:**
- 📍 **Accommodations** - Add/edit hotels with pricing
- 🚌 **Transportation** - Add/edit transport services
- 🎯 **Activities** - Add/edit tours and experiences
- 👤 **Guides** - Add/edit guide services
- 🍽️ **Restaurants** - Add/edit meal options
- ➕ **Additional Services** - Insurance, visas, etc.

### 2. Quick Actions Per Section
- ✅ Add new item
- ✏️ Edit existing item
- 🗑️ Deactivate item
- 📋 Clone item (duplicate with modifications)
- 📊 View pricing history

### 3. Bulk Import
- CSV/Excel upload for mass data entry
- Template download for easier data preparation

---

## Itinerary Generation Flow

### OLD (External APIs - ❌):
1. Customer requests itinerary
2. Call external APIs for each service
3. High cost, slow, unpredictable

### NEW (Operator Database - ✅):
1. Customer requests itinerary
2. Query operator's own pricing database
3. AI generates itinerary using operator's services
4. Operator controls margins = profitable
5. Fast, predictable, cost-effective

---

## Implementation Steps

### Phase 1: Database Setup (Now)
1. ✅ Run ALTER TABLE statements to add operator_id
2. ✅ Create new tables (transport, guides, restaurants, additional_services)
3. ✅ Add sample data for Funny Tourism operator

### Phase 2: Admin UI (Next)
1. Create pricing management pages in dashboard
2. Forms to add/edit each service type
3. List views with search/filter
4. Bulk import functionality

### Phase 3: AI Integration (After UI)
1. Update itinerary API to query operator's services
2. Pass operator's pricing to Claude
3. Claude generates itinerary using operator's inventory
4. Calculate accurate total costs

---

## Benefits of This Approach

### For Operators:
- 💰 **Control Margins** - Set your own prices
- 🎯 **Flexible Packages** - Create unique offerings
- ⚡ **Fast Quotes** - Instant pricing, no API delays
- 📊 **Track Inventory** - Know what you're selling

### For Platform:
- 💵 **No API Costs** - All data is local
- 🚀 **Fast Performance** - No external dependencies
- 🔒 **Data Ownership** - Operators own their pricing
- 📈 **Scalable** - Works for 1 or 1000 operators

### For Customers:
- ⏱️ **Instant Quotes** - Get pricing immediately
- 🎨 **Custom Options** - Each operator offers different experiences
- 💯 **Accurate Pricing** - Real prices, not estimates

---

## Next Actions

1. **Run database migrations** to add operator_id and new tables
2. **Insert sample data** for Funny Tourism operator
3. **Create pricing management UI** in dashboard
4. **Update AI generation** to use operator's pricing

---

**Status:** Ready to implement
**Priority:** High - Core business functionality
