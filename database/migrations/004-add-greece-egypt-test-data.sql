-- Migration: Add test data for Greece and Egypt
-- Date: 2025-11-19
-- Description: Add sample hotels, tours, and pricing for multi-country testing

-- ============================================================================
-- GREECE (country_id = 2)
-- ============================================================================

-- -------------------- HOTELS --------------------

-- Athens Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, google_rating, status, season_name, created_at
) VALUES
(5, 2, 'Hotel Grande Bretagne', 'Athens', 5, 4.8, 'active', 'Winter 2024-25', NOW()),
(5, 2, 'Electra Palace Athens', 'Athens', 5, 4.7, 'active', 'Winter 2024-25', NOW()),
(5, 2, 'Athens Gate Hotel', 'Athens', 4, 4.6, 'active', 'Winter 2024-25', NOW());

-- Santorini Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, google_rating, status, season_name, created_at
) VALUES
(5, 2, 'Canaves Oia Suites', 'Santorini', 5, 4.9, 'active', 'Winter 2024-25', NOW()),
(5, 2, 'Grace Hotel Santorini', 'Santorini', 5, 4.8, 'active', 'Winter 2024-25', NOW()),
(5, 2, 'Astra Suites', 'Santorini', 4, 4.7, 'active', 'Winter 2024-25', NOW());

-- Mykonos Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, google_rating, status, season_name, created_at
) VALUES
(5, 2, 'Cavo Tagoo Mykonos', 'Mykonos', 5, 4.9, 'active', 'Winter 2024-25', NOW()),
(5, 2, 'Bill & Coo Suites', 'Mykonos', 5, 4.8, 'active', 'Winter 2024-25', NOW());

-- -------------------- HOTEL PRICING --------------------

-- Athens Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, price_single, price_double, price_triple,
  breakfast_included, status, created_at
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Hotel Grande Bretagne' AND country_id = 2),
 'Winter 2024-25', 320.00, 220.00, 180.00, 1, 'active', NOW()),
((SELECT id FROM hotels WHERE hotel_name = 'Electra Palace Athens' AND country_id = 2),
 'Winter 2024-25', 280.00, 190.00, 155.00, 1, 'active', NOW()),
((SELECT id FROM hotels WHERE hotel_name = 'Athens Gate Hotel' AND country_id = 2),
 'Winter 2024-25', 200.00, 140.00, 115.00, 1, 'active', NOW());

-- Santorini Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, price_single, price_double, price_triple,
  breakfast_included, status, created_at
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Canaves Oia Suites' AND country_id = 2),
 'Winter 2024-25', 450.00, 320.00, 280.00, 1, 'active', NOW()),
((SELECT id FROM hotels WHERE hotel_name = 'Grace Hotel Santorini' AND country_id = 2),
 'Winter 2024-25', 420.00, 300.00, 260.00, 1, 'active', NOW()),
((SELECT id FROM hotels WHERE hotel_name = 'Astra Suites' AND country_id = 2),
 'Winter 2024-25', 350.00, 250.00, 210.00, 1, 'active', NOW());

-- Mykonos Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, price_single, price_double, price_triple,
  breakfast_included, status, created_at
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Cavo Tagoo Mykonos' AND country_id = 2),
 'Winter 2024-25', 480.00, 340.00, 290.00, 1, 'active', NOW()),
((SELECT id FROM hotels WHERE hotel_name = 'Bill & Coo Suites' AND country_id = 2),
 'Winter 2024-25', 460.00, 330.00, 280.00, 1, 'active', NOW());

-- -------------------- TOURS --------------------

INSERT INTO tours (
  organization_id, country_id, tour_name, city, tour_type,
  duration_hours, inclusions, status, created_at
) VALUES
(5, 2, 'Athens Acropolis & Ancient Agora Tour', 'Athens', 'SIC', 4,
 'Professional guide, entrance fees, transportation', 'active', NOW()),
(5, 2, 'Athens Food & Wine Walking Tour', 'Athens', 'SIC', 3,
 'Professional guide, food tastings, wine samples, lunch', 'active', NOW()),
(5, 2, 'Cape Sounion Sunset Tour', 'Athens', 'SIC', 5,
 'Professional guide, transportation, entrance to Temple of Poseidon', 'active', NOW()),
(5, 2, 'Santorini Caldera Sunset Cruise', 'Santorini', 'SIC', 5,
 'Catamaran cruise, dinner, unlimited drinks, sunset views', 'active', NOW()),
(5, 2, 'Santorini Wine Tour', 'Santorini', 'SIC', 4,
 'Professional guide, transportation, wine tastings at 3 wineries, lunch', 'active', NOW()),
