-- ============================================
-- Activity Pricing System Migration
-- Component-based pricing for SIC and Private tours
-- ============================================

-- 1. Add operator_id to activities table (if not exists)
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS operator_id CHAR(36) NOT NULL AFTER id,
ADD CONSTRAINT fk_activities_operator
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE;

-- 2. Create activity_pricing table with component-based structure
CREATE TABLE IF NOT EXISTS activity_pricing (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  activity_id CHAR(36) NOT NULL,
  operator_id CHAR(36) NOT NULL,

  -- Pricing type: SIC (join-in) or Private (exclusive)
  pricing_type ENUM('sic', 'private') NOT NULL DEFAULT 'sic',

  -- Fixed costs (divided by pax count for private tours)
  transport_cost DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Vehicle cost - divided by pax for private',
  guide_cost DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Guide cost - divided by pax for private',

  -- Variable costs (always per person, never divided)
  entrance_fee_adult DECIMAL(10,2) DEFAULT 0.00,
  entrance_fee_child_0_2 DECIMAL(10,2) DEFAULT 0.00,
  entrance_fee_child_3_5 DECIMAL(10,2) DEFAULT 0.00,
  entrance_fee_child_6_11 DECIMAL(10,2) DEFAULT 0.00,
  entrance_fee_child_12_17 DECIMAL(10,2) DEFAULT 0.00,

  meal_cost_adult DECIMAL(10,2) DEFAULT 0.00,
  meal_cost_child DECIMAL(10,2) DEFAULT 0.00,

  -- For SIC pricing: simple per-person rate
  sic_price_adult DECIMAL(10,2) DEFAULT 0.00,
  sic_price_child_0_2 DECIMAL(10,2) DEFAULT 0.00,
  sic_price_child_3_5 DECIMAL(10,2) DEFAULT 0.00,
  sic_price_child_6_11 DECIMAL(10,2) DEFAULT 0.00,
  sic_price_child_12_17 DECIMAL(10,2) DEFAULT 0.00,

  -- For private pricing slabs (pax-based pricing tiers)
  min_pax INT DEFAULT 1,
  max_pax INT DEFAULT NULL,

  -- Seasonal pricing
  season ENUM('standard', 'high_season', 'low_season', 'peak') DEFAULT 'standard',
  valid_from DATE NULL,
  valid_until DATE NULL,

  -- Additional info
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_activity_pricing_activity
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_pricing_operator
    FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,

  INDEX idx_activity_pricing_activity (activity_id),
  INDEX idx_activity_pricing_operator (operator_id),
  INDEX idx_activity_pricing_type (pricing_type),
  INDEX idx_activity_pricing_season (season),
  INDEX idx_activity_pricing_dates (valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create transportation_pricing table (same component logic)
CREATE TABLE IF NOT EXISTS transportation_pricing (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  operator_id CHAR(36) NOT NULL,

  -- Vehicle details
  vehicle_type VARCHAR(100) NOT NULL COMMENT 'e.g., Sedan, Minivan, Minibus, Coach',
  vehicle_capacity INT NOT NULL COMMENT 'Maximum passenger capacity',

  -- Pricing structure
  base_cost DECIMAL(10,2) NOT NULL COMMENT 'Total vehicle cost (will be divided by pax)',
  per_hour_cost DECIMAL(10,2) DEFAULT 0.00,
  per_km_cost DECIMAL(10,2) DEFAULT 0.00,

  -- Distance/duration based pricing
  route_description VARCHAR(255) NULL COMMENT 'e.g., Airport to Hotel, Istanbul City Tour',
  estimated_duration_hours DECIMAL(4,2) NULL,
  estimated_distance_km DECIMAL(6,2) NULL,

  -- Seasonal pricing
  season ENUM('standard', 'high_season', 'low_season', 'peak') DEFAULT 'standard',
  valid_from DATE NULL,
  valid_until DATE NULL,

  -- Additional info
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_transportation_pricing_operator
    FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,

  INDEX idx_transportation_pricing_operator (operator_id),
  INDEX idx_transportation_pricing_vehicle (vehicle_type),
  INDEX idx_transportation_pricing_season (season)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Example Data and Usage Comments
-- ============================================

-- Example 1: SIC Tour (Istanbul Full Day Tour)
-- INSERT INTO activity_pricing (
--   id, activity_id, operator_id, pricing_type,
--   sic_price_adult, sic_price_child_6_11,
--   entrance_fee_adult, entrance_fee_child_6_11,
--   meal_cost_adult, meal_cost_child,
--   season, currency, notes
-- ) VALUES (
--   UUID(), 'activity-uuid', 'operator-uuid', 'sic',
--   150.00, 75.00,  -- SIC prices
--   45.00, 22.50,   -- Entrance fees (included in SIC)
--   25.00, 15.00,   -- Meal costs (included in SIC)
--   'standard', 'USD', 'Includes transport, guide, entrance fees, lunch'
-- );

-- Example 2: Private Tour (Istanbul Full Day Tour)
-- INSERT INTO activity_pricing (
--   id, activity_id, operator_id, pricing_type,
--   transport_cost, guide_cost,  -- Fixed costs to divide
--   entrance_fee_adult, entrance_fee_child_6_11,
--   meal_cost_adult, meal_cost_child,
--   min_pax, max_pax, season, currency
-- ) VALUES (
--   UUID(), 'activity-uuid', 'operator-uuid', 'private',
--   200.00, 150.00,  -- Transport + Guide costs (divide by pax)
--   45.00, 22.50,    -- Entrance fees (per person)
--   25.00, 15.00,    -- Meal costs (per person)
--   2, 6, 'standard', 'USD'
-- );

-- Calculation for Private Tour with 4 adults:
-- Fixed per person = (200 + 150) / 4 = 87.50
-- Variable per person = 45 + 25 = 70.00
-- Total per person = 87.50 + 70.00 = 157.50

-- Example 3: Transportation Service
-- INSERT INTO transportation_pricing (
--   id, operator_id, vehicle_type, vehicle_capacity,
--   base_cost, route_description, estimated_duration_hours,
--   season, currency
-- ) VALUES (
--   UUID(), 'operator-uuid', 'Minivan', 7,
--   120.00, 'Airport to Hotel Transfer', 1.5,
--   'standard', 'USD'
-- );

-- Calculation for 5 passengers:
-- Cost per person = 120.00 / 5 = 24.00
