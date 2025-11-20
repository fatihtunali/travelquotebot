-- Copy Winter 2024-25 pricing to Winter 2025-26 for Greece & Egypt
-- This allows multi-country itineraries to work with the current season

USE tqa_multi;

-- Start transaction
START TRANSACTION;

-- 1. Copy hotel pricing from Winter 2024-25 to Winter 2025-26 for Greece & Egypt
INSERT INTO hotel_pricing (
  hotel_id,
  season_name,
  start_date,
  end_date,
  currency,
  double_room_bb,
  single_supplement_bb,
  triple_room_bb,
  child_0_6_bb,
  child_6_12_bb,
  hb_supplement,
  fb_supplement,
  ai_supplement,
  base_meal_plan,
  created_by,
  notes,
  status
)
SELECT
  hp.hotel_id,
  'Winter 2025-26' as season_name,
  '2025-11-01' as start_date,
  '2026-04-30' as end_date,
  hp.currency,
  hp.double_room_bb,
  hp.single_supplement_bb,
  hp.triple_room_bb,
  hp.child_0_6_bb,
  hp.child_6_12_bb,
  hp.hb_supplement,
  hp.fb_supplement,
  hp.ai_supplement,
  hp.base_meal_plan,
  hp.created_by,
  hp.notes,
  'active' as status
FROM hotel_pricing hp
JOIN hotels h ON hp.hotel_id = h.id
WHERE hp.season_name = 'Winter 2024-25'
  AND h.country_id IN (2, 9)  -- Greece and Egypt
  AND hp.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM hotel_pricing hp2
    WHERE hp2.hotel_id = hp.hotel_id
    AND hp2.season_name = 'Winter 2025-26'
  );

SELECT CONCAT('✅ Copied ', ROW_COUNT(), ' hotel pricing records') as result;

-- 2. Copy tour pricing from Winter 2024-25 to Winter 2025-26 for Greece & Egypt
INSERT INTO tour_pricing (
  tour_id,
  season_name,
  start_date,
  end_date,
  currency,
  sic_price_2_pax,
  sic_price_4_pax,
  sic_price_6_pax,
  sic_price_8_pax,
  sic_price_10_pax,
  pvt_price_2_pax,
  pvt_price_4_pax,
  pvt_price_6_pax,
  pvt_price_8_pax,
  pvt_price_10_pax,
  created_by,
  notes,
  status
)
SELECT
  tp.tour_id,
  'Winter 2025-26' as season_name,
  '2025-11-01' as start_date,
  '2026-04-30' as end_date,
  tp.currency,
  tp.sic_price_2_pax,
  tp.sic_price_4_pax,
  tp.sic_price_6_pax,
  tp.sic_price_8_pax,
  tp.sic_price_10_pax,
  tp.pvt_price_2_pax,
  tp.pvt_price_4_pax,
  tp.pvt_price_6_pax,
  tp.pvt_price_8_pax,
  tp.pvt_price_10_pax,
  tp.created_by,
  tp.notes,
  'active' as status
FROM tour_pricing tp
JOIN tours t ON tp.tour_id = t.id
WHERE tp.season_name = 'Winter 2024-25'
  AND t.country_id IN (2, 9)  -- Greece and Egypt
  AND tp.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM tour_pricing tp2
    WHERE tp2.tour_id = tp.tour_id
    AND tp2.season_name = 'Winter 2025-26'
  );

SELECT CONCAT('✅ Copied ', ROW_COUNT(), ' tour pricing records') as result;

-- 3. Add airport transfers for Greek and Egyptian cities
-- Athens Airport
INSERT INTO intercity_transfers (
  organization_id, vehicle_id, from_city, to_city,
  estimated_duration_hours, price_oneway, price_roundtrip,
  season_name, status
)
SELECT DISTINCT
  5 as organization_id,
  v.id as vehicle_id,
  'Athens Airport' as from_city,
  'Athens' as to_city,
  1.0 as estimated_duration_hours,
  80 as price_oneway,
  150 as price_roundtrip,
  'Winter 2025-26' as season_name,
  'active' as status
