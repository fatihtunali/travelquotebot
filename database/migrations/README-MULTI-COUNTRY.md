# Multi-Country Support Migration Guide

## Overview

These migrations add multi-country support to the Travel Quote AI platform. Currently the system is Turkey-focused, but these migrations allow supporting any country (Greece, Italy, Spain, UAE, Egypt, etc.).

## Migration Files

Run these in order on your **LOCAL database first**:

1. **001-create-countries-table.sql** - Creates `countries` and `organization_countries` tables
2. **002-add-country-to-pricing-tables.sql** - Adds `country_id` columns to all pricing tables
3. **003-assign-turkey-to-existing-data.sql** - Migrates existing data to Turkey

## How to Run Locally (Windows)

### Option A: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your local database
3. Open each file (001, 002, 003) in order
4. Click "Execute" (lightning bolt icon)
5. Review output for any errors

### Option B: Using Command Line
```bash
# Navigate to migrations folder
cd C:\Users\fatih\Desktop\tqa\database\migrations

# Run migrations in order (update password and database name)
mysql -u root -p tqa_db < 001-create-countries-table.sql
mysql -u root -p tqa_db < 002-add-country-to-pricing-tables.sql
mysql -u root -p tqa_db < 003-assign-turkey-to-existing-data.sql
```

## What Each Migration Does

### Migration 001: Countries Table
✅ Creates `countries` table with 26 countries (Turkey, Greece, Italy, Spain, UAE, Egypt, etc.)
✅ Creates `organization_countries` table (many-to-many: org can serve multiple countries)
✅ Assigns Turkey as default country to all existing organizations

**Seed Countries:**
- 🇹🇷 Turkey (EUR)
- 🇬🇷 Greece (EUR)
- 🇮🇹 Italy (EUR)
- 🇪🇸 Spain (EUR)
- 🇫🇷 France (EUR)
- 🇦🇪 UAE (AED)
- 🇪🇬 Egypt (USD)
- + 19 more countries

### Migration 002: Add Country Columns
✅ Adds `country_id INT NULL` to:
   - `hotels`
   - `tours`
   - `vehicles`
   - `guides`
   - `entrance_fees`
   - `meal_pricing`
   - `extra_expenses`

✅ Adds `from_country_id` and `to_country_id` to `intercity_transfers`
✅ Creates indexes for better query performance
✅ **NON-BREAKING**: All columns are NULLABLE, existing code keeps working

### Migration 003: Assign Turkey
✅ Sets `country_id = 1` (Turkey) for all existing pricing data
✅ Verifies all tables have country assigned
✅ Provides optional foreign key constraints (commented out)

## Verification Queries

After running migrations, verify everything worked:

```sql
-- 1. Check countries table
SELECT * FROM countries ORDER BY country_name;

-- 2. Check all orgs have Turkey assigned
SELECT o.id, o.name, c.country_name, oc.is_primary
FROM organizations o
JOIN organization_countries oc ON o.id = oc.organization_id
JOIN countries c ON oc.country_id = c.id;

-- 3. Verify pricing data has country_id
SELECT
  'hotels' as table_name,
  COUNT(*) as total,
  SUM(CASE WHEN country_id = 1 THEN 1 ELSE 0 END) as turkey_records,
  SUM(CASE WHEN country_id IS NULL THEN 1 ELSE 0 END) as null_records
FROM hotels
UNION ALL
SELECT 'tours', COUNT(*), SUM(CASE WHEN country_id = 1 THEN 1 ELSE 0 END), SUM(CASE WHEN country_id IS NULL THEN 1 ELSE 0 END) FROM tours;

-- 4. Check for potential city name collisions (should be empty for now)
SELECT city, COUNT(DISTINCT country_id) as countries
FROM hotels
GROUP BY city
HAVING countries > 1;
```

## Testing Locally

After migrations, test by adding data for a second country:

```sql
-- Example: Add a hotel in Athens, Greece
INSERT INTO hotels (
  organization_id,
  country_id,  -- 🆕 Greece
  hotel_name,
  city,
  star_rating,
  status
) VALUES (
  5,  -- Your org ID
  2,  -- Greece (from countries table)
  'Hotel Grande Bretagne',
  'Athens',
  5,
  'active'
);

-- Verify you can filter by country
SELECT h.hotel_name, h.city, c.country_name
FROM hotels h
JOIN countries c ON h.country_id = c.id
WHERE h.organization_id = 5;
```

## Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Rollback Migration 003
UPDATE hotels SET country_id = NULL;
UPDATE tours SET country_id = NULL;
-- Repeat for other tables

-- Rollback Migration 002
ALTER TABLE hotels DROP COLUMN country_id;
ALTER TABLE tours DROP COLUMN country_id;
-- Repeat for other tables

-- Rollback Migration 001
DROP TABLE organization_countries;
DROP TABLE countries;
```

## Next Steps After Migration

Once migrations are successful locally:

1. ✅ Test API routes still work
2. ✅ Create `/api/countries` route to fetch countries
3. ✅ Update `/api/cities` to filter by country
4. ✅ Update pricing API routes to support country filtering
5. ✅ Remove hardcoded "Turkey" from frontend
6. ✅ Add country selector to UI
7. ✅ Build and test locally
8. ✅ Deploy to production

## Important Notes

⚠️ **SAFETY FIRST:**
- Run on LOCAL database first
- Backup production database before running on server
- Migrations are idempotent (safe to run multiple times)
- All changes are NON-BREAKING until you enforce foreign keys

⚠️ **DO NOT:**
- Run directly on production without testing locally
- Delete the migration files (keep for documentation)
- Skip migration order (must run 001 → 002 → 003)

## Questions?

If you see any errors:
1. Check MySQL error log
2. Verify table names match your database
3. Ensure you're connected to correct database
4. Make sure you have sufficient MySQL privileges

## Status

- [x] Migration 001 created
- [x] Migration 002 created
- [x] Migration 003 created
- [ ] Tested on local database
- [ ] API routes updated
- [ ] Frontend updated
- [ ] Production deployment
