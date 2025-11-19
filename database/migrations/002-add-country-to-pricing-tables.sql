-- Migration: Add country_id to all pricing tables
-- Date: 2025-11-19
-- Description: Add country context to prevent city name collisions

-- ============================================================================
-- IMPORTANT: This migration is NON-BREAKING
-- All country_id columns are added as NULLABLE first
-- Existing queries will continue to work without modification
-- ============================================================================

SET @country_id_exists_hotels = 0;
SET @country_id_exists_tours = 0;
SET @country_id_exists_vehicles = 0;
SET @country_id_exists_guides = 0;
SET @country_id_exists_entrance_fees = 0;
SET @country_id_exists_meal_pricing = 0;
SET @country_id_exists_extra_expenses = 0;
SET @country_id_exists_intercity = 0;

-- Check if columns already exist
SELECT COUNT(*) INTO @country_id_exists_hotels FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'hotels' AND column_name = 'country_id';

SELECT COUNT(*) INTO @country_id_exists_tours FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'tours' AND column_name = 'country_id';

SELECT COUNT(*) INTO @country_id_exists_vehicles FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'vehicles' AND column_name = 'country_id';

SELECT COUNT(*) INTO @country_id_exists_guides FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'guides' AND column_name = 'country_id';

SELECT COUNT(*) INTO @country_id_exists_entrance_fees FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'entrance_fees' AND column_name = 'country_id';

SELECT COUNT(*) INTO @country_id_exists_meal_pricing FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'meal_pricing' AND column_name = 'country_id';

SELECT COUNT(*) INTO @country_id_exists_extra_expenses FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'extra_expenses' AND column_name = 'country_id';

SELECT COUNT(*) INTO @country_id_exists_intercity FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'intercity_transfers' AND column_name = 'from_country_id';

-- ============================================================================
-- STEP 1: Add country_id to hotels table
-- ============================================================================

SET @sql_hotels = IF(@country_id_exists_hotels = 0,
  'ALTER TABLE hotels ADD COLUMN country_id INT NULL AFTER organization_id COMMENT "Reference to countries table"',
  'SELECT "country_id column already exists in hotels table" AS message'
);
PREPARE stmt_hotels FROM @sql_hotels;
EXECUTE stmt_hotels;
DEALLOCATE PREPARE stmt_hotels;

-- ============================================================================
-- STEP 2: Add country_id to tours table
-- ============================================================================

SET @sql_tours = IF(@country_id_exists_tours = 0,
  'ALTER TABLE tours ADD COLUMN country_id INT NULL AFTER organization_id COMMENT "Reference to countries table"',
  'SELECT "country_id column already exists in tours table" AS message'
);
PREPARE stmt_tours FROM @sql_tours;
EXECUTE stmt_tours;
DEALLOCATE PREPARE stmt_tours;

-- ============================================================================
-- STEP 3: Add country_id to vehicles table
-- ============================================================================

SET @sql_vehicles = IF(@country_id_exists_vehicles = 0,
  'ALTER TABLE vehicles ADD COLUMN country_id INT NULL AFTER organization_id COMMENT "Reference to countries table"',
  'SELECT "country_id column already exists in vehicles table" AS message'
);
PREPARE stmt_vehicles FROM @sql_vehicles;
EXECUTE stmt_vehicles;
DEALLOCATE PREPARE stmt_vehicles;

-- ============================================================================
-- STEP 4: Add country_id to guides table
-- ============================================================================

SET @sql_guides = IF(@country_id_exists_guides = 0,
  'ALTER TABLE guides ADD COLUMN country_id INT NULL AFTER organization_id COMMENT "Reference to countries table"',
  'SELECT "country_id column already exists in guides table" AS message'
);
PREPARE stmt_guides FROM @sql_guides;
EXECUTE stmt_guides;
DEALLOCATE PREPARE stmt_guides;

-- ============================================================================
-- STEP 5: Add country_id to entrance_fees table
-- ============================================================================

SET @sql_entrance_fees = IF(@country_id_exists_entrance_fees = 0,
  'ALTER TABLE entrance_fees ADD COLUMN country_id INT NULL AFTER organization_id COMMENT "Reference to countries table"',
  'SELECT "country_id column already exists in entrance_fees table" AS message'
);
PREPARE stmt_entrance_fees FROM @sql_entrance_fees;
EXECUTE stmt_entrance_fees;
DEALLOCATE PREPARE stmt_entrance_fees;