FROM vehicles v
WHERE v.organization_id = 5
  AND v.status = 'active'
  AND v.city = 'Athens'
  AND NOT EXISTS (
    SELECT 1 FROM intercity_transfers it
    WHERE it.from_city = 'Athens Airport'
    AND it.to_city = 'Athens'
    AND it.vehicle_id = v.id
  )
LIMIT 3;

-- Athens to Athens Airport (return)
INSERT INTO intercity_transfers (
  organization_id, vehicle_id, from_city, to_city,
  estimated_duration_hours, price_oneway, price_roundtrip,
  season_name, status
)
SELECT DISTINCT
  5 as organization_id,
  v.id as vehicle_id,
  'Athens' as from_city,
  'Athens Airport' as to_city,
  1.0 as estimated_duration_hours,
  80 as price_oneway,
  150 as price_roundtrip,
  'Winter 2025-26' as season_name,
  'active' as status
FROM vehicles v
WHERE v.organization_id = 5
  AND v.status = 'active'
  AND v.city = 'Athens'
  AND NOT EXISTS (
    SELECT 1 FROM intercity_transfers it
    WHERE it.from_city = 'Athens'
    AND it.to_city = 'Athens Airport'
    AND it.vehicle_id = v.id
  )
LIMIT 3;

-- Cairo Airport
INSERT INTO intercity_transfers (
  organization_id, vehicle_id, from_city, to_city,
  estimated_duration_hours, price_oneway, price_roundtrip,
  season_name, status
)
SELECT DISTINCT
  5 as organization_id,
  v.id as vehicle_id,
  'Cairo Airport' as from_city,
  'Cairo' as to_city,
  0.75 as estimated_duration_hours,
  60 as price_oneway,
  110 as price_roundtrip,
  'Winter 2025-26' as season_name,
  'active' as status
FROM vehicles v
WHERE v.organization_id = 5
  AND v.status = 'active'
  AND v.city = 'Cairo'
  AND NOT EXISTS (
    SELECT 1 FROM intercity_transfers it
    WHERE it.from_city = 'Cairo Airport'
    AND it.to_city = 'Cairo'
    AND it.vehicle_id = v.id
  )
LIMIT 3;

-- Cairo to Cairo Airport (return)
INSERT INTO intercity_transfers (
  organization_id, vehicle_id, from_city, to_city,
  estimated_duration_hours, price_oneway, price_roundtrip,
  season_name, status
)
SELECT DISTINCT
  5 as organization_id,
  v.id as vehicle_id,
  'Cairo' as from_city,
  'Cairo Airport' as to_city,
  0.75 as estimated_duration_hours,
  60 as price_oneway,
  110 as price_roundtrip,
  'Winter 2025-26' as season_name,
  'active' as status
FROM vehicles v
WHERE v.organization_id = 5
  AND v.status = 'active'
  AND v.city = 'Cairo'
  AND NOT EXISTS (
    SELECT 1 FROM intercity_transfers it
    WHERE it.from_city = 'Cairo'
    AND it.to_city = 'Cairo Airport'
    AND it.vehicle_id = v.id
  )
LIMIT 3;

-- Luxor Airport
INSERT INTO intercity_transfers (
  organization_id, vehicle_id, from_city, to_city,
  estimated_duration_hours, price_oneway, price_roundtrip,
  season_name, status
)
SELECT DISTINCT
  5 as organization_id,
  v.id as vehicle_id,
  'Luxor Airport' as from_city,
  'Luxor' as to_city,
  0.5 as estimated_duration_hours,
  50 as price_oneway,
  90 as price_roundtrip,
  'Winter 2025-26' as season_name,
  'active' as status
FROM vehicles v
WHERE v.organization_id = 5
  AND v.status = 'active'
  AND v.city = 'Luxor'
  AND NOT EXISTS (
    SELECT 1 FROM intercity_transfers it
    WHERE it.from_city = 'Luxor Airport'
    AND it.to_city = 'Luxor'
    AND it.vehicle_id = v.id
  )
LIMIT 3;

