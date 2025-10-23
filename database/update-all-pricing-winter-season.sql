-- Update ALL pricing categories to Winter 2025-26 season (01/11/2025 - 14/03/2026)
USE tqa_db;

-- ======================
-- TOURS PRICING
-- ======================
-- Delete all existing tour pricing
DELETE tp FROM tour_pricing tp
INNER JOIN tours t ON tp.tour_id = t.id
WHERE t.organization_id = 1;

-- Insert Winter 2025-26 pricing for SIC tours
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, sic_price_2_pax, sic_price_4_pax, sic_price_6_pax, sic_price_8_pax, sic_price_10_pax, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax, pvt_price_10_pax, status, created_by)
SELECT
  t.id,
  'Winter 2025-26',
  '2025-11-01',
  '2026-03-14',
  'EUR',
  -- SIC prices (Seat-in-Coach)
  CASE
    WHEN t.city = 'Istanbul' THEN 65
    WHEN t.city = 'Cappadocia' AND t.tour_name LIKE '%Balloon%' THEN 280
    WHEN t.city = 'Cappadocia' THEN 70
    WHEN t.city = 'Ephesus' THEN 75
    WHEN t.city = 'Antalya' THEN 60
    WHEN t.city = 'Pamukkale' AND t.tour_name LIKE '%Balloon%' THEN 100
    WHEN t.city = 'Pamukkale' THEN 70
    ELSE 55
  END,
  CASE
    WHEN t.city = 'Istanbul' THEN 55
    WHEN t.city = 'Cappadocia' AND t.tour_name LIKE '%Balloon%' THEN 280
    WHEN t.city = 'Cappadocia' THEN 60
    WHEN t.city = 'Ephesus' THEN 65
    WHEN t.city = 'Antalya' THEN 50
    WHEN t.city = 'Pamukkale' AND t.tour_name LIKE '%Balloon%' THEN 100
    WHEN t.city = 'Pamukkale' THEN 60
    ELSE 48
  END,
  CASE
    WHEN t.city = 'Istanbul' THEN 48
    WHEN t.city = 'Cappadocia' AND t.tour_name LIKE '%Balloon%' THEN 280
    WHEN t.city = 'Cappadocia' THEN 52
    WHEN t.city = 'Ephesus' THEN 58
    WHEN t.city = 'Antalya' THEN 45
    WHEN t.city = 'Pamukkale' AND t.tour_name LIKE '%Balloon%' THEN 100
    WHEN t.city = 'Pamukkale' THEN 55
    ELSE 42
  END,
  CASE
    WHEN t.city = 'Istanbul' THEN 42
    WHEN t.city = 'Cappadocia' AND t.tour_name LIKE '%Balloon%' THEN 280
    WHEN t.city = 'Cappadocia' THEN 48
    WHEN t.city = 'Ephesus' THEN 52
    WHEN t.city = 'Antalya' THEN 40
    WHEN t.city = 'Pamukkale' AND t.tour_name LIKE '%Balloon%' THEN 100
    WHEN t.city = 'Pamukkale' THEN 50
    ELSE 38
  END,
  CASE
    WHEN t.city = 'Istanbul' THEN 38
    WHEN t.city = 'Cappadocia' AND t.tour_name LIKE '%Balloon%' THEN 280
    WHEN t.city = 'Cappadocia' THEN 45
    WHEN t.city = 'Ephesus' THEN 48
    WHEN t.city = 'Antalya' THEN 38
    WHEN t.city = 'Pamukkale' AND t.tour_name LIKE '%Balloon%' THEN 100
    WHEN t.city = 'Pamukkale' THEN 48
    ELSE 35
  END,
  -- Private prices (higher rates)
  CASE
    WHEN t.city = 'Istanbul' THEN 180
    WHEN t.city = 'Cappadocia' AND t.tour_name LIKE '%Balloon%' THEN 350
    WHEN t.city = 'Cappadocia' THEN 200
    WHEN t.city = 'Ephesus' THEN 190
    WHEN t.city = 'Antalya' THEN 170
    WHEN t.city = 'Pamukkale' THEN 180
    ELSE 160
  END,
  CASE
    WHEN t.city = 'Istanbul' THEN 110
    WHEN t.city = 'Cappadocia' AND t.tour_name LIKE '%Balloon%' THEN 350
    WHEN t.city = 'Cappadocia' THEN 120
    WHEN t.city = 'Ephesus' THEN 115
    WHEN t.city = 'Antalya' THEN 105
    WHEN t.city = 'Pamukkale' THEN 110
    ELSE 100
  END,
  CASE
    WHEN t.city = 'Istanbul' THEN 85
    WHEN t.city = 'Cappadocia' AND t.tour_name LIKE '%Balloon%' THEN 350
    WHEN t.city = 'Cappadocia' THEN 95
    WHEN t.city = 'Ephesus' THEN 90
    WHEN t.city = 'Antalya' THEN 80
    WHEN t.city = 'Pamukkale' THEN 85
    ELSE 75
  END,
  CASE
    WHEN t.city = 'Istanbul' THEN 70
    WHEN t.city = 'Cappadocia' AND t.tour_name LIKE '%Balloon%' THEN 350
    WHEN t.city = 'Cappadocia' THEN 78
    WHEN t.city = 'Ephesus' THEN 75
    WHEN t.city = 'Antalya' THEN 68
    WHEN t.city = 'Pamukkale' THEN 70
    ELSE 65
  END,
  CASE
    WHEN t.city = 'Istanbul' THEN 62
    WHEN t.city = 'Cappadocia' AND t.tour_name LIKE '%Balloon%' THEN 350
    WHEN t.city = 'Cappadocia' THEN 68
    WHEN t.city = 'Ephesus' THEN 65
    WHEN t.city = 'Antalya' THEN 60
    WHEN t.city = 'Pamukkale' THEN 62
    ELSE 58
  END,
  'active',
  3
