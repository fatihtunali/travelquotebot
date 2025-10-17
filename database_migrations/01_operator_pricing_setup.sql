-- =====================================================
-- OPERATOR PRICING DATABASE MIGRATION
-- Version: 1.0
-- Date: October 17, 2025
-- Description: Add operator-specific pricing tables
-- =====================================================

-- Step 1: Add operator_id to existing accommodations table
-- This links each accommodation to a specific operator
ALTER TABLE accommodations
ADD COLUMN operator_id CHAR(36) NULL AFTER id,
ADD CONSTRAINT fk_accommodations_operator
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE;

CREATE INDEX idx_operator_accommodations ON accommodations(operator_id);

-- Step 2: Add operator_id to existing activities table
ALTER TABLE activities
ADD COLUMN operator_id CHAR(36) NULL AFTER id,
ADD CONSTRAINT fk_activities_operator
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE;

CREATE INDEX idx_operator_activities ON activities(operator_id);

-- Step 3: Create operator_transport table
-- Handles all transportation services (flights, buses, transfers, etc.)
CREATE TABLE operator_transport (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  operator_id CHAR(36) NOT NULL,

  -- Transport details
  name VARCHAR(255) NOT NULL COMMENT 'e.g., "Private Transfer Istanbul Airport to Hotel"',
  type ENUM('flight', 'bus', 'train', 'car_rental', 'private_transfer', 'ferry', 'metro', 'taxi') NOT NULL,

  -- Route
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  distance_km DECIMAL(8,2) NULL,
  duration_minutes INT NULL,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL COMMENT 'Base price for the service',
  price_per_person DECIMAL(10,2) NULL COMMENT 'Additional per-person cost (if applicable)',
  currency VARCHAR(3) DEFAULT 'USD',

  -- Capacity
  min_passengers INT DEFAULT 1,
  max_passengers INT NULL,

  -- Details
  description TEXT NULL,
  vehicle_type VARCHAR(100) NULL COMMENT 'e.g., "Mercedes Vito", "Tourist Bus", "Boeing 737"',
  amenities JSON NULL COMMENT '["WiFi", "AC", "Luggage space", "Refreshments"]',

  -- Meta
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_operator (operator_id),
  INDEX idx_type (type),
  INDEX idx_route (from_location, to_location),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Create operator_guide_services table
-- Tour guides and specialist services
CREATE TABLE operator_guide_services (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  operator_id CHAR(36) NOT NULL,

  -- Guide details
  name VARCHAR(255) NOT NULL COMMENT 'e.g., "English Speaking Guide - Full Day"',
  guide_type ENUM('tour_guide', 'driver_guide', 'specialist', 'translator') NOT NULL,

  -- Languages
  languages JSON NOT NULL COMMENT '["English", "German", "Turkish"]',

  -- Specialization
  specialization VARCHAR(255) NULL COMMENT 'e.g., "Archaeological sites", "Wine tours", "Photography"',

  -- Pricing
  price_per_day DECIMAL(10,2) NULL,
  price_per_hour DECIMAL(10,2) NULL,
  price_half_day DECIMAL(10,2) NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Capacity
  max_group_size INT NULL COMMENT 'Maximum group size this guide can handle',

  -- Availability
  cities JSON NULL COMMENT '["Istanbul", "Cappadocia", "Ephesus"]',
  description TEXT NULL,

  -- Meta
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_operator (operator_id),
  INDEX idx_type (guide_type),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Create operator_restaurants table
-- Meal options and restaurant partnerships
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
  specialties JSON NULL COMMENT '["Kebab", "Baklava", "Meze"]',
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
  INDEX idx_city (city),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 6: Create operator_additional_services table
-- Insurance, visas, entrance fees, and other extras
CREATE TABLE operator_additional_services (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  operator_id CHAR(36) NOT NULL,

  -- Service details
  name VARCHAR(255) NOT NULL COMMENT 'e.g., "Travel Insurance - 7 Days", "Museum Pass Istanbul"',
  service_type ENUM('insurance', 'visa', 'entrance_fee', 'airport_service', 'sim_card', 'equipment_rental', 'other') NOT NULL,

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  price_type ENUM('per_person', 'per_group', 'per_day', 'one_time') NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Details
  description TEXT NULL,
  mandatory TINYINT(1) DEFAULT 0 COMMENT 'Is this service mandatory for all tours?',
  included_in_packages TINYINT(1) DEFAULT 0 COMMENT 'Is this included in package price?',

  -- Meta
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_operator (operator_id),
  INDEX idx_type (service_type),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA FOR FUNNY TOURISM OPERATOR
-- operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'
-- =====================================================

-- Update existing accommodations to link to Funny Tourism
UPDATE accommodations
SET operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'
WHERE operator_id IS NULL;

-- Update existing activities to link to Funny Tourism
UPDATE activities
SET operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'
WHERE operator_id IS NULL;

-- Insert sample transport services
INSERT INTO operator_transport (id, operator_id, name, type, from_location, to_location, distance_km, duration_minutes, base_price, max_passengers, vehicle_type, amenities) VALUES
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Private Transfer - Istanbul Airport to Sultanahmet', 'private_transfer', 'Istanbul Sabiha Gökçen Airport', 'Sultanahmet Area', 45, 60, 45.00, 6, 'Mercedes Vito', '["WiFi", "AC", "Luggage space"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Private Transfer - Istanbul Airport to Taksim', 'private_transfer', 'Istanbul Airport', 'Taksim Square', 52, 75, 50.00, 6, 'Mercedes Vito', '["WiFi", "AC", "Luggage space"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Domestic Flight - Istanbul to Cappadocia', 'flight', 'Istanbul', 'Cappadocia (Kayseri)', 730, 90, 120.00, 1, 'Boeing 737', '["Baggage allowance", "In-flight service"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Tourist Bus - Full Day with Driver', 'bus', 'Istanbul', 'Various', NULL, 480, 250.00, 45, 'Mercedes Tourismo', '["WiFi", "AC", "Restroom", "Reclining seats"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Car Rental - Economy (per day)', 'car_rental', 'Istanbul', 'Customer choice', NULL, 1440, 35.00, 5, 'Fiat Egea or similar', '["AC", "GPS", "Insurance"]');

-- Insert sample guide services
INSERT INTO operator_guide_services (id, operator_id, name, guide_type, languages, specialization, price_per_day, price_half_day, currency, max_group_size, cities) VALUES
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'English Speaking Guide - Full Day', 'tour_guide', '["English", "Turkish"]', 'Historical sites and museums', 150.00, 85.00, 'USD', 15, '["Istanbul", "Cappadocia", "Ephesus"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'German Speaking Guide - Full Day', 'tour_guide', '["German", "Turkish", "English"]', 'General tourism', 160.00, 90.00, 'USD', 15, '["Istanbul", "Antalya"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Driver-Guide - Full Day', 'driver_guide', '["English", "Turkish"]', 'General tourism with transportation', 200.00, 120.00, 'USD', 6, '["Istanbul", "Cappadocia"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Archaeology Specialist Guide', 'specialist', '["English", "Turkish"]', 'Archaeological sites (Ephesus, Troy, etc.)', 200.00, 120.00, 'USD', 10, '["Ephesus", "Troy", "Pergamon"]');

-- Insert sample restaurant/meal options
INSERT INTO operator_restaurants (id, operator_id, name, city, cuisine_type, breakfast_price, lunch_price, dinner_price, price_range, specialties) VALUES
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Sultanahmet Köftecisi', 'Istanbul', 'Turkish', NULL, 20.00, 25.00, 'mid-range', '["Köfte", "Turkish meze", "Ayran"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Hafız Mustafa (Breakfast)', 'Istanbul', 'Turkish Breakfast', 15.00, NULL, NULL, 'mid-range', '["Turkish breakfast", "Börek", "Turkish tea"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Cappadocia Local Restaurant', 'Göreme', 'Turkish/Anatolian', NULL, 18.00, 22.00, 'mid-range', '["Testi kebab", "Pottery kebab", "Local wine"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Mikla Restaurant', 'Istanbul', 'Contemporary Turkish', NULL, NULL, 80.00, 'luxury', '["Fine dining", "Bosphorus view", "Modern Turkish cuisine"]'),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Budget Meal Option', 'Istanbul', 'Turkish Street Food', NULL, 8.00, 10.00, 'budget', '["Döner", "Simit", "Lahmacun"]');

-- Insert sample additional services
INSERT INTO operator_additional_services (id, operator_id, name, service_type, price, price_type, description, mandatory) VALUES
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Travel Insurance - 7 Days', 'insurance', 25.00, 'per_person', 'Comprehensive travel insurance covering medical, cancellation, and baggage', 0),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Travel Insurance - 14 Days', 'insurance', 45.00, 'per_person', 'Comprehensive travel insurance for 2-week trips', 0),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Museum Pass Istanbul (5 Days)', 'entrance_fee', 50.00, 'per_person', 'Access to major museums in Istanbul including Hagia Sophia, Topkapi Palace', 0),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Airport Meet & Greet Service', 'airport_service', 30.00, 'one_time', 'Personal assistant to meet you at airport and help with transfer', 0),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'Turkey SIM Card - 10GB', 'sim_card', 20.00, 'per_person', '10GB data + unlimited calls within Turkey', 0),
(UUID(), 'ed58206d-f600-483b-b98a-79805310e9be', 'E-Visa Processing Fee', 'visa', 35.00, 'per_person', 'Processing fee for Turkey e-visa (visa cost not included)', 1);

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify the migration was successful
-- =====================================================

-- Check accommodations linked to operator
-- SELECT COUNT(*) as count FROM accommodations WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be';

-- Check activities linked to operator
-- SELECT COUNT(*) as count FROM activities WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be';

-- Check transport services
-- SELECT COUNT(*) as count FROM operator_transport WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be';

-- Check guide services
-- SELECT COUNT(*) as count FROM operator_guide_services WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be';

-- Check restaurants
-- SELECT COUNT(*) as count FROM operator_restaurants WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be';

-- Check additional services
-- SELECT COUNT(*) as count FROM operator_additional_services WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be';