-- Luxor to Luxor Airport (return)
INSERT INTO intercity_transfers (
  organization_id, vehicle_id, from_city, to_city,
  estimated_duration_hours, price_oneway, price_roundtrip,
  season_name, status
)
SELECT DISTINCT
  5 as organization_id,
  v.id as vehicle_id,
  'Luxor' as from_city,
  'Luxor Airport' as to_city,
  0.5 as estimated_duration_hours,
  50 as price_oneway,
  90 as price_roundtrip,
  'Winter 2025-26' as season_name,
  'active' as status
FROM vehicles v
WHERE v.organization_id = 5
  AND v.status = 'active'
  AND v.city = 'Luxor'
  AND NOT EXISTS (
    SELECT 1 FROM intercity_transfers it
    WHERE it.from_city = 'Luxor'
    AND it.to_city = 'Luxor Airport'
    AND it.vehicle_id = v.id
  )
LIMIT 3;

-- Santorini Airport
INSERT INTO intercity_transfers (
  organization_id, vehicle_id, from_city, to_city,
  estimated_duration_hours, price_oneway, price_roundtrip,
  season_name, status
)
SELECT DISTINCT
  5 as organization_id,
  v.id as vehicle_id,
  'Santorini Airport' as from_city,
  'Santorini' as to_city,
  0.4 as estimated_duration_hours,
  70 as price_oneway,
  130 as price_roundtrip,
  'Winter 2025-26' as season_name,
  'active' as status
FROM vehicles v
WHERE v.organization_id = 5
  AND v.status = 'active'
  AND v.city = 'Santorini'
  AND NOT EXISTS (
    SELECT 1 FROM intercity_transfers it
    WHERE it.from_city = 'Santorini Airport'
    AND it.to_city = 'Santorini'
    AND it.vehicle_id = v.id
  )
LIMIT 3;

-- Santorini to Santorini Airport (return)
INSERT INTO intercity_transfers (
  organization_id, vehicle_id, from_city, to_city,
  estimated_duration_hours, price_oneway, price_roundtrip,
  season_name, status
)
SELECT DISTINCT
  5 as organization_id,
  v.id as vehicle_id,
  'Santorini' as from_city,
  'Santorini Airport' as to_city,
  0.4 as estimated_duration_hours,
  70 as price_oneway,
  130 as price_roundtrip,
  'Winter 2025-26' as season_name,
  'active' as status
FROM vehicles v
WHERE v.organization_id = 5
  AND v.status = 'active'
  AND v.city = 'Santorini'
  AND NOT EXISTS (
    SELECT 1 FROM intercity_transfers it
    WHERE it.from_city = 'Santorini'
    AND it.to_city = 'Santorini Airport'
    AND it.vehicle_id = v.id
  )
LIMIT 3;

SELECT CONCAT('✅ Added airport transfers for Greek and Egyptian cities') as result;

-- Commit transaction
COMMIT;

-- Verify results
SELECT '📊 Final Statistics:' as info;

SELECT
  'Hotel Pricing' as category,
  COUNT(*) as winter_2025_26_records
FROM hotel_pricing hp
JOIN hotels h ON hp.hotel_id = h.id
WHERE hp.season_name = 'Winter 2025-26'
  AND h.country_id IN (2, 9)
  AND hp.status = 'active';

SELECT
  'Tour Pricing' as category,
  COUNT(*) as winter_2025_26_records
FROM tour_pricing tp
JOIN tours t ON tp.tour_id = t.id
WHERE tp.season_name = 'Winter 2025-26'
  AND t.country_id IN (2, 9)
  AND tp.status = 'active';

SELECT
  'Airport Transfers' as category,
  COUNT(*) as transfer_records
FROM intercity_transfers
WHERE organization_id = 5
  AND (from_city LIKE '%Airport' OR to_city LIKE '%Airport')
  AND (from_city LIKE '%Athens%' OR to_city LIKE '%Athens%'
    OR from_city LIKE '%Cairo%' OR to_city LIKE '%Cairo%'
    OR from_city LIKE '%Luxor%' OR to_city LIKE '%Luxor%'
    OR from_city LIKE '%Santorini%' OR to_city LIKE '%Santorini%')
  AND status = 'active';
