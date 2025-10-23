-- Add Summer 2026 and Winter 2026-27 seasons to all pricing categories
USE tqa_db;

-- ======================
-- HOTELS - Summer 2026 (Higher prices)
-- ======================
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT
  hp.hotel_id,
  'Summer 2026',
  '2026-03-15',
  '2026-10-31',
  hp.currency,
  ROUND(hp.double_room_bb * 1.30, 2),  -- 30% higher for summer
  ROUND(hp.single_supplement_bb * 1.30, 2),
  ROUND(hp.triple_room_bb * 1.30, 2),
  hp.child_0_6_bb,
  ROUND(hp.child_6_12_bb * 1.30, 2),
  hp.base_meal_plan,
  ROUND(hp.hb_supplement * 1.20, 2),
  ROUND(hp.fb_supplement * 1.20, 2),
  ROUND(hp.ai_supplement * 1.20, 2),
  'Summer 2026 season pricing',
  'active',
  3
FROM hotel_pricing hp
INNER JOIN hotels h ON hp.hotel_id = h.id
WHERE h.organization_id = 1 AND hp.season_name = 'Winter 2025-26' AND hp.status = 'active';

-- ======================
-- HOTELS - Winter 2026-27 (Same as Winter 2025-26)
-- ======================
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT
  hp.hotel_id,
  'Winter 2026-27',
  '2026-11-01',
  '2027-03-14',
  hp.currency,
  ROUND(hp.double_room_bb * 1.05, 2),  -- 5% increase year over year
  ROUND(hp.single_supplement_bb * 1.05, 2),
  ROUND(hp.triple_room_bb * 1.05, 2),
  hp.child_0_6_bb,
  ROUND(hp.child_6_12_bb * 1.05, 2),
  hp.base_meal_plan,
  ROUND(hp.hb_supplement * 1.05, 2),
  ROUND(hp.fb_supplement * 1.05, 2),
  ROUND(hp.ai_supplement * 1.05, 2),
  'Winter 2026-27 season pricing',
  'active',
  3
FROM hotel_pricing hp
INNER JOIN hotels h ON hp.hotel_id = h.id
WHERE h.organization_id = 1 AND hp.season_name = 'Winter 2025-26' AND hp.status = 'active';

-- ======================
-- TOURS - Summer 2026
-- ======================
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, sic_price_2_pax, sic_price_4_pax, sic_price_6_pax, sic_price_8_pax, sic_price_10_pax, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax, pvt_price_10_pax, status, created_by)
SELECT
  tp.tour_id,
  'Summer 2026',
  '2026-03-15',
  '2026-10-31',
  tp.currency,
  ROUND(tp.sic_price_2_pax * 1.25, 2),
  ROUND(tp.sic_price_4_pax * 1.25, 2),
  ROUND(tp.sic_price_6_pax * 1.25, 2),
  ROUND(tp.sic_price_8_pax * 1.25, 2),
  ROUND(tp.sic_price_10_pax * 1.25, 2),
  ROUND(tp.pvt_price_2_pax * 1.25, 2),
  ROUND(tp.pvt_price_4_pax * 1.25, 2),
  ROUND(tp.pvt_price_6_pax * 1.25, 2),
  ROUND(tp.pvt_price_8_pax * 1.25, 2),
  ROUND(tp.pvt_price_10_pax * 1.25, 2),
  'active',
  3
FROM tour_pricing tp
INNER JOIN tours t ON tp.tour_id = t.id
WHERE t.organization_id = 1 AND tp.season_name = 'Winter 2025-26';

-- ======================
-- TOURS - Winter 2026-27
-- ======================
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, sic_price_2_pax, sic_price_4_pax, sic_price_6_pax, sic_price_8_pax, sic_price_10_pax, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax, pvt_price_10_pax, status, created_by)
SELECT
  tp.tour_id,
  'Winter 2026-27',
  '2026-11-01',
  '2027-03-14',
  tp.currency,
  ROUND(tp.sic_price_2_pax * 1.05, 2),
  ROUND(tp.sic_price_4_pax * 1.05, 2),
  ROUND(tp.sic_price_6_pax * 1.05, 2),
  ROUND(tp.sic_price_8_pax * 1.05, 2),
  ROUND(tp.sic_price_10_pax * 1.05, 2),
  ROUND(tp.pvt_price_2_pax * 1.05, 2),
  ROUND(tp.pvt_price_4_pax * 1.05, 2),
  ROUND(tp.pvt_price_6_pax * 1.05, 2),
  ROUND(tp.pvt_price_8_pax * 1.05, 2),
  ROUND(tp.pvt_price_10_pax * 1.05, 2),
  'active',
  3
FROM tour_pricing tp
INNER JOIN tours t ON tp.tour_id = t.id
WHERE t.organization_id = 1 AND tp.season_name = 'Winter 2025-26';

-- ======================
-- VEHICLES - Summer 2026
-- ======================
INSERT INTO vehicle_pricing (vehicle_id, season_name, start_date, end_date, currency, price_per_day, price_half_day, airport_to_hotel, hotel_to_airport, airport_roundtrip, status, created_by)
SELECT
  vp.vehicle_id,
  'Summer 2026',
  '2026-03-15',
  '2026-10-31',
  vp.currency,
  ROUND(vp.price_per_day * 1.20, 2),
  ROUND(vp.price_half_day * 1.20, 2),
  ROUND(vp.airport_to_hotel * 1.15, 2),
  ROUND(vp.hotel_to_airport * 1.15, 2),
  ROUND(vp.airport_roundtrip * 1.15, 2),
  'active',
  3