-- ============================================================================
-- STEP 6: Add country_id to meal_pricing table
-- ============================================================================

SET @sql_meal_pricing = IF(@country_id_exists_meal_pricing = 0,
  'ALTER TABLE meal_pricing ADD COLUMN country_id INT NULL AFTER organization_id COMMENT "Reference to countries table"',
  'SELECT "country_id column already exists in meal_pricing table" AS message'
);
PREPARE stmt_meal_pricing FROM @sql_meal_pricing;
EXECUTE stmt_meal_pricing;
DEALLOCATE PREPARE stmt_meal_pricing;

-- ============================================================================
-- STEP 7: Add country_id to extra_expenses table
-- ============================================================================

SET @sql_extra_expenses = IF(@country_id_exists_extra_expenses = 0,
  'ALTER TABLE extra_expenses ADD COLUMN country_id INT NULL AFTER organization_id COMMENT "Reference to countries table"',
  'SELECT "country_id column already exists in extra_expenses table" AS message'
);
PREPARE stmt_extra_expenses FROM @sql_extra_expenses;
EXECUTE stmt_extra_expenses;
DEALLOCATE PREPARE stmt_extra_expenses;

-- ============================================================================
-- STEP 8: Add country_id to intercity_transfers table (special case)
-- ============================================================================

SET @sql_intercity = IF(@country_id_exists_intercity = 0,
  'ALTER TABLE intercity_transfers
   ADD COLUMN from_country_id INT NULL AFTER from_city COMMENT "Country of departure city",
   ADD COLUMN to_country_id INT NULL AFTER to_city COMMENT "Country of arrival city"',
  'SELECT "country_id columns already exist in intercity_transfers table" AS message'
);
PREPARE stmt_intercity FROM @sql_intercity;
EXECUTE stmt_intercity;
DEALLOCATE PREPARE stmt_intercity;

-- ============================================================================
-- STEP 9: Add indexes for better query performance
-- ============================================================================

-- Hotels indexes
SET @sql_idx_hotels = IF(@country_id_exists_hotels = 0,
  'ALTER TABLE hotels ADD INDEX idx_country_city (country_id, city)',
  'SELECT "Indexes already exist for hotels" AS message'
);
PREPARE stmt_idx_hotels FROM @sql_idx_hotels;
EXECUTE stmt_idx_hotels;
DEALLOCATE PREPARE stmt_idx_hotels;

-- Tours indexes
SET @sql_idx_tours = IF(@country_id_exists_tours = 0,
  'ALTER TABLE tours ADD INDEX idx_country_city (country_id, city)',
  'SELECT "Indexes already exist for tours" AS message'
);
PREPARE stmt_idx_tours FROM @sql_idx_tours;
EXECUTE stmt_idx_tours;
DEALLOCATE PREPARE stmt_idx_tours;

-- Vehicles indexes
SET @sql_idx_vehicles = IF(@country_id_exists_vehicles = 0,
  'ALTER TABLE vehicles ADD INDEX idx_country_city (country_id, city)',
  'SELECT "Indexes already exist for vehicles" AS message'
);
PREPARE stmt_idx_vehicles FROM @sql_idx_vehicles;
EXECUTE stmt_idx_vehicles;
DEALLOCATE PREPARE stmt_idx_vehicles;

-- ============================================================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================================================

-- Verify columns were added
-- SELECT
--   'hotels' as table_name,
--   COUNT(*) as has_country_id
-- FROM information_schema.columns
-- WHERE table_schema = DATABASE() AND table_name = 'hotels' AND column_name = 'country_id'
-- UNION ALL
-- SELECT 'tours', COUNT(*)
-- FROM information_schema.columns
-- WHERE table_schema = DATABASE() AND table_name = 'tours' AND column_name = 'country_id';

-- Check data - should show NULL for all existing records
-- SELECT country_id, COUNT(*) as count FROM hotels GROUP BY country_id;
-- SELECT country_id, COUNT(*) as count FROM tours GROUP BY country_id;

SELECT '✅ Migration 002 completed: country_id columns added to all pricing tables' AS status;
