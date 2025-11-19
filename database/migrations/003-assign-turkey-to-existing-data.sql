-- Migration: Assign Turkey (country_id = 1) to all existing pricing data
-- Date: 2025-11-19
-- Description: Migrate all existing Turkey-specific data to have proper country reference

-- ============================================================================
-- IMPORTANT: Run this AFTER running migrations 001 and 002
-- This assigns all existing data to Turkey (country_id = 1)
-- ============================================================================

-- Verify countries table exists with Turkey
SELECT
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Countries table exists'
    ELSE '❌ ERROR: Run migration 001 first!'
  END as status
FROM countries WHERE country_code = 'TR';

-- ============================================================================
-- STEP 1: Assign Turkey to all hotels
-- ============================================================================

UPDATE hotels
SET country_id = 1
WHERE country_id IS NULL;

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' hotels to Turkey') AS status;

-- ============================================================================
-- STEP 2: Assign Turkey to all tours
-- ============================================================================

UPDATE tours
SET country_id = 1
WHERE country_id IS NULL;

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' tours to Turkey') AS status;

-- ============================================================================
-- STEP 3: Assign Turkey to all vehicles
-- ============================================================================

UPDATE vehicles
SET country_id = 1
WHERE country_id IS NULL;

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' vehicles to Turkey') AS status;

-- ============================================================================
-- STEP 4: Assign Turkey to all guides
-- ============================================================================

UPDATE guides
SET country_id = 1
WHERE country_id IS NULL;

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' guides to Turkey') AS status;

-- ============================================================================
-- STEP 5: Assign Turkey to all entrance fees
-- ============================================================================

UPDATE entrance_fees
SET country_id = 1
WHERE country_id IS NULL;

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' entrance fees to Turkey') AS status;

-- ============================================================================
-- STEP 6: Assign Turkey to all meal pricing
-- ============================================================================

UPDATE meal_pricing
SET country_id = 1
WHERE country_id IS NULL;

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' meal pricing entries to Turkey') AS status;

-- ============================================================================
-- STEP 7: Assign Turkey to all extra expenses
-- ============================================================================

UPDATE extra_expenses
SET country_id = 1
WHERE country_id IS NULL;

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' extra expenses to Turkey') AS status;

-- ============================================================================
-- STEP 8: Assign Turkey to all intercity transfers (domestic transfers)
-- ============================================================================

UPDATE intercity_transfers
SET from_country_id = 1, to_country_id = 1
WHERE from_country_id IS NULL OR to_country_id IS NULL;

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' intercity transfers to Turkey domestic') AS status;

-- ============================================================================
-- VERIFICATION: Check all data now has country assigned
-- ============================================================================

SELECT
  'hotels' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN country_id IS NULL THEN 1 ELSE 0 END) as null_country,
  SUM(CASE WHEN country_id = 1 THEN 1 ELSE 0 END) as turkey_records
FROM hotels
UNION ALL
SELECT
  'tours',
  COUNT(*),
  SUM(CASE WHEN country_id IS NULL THEN 1 ELSE 0 END),
  SUM(CASE WHEN country_id = 1 THEN 1 ELSE 0 END)
FROM tours
UNION ALL
SELECT
  'vehicles',
  COUNT(*),
  SUM(CASE WHEN country_id IS NULL THEN 1 ELSE 0 END),
  SUM(CASE WHEN country_id = 1 THEN 1 ELSE 0 END)
FROM vehicles
UNION ALL
SELECT
  'guides',
  COUNT(*),
  SUM(CASE WHEN country_id IS NULL THEN 1 ELSE 0 END),
  SUM(CASE WHEN country_id = 1 THEN 1 ELSE 0 END)
FROM guides
UNION ALL
SELECT
  'entrance_fees',
  COUNT(*),
  SUM(CASE WHEN country_id IS NULL THEN 1 ELSE 0 END),
  SUM(CASE WHEN country_id = 1 THEN 1 ELSE 0 END)
FROM entrance_fees
UNION ALL
SELECT
  'meal_pricing',
  COUNT(*),
  SUM(CASE WHEN country_id IS NULL THEN 1 ELSE 0 END),
  SUM(CASE WHEN country_id = 1 THEN 1 ELSE 0 END)
FROM meal_pricing
UNION ALL
SELECT
  'extra_expenses',
  COUNT(*),
  SUM(CASE WHEN country_id IS NULL THEN 1 ELSE 0 END),
  SUM(CASE WHEN country_id = 1 THEN 1 ELSE 0 END)
FROM extra_expenses;

-- ============================================================================
-- OPTIONAL: Add foreign key constraints (DO THIS AFTER VERIFICATION)
-- ============================================================================

-- Uncomment these lines after you've verified all data has country_id assigned
-- and you're ready to enforce referential integrity

-- ALTER TABLE hotels ADD FOREIGN KEY fk_hotels_country (country_id) REFERENCES countries(id);
-- ALTER TABLE tours ADD FOREIGN KEY fk_tours_country (country_id) REFERENCES countries(id);
-- ALTER TABLE vehicles ADD FOREIGN KEY fk_vehicles_country (country_id) REFERENCES countries(id);
-- ALTER TABLE guides ADD FOREIGN KEY fk_guides_country (country_id) REFERENCES countries(id);
-- ALTER TABLE entrance_fees ADD FOREIGN KEY fk_entrance_fees_country (country_id) REFERENCES countries(id);
-- ALTER TABLE meal_pricing ADD FOREIGN KEY fk_meal_pricing_country (country_id) REFERENCES countries(id);
-- ALTER TABLE extra_expenses ADD FOREIGN KEY fk_extra_expenses_country (country_id) REFERENCES countries(id);
-- ALTER TABLE intercity_transfers ADD FOREIGN KEY fk_intercity_from_country (from_country_id) REFERENCES countries(id);
-- ALTER TABLE intercity_transfers ADD FOREIGN KEY fk_intercity_to_country (to_country_id) REFERENCES countries(id);

SELECT '✅ Migration 003 completed: All existing data assigned to Turkey' AS final_status;