FROM tours t
WHERE t.organization_id = 1 AND t.status = 'active';

-- ======================
-- VEHICLES PRICING
-- ======================
-- Delete all existing vehicle pricing
DELETE vp FROM vehicle_pricing vp
INNER JOIN vehicles v ON vp.vehicle_id = v.id
WHERE v.organization_id = 1;

-- Insert Winter 2025-26 pricing for all vehicles
INSERT INTO vehicle_pricing (vehicle_id, season_name, start_date, end_date, currency, price_per_day, price_half_day, airport_to_hotel, hotel_to_airport, airport_roundtrip, status, created_by)
SELECT
  v.id,
  'Winter 2025-26',
  '2025-11-01',
  '2026-03-14',
  'EUR',
  CASE
    WHEN v.vehicle_type = 'Vito' THEN 120
    WHEN v.vehicle_type = 'Sprinter' THEN 160
    WHEN v.vehicle_type = 'Midibus' THEN 220
    WHEN v.vehicle_type = 'Coach' THEN 350
    ELSE 100
  END,
  CASE
    WHEN v.vehicle_type = 'Vito' THEN 70
    WHEN v.vehicle_type = 'Sprinter' THEN 95
    WHEN v.vehicle_type = 'Midibus' THEN 130
    WHEN v.vehicle_type = 'Coach' THEN 200
    ELSE 60
  END,
  CASE
    WHEN v.vehicle_type = 'Vito' THEN 45
    WHEN v.vehicle_type = 'Sprinter' THEN 55
    WHEN v.vehicle_type = 'Midibus' THEN 75
    WHEN v.vehicle_type = 'Coach' THEN 120
    ELSE 40
  END,
  CASE
    WHEN v.vehicle_type = 'Vito' THEN 45
    WHEN v.vehicle_type = 'Sprinter' THEN 55
    WHEN v.vehicle_type = 'Midibus' THEN 75
    WHEN v.vehicle_type = 'Coach' THEN 120
    ELSE 40
  END,
  CASE
    WHEN v.vehicle_type = 'Vito' THEN 80
    WHEN v.vehicle_type = 'Sprinter' THEN 100
    WHEN v.vehicle_type = 'Midibus' THEN 135
    WHEN v.vehicle_type = 'Coach' THEN 220
    ELSE 70
  END,
  'active',
  3
FROM vehicles v
WHERE v.organization_id = 1 AND v.status = 'active';

-- ======================
-- GUIDES PRICING
-- ======================
-- Delete all existing guide pricing
DELETE gp FROM guide_pricing gp
INNER JOIN guides g ON gp.guide_id = g.id
WHERE g.organization_id = 1;

