-- Update all hotels to Winter 2025-26 season (01/11/2025 - 14/03/2026)
-- Delete all existing hotel pricing for Istanbul Travel Agency
USE tqa_db;

-- Delete all existing hotel_pricing records
DELETE hp FROM hotel_pricing hp
INNER JOIN hotels h ON hp.hotel_id = h.id
WHERE h.organization_id = 1;

-- Insert Winter 2025-26 pricing for all hotels
-- Istanbul Hotels (5-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 180, 85, 160, 0, 65, 'BB', 35, 55, 85, 'Winter season pricing', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Istanbul' AND star_rating = 5 AND status = 'active';

-- Istanbul Hotels (4-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 120, 55, 105, 0, 45, 'BB', 25, 40, 65, 'Winter season pricing', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Istanbul' AND star_rating = 4 AND status = 'active';

-- Istanbul Hotels (3-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 75, 35, 65, 0, 30, 'BB', 20, 30, 45, 'Winter season pricing', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Istanbul' AND star_rating = 3 AND status = 'active';

-- Cappadocia Hotels (5-star cave hotels)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 200, 95, 180, 0, 70, 'BB', 30, 50, 75, 'Winter season pricing - cave hotel', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Cappadocia' AND star_rating = 5 AND status = 'active';

-- Cappadocia Hotels (4-star cave hotels)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 135, 65, 120, 0, 50, 'BB', 25, 40, 60, 'Winter season pricing - cave hotel', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Cappadocia' AND star_rating = 4 AND status = 'active';

-- Cappadocia Hotels (3-star cave hotels)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 95, 45, 85, 0, 35, 'BB', 20, 30, 45, 'Winter season pricing - cave hotel', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Cappadocia' AND star_rating = 3 AND status = 'active';

-- Antalya Hotels (5-star All-Inclusive beach resorts)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 160, 75, 145, 0, 55, 'AI', 0, 0, 0, 'Winter season pricing - All-Inclusive base', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Antalya' AND star_rating = 5 AND status = 'active';

-- Antalya Hotels (4-star All-Inclusive beach resorts)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 125, 60, 115, 0, 45, 'AI', 0, 0, 0, 'Winter season pricing - All-Inclusive base', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Antalya' AND star_rating = 4 AND status = 'active';

-- Bodrum Hotels (5-star beach resorts)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 155, 75, 140, 0, 55, 'HB', 0, 25, 50, 'Winter season pricing - Half Board base', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Bodrum' AND star_rating = 5 AND status = 'active';

-- Bodrum Hotels (4-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 110, 55, 100, 0, 40, 'HB', 0, 20, 45, 'Winter season pricing - Half Board base', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Bodrum' AND star_rating = 4 AND status = 'active';

-- Fethiye Hotels (5-star beach resorts)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 145, 70, 130, 0, 50, 'AI', 0, 0, 0, 'Winter season pricing - All-Inclusive base', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Fethiye' AND star_rating = 5 AND status = 'active';

-- Fethiye Hotels (4-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 105, 50, 95, 0, 40, 'AI', 0, 0, 0, 'Winter season pricing - All-Inclusive base', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Fethiye' AND star_rating = 4 AND status = 'active';

-- Izmir/Ephesus Hotels (5-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 130, 60, 115, 0, 45, 'BB', 25, 40, 65, 'Winter season pricing', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Izmir' AND star_rating = 5 AND status = 'active';

-- Izmir Hotels (4-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 95, 45, 85, 0, 35, 'BB', 20, 30, 50, 'Winter season pricing', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Izmir' AND star_rating = 4 AND status = 'active';

-- Kusadasi Hotels (5-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 125, 60, 110, 0, 45, 'HB', 0, 20, 45, 'Winter season pricing - Half Board base', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Kusadasi' AND star_rating = 5 AND status = 'active';

-- Kusadasi Hotels (4-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 90, 45, 80, 0, 35, 'BB', 20, 30, 50, 'Winter season pricing', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Kusadasi' AND star_rating = 4 AND status = 'active';

-- Pamukkale Thermal Hotels (5-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 115, 55, 105, 0, 40, 'HB', 0, 20, 40, 'Winter season pricing - Thermal spa hotel', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Pamukkale' AND star_rating = 5 AND status = 'active';

-- Pamukkale Thermal Hotels (4-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 85, 40, 75, 0, 30, 'HB', 0, 15, 35, 'Winter season pricing - Thermal spa hotel', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Pamukkale' AND star_rating = 4 AND status = 'active';

-- Selcuk Hotels (4-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 80, 40, 70, 0, 30, 'BB', 18, 28, 45, 'Winter season pricing', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Selcuk' AND star_rating = 4 AND status = 'active';

-- Selcuk Hotels (3-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 60, 30, 55, 0, 25, 'BB', 15, 25, 35, 'Winter season pricing', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Selcuk' AND star_rating = 3 AND status = 'active';

-- Oludeniz Hotels (4-star beach resorts)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 100, 50, 90, 0, 38, 'AI', 0, 0, 0, 'Winter season pricing - All-Inclusive base', 'active', 3
FROM hotels WHERE organization_id = 1 AND city = 'Oludeniz' AND star_rating = 4 AND status = 'active';

-- Other cities (Ankara, Konya, Trabzon, Gaziantep) - Business hotels (5-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 110, 50, 95, 0, 40, 'BB', 20, 35, 55, 'Winter season pricing', 'active', 3
FROM hotels WHERE organization_id = 1 AND city IN ('Ankara', 'Konya', 'Trabzon', 'Gaziantep') AND star_rating = 5 AND status = 'active';

-- Other cities - Business hotels (4-star)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status, created_by)
SELECT id, 'Winter 2025-26', '2025-11-01', '2026-03-14', 'EUR', 85, 40, 75, 0, 32, 'BB', 18, 30, 45, 'Winter season pricing', 'active', 3
FROM hotels WHERE organization_id = 1 AND city IN ('Ankara', 'Konya', 'Trabzon', 'Gaziantep') AND star_rating = 4 AND status = 'active';