FROM vehicle_pricing vp
INNER JOIN vehicles v ON vp.vehicle_id = v.id
WHERE v.organization_id = 1 AND vp.season_name = 'Winter 2025-26';

-- ======================
-- VEHICLES - Winter 2026-27
-- ======================
INSERT INTO vehicle_pricing (vehicle_id, season_name, start_date, end_date, currency, price_per_day, price_half_day, airport_to_hotel, hotel_to_airport, airport_roundtrip, status, created_by)
SELECT
  vp.vehicle_id,
  'Winter 2026-27',
  '2026-11-01',
  '2027-03-14',
  vp.currency,
  ROUND(vp.price_per_day * 1.05, 2),
  ROUND(vp.price_half_day * 1.05, 2),
  ROUND(vp.airport_to_hotel * 1.05, 2),
  ROUND(vp.hotel_to_airport * 1.05, 2),
  ROUND(vp.airport_roundtrip * 1.05, 2),
  'active',
  3
FROM vehicle_pricing vp
INNER JOIN vehicles v ON vp.vehicle_id = v.id
WHERE v.organization_id = 1 AND vp.season_name = 'Winter 2025-26';

-- ======================
-- GUIDES - Summer 2026
-- ======================
INSERT INTO guide_pricing (guide_id, season_name, start_date, end_date, currency, full_day_price, half_day_price, status, created_by)
SELECT
  gp.guide_id,
  'Summer 2026',
  '2026-03-15',
  '2026-10-31',
  gp.currency,
  ROUND(gp.full_day_price * 1.25, 2),
  ROUND(gp.half_day_price * 1.25, 2),
  'active',
  3
FROM guide_pricing gp
INNER JOIN guides g ON gp.guide_id = g.id
WHERE g.organization_id = 1 AND gp.season_name = 'Winter 2025-26';

-- ======================
-- GUIDES - Winter 2026-27
-- ======================
INSERT INTO guide_pricing (guide_id, season_name, start_date, end_date, currency, full_day_price, half_day_price, status, created_by)
SELECT
  gp.guide_id,
  'Winter 2026-27',
  '2026-11-01',
  '2027-03-14',
  gp.currency,
  ROUND(gp.full_day_price * 1.05, 2),
  ROUND(gp.half_day_price * 1.05, 2),
  'active',
  3
FROM guide_pricing gp
INNER JOIN guides g ON gp.guide_id = g.id
WHERE g.organization_id = 1 AND gp.season_name = 'Winter 2025-26';

-- ======================
-- ENTRANCE FEES - Summer 2026
-- ======================
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, child_price, student_price, status, created_by)
SELECT
  efp.entrance_fee_id,
  'Summer 2026',
  '2026-03-15',
  '2026-10-31',
  efp.currency,
  ROUND(efp.adult_price * 1.15, 2),
  efp.child_price,
  ROUND(efp.student_price * 1.15, 2),
  'active',
  3
FROM entrance_fee_pricing efp
INNER JOIN entrance_fees ef ON efp.entrance_fee_id = ef.id
WHERE ef.organization_id = 1 AND efp.season_name = 'Winter 2025-26';

-- ======================
-- ENTRANCE FEES - Winter 2026-27
-- ======================
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, child_price, student_price, status, created_by)
SELECT
  efp.entrance_fee_id,
  'Winter 2026-27',
  '2026-11-01',
  '2027-03-14',
  efp.currency,
  ROUND(efp.adult_price * 1.05, 2),
  efp.child_price,
  ROUND(efp.student_price * 1.05, 2),
  'active',
  3
FROM entrance_fee_pricing efp
INNER JOIN entrance_fees ef ON efp.entrance_fee_id = ef.id
WHERE ef.organization_id = 1 AND efp.season_name = 'Winter 2025-26';

-- ======================
-- MEALS - Summer 2026
-- ======================
INSERT INTO meal_pricing (organization_id, restaurant_name, city, meal_type, season_name, start_date, end_date, currency, adult_lunch_price, child_lunch_price, adult_dinner_price, child_dinner_price, menu_description, notes, status, created_by)
SELECT
  mp.organization_id,
  mp.restaurant_name,
  mp.city,
  mp.meal_type,
  'Summer 2026',
  '2026-03-15',
  '2026-10-31',
  mp.currency,
  ROUND(mp.adult_lunch_price * 1.20, 2),
  ROUND(mp.child_lunch_price * 1.20, 2),
  ROUND(mp.adult_dinner_price * 1.20, 2),
  ROUND(mp.child_dinner_price * 1.20, 2),
  mp.menu_description,
  'Summer 2026 season pricing',
  'active',
  3
FROM meal_pricing mp
WHERE mp.organization_id = 1 AND mp.season_name = 'Winter 2025-26';

-- ======================
-- MEALS - Winter 2026-27
-- ======================
INSERT INTO meal_pricing (organization_id, restaurant_name, city, meal_type, season_name, start_date, end_date, currency, adult_lunch_price, child_lunch_price, adult_dinner_price, child_dinner_price, menu_description, notes, status, created_by)
SELECT
  mp.organization_id,
  mp.restaurant_name,
  mp.city,
  mp.meal_type,
  'Winter 2026-27',
  '2026-11-01',
  '2027-03-14',
  mp.currency,
  ROUND(mp.adult_lunch_price * 1.05, 2),
  ROUND(mp.child_lunch_price * 1.05, 2),
  ROUND(mp.adult_dinner_price * 1.05, 2),
  ROUND(mp.child_dinner_price * 1.05, 2),
  mp.menu_description,
  'Winter 2026-27 season pricing',
  'active',
  3
FROM meal_pricing mp
WHERE mp.organization_id = 1 AND mp.season_name = 'Winter 2025-26';