-- Insert Winter 2025-26 pricing for all guides
INSERT INTO guide_pricing (guide_id, season_name, start_date, end_date, currency, full_day_price, half_day_price, status, created_by)
SELECT
  g.id,
  'Winter 2025-26',
  '2025-11-01',
  '2026-03-14',
  'EUR',
  CASE
    WHEN g.city = 'Istanbul' THEN 140
    WHEN g.city = 'Cappadocia' THEN 110
    WHEN g.city = 'Ephesus' OR g.city = 'Kusadasi' THEN 100
    WHEN g.city = 'Antalya' THEN 95
    ELSE 90
  END,
  CASE
    WHEN g.city = 'Istanbul' THEN 85
    WHEN g.city = 'Cappadocia' THEN 68
    WHEN g.city = 'Ephesus' OR g.city = 'Kusadasi' THEN 62
    WHEN g.city = 'Antalya' THEN 58
    ELSE 55
  END,
  'active',
  3
FROM guides g
WHERE g.organization_id = 1 AND g.status = 'active';

-- ======================
-- ENTRANCE FEES PRICING
-- ======================
-- Delete all existing entrance fee pricing
DELETE efp FROM entrance_fee_pricing efp
INNER JOIN entrance_fees ef ON efp.entrance_fee_id = ef.id
WHERE ef.organization_id = 1;

-- Insert Winter 2025-26 pricing for all entrance fees
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, child_price, student_price, status, created_by)
SELECT
  ef.id,
  'Winter 2025-26',
  '2025-11-01',
  '2026-03-14',
  'EUR',
  -- Adult prices based on site importance
  CASE
    WHEN ef.site_name LIKE '%Topkap%' OR ef.site_name LIKE '%Topkapı%' THEN 77
    WHEN ef.site_name LIKE '%Hagia Sophia%' THEN 25
    WHEN ef.site_name LIKE '%Basilica Cistern%' THEN 48
    WHEN ef.site_name LIKE '%Dolmabah%' THEN 32
    WHEN ef.site_name LIKE '%Galata%' THEN 10
    WHEN ef.site_name LIKE '%Ephesus%' THEN 16
    WHEN ef.site_name LIKE '%Pamukkale%' THEN 15
    WHEN ef.site_name LIKE '%Göreme%' OR ef.site_name LIKE '%Goreme%' THEN 18
    WHEN ef.site_name LIKE '%Underground%' THEN 14
    WHEN ef.site_name LIKE '%Maiden%' OR ef.site_name LIKE '%Kız Kulesi%' THEN 5
    WHEN ef.city = 'Istanbul' THEN 15
    WHEN ef.city = 'Cappadocia' THEN 12
    WHEN ef.city = 'Izmir' THEN 10
    ELSE 8
  END,
  -- Child prices (usually free or 50% discount)
  CASE
    WHEN ef.site_name LIKE '%Topkap%' OR ef.site_name LIKE '%Topkapı%' THEN 0
    WHEN ef.site_name LIKE '%Hagia Sophia%' THEN 0
    ELSE 0
  END,
  -- Student prices (50% discount)
  CASE
    WHEN ef.site_name LIKE '%Topkap%' OR ef.site_name LIKE '%Topkapı%' THEN 39
    WHEN ef.site_name LIKE '%Hagia Sophia%' THEN 13
    WHEN ef.site_name LIKE '%Basilica Cistern%' THEN 24
    WHEN ef.site_name LIKE '%Dolmabah%' THEN 16
    WHEN ef.site_name LIKE '%Galata%' THEN 5
    WHEN ef.site_name LIKE '%Ephesus%' THEN 8
    WHEN ef.site_name LIKE '%Pamukkale%' THEN 8
    WHEN ef.site_name LIKE '%Göreme%' OR ef.site_name LIKE '%Goreme%' THEN 9
    WHEN ef.site_name LIKE '%Underground%' THEN 7
    WHEN ef.site_name LIKE '%Maiden%' OR ef.site_name LIKE '%Kız Kulesi%' THEN 3
    WHEN ef.city = 'Istanbul' THEN 8
    WHEN ef.city = 'Cappadocia' THEN 6
    WHEN ef.city = 'Izmir' THEN 5
    ELSE 4
  END,
  'active',
  3
FROM entrance_fees ef
WHERE ef.organization_id = 1 AND ef.status = 'active';

-- ======================
-- MEALS PRICING
-- ======================
-- Update all meal pricing dates to Winter 2025-26
UPDATE meal_pricing
SET
  season_name = 'Winter 2025-26',
  start_date = '2025-11-01',
  end_date = '2026-03-14'
WHERE organization_id = 1 AND status = 'active';

-- ======================
-- EXTRA EXPENSES
-- ======================
-- Note: Extra expenses don't have seasonal pricing (no season_name, start_date, end_date columns)
-- They are fixed year-round prices, so no update needed
