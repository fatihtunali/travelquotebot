-- =====================================================
-- ENHANCED ITINERARY FIELDS MIGRATION
-- Version: 2.0
-- Date: October 18, 2025
-- Description: Add contact info, operational details, and practical information
--              to support comprehensive travel itineraries
-- =====================================================

-- ========================================
-- 1. ACCOMMODATIONS - Add Contact & Check-in Info
-- ========================================
ALTER TABLE accommodations
ADD COLUMN address TEXT NULL AFTER description,
ADD COLUMN phone VARCHAR(50) NULL AFTER address,
ADD COLUMN check_in_time TIME DEFAULT '14:00:00' AFTER phone,
ADD COLUMN check_out_time TIME DEFAULT '11:00:00' AFTER check_in_time,
ADD COLUMN website VARCHAR(255) NULL AFTER check_out_time;

-- ========================================
-- 2. ACTIVITIES - Add Meeting Point & Operational Details
-- ========================================
ALTER TABLE activities
ADD COLUMN meeting_point TEXT NULL AFTER description,
ADD COLUMN phone VARCHAR(50) NULL AFTER meeting_point,
ADD COLUMN booking_required TINYINT(1) DEFAULT 1 AFTER phone,
ADD COLUMN difficulty_level ENUM('easy', 'moderate', 'challenging', 'difficult') DEFAULT 'easy' AFTER booking_required,
ADD COLUMN operating_hours VARCHAR(100) NULL AFTER difficulty_level,
ADD COLUMN seasonal_operation TINYINT(1) DEFAULT 0 AFTER operating_hours,
ADD COLUMN best_time_to_visit VARCHAR(100) NULL AFTER seasonal_operation,
ADD COLUMN included_items JSON NULL AFTER best_time_to_visit,
ADD COLUMN excluded_items JSON NULL AFTER included_items,
ADD COLUMN cancellation_policy VARCHAR(255) NULL AFTER excluded_items;

-- ========================================
-- 3. OPERATOR_RESTAURANTS - Add Contact & Hours
-- ========================================
ALTER TABLE operator_restaurants
ADD COLUMN phone VARCHAR(50) NULL AFTER address,
ADD COLUMN operating_hours VARCHAR(100) NULL AFTER phone,
ADD COLUMN reservation_required TINYINT(1) DEFAULT 0 AFTER operating_hours,
ADD COLUMN average_meal_duration INT DEFAULT 90 AFTER reservation_required,
ADD COLUMN dress_code ENUM('casual', 'smart_casual', 'formal') DEFAULT 'casual' AFTER average_meal_duration,
ADD COLUMN recommended_dishes JSON NULL AFTER dress_code;

-- ========================================
-- 4. OPERATOR_TRANSPORT - Add Pickup & Timing Details
-- ========================================
ALTER TABLE operator_transport
ADD COLUMN pickup_location VARCHAR(255) NULL AFTER to_location,
ADD COLUMN default_departure_time TIME NULL AFTER pickup_location,
ADD COLUMN includes_meet_greet TINYINT(1) DEFAULT 0 AFTER default_departure_time,
ADD COLUMN luggage_capacity INT NULL AFTER vehicle_type,
ADD COLUMN child_seat_available TINYINT(1) DEFAULT 0 AFTER luggage_capacity,
ADD COLUMN contact_phone VARCHAR(50) NULL AFTER child_seat_available;

-- ========================================
-- 5. OPERATOR_GUIDE_SERVICES - Add Contact & Availability
-- ========================================
ALTER TABLE operator_guide_services
ADD COLUMN phone VARCHAR(50) NULL AFTER description,
ADD COLUMN email VARCHAR(255) NULL AFTER phone,
ADD COLUMN years_experience INT NULL AFTER specialization,
ADD COLUMN certifications JSON NULL AFTER years_experience,
ADD COLUMN availability_notes TEXT NULL AFTER cities;

-- ========================================
-- 6. Add indexes for commonly searched fields
-- ========================================
CREATE INDEX idx_accommodations_city_active ON accommodations(city, is_active);
CREATE INDEX idx_activities_city_active ON activities(city, is_active);
CREATE INDEX idx_activities_difficulty ON activities(difficulty_level);
CREATE INDEX idx_restaurants_city_active ON operator_restaurants(city, is_active);
CREATE INDEX idx_transport_route ON operator_transport(from_location, to_location, is_active);

-- ========================================
-- 7. Update existing data with sample values for Funny Tourism
-- ========================================

-- Update accommodations with sample contact info
UPDATE accommodations
SET
  phone = '+90 212 XXX XXXX',
  check_in_time = '14:00:00',
  check_out_time = '11:00:00'
WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'
  AND phone IS NULL;

-- Update activities with operational details
UPDATE activities
SET
  booking_required = 1,
  difficulty_level = 'easy',
  included_items = '["Professional guide", "Entrance fees", "Transportation"]',
  excluded_items = '["Personal expenses", "Tips", "Meals"]',
  cancellation_policy = 'Free cancellation up to 24 hours before start'
WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'
  AND booking_required IS NULL;

-- Update restaurants with operating hours
UPDATE operator_restaurants
SET
  operating_hours = 'Daily 11:00-23:00',
  reservation_required = 0,
  average_meal_duration = 90,
  dress_code = 'casual'
WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'
  AND operating_hours IS NULL;

-- Update transport with contact info
UPDATE operator_transport
SET
  includes_meet_greet = 1,
  contact_phone = '+90 532 XXX XXXX'
WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'
  AND type IN ('private_transfer', 'bus')
  AND contact_phone IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify the migration was successful
-- =====================================================

-- Check accommodations have new fields
-- SELECT name, city, phone, check_in_time, check_out_time FROM accommodations LIMIT 5;

-- Check activities have operational details
-- SELECT name, booking_required, difficulty_level, operating_hours, included_items FROM activities LIMIT 5;

-- Check restaurants have contact info
-- SELECT name, phone, operating_hours, reservation_required FROM operator_restaurants LIMIT 5;

-- Check transport has pickup details
-- SELECT name, pickup_location, includes_meet_greet, contact_phone FROM operator_transport LIMIT 5;
