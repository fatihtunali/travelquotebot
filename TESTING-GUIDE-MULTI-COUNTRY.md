# Testing Multi-Country Support - Safe Approach

## Strategy
1. Create `tqa_multi` test database on server
2. Copy all data from `tqa_db` → `tqa_multi`
3. Point local app to `tqa_multi` (test database)
4. Run migrations and test locally
5. Once confirmed working → apply to production

---

## Step 1: SSH to Server and Create Test Database

```bash
# SSH to server
ssh root@134.209.137.11

# Login to MySQL
mysql -u root -p
# Enter your MySQL root password when prompted
```

```sql
-- Create test database
CREATE DATABASE tqa_multi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify it was created
SHOW DATABASES LIKE 'tqa%';

-- You should see:
-- tqa_db (production)
-- tqa_multi (test)

-- Exit MySQL
exit;
```

---

## Step 2: Copy All Data from tqa_db to tqa_multi

```bash
# Still on server (root@134.209.137.11)

# Create a complete copy of tqa_db
mysqldump -u root -p tqa_db > /tmp/tqa_db_copy.sql

# Verify backup was created (should be several MB)
ls -lh /tmp/tqa_db_copy.sql

# Import into tqa_multi
mysql -u root -p tqa_multi < /tmp/tqa_db_copy.sql

# This will take 30-60 seconds depending on data size

# Verify copy worked - count tables
mysql -u root -p -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'tqa_multi';"

# Should show same number as production
mysql -u root -p -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'tqa_db';"
```

**Expected output:**
```
+-------------+
| table_count |
+-------------+
|          25 | (or whatever your count is)
+-------------+
```

---

## Step 3: Update Local .env.local to Use tqa_multi

**On your LOCAL machine (Windows):**

Open: `C:\Users\fatih\Desktop\tqa\.env.local`

Find the line:
```env
DATABASE_URL=mysql://root:YOUR_PASSWORD@134.209.137.11:3306/tqa_db
```

**⚠️ BACKUP your original .env.local first:**
```powershell
# In PowerShell or Command Prompt
cd C:\Users\fatih\Desktop\tqa
copy .env.local .env.local.backup
```

**Change to:**
```env
DATABASE_URL=mysql://root:YOUR_PASSWORD@134.209.137.11:3306/tqa_multi
```

**Save the file.**

---

## Step 4: Pull Latest Code from Git

```powershell
# On your local machine
cd C:\Users\fatih\Desktop\tqa

# Pull the multi-country code we just committed
git pull origin master

# Verify migrations are there
dir database\migrations
# Should show:
# 001-create-countries-table.sql
# 002-add-country-to-pricing-tables.sql
# 003-assign-turkey-to-existing-data.sql
# README-MULTI-COUNTRY.md
```

---

## Step 5: Run Migrations on tqa_multi Database

**Back on the server:**

```bash
# Still SSH'd to server: root@134.209.137.11
cd /home/tqa/aipricing

# Pull latest code (with migrations)
git pull origin master

# Run migrations on TEST database (tqa_multi)
mysql -u root -p tqa_multi < database/migrations/001-create-countries-table.sql
mysql -u root -p tqa_multi < database/migrations/002-add-country-to-pricing-tables.sql
mysql -u root -p tqa_multi < database/migrations/003-assign-turkey-to-existing-data.sql
```

**After each migration, verify:**

```bash
# After 001 - Check countries table
mysql -u root -p tqa_multi -e "SELECT country_code, country_name, flag_emoji FROM countries LIMIT 10;"

# Expected output:
# +-------------+-----------------------+-------------+
# | country_code| country_name          | flag_emoji  |
# +-------------+-----------------------+-------------+
# | TR          | Turkey                | 🇹🇷         |
# | GR          | Greece                | 🇬🇷         |
# | IT          | Italy                 | 🇮🇹         |
# +-------------+-----------------------+-------------+

# After 002 - Check country_id column was added
mysql -u root -p tqa_multi -e "SHOW COLUMNS FROM hotels LIKE 'country_id';"

# Expected output:
# +------------+------+------+-----+---------+-------+
# | Field      | Type | Null | Key | Default | Extra |
# +------------+------+------+-----+---------+-------+
# | country_id | int  | YES  | MUL | NULL    |       |
# +------------+------+------+-----+---------+-------+

# After 003 - Check data was assigned to Turkey
mysql -u root -p tqa_multi -e "SELECT country_id, COUNT(*) as count FROM hotels GROUP BY country_id;"

# Expected output:
# +------------+-------+
# | country_id | count |
# +------------+-------+
# |          1 |   45  | (all hotels now have country_id = 1 for Turkey)
# +------------+-------+
```