(5, 2, 'Mykonos Island Tour', 'Mykonos', 'SIC', 4,
 'Professional guide, transportation, beach visits', 'active', NOW());

-- -------------------- TOUR PRICING --------------------

INSERT INTO tour_pricing (
  tour_id, season_name, sic_price_2_pax, pvt_price_2_pax, status
) VALUES
((SELECT id FROM tours WHERE tour_name = 'Athens Acropolis & Ancient Agora Tour' AND country_id = 2),
 'Winter 2024-25', 55.00, 110.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Athens Food & Wine Walking Tour' AND country_id = 2),
 'Winter 2024-25', 75.00, 150.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Cape Sounion Sunset Tour' AND country_id = 2),
 'Winter 2024-25', 65.00, 130.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Santorini Caldera Sunset Cruise' AND country_id = 2),
 'Winter 2024-25', 120.00, 240.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Santorini Wine Tour' AND country_id = 2),
 'Winter 2024-25', 85.00, 170.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Mykonos Island Tour' AND country_id = 2),
 'Winter 2024-25', 60.00, 120.00, 'active');

-- -------------------- VEHICLES --------------------

INSERT INTO vehicles (
  organization_id, country_id, vehicle_type, city,
  max_capacity, status, created_at
) VALUES
(5, 2, 'Sedan', 'Athens', 3, 'active', NOW()),
(5, 2, 'Minivan', 'Athens', 6, 'active', NOW()),
(5, 2, 'Minibus', 'Athens', 14, 'active', NOW()),
(5, 2, 'Sedan', 'Santorini', 3, 'active', NOW()),
(5, 2, 'Minivan', 'Santorini', 6, 'active', NOW());

-- -------------------- VEHICLE PRICING --------------------

INSERT INTO vehicle_pricing (
  vehicle_id, season_name, price_per_day, status, created_at, created_by
) VALUES
((SELECT id FROM vehicles WHERE vehicle_type = 'Sedan' AND city = 'Athens' AND country_id = 2),
 'Winter 2024-25', 80.00, 'active', NOW(), 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minivan' AND city = 'Athens' AND country_id = 2),
 'Winter 2024-25', 120.00, 'active', NOW(), 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minibus' AND city = 'Athens' AND country_id = 2),
 'Winter 2024-25', 180.00, 'active', NOW(), 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Sedan' AND city = 'Santorini' AND country_id = 2),
 'Winter 2024-25', 90.00, 'active', NOW(), 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minivan' AND city = 'Santorini' AND country_id = 2),
 'Winter 2024-25', 140.00, 'active', NOW(), 1);

-- -------------------- GUIDES --------------------

INSERT INTO guides (
  organization_id, country_id, guide_name, city,
  languages, status, created_at
) VALUES
(5, 2, 'Maria Papadopoulos', 'Athens', 'English, Greek, German', 'active', NOW()),
(5, 2, 'Nikos Georgiou', 'Athens', 'English, Greek, French', 'active', NOW()),
(5, 2, 'Sofia Konstantinou', 'Santorini', 'English, Greek, Italian', 'active', NOW()),
(5, 2, 'Dimitris Antonopoulos', 'Mykonos', 'English, Greek, Spanish', 'active', NOW());

-- -------------------- GUIDE PRICING --------------------

INSERT INTO guide_pricing (
  guide_id, season_name, price_half_day, price_full_day, status, created_at, created_by
) VALUES
((SELECT id FROM guides WHERE guide_name = 'Maria Papadopoulos' AND country_id = 2),
 'Winter 2024-25', 120.00, 200.00, 'active', NOW(), 1),
((SELECT id FROM guides WHERE guide_name = 'Nikos Georgiou' AND country_id = 2),
 'Winter 2024-25', 120.00, 200.00, 'active', NOW(), 1),
((SELECT id FROM guides WHERE guide_name = 'Sofia Konstantinou' AND country_id = 2),
 'Winter 2024-25', 130.00, 220.00, 'active', NOW(), 1),
((SELECT id FROM guides WHERE guide_name = 'Dimitris Antonopoulos' AND country_id = 2),
 'Winter 2024-25', 130.00, 220.00, 'active', NOW(), 1);

-- ============================================================================
-- EGYPT (country_id = 3)
-- ============================================================================

-- -------------------- HOTELS --------------------

