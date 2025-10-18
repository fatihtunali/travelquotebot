-- =====================================================
-- ENHANCED ITINERARY FIELDS MIGRATION (SAFE VERSION)
-- Version: 2.0
-- Date: October 18, 2025
-- Description: Add contact info, operational details, and practical information
--              Uses IF NOT EXISTS-style checks to avoid duplicate column errors
-- =====================================================

-- ========================================
-- 1. ACCOMMODATIONS - Add Contact & Check-in Info
-- ========================================

-- Check and add address if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'accommodations'
  AND COLUMN_NAME = 'address'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE accommodations ADD COLUMN address TEXT NULL AFTER description',
  'SELECT "Column address already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add other accommodation fields
ALTER TABLE accommodations
ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL AFTER description,
ADD COLUMN IF NOT EXISTS check_in_time TIME DEFAULT '14:00:00' AFTER phone,
ADD COLUMN IF NOT EXISTS check_out_time TIME DEFAULT '11:00:00' AFTER check_in_time,
ADD COLUMN IF NOT EXISTS website VARCHAR(255) NULL AFTER check_out_time;

-- ========================================
-- 2. ACTIVITIES - Add Meeting Point & Operational Details
-- ========================================
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS meeting_point TEXT NULL AFTER description,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL AFTER meeting_point,
ADD COLUMN IF NOT EXISTS booking_required TINYINT(1) DEFAULT 1 AFTER phone,
ADD COLUMN IF NOT EXISTS difficulty_level ENUM('easy', 'moderate', 'challenging', 'difficult') DEFAULT 'easy' AFTER booking_required,
ADD COLUMN IF NOT EXISTS operating_hours VARCHAR(100) NULL AFTER difficulty_level,
ADD COLUMN IF NOT EXISTS seasonal_operation TINYINT(1) DEFAULT 0 AFTER operating_hours,
ADD COLUMN IF NOT EXISTS best_time_to_visit VARCHAR(100) NULL AFTER seasonal_operation,
ADD COLUMN IF NOT EXISTS included_items JSON NULL AFTER best_time_to_visit,
ADD COLUMN IF NOT EXISTS excluded_items JSON NULL AFTER included_items,
ADD COLUMN IF NOT EXISTS cancellation_policy VARCHAR(255) NULL AFTER excluded_items;

-- ========================================
-- 3. OPERATOR_RESTAURANTS - Add Contact & Hours (address already exists)
-- ========================================
ALTER TABLE operator_restaurants
ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL AFTER address,
ADD COLUMN IF NOT EXISTS operating_hours VARCHAR(100) NULL AFTER phone,
ADD COLUMN IF NOT EXISTS reservation_required TINYINT(1) DEFAULT 0 AFTER operating_hours,
ADD COLUMN IF NOT EXISTS average_meal_duration INT DEFAULT 90 AFTER reservation_required,
ADD COLUMN IF NOT EXISTS dress_code ENUM('casual', 'smart_casual', 'formal') DEFAULT 'casual' AFTER average_meal_duration,
ADD COLUMN IF NOT EXISTS recommended_dishes JSON NULL AFTER dress_code;

-- ========================================
-- 4. OPERATOR_TRANSPORT - Add Pickup & Timing Details
-- ========================================
ALTER TABLE operator_transport
ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(255) NULL AFTER to_location,
ADD COLUMN IF NOT EXISTS default_departure_time TIME NULL AFTER pickup_location,
ADD COLUMN IF NOT EXISTS includes_meet_greet TINYINT(1) DEFAULT 0 AFTER default_departure_time,
ADD COLUMN IF NOT EXISTS luggage_capacity INT NULL AFTER vehicle_type,
ADD COLUMN IF NOT EXISTS child_seat_available TINYINT(1) DEFAULT 0 AFTER luggage_capacity,
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50) NULL AFTER child_seat_available;

-- ========================================
-- 5. OPERATOR_GUIDE_SERVICES - Add Contact & Availability
-- ========================================
ALTER TABLE operator_guide_services
ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL AFTER description,
ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL AFTER phone,
ADD COLUMN IF NOT EXISTS years_experience INT NULL AFTER specialization,
ADD COLUMN IF NOT EXISTS certifications JSON NULL AFTER years_experience,
ADD COLUMN IF NOT EXISTS availability_notes TEXT NULL AFTER cities;

-- ========================================
-- 6. Add indexes for commonly searched fields (with IF NOT EXISTS checks)
-- ========================================

-- Create indexes only if they don't exist
SET @index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'accommodations'
  AND INDEX_NAME = 'idx_accommodations_city_active'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_accommodations_city_active ON accommodations(city, is_active)',
  'SELECT "Index idx_accommodations_city_active already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'activities'
  AND INDEX_NAME = 'idx_activities_city_active'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_activities_city_active ON activities(city, is_active)',
  'SELECT "Index idx_activities_city_active already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'activities'
  AND INDEX_NAME = 'idx_activities_difficulty'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_activities_difficulty ON activities(difficulty_level)',
  'SELECT "Index idx_activities_difficulty already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'operator_restaurants'
  AND INDEX_NAME = 'idx_restaurants_city_active'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_restaurants_city_active ON operator_restaurants(city, is_active)',
  'SELECT "Index idx_restaurants_city_active already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'operator_transport'
  AND INDEX_NAME = 'idx_transport_route'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_transport_route ON operator_transport(from_location(100), to_location(100), is_active)',
  'SELECT "Index idx_transport_route already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 7. Update existing data with sample values for Funny Tourism
-- ========================================

-- Update accommodations with sample contact info
UPDATE accommodations
SET
  phone = COALESCE(phone, '+90 212 XXX XXXX'),
  check_in_time = COALESCE(check_in_time, '14:00:00'),
  check_out_time = COALESCE(check_out_time, '11:00:00')
WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be';

-- Update activities with operational details
UPDATE activities
SET
  booking_required = COALESCE(booking_required, 1),
  difficulty_level = COALESCE(difficulty_level, 'easy'),
  included_items = COALESCE(included_items, '["Professional guide", "Entrance fees", "Transportation"]'),
  excluded_items = COALESCE(excluded_items, '["Personal expenses", "Tips", "Meals"]'),
  cancellation_policy = COALESCE(cancellation_policy, 'Free cancellation up to 24 hours before start')
WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be';

-- Update restaurants with operating hours
UPDATE operator_restaurants
SET
  operating_hours = COALESCE(operating_hours, 'Daily 11:00-23:00'),
  reservation_required = COALESCE(reservation_required, 0),
  average_meal_duration = COALESCE(average_meal_duration, 90),
  dress_code = COALESCE(dress_code, 'casual')
WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be';

-- Update transport with contact info
UPDATE operator_transport
SET
  includes_meet_greet = COALESCE(includes_meet_greet, 1),
  contact_phone = COALESCE(contact_phone, '+90 532 XXX XXXX')
WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'
  AND type IN ('private_transfer', 'bus');