---

## Step 6: Test Locally with tqa_multi Database

**On your local machine:**

```powershell
# Start local dev server
npm run dev

# Server should start on port 3003
```

**Open browser and test:**

1. **Test Countries API:**
   ```
   http://localhost:3003/api/countries
   ```
   Should return:
   ```json
   {
     "countries": [
       {
         "id": 1,
         "country_code": "TR",
         "country_name": "Turkey",
         "flag_emoji": "🇹🇷",
         ...
       },
       ...
     ],
     "total": 26
   }
   ```

2. **Test Cities API (all cities):**
   ```
   http://localhost:3003/api/cities?search=ist
   ```

3. **Test Cities API (Turkey only):**
   ```
   http://localhost:3003/api/cities?search=ist&country_id=1
   ```

4. **Login to Dashboard:**
   ```
   http://localhost:3003/login
   ```
   - Login with your credentials
   - Check that everything still works
   - Pricing pages should load normally

---

## Step 7: Add Test Data for Second Country (Greece)

**On the server, add some Greek hotels/tours:**

```bash
# SSH to server
ssh root@134.209.137.11

# Login to MySQL
mysql -u root -p tqa_multi
```

```sql
-- Add a hotel in Athens, Greece
INSERT INTO hotels (
  organization_id,
  country_id,
  hotel_name,
  city,
  star_rating,
  google_rating,
  status,
  season_name,
  created_at
) VALUES (
  5,  -- Your organization ID
  2,  -- Greece (country_id = 2)
  'Hotel Grande Bretagne',
  'Athens',
  5,
  4.8,
  'active',
  'Winter 2024-25',
  NOW()
);

-- Add hotel pricing for Athens
INSERT INTO hotel_pricing (
  hotel_id,
  season_name,
  price_single,
  price_double,
  price_triple,
  status,
  created_at
) VALUES (
  LAST_INSERT_ID(),
  'Winter 2024-25',
  250.00,
  180.00,
  150.00,
  'active',
  NOW()
);

-- Add a tour in Athens
INSERT INTO tours (
  organization_id,
  country_id,
  tour_name,
  city,
  tour_type,
  duration_hours,
  status,
  created_at
) VALUES (
  5,
  2,  -- Greece
  'Athens Acropolis & Ancient Agora Tour',
  'Athens',
  'SIC',
  4,
  'active',
  NOW()
);

-- Add tour pricing
INSERT INTO tour_pricing (
  tour_id,
  season_name,
  sic_price_2_pax,
  pvt_price_2_pax,
  status
) VALUES (
  LAST_INSERT_ID(),
  'Winter 2024-25',
  45.00,
  90.00,
  'active'
);

-- Verify data was added
SELECT h.hotel_name, h.city, c.country_name
FROM hotels h
JOIN countries c ON h.country_id = c.id
WHERE c.country_code = 'GR';

-- Should show:
-- +--------------------------+--------+--------------+
-- | hotel_name               | city   | country_name |
-- +--------------------------+--------+--------------+
-- | Hotel Grande Bretagne    | Athens | Greece       |
-- +--------------------------+--------+--------------+

exit;
```

---

## Step 8: Test Multi-Country Filtering

**Back in browser on local machine:**

1. **Test Athens cities appear:**
   ```
   http://localhost:3003/api/cities?search=ath
   ```
   Should return both Athens and any Turkish cities with "ath"