-- Cairo Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, google_rating, status, season_name, created_at
) VALUES
(5, 3, 'Four Seasons Hotel Cairo at Nile Plaza', 'Cairo', 5, 4.8, 'active', 'Winter 2024-25', NOW()),
(5, 3, 'Marriott Mena House Cairo', 'Cairo', 5, 4.7, 'active', 'Winter 2024-25', NOW()),
(5, 3, 'Kempinski Nile Hotel', 'Cairo', 5, 4.7, 'active', 'Winter 2024-25', NOW());

-- Luxor Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, google_rating, status, season_name, created_at
) VALUES
(5, 3, 'Sofitel Winter Palace Luxor', 'Luxor', 5, 4.8, 'active', 'Winter 2024-25', NOW()),
(5, 3, 'Hilton Luxor Resort & Spa', 'Luxor', 5, 4.6, 'active', 'Winter 2024-25', NOW()),
(5, 3, 'Steigenberger Nile Palace', 'Luxor', 4, 4.5, 'active', 'Winter 2024-25', NOW());

-- Hurghada Hotels
INSERT INTO hotels (
  organization_id, country_id, hotel_name, city,
  star_rating, google_rating, status, season_name, created_at
) VALUES
(5, 3, 'Steigenberger Pure Lifestyle', 'Hurghada', 5, 4.7, 'active', 'Winter 2024-25', NOW()),
(5, 3, 'Kempinski Hotel Soma Bay', 'Hurghada', 5, 4.8, 'active', 'Winter 2024-25', NOW());

-- -------------------- HOTEL PRICING --------------------

-- Cairo Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, price_single, price_double, price_triple,
  breakfast_included, status, created_at
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Four Seasons Hotel Cairo at Nile Plaza' AND country_id = 3),
 'Winter 2024-25', 280.00, 200.00, 165.00, 1, 'active', NOW()),
((SELECT id FROM hotels WHERE hotel_name = 'Marriott Mena House Cairo' AND country_id = 3),
 'Winter 2024-25', 260.00, 185.00, 155.00, 1, 'active', NOW()),
((SELECT id FROM hotels WHERE hotel_name = 'Kempinski Nile Hotel' AND country_id = 3),
 'Winter 2024-25', 240.00, 170.00, 140.00, 1, 'active', NOW());

-- Luxor Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, price_single, price_double, price_triple,
  breakfast_included, status, created_at
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Sofitel Winter Palace Luxor' AND country_id = 3),
 'Winter 2024-25', 220.00, 160.00, 135.00, 1, 'active', NOW()),
((SELECT id FROM hotels WHERE hotel_name = 'Hilton Luxor Resort & Spa' AND country_id = 3),
 'Winter 2024-25', 190.00, 140.00, 115.00, 1, 'active', NOW()),
((SELECT id FROM hotels WHERE hotel_name = 'Steigenberger Nile Palace' AND country_id = 3),
 'Winter 2024-25', 160.00, 120.00, 100.00, 1, 'active', NOW());

-- Hurghada Hotel Pricing
INSERT INTO hotel_pricing (
  hotel_id, season_name, price_single, price_double, price_triple,
  breakfast_included, status, created_at
) VALUES
((SELECT id FROM hotels WHERE hotel_name = 'Steigenberger Pure Lifestyle' AND country_id = 3),
 'Winter 2024-25', 180.00, 130.00, 110.00, 1, 'active', NOW()),
((SELECT id FROM hotels WHERE hotel_name = 'Kempinski Hotel Soma Bay' AND country_id = 3),
 'Winter 2024-25', 200.00, 145.00, 120.00, 1, 'active', NOW());

-- -------------------- TOURS --------------------

INSERT INTO tours (
  organization_id, country_id, tour_name, city, tour_type,
  duration_hours, inclusions, status, created_at
) VALUES
(5, 3, 'Pyramids of Giza & Sphinx Tour', 'Cairo', 'SIC', 4,
 'Professional guide, entrance fees, camel ride, lunch', 'active', NOW()),
(5, 3, 'Egyptian Museum & Old Cairo Tour', 'Cairo', 'SIC', 5,
 'Professional guide, entrance fees, transportation, lunch', 'active', NOW()),
(5, 3, 'Sound & Light Show at Pyramids', 'Cairo', 'SIC', 2,
 'Transportation, show tickets, soft drinks', 'active', NOW()),
(5, 3, 'Valley of the Kings & Karnak Temple', 'Luxor', 'SIC', 8,
 'Professional guide, entrance fees, lunch, transportation', 'active', NOW()),
(5, 3, 'Hot Air Balloon Ride over Luxor', 'Luxor', 'SIC', 3,
 'Balloon ride, transportation, breakfast box', 'active', NOW()),
(5, 3, 'Nile Felucca Sailing', 'Luxor', 'SIC', 2,
 'Traditional sailing boat, soft drinks, snacks', 'active', NOW()),
