-- Migration: Add country_id to all pricing tables (SIMPLIFIED VERSION)
-- Date: 2025-11-19
-- Description: Add country context to prevent city name collisions

-- ============================================================================
-- STEP 1: Add country_id to hotels table
-- ============================================================================

ALTER TABLE hotels ADD COLUMN IF NOT EXISTS country_id INT NULL AFTER organization_id;
ALTER TABLE hotels ADD INDEX IF NOT EXISTS idx_country_city (country_id, city);

-- ============================================================================
-- STEP 2: Add country_id to tours table
-- ============================================================================

ALTER TABLE tours ADD COLUMN IF NOT EXISTS country_id INT NULL AFTER organization_id;
ALTER TABLE tours ADD INDEX IF NOT EXISTS idx_country_city (country_id, city);

-- ============================================================================
-- STEP 3: Add country_id to vehicles table
-- ============================================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS country_id INT NULL AFTER organization_id;
ALTER TABLE vehicles ADD INDEX IF NOT EXISTS idx_country_city (country_id, city);

-- ============================================================================
-- STEP 4: Add country_id to guides table
-- ============================================================================

ALTER TABLE guides ADD COLUMN IF NOT EXISTS country_id INT NULL AFTER organization_id;
ALTER TABLE guides ADD INDEX IF NOT EXISTS idx_country_city (country_id, city);

-- ============================================================================
-- STEP 5: Add country_id to entrance_fees table
-- ============================================================================

ALTER TABLE entrance_fees ADD COLUMN IF NOT EXISTS country_id INT NULL AFTER organization_id;
ALTER TABLE entrance_fees ADD INDEX IF NOT EXISTS idx_country_city (country_id, city);

-- ============================================================================
-- STEP 6: Add country_id to meal_pricing table
-- ============================================================================

ALTER TABLE meal_pricing ADD COLUMN IF NOT EXISTS country_id INT NULL AFTER organization_id;
ALTER TABLE meal_pricing ADD INDEX IF NOT EXISTS idx_country_city (country_id, city);

-- ============================================================================
-- STEP 7: Add country_id to extra_expenses table
-- ============================================================================

ALTER TABLE extra_expenses ADD COLUMN IF NOT EXISTS country_id INT NULL AFTER organization_id;

-- ============================================================================
-- STEP 8: Add country_id to intercity_transfers table
-- ============================================================================

ALTER TABLE intercity_transfers ADD COLUMN IF NOT EXISTS from_country_id INT NULL AFTER from_city;
ALTER TABLE intercity_transfers ADD COLUMN IF NOT EXISTS to_country_id INT NULL AFTER to_city;

-- ============================================================================
-- Verification
-- ============================================================================

SELECT '✅ Migration 002 completed: country_id columns added to all pricing tables' AS status;