2. **Test Greece-only filter:**
   ```
   http://localhost:3003/api/cities?search=ath&country_id=2
   ```
   Should return ONLY Athens (Greece)

3. **Test Turkey-only filter:**
   ```
   http://localhost:3003/api/cities?country_id=1
   ```
   Should return all Turkish cities

4. **Test countries for your organization:**
   ```
   http://localhost:3003/api/countries?org_id=5
   ```
   Should show Turkey (and Greece if you added the org_countries relationship)

---

## Step 9: Verification Checklist

**Before applying to production, verify:**

- [ ] Countries table has 26 countries
- [ ] All pricing tables have `country_id` column
- [ ] All existing data has `country_id = 1` (Turkey)
- [ ] New Greek data has `country_id = 2`
- [ ] `/api/countries` returns all countries
- [ ] `/api/cities` works without country filter (backward compatible)
- [ ] `/api/cities?country_id=1` returns only Turkish cities
- [ ] `/api/cities?country_id=2` returns only Greek cities
- [ ] Dashboard still works normally
- [ ] No errors in browser console
- [ ] No errors in terminal (npm run dev)

---

## Step 10: Apply to Production (Only After Testing!)

**Once everything works on tqa_multi:**

```bash
# SSH to server
ssh root@134.209.137.11

# BACKUP production database first!
mysqldump -u root -p tqa_db > /tmp/tqa_db_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup size
ls -lh /tmp/tqa_db_backup_*.sql

# Run migrations on PRODUCTION
cd /home/tqa/aipricing
mysql -u root -p tqa_db < database/migrations/001-create-countries-table.sql
mysql -u root -p tqa_db < database/migrations/002-add-country-to-pricing-tables.sql
mysql -u root -p tqa_db < database/migrations/003-assign-turkey-to-existing-data.sql

# Verify production
mysql -u root -p tqa_db -e "SELECT * FROM countries LIMIT 5;"
mysql -u root -p tqa_db -e "SELECT country_id, COUNT(*) FROM hotels GROUP BY country_id;"

# Rebuild production app
sudo -u tqa npm run build

# Restart PM2
sudo -u tqa pm2 restart tqa-app --update-env
```

---

## Step 11: Restore Local .env.local to Production

**On your local machine:**

```powershell
# Restore original .env.local
cd C:\Users\fatih\Desktop\tqa
copy .env.local.backup .env.local

# OR manually edit .env.local
# Change back to:
# DATABASE_URL=mysql://root:YOUR_PASSWORD@134.209.137.11:3306/tqa_db
```

---

## Cleanup (Optional)

**After successful production deployment:**

```bash
# SSH to server
ssh root@134.209.137.11

# Remove test database (optional - or keep for future testing)
mysql -u root -p -e "DROP DATABASE tqa_multi;"

# Remove backup files older than 7 days (optional)
find /tmp -name "tqa_*.sql" -mtime +7 -delete
```

---

## Rollback (If Something Goes Wrong)

**If migrations cause issues on production:**

```bash
# Restore from backup
mysql -u root -p tqa_db < /tmp/tqa_db_backup_YYYYMMDD_HHMMSS.sql

# Restart app
sudo -u tqa pm2 restart tqa-app
```

---

## Summary of Databases

| Database | Purpose | Safe to Break? |
|----------|---------|----------------|
| `tqa_db` | **PRODUCTION** - Live users | ❌ NO |
| `tqa_multi` | **TEST** - For testing changes | ✅ YES |

---

## Quick Reference Commands

```bash
# Connect to test database
mysql -u root -p tqa_multi

# Connect to production database
mysql -u root -p tqa_db

# Count tables
mysql -u root -p -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'tqa_multi';"

# Check countries
mysql -u root -p tqa_multi -e "SELECT * FROM countries LIMIT 10;"

# Check hotel country assignments
mysql -u root -p tqa_multi -e "SELECT country_id, COUNT(*) FROM hotels GROUP BY country_id;"
```

---

**Ready to start? Let me know when you're at each step and I can help if you encounter any issues!**