(5, 3, 'Red Sea Snorkeling Adventure', 'Hurghada', 'SIC', 6,
 'Boat trip, snorkeling equipment, lunch, drinks', 'active', NOW());

-- -------------------- TOUR PRICING --------------------

INSERT INTO tour_pricing (
  tour_id, season_name, sic_price_2_pax, pvt_price_2_pax, status
) VALUES
((SELECT id FROM tours WHERE tour_name = 'Pyramids of Giza & Sphinx Tour' AND country_id = 3),
 'Winter 2024-25', 65.00, 130.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Egyptian Museum & Old Cairo Tour' AND country_id = 3),
 'Winter 2024-25', 70.00, 140.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Sound & Light Show at Pyramids' AND country_id = 3),
 'Winter 2024-25', 45.00, 90.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Valley of the Kings & Karnak Temple' AND country_id = 3),
 'Winter 2024-25', 95.00, 190.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Hot Air Balloon Ride over Luxor' AND country_id = 3),
 'Winter 2024-25', 110.00, 220.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Nile Felucca Sailing' AND country_id = 3),
 'Winter 2024-25', 35.00, 70.00, 'active'),
((SELECT id FROM tours WHERE tour_name = 'Red Sea Snorkeling Adventure' AND country_id = 3),
 'Winter 2024-25', 55.00, 110.00, 'active');

-- -------------------- VEHICLES --------------------

INSERT INTO vehicles (
  organization_id, country_id, vehicle_type, city,
  max_capacity, status, created_at
) VALUES
(5, 3, 'Sedan', 'Cairo', 3, 'active', NOW()),
(5, 3, 'Minivan', 'Cairo', 6, 'active', NOW()),
(5, 3, 'Minibus', 'Cairo', 14, 'active', NOW()),
(5, 3, 'Sedan', 'Luxor', 3, 'active', NOW()),
(5, 3, 'Minivan', 'Luxor', 6, 'active', NOW());

-- -------------------- VEHICLE PRICING --------------------

INSERT INTO vehicle_pricing (
  vehicle_id, season_name, price_per_day, status, created_at, created_by
) VALUES
((SELECT id FROM vehicles WHERE vehicle_type = 'Sedan' AND city = 'Cairo' AND country_id = 3),
 'Winter 2024-25', 60.00, 'active', NOW(), 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minivan' AND city = 'Cairo' AND country_id = 3),
 'Winter 2024-25', 90.00, 'active', NOW(), 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minibus' AND city = 'Cairo' AND country_id = 3),
 'Winter 2024-25', 140.00, 'active', NOW(), 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Sedan' AND city = 'Luxor' AND country_id = 3),
 'Winter 2024-25', 55.00, 'active', NOW(), 1),
((SELECT id FROM vehicles WHERE vehicle_type = 'Minivan' AND city = 'Luxor' AND country_id = 3),
 'Winter 2024-25', 85.00, 'active', NOW(), 1);

-- -------------------- GUIDES --------------------

INSERT INTO guides (
  organization_id, country_id, guide_name, city,
  languages, status, created_at
) VALUES
(5, 3, 'Ahmed Hassan', 'Cairo', 'English, Arabic, French', 'active', NOW()),
(5, 3, 'Fatima El-Sayed', 'Cairo', 'English, Arabic, German', 'active', NOW()),
(5, 3, 'Mohamed Ramadan', 'Luxor', 'English, Arabic, Spanish', 'active', NOW()),
(5, 3, 'Layla Ibrahim', 'Luxor', 'English, Arabic, Italian', 'active', NOW());

-- -------------------- GUIDE PRICING --------------------

INSERT INTO guide_pricing (
  guide_id, season_name, price_half_day, price_full_day, status, created_at, created_by
) VALUES
((SELECT id FROM guides WHERE guide_name = 'Ahmed Hassan' AND country_id = 3),
 'Winter 2024-25', 80.00, 140.00, 'active', NOW(), 1),
((SELECT id FROM guides WHERE guide_name = 'Fatima El-Sayed' AND country_id = 3),
 'Winter 2024-25', 80.00, 140.00, 'active', NOW(), 1),
((SELECT id FROM guides WHERE guide_name = 'Mohamed Ramadan' AND country_id = 3),
 'Winter 2024-25', 75.00, 130.00, 'active', NOW(), 1),
((SELECT id FROM guides WHERE guide_name = 'Layla Ibrahim' AND country_id = 3),
 'Winter 2024-25', 75.00, 130.00, 'active', NOW(), 1);

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
