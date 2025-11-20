-- Migration: Add test data for Greece and Egypt (CORRECTED)
-- Date: 2025-11-19
-- Description: Add sample hotels, tours, and pricing for multi-country testing

-- ============================================================================
-- GREECE (country_id = 2)
-- ============================================================================

-- -------------------- HOTELS --------------------

-- Athens Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, rating, status
) VALUES
(5, 2, 'Hotel Grande Bretagne', 'Athens', 5, 4.8, 'active'),
(5, 2, 'Electra Palace Athens', 'Athens', 5, 4.7, 'active'),
(5, 2, 'Athens Gate Hotel', 'Athens', 4, 4.6, 'active');

-- Santorini Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, rating, status
) VALUES
(5, 2, 'Canaves Oia Suites', 'Santorini', 5, 4.9, 'active'),
(5, 2, 'Grace Hotel Santorini', 'Santorini', 5, 4.8, 'active'),
(5, 2, 'Astra Suites', 'Santorini', 4, 4.7, 'active');

-- Mykonos Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, rating, status
) VALUES
(5, 2, 'Cavo Tagoo Mykonos', 'Mykonos', 5, 4.9, 'active'),
(5, 2, 'Bill & Coo Suites', 'Mykonos', 5, 4.8, 'active');

-- -------------------- HOTEL PRICING --------------------

-- Athens Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, start_date, end_date,
  double_room_bb, single_supplement_bb, triple_room_bb,
  base_meal_plan, status, created_by
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Hotel Grande Bretagne' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 220.00, 320.00, 180.00, 'BB', 'active', 1),
((SELECT id FROM hotels WHERE hotel_name = 'Electra Palace Athens' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 190.00, 280.00, 155.00, 'BB', 'active', 1),
((SELECT id FROM hotels WHERE hotel_name = 'Athens Gate Hotel' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 140.00, 200.00, 115.00, 'BB', 'active', 1);

-- Santorini Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, start_date, end_date,
  double_room_bb, single_supplement_bb, triple_room_bb,
  base_meal_plan, status, created_by
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Canaves Oia Suites' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 320.00, 450.00, 280.00, 'BB', 'active', 1),
((SELECT id FROM hotels WHERE hotel_name = 'Grace Hotel Santorini' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 300.00, 420.00, 260.00, 'BB', 'active', 1),
((SELECT id FROM hotels WHERE hotel_name = 'Astra Suites' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 250.00, 350.00, 210.00, 'BB', 'active', 1);

-- Mykonos Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, start_date, end_date,
  double_room_bb, single_supplement_bb, triple_room_bb,
  base_meal_plan, status, created_by
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Cavo Tagoo Mykonos' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 340.00, 480.00, 290.00, 'BB', 'active', 1),
((SELECT id FROM hotels WHERE hotel_name = 'Bill & Coo Suites' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 330.00, 460.00, 280.00, 'BB', 'active', 1);

-- -------------------- TOURS --------------------

INSERT INTO tours (
  organization_id, country_id, tour_name, city, tour_type,
  duration_hours, inclusions, status
) VALUES
(5, 2, 'Athens Acropolis & Ancient Agora Tour', 'Athens', 'SIC', 4.0,
 'Professional guide, entrance fees, transportation', 'active'),
(5, 2, 'Athens Food & Wine Walking Tour', 'Athens', 'SIC', 3.0,
 'Professional guide, food tastings, wine samples, lunch', 'active'),
(5, 2, 'Cape Sounion Sunset Tour', 'Athens', 'SIC', 5.0,
 'Professional guide, transportation, entrance to Temple of Poseidon', 'active'),
(5, 2, 'Santorini Caldera Sunset Cruise', 'Santorini', 'SIC', 5.0,
 'Catamaran cruise, dinner, unlimited drinks, sunset views', 'active'),
(5, 2, 'Santorini Wine Tour', 'Santorini', 'SIC', 4.0,
 'Professional guide, transportation, wine tastings at 3 wineries, lunch', 'active'),
(5, 2, 'Mykonos Island Tour', 'Mykonos', 'SIC', 4.0,
 'Professional guide, transportation, beach visits', 'active');

-- -------------------- TOUR PRICING --------------------

INSERT INTO tour_pricing (
  tour_id, season_name, start_date, end_date,
  sic_price_2_pax, pvt_price_2_pax, status, created_by
) VALUES
((SELECT id FROM tours WHERE tour_name = 'Athens Acropolis & Ancient Agora Tour' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 55.00, 110.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Athens Food & Wine Walking Tour' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 75.00, 150.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Cape Sounion Sunset Tour' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 65.00, 130.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Santorini Caldera Sunset Cruise' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 120.00, 240.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Santorini Wine Tour' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 85.00, 170.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Mykonos Island Tour' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 60.00, 120.00, 'active', 1);

-- -------------------- VEHICLES --------------------

INSERT INTO vehicles (
  organization_id, country_id, vehicle_type, city,
  max_capacity, status
) VALUES
(5, 2, 'Sedan', 'Athens', 3, 'active'),
(5, 2, 'Minivan', 'Athens', 6, 'active'),
(5, 2, 'Minibus', 'Athens', 14, 'active'),
(5, 2, 'Sedan', 'Santorini', 3, 'active'),
(5, 2, 'Minivan', 'Santorini', 6, 'active');

-- -------------------- VEHICLE PRICING --------------------

INSERT INTO vehicle_pricing (
  vehicle_id, season_name, start_date, end_date, price_per_day, status, created_by
) VALUES
((SELECT id FROM vehicles WHERE vehicle_type = 'Sedan' AND city = 'Athens' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 80.00, 'active', 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minivan' AND city = 'Athens' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 120.00, 'active', 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minibus' AND city = 'Athens' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 180.00, 'active', 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Sedan' AND city = 'Santorini' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 90.00, 'active', 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minivan' AND city = 'Santorini' AND country_id = 2 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 140.00, 'active', 1);

-- -------------------- GUIDES --------------------

-- Athens Guides (Greece)
INSERT INTO guides (organization_id, country_id, city, language, description, status)
VALUES (5, 2, 'Athens', 'English', 'Professional English-speaking guide in Athens', 'active');
SET @guide_athens_1 = LAST_INSERT_ID();

INSERT INTO guides (organization_id, country_id, city, language, description, status)
VALUES (5, 2, 'Athens', 'English', 'Professional multi-lingual guide (English, Greek, French)', 'active');
SET @guide_athens_2 = LAST_INSERT_ID();

-- Santorini Guide (Greece)
INSERT INTO guides (organization_id, country_id, city, language, description, status)
VALUES (5, 2, 'Santorini', 'English', 'Professional English-speaking guide in Santorini', 'active');
SET @guide_santorini = LAST_INSERT_ID();

-- Mykonos Guide (Greece)
INSERT INTO guides (organization_id, country_id, city, language, description, status)
VALUES (5, 2, 'Mykonos', 'English', 'Professional English-speaking guide in Mykonos', 'active');
SET @guide_mykonos = LAST_INSERT_ID();

-- -------------------- GUIDE PRICING --------------------

INSERT INTO guide_pricing (guide_id, season_name, start_date, end_date, half_day_price, full_day_price, status, created_by)
VALUES
(@guide_athens_1, 'Winter 2024-25', '2024-11-01', '2025-03-31', 120.00, 200.00, 'active', 1),
(@guide_athens_2, 'Winter 2024-25', '2024-11-01', '2025-03-31', 120.00, 200.00, 'active', 1),
(@guide_santorini, 'Winter 2024-25', '2024-11-01', '2025-03-31', 130.00, 220.00, 'active', 1),
(@guide_mykonos, 'Winter 2024-25', '2024-11-01', '2025-03-31', 130.00, 220.00, 'active', 1);

-- ============================================================================
-- EGYPT (country_id = 3)
-- ============================================================================

-- -------------------- HOTELS --------------------

-- Cairo Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, rating, status
) VALUES
(5, 3, 'Four Seasons Hotel Cairo at Nile Plaza', 'Cairo', 5, 4.8, 'active'),
(5, 3, 'Marriott Mena House Cairo', 'Cairo', 5, 4.7, 'active'),
(5, 3, 'Kempinski Nile Hotel', 'Cairo', 5, 4.7, 'active');

-- Luxor Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, rating, status
) VALUES
(5, 3, 'Sofitel Winter Palace Luxor', 'Luxor', 5, 4.8, 'active'),
(5, 3, 'Hilton Luxor Resort & Spa', 'Luxor', 5, 4.6, 'active'),
(5, 3, 'Steigenberger Nile Palace', 'Luxor', 4, 4.5, 'active');

-- Hurghada Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, rating, status
) VALUES
(5, 3, 'Steigenberger Pure Lifestyle', 'Hurghada', 5, 4.7, 'active'),
(5, 3, 'Kempinski Hotel Soma Bay', 'Hurghada', 5, 4.8, 'active');

-- -------------------- HOTEL PRICING --------------------

-- Cairo Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, start_date, end_date,
  double_room_bb, single_supplement_bb, triple_room_bb,
  base_meal_plan, status, created_by
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Four Seasons Hotel Cairo at Nile Plaza' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 200.00, 280.00, 165.00, 'BB', 'active', 1),
((SELECT id FROM hotels WHERE hotel_name = 'Marriott Mena House Cairo' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 185.00, 260.00, 155.00, 'BB', 'active', 1),
((SELECT id FROM hotels WHERE hotel_name = 'Kempinski Nile Hotel' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 170.00, 240.00, 140.00, 'BB', 'active', 1);

-- Luxor Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, start_date, end_date,
  double_room_bb, single_supplement_bb, triple_room_bb,
  base_meal_plan, status, created_by
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Sofitel Winter Palace Luxor' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 160.00, 220.00, 135.00, 'BB', 'active', 1),
((SELECT id FROM hotels WHERE hotel_name = 'Hilton Luxor Resort & Spa' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 140.00, 190.00, 115.00, 'BB', 'active', 1),
((SELECT id FROM hotels WHERE hotel_name = 'Steigenberger Nile Palace' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 120.00, 160.00, 100.00, 'BB', 'active', 1);

-- Hurghada Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, start_date, end_date,
  double_room_bb, single_supplement_bb, triple_room_bb,
  base_meal_plan, status, created_by
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Steigenberger Pure Lifestyle' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 130.00, 180.00, 110.00, 'BB', 'active', 1),
((SELECT id FROM hotels WHERE hotel_name = 'Kempinski Hotel Soma Bay' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 145.00, 200.00, 120.00, 'BB', 'active', 1);

-- -------------------- TOURS --------------------

INSERT INTO tours (
  organization_id, country_id, tour_name, city, tour_type,
  duration_hours, inclusions, status
) VALUES
(5, 3, 'Pyramids of Giza & Sphinx Tour', 'Cairo', 'SIC', 4.0,
 'Professional guide, entrance fees, camel ride, lunch', 'active'),
(5, 3, 'Egyptian Museum & Old Cairo Tour', 'Cairo', 'SIC', 5.0,
 'Professional guide, entrance fees, transportation, lunch', 'active'),
(5, 3, 'Sound & Light Show at Pyramids', 'Cairo', 'SIC', 2.0,
 'Transportation, show tickets, soft drinks', 'active'),
(5, 3, 'Valley of the Kings & Karnak Temple', 'Luxor', 'SIC', 8.0,
 'Professional guide, entrance fees, lunch, transportation', 'active'),
(5, 3, 'Hot Air Balloon Ride over Luxor', 'Luxor', 'SIC', 3.0,
 'Balloon ride, transportation, breakfast box', 'active'),
(5, 3, 'Nile Felucca Sailing', 'Luxor', 'SIC', 2.0,
 'Traditional sailing boat, soft drinks, snacks', 'active'),
(5, 3, 'Red Sea Snorkeling Adventure', 'Hurghada', 'SIC', 6.0,
 'Boat trip, snorkeling equipment, lunch, drinks', 'active');

-- -------------------- TOUR PRICING --------------------

INSERT INTO tour_pricing (
  tour_id, season_name, start_date, end_date,
  sic_price_2_pax, pvt_price_2_pax, status, created_by
) VALUES
((SELECT id FROM tours WHERE tour_name = 'Pyramids of Giza & Sphinx Tour' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 65.00, 130.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Egyptian Museum & Old Cairo Tour' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 70.00, 140.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Sound & Light Show at Pyramids' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 45.00, 90.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Valley of the Kings & Karnak Temple' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 95.00, 190.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Hot Air Balloon Ride over Luxor' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 110.00, 220.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Nile Felucca Sailing' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 35.00, 70.00, 'active', 1),
((SELECT id FROM tours WHERE tour_name = 'Red Sea Snorkeling Adventure' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 55.00, 110.00, 'active', 1);

-- -------------------- VEHICLES --------------------

INSERT INTO vehicles (
  organization_id, country_id, vehicle_type, city,
  max_capacity, status
) VALUES
(5, 3, 'Sedan', 'Cairo', 3, 'active'),
(5, 3, 'Minivan', 'Cairo', 6, 'active'),
(5, 3, 'Minibus', 'Cairo', 14, 'active'),
(5, 3, 'Sedan', 'Luxor', 3, 'active'),
(5, 3, 'Minivan', 'Luxor', 6, 'active');

-- -------------------- VEHICLE PRICING --------------------

INSERT INTO vehicle_pricing (
  vehicle_id, season_name, start_date, end_date, price_per_day, status, created_by
) VALUES
((SELECT id FROM vehicles WHERE vehicle_type = 'Sedan' AND city = 'Cairo' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 60.00, 'active', 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minivan' AND city = 'Cairo' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 90.00, 'active', 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minibus' AND city = 'Cairo' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 140.00, 'active', 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Sedan' AND city = 'Luxor' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 55.00, 'active', 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minivan' AND city = 'Luxor' AND country_id = 3 LIMIT 1),
 'Winter 2024-25', '2024-11-01', '2025-03-31', 85.00, 'active', 1);

-- -------------------- GUIDES --------------------

-- Cairo Guides (Egypt)
INSERT INTO guides (organization_id, country_id, city, language, description, status)
VALUES (5, 3, 'Cairo', 'English', 'Professional English-speaking guide in Cairo', 'active');
SET @guide_cairo_1 = LAST_INSERT_ID();

INSERT INTO guides (organization_id, country_id, city, language, description, status)
VALUES (5, 3, 'Cairo', 'English', 'Professional multi-lingual guide (English, Arabic, German)', 'active');
SET @guide_cairo_2 = LAST_INSERT_ID();

-- Luxor Guides (Egypt)
INSERT INTO guides (organization_id, country_id, city, language, description, status)
VALUES (5, 3, 'Luxor', 'English', 'Professional English-speaking guide in Luxor', 'active');
SET @guide_luxor_1 = LAST_INSERT_ID();

INSERT INTO guides (organization_id, country_id, city, language, description, status)
VALUES (5, 3, 'Luxor', 'English', 'Professional multi-lingual guide (English, Arabic, Italian)', 'active');
SET @guide_luxor_2 = LAST_INSERT_ID();

-- -------------------- GUIDE PRICING --------------------

INSERT INTO guide_pricing (guide_id, season_name, start_date, end_date, half_day_price, full_day_price, status, created_by)
VALUES
(@guide_cairo_1, 'Winter 2024-25', '2024-11-01', '2025-03-31', 80.00, 140.00, 'active', 1),
(@guide_cairo_2, 'Winter 2024-25', '2024-11-01', '2025-03-31', 80.00, 140.00, 'active', 1),
(@guide_luxor_1, 'Winter 2024-25', '2024-11-01', '2025-03-31', 75.00, 130.00, 'active', 1),
(@guide_luxor_2, 'Winter 2024-25', '2024-11-01', '2025-03-31', 75.00, 130.00, 'active', 1);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT '✅ Migration 004 completed: Greece and Egypt test data added' AS status;

-- Count summary
SELECT
  'Greece Hotels' as category,
  COUNT(*) as count
FROM hotels WHERE country_id = 2
UNION ALL
SELECT
  'Greece Tours' as category,
  COUNT(*) as count
FROM tours WHERE country_id = 2
UNION ALL
SELECT
  'Egypt Hotels' as category,
  COUNT(*) as count
FROM hotels WHERE country_id = 3
UNION ALL
SELECT
  'Egypt Tours' as category,
  COUNT(*) as count
FROM tours WHERE country_id = 3;

-- Show sample cities by country
SELECT DISTINCT
  c.country_name,
  h.city,
  COUNT(*) as hotel_count
FROM hotels h
JOIN countries c ON h.country_id = c.id
WHERE c.id IN (2, 3)
GROUP BY c.country_name, h.city
ORDER BY c.country_name, h.city;
