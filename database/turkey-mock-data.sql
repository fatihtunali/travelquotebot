-- ============================================
-- TURKEY TOURISM MOCK DATA
-- For: Istanbul Travel Agency (Organization ID: 2)
-- Created: 2025-10-23
--
-- Includes:
-- - 60+ Hotels across major Turkish destinations
-- - 30+ Tours (SIC and Private)
-- - 20+ Entrance Fees for major sites
-- - Vehicle pricing for transfers
-- - Guide pricing for multiple languages
-- - Restaurant meal pricing
-- - Extra expenses (parking, tips, tolls)
-- ============================================

-- Note: This assumes organization_id = 2 for Istanbul Travel Agency
-- and user_id = 3 for the operator user who creates the pricing

SET @org_id = 2;
SET @user_id = 3;

-- ============================================
-- HOTELS DATA (60+ Hotels)
-- ============================================

-- ISTANBUL HOTELS (15 hotels)
INSERT INTO hotels (organization_id, hotel_name, city, star_rating, status) VALUES
(@org_id, 'Four Seasons Sultanahmet', 'Istanbul', 5, 'active'),
(@org_id, 'Çırağan Palace Kempinski', 'Istanbul', 5, 'active'),
(@org_id, 'The Ritz-Carlton Istanbul', 'Istanbul', 5, 'active'),
(@org_id, 'Raffles Istanbul', 'Istanbul', 5, 'active'),
(@org_id, 'Swissôtel The Bosphorus', 'Istanbul', 5, 'active'),
(@org_id, 'CVK Park Bosphorus Hotel', 'Istanbul', 5, 'active'),
(@org_id, 'Wyndham Grand Istanbul Levent', 'Istanbul', 5, 'active'),
(@org_id, 'Golden Horn Bosphorus Hotel', 'Istanbul', 4, 'active'),
(@org_id, 'White House Hotel Istanbul', 'Istanbul', 4, 'active'),
(@org_id, 'Saratoga Hotel Sultanahmet', 'Istanbul', 4, 'active'),
(@org_id, 'Sura Hagia Sophia Hotel', 'Istanbul', 4, 'active'),
(@org_id, 'Arcadia Blue Istanbul', 'Istanbul', 4, 'active'),
(@org_id, 'Bosphorus Palace Hotel', 'Istanbul', 4, 'active'),
(@org_id, 'Ottoman Hotel Imperial', 'Istanbul', 4, 'active'),
(@org_id, 'Best Western Empire Palace', 'Istanbul', 3, 'active');

-- CAPPADOCIA HOTELS (12 cave hotels)
INSERT INTO hotels (organization_id, hotel_name, city, star_rating, status) VALUES
(@org_id, 'Museum Hotel Cappadocia', 'Cappadocia', 5, 'active'),
(@org_id, 'Sultan Cave Suites', 'Cappadocia', 5, 'active'),
(@org_id, 'Kayakapi Premium Caves', 'Cappadocia', 5, 'active'),
(@org_id, 'Argos in Cappadocia', 'Cappadocia', 5, 'active'),
(@org_id, 'Kelebek Special Cave Hotel', 'Cappadocia', 4, 'active'),
(@org_id, 'Cappadocia Cave Suites', 'Cappadocia', 4, 'active'),
(@org_id, 'Anatolian Houses', 'Cappadocia', 4, 'active'),
(@org_id, 'Hezen Cave Hotel', 'Cappadocia', 4, 'active'),
(@org_id, 'Stone Concept Hotel', 'Cappadocia', 4, 'active'),
(@org_id, 'Mithra Cave Hotel', 'Cappadocia', 3, 'active'),
(@org_id, 'Travellers Cave Hotel', 'Cappadocia', 3, 'active'),
(@org_id, 'Cave Hotel Saksagan', 'Cappadocia', 3, 'active');

-- ANTALYA HOTELS (12 beach resorts)
INSERT INTO hotels (organization_id, hotel_name, city, star_rating, status) VALUES
(@org_id, 'Rixos Premium Belek', 'Antalya', 5, 'active'),
(@org_id, 'Maxx Royal Belek Golf Resort', 'Antalya', 5, 'active'),
(@org_id, 'Regnum Carya Golf & Spa Resort', 'Antalya', 5, 'active'),
(@org_id, 'Gloria Serenity Resort', 'Antalya', 5, 'active'),
(@org_id, 'Titanic Beach Lara', 'Antalya', 5, 'active'),
(@org_id, 'Delphin Imperial Hotel Lara', 'Antalya', 5, 'active'),
(@org_id, 'Liberty Hotels Lara', 'Antalya', 5, 'active'),
(@org_id, 'Miracle Resort Hotel', 'Antalya', 4, 'active'),
(@org_id, 'Royal Wings Hotel', 'Antalya', 4, 'active'),
(@org_id, 'IC Hotels Residence', 'Antalya', 4, 'active'),
(@org_id, 'Lara Family Club', 'Antalya', 4, 'active'),
(@org_id, 'Akra Hotel Antalya', 'Antalya', 5, 'active');

-- IZMIR & EPHESUS HOTELS (8 hotels)
INSERT INTO hotels (organization_id, hotel_name, city, star_rating, status) VALUES
(@org_id, 'Swissôtel Grand Efes Izmir', 'Izmir', 5, 'active'),
(@org_id, 'Hilton Izmir', 'Izmir', 5, 'active'),
(@org_id, 'Renaissance Izmir Hotel', 'Izmir', 5, 'active'),
(@org_id, 'Movenpick Hotel Izmir', 'Izmir', 4, 'active'),
(@org_id, 'Korumar Hotel De Luxe', 'Kusadasi', 5, 'active'),
(@org_id, 'Cella Boutique Hotel & Spa', 'Selcuk', 4, 'active'),
(@org_id, 'Charisma De Luxe Hotel', 'Kusadasi', 4, 'active'),
(@org_id, 'Hotel Bella', 'Selcuk', 3, 'active');

-- PAMUKKALE HOTELS (4 hotels)
INSERT INTO hotels (organization_id, hotel_name, city, star_rating, status) VALUES
(@org_id, 'Doga Thermal Health & Spa', 'Pamukkale', 5, 'active'),
(@org_id, 'Colossae Thermal Hotel', 'Pamukkale', 5, 'active'),
(@org_id, 'Richmond Pamukkale Thermal', 'Pamukkale', 4, 'active'),
(@org_id, 'Lycus River Thermal Hotel', 'Pamukkale', 4, 'active');

-- BODRUM HOTELS (5 hotels)
INSERT INTO hotels (organization_id, hotel_name, city, star_rating, status) VALUES
(@org_id, 'The Bodrum by Paramount Hotels', 'Bodrum', 5, 'active'),
(@org_id, 'Hilton Bodrum Turkbuku Resort', 'Bodrum', 5, 'active'),
(@org_id, 'Voyage Bodrum', 'Bodrum', 5, 'active'),
(@org_id, 'Kempinski Hotel Barbaros Bay', 'Bodrum', 5, 'active'),
(@org_id, 'Rixos Premium Bodrum', 'Bodrum', 5, 'active');

-- FETHIYE & OLUDENIZ HOTELS (4 hotels)
INSERT INTO hotels (organization_id, hotel_name, city, star_rating, status) VALUES
(@org_id, 'Hillside Beach Club', 'Fethiye', 5, 'active'),
(@org_id, 'Club Hotel Letoonia', 'Fethiye', 5, 'active'),
(@org_id, 'TUI BLUE Makarska', 'Fethiye', 4, 'active'),
(@org_id, 'Liberty Hotels Oludeniz', 'Oludeniz', 4, 'active');

-- OTHER DESTINATIONS (6 hotels)
INSERT INTO hotels (organization_id, hotel_name, city, star_rating, status) VALUES
(@org_id, 'Dedeman Konya Hotel', 'Konya', 5, 'active'),
(@org_id, 'Radisson Blu Hotel Trabzon', 'Trabzon', 5, 'active'),
(@org_id, 'Richmond Ephesus Resort', 'Kusadasi', 5, 'active'),
(@org_id, 'Golden Key Bordrum', 'Bodrum', 4, 'active'),
(@org_id, 'Doubletree by Hilton Gaziantep', 'Gaziantep', 4, 'active'),
(@org_id, 'Holiday Inn Ankara', 'Ankara', 4, 'active');

-- ============================================
-- HOTEL PRICING (Sample pricing for all hotels)
-- Seasons: Summer 2025, Winter 2025, All Year 2025
-- ============================================

-- Istanbul 5-star hotels pricing (Summer Season)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, status, created_by) VALUES
(1, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 180.00, 90.00, 160.00, 0.00, 50.00, 'BB', 35.00, 55.00, 75.00, 'active', @user_id),
(2, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 250.00, 120.00, 220.00, 0.00, 70.00, 'BB', 40.00, 60.00, 85.00, 'active', @user_id),
(3, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 200.00, 100.00, 180.00, 0.00, 60.00, 'BB', 35.00, 55.00, 75.00, 'active', @user_id),
(4, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 220.00, 110.00, 200.00, 0.00, 65.00, 'BB', 40.00, 60.00, 80.00, 'active', @user_id),
(5, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 190.00, 95.00, 170.00, 0.00, 55.00, 'BB', 35.00, 55.00, 75.00, 'active', @user_id),
(6, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 170.00, 85.00, 155.00, 0.00, 50.00, 'BB', 30.00, 50.00, 70.00, 'active', @user_id),
(7, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 165.00, 82.00, 150.00, 0.00, 48.00, 'BB', 30.00, 50.00, 70.00, 'active', @user_id);

-- Istanbul 4-star hotels pricing (Summer Season)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, status, created_by) VALUES
(8, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 95.00, 45.00, 85.00, 0.00, 30.00, 'BB', 20.00, 35.00, NULL, 'active', @user_id),
(9, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 90.00, 42.00, 80.00, 0.00, 28.00, 'BB', 20.00, 35.00, NULL, 'active', @user_id),
(10, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 88.00, 40.00, 78.00, 0.00, 27.00, 'BB', 18.00, 32.00, NULL, 'active', @user_id),
(11, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 92.00, 43.00, 82.00, 0.00, 29.00, 'BB', 20.00, 35.00, NULL, 'active', @user_id),
(12, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 85.00, 38.00, 75.00, 0.00, 26.00, 'BB', 18.00, 32.00, NULL, 'active', @user_id),
(13, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 87.00, 39.00, 77.00, 0.00, 27.00, 'BB', 18.00, 32.00, NULL, 'active', @user_id),
(14, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 83.00, 37.00, 73.00, 0.00, 25.00, 'BB', 18.00, 30.00, NULL, 'active', @user_id);

-- Istanbul 3-star hotel
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, status, created_by) VALUES
(15, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 60.00, 25.00, 50.00, 0.00, 18.00, 'BB', 'active', @user_id);

-- Cappadocia Cave Hotels pricing (Summer Season)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, status, created_by) VALUES
(16, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 280.00, 140.00, 250.00, 0.00, 80.00, 'BB', 30.00, 50.00, 'active', @user_id),
(17, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 250.00, 125.00, 220.00, 0.00, 70.00, 'BB', 30.00, 50.00, 'active', @user_id),
(18, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 270.00, 135.00, 240.00, 0.00, 75.00, 'BB', 30.00, 50.00, 'active', @user_id),
(19, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 260.00, 130.00, 230.00, 0.00, 72.00, 'BB', 30.00, 50.00, 'active', @user_id),
(20, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 150.00, 75.00, 135.00, 0.00, 45.00, 'BB', 25.00, 40.00, 'active', @user_id),
(21, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 145.00, 72.00, 130.00, 0.00, 43.00, 'BB', 25.00, 40.00, 'active', @user_id),
(22, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 140.00, 70.00, 125.00, 0.00, 42.00, 'BB', 25.00, 40.00, 'active', @user_id),
(23, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 138.00, 68.00, 123.00, 0.00, 41.00, 'BB', 25.00, 40.00, 'active', @user_id),
(24, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 135.00, 67.00, 120.00, 0.00, 40.00, 'BB', 25.00, 40.00, 'active', @user_id),
(25, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 95.00, 45.00, 85.00, 0.00, 30.00, 'BB', 20.00, 35.00, 'active', @user_id),
(26, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 92.00, 43.00, 82.00, 0.00, 28.00, 'BB', 20.00, 35.00, 'active', @user_id),
(27, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 90.00, 42.00, 80.00, 0.00, 27.00, 'BB', 20.00, 35.00, 'active', @user_id);

-- Antalya Beach Resorts pricing (Summer Season) - Most are All Inclusive base
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, status, created_by) VALUES
(28, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 220.00, 110.00, 200.00, 50.00, 110.00, 'AI', 'active', @user_id),
(29, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 250.00, 125.00, 225.00, 60.00, 125.00, 'AI', 'active', @user_id),
(30, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 230.00, 115.00, 210.00, 55.00, 115.00, 'AI', 'active', @user_id),
(31, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 210.00, 105.00, 190.00, 50.00, 105.00, 'AI', 'active', @user_id),
(32, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 240.00, 120.00, 220.00, 58.00, 120.00, 'AI', 'active', @user_id),
(33, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 235.00, 117.00, 215.00, 57.00, 117.00, 'AI', 'active', @user_id),
(34, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 225.00, 112.00, 205.00, 54.00, 112.00, 'AI', 'active', @user_id),
(35, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 190.00, 95.00, 170.00, 45.00, 95.00, 'AI', 'active', @user_id),
(36, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 200.00, 100.00, 180.00, 48.00, 100.00, 'AI', 'active', @user_id),
(37, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 195.00, 97.00, 175.00, 47.00, 97.00, 'AI', 'active', @user_id),
(38, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 185.00, 92.00, 165.00, 44.00, 92.00, 'AI', 'active', @user_id),
(39, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 260.00, 130.00, 235.00, 62.00, 130.00, 'AI', 'active', @user_id);

-- Izmir & Ephesus Hotels pricing (All Year)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, status, created_by) VALUES
(40, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 140.00, 70.00, 125.00, 0.00, 42.00, 'BB', 25.00, 40.00, 'active', @user_id),
(41, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 135.00, 67.00, 120.00, 0.00, 40.00, 'BB', 25.00, 40.00, 'active', @user_id),
(42, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 130.00, 65.00, 115.00, 0.00, 39.00, 'BB', 25.00, 40.00, 'active', @user_id),
(43, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 110.00, 55.00, 98.00, 0.00, 33.00, 'BB', 20.00, 35.00, 'active', @user_id),
(44, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 180.00, 90.00, 160.00, 40.00, 90.00, 'AI', NULL, NULL, 'active', @user_id),
(45, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 85.00, 42.00, 75.00, 0.00, 25.00, 'BB', 15.00, 28.00, 'active', @user_id),
(46, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 150.00, 75.00, 135.00, 35.00, 75.00, 'AI', NULL, NULL, 'active', @user_id),
(47, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 70.00, 35.00, 60.00, 0.00, 20.00, 'BB', 12.00, 25.00, 'active', @user_id);

-- Pamukkale Thermal Hotels pricing (All Year)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, status, created_by) VALUES
(48, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 120.00, 60.00, 105.00, 0.00, 36.00, 'HB', NULL, 20.00, 'active', @user_id),
(49, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 115.00, 57.00, 100.00, 0.00, 34.00, 'HB', NULL, 20.00, 'active', @user_id),
(50, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 95.00, 47.00, 85.00, 0.00, 28.00, 'HB', NULL, 18.00, 'active', @user_id),
(51, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 90.00, 45.00, 80.00, 0.00, 27.00, 'HB', NULL, 18.00, 'active', @user_id);

-- Bodrum Hotels pricing (Summer Season)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, status, created_by) VALUES
(52, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 280.00, 140.00, 250.00, 65.00, 140.00, 'AI', 'active', @user_id),
(53, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 270.00, 135.00, 240.00, 63.00, 135.00, 'AI', 'active', @user_id),
(54, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 250.00, 125.00, 225.00, 60.00, 125.00, 'AI', 'active', @user_id),
(55, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 300.00, 150.00, 270.00, 70.00, 150.00, 'AI', 'active', @user_id),
(56, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 290.00, 145.00, 260.00, 68.00, 145.00, 'AI', 'active', @user_id);

-- Fethiye Hotels pricing (Summer Season)
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, status, created_by) VALUES
(57, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 240.00, 120.00, 215.00, 55.00, 120.00, 'AI', 'active', @user_id),
(58, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 230.00, 115.00, 205.00, 53.00, 115.00, 'AI', 'active', @user_id),
(59, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 210.00, 105.00, 190.00, 50.00, 105.00, 'AI', 'active', @user_id),
(60, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 200.00, 100.00, 180.00, 48.00, 100.00, 'AI', 'active', @user_id);

-- Other cities hotels pricing
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, status, created_by) VALUES
(61, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 95.00, 47.00, 85.00, 0.00, 28.00, 'BB', 20.00, 35.00, 'active', @user_id),
(62, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 100.00, 50.00, 90.00, 0.00, 30.00, 'BB', 20.00, 35.00, 'active', @user_id),
(63, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 190.00, 95.00, 170.00, 45.00, 95.00, 'AI', NULL, NULL, 'active', @user_id),
(64, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 180.00, 90.00, 160.00, 42.00, 90.00, 'AI', NULL, NULL, 'active', @user_id),
(65, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 110.00, 55.00, 98.00, 0.00, 33.00, 'BB', 20.00, 35.00, 'active', @user_id),
(66, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 105.00, 52.00, 93.00, 0.00, 31.00, 'BB', 20.00, 35.00, 'active', @user_id);

-- ============================================
-- TOURS DATA (30+ Tours)
-- ============================================

-- Istanbul Tours
INSERT INTO tours (organization_id, tour_name, tour_code, city, duration_days, tour_type, inclusions, exclusions, status) VALUES
(@org_id, 'Istanbul Classic City Tour', 'IST-001', 'Istanbul', 1, 'SIC', 'Professional guide, entrance fees (Topkapi, Hagia Sophia, Blue Mosque, Cistern), lunch', 'Beverages, personal expenses', 'active'),
(@org_id, 'Istanbul Classic City Tour Private', 'IST-001P', 'Istanbul', 1, 'PRIVATE', 'Professional guide, private vehicle, entrance fees (Topkapi, Hagia Sophia, Blue Mosque, Cistern)', 'Lunch, beverages, personal expenses', 'active'),
(@org_id, 'Bosphorus Cruise with Spice Bazaar', 'IST-002', 'Istanbul', 1, 'SIC', 'Professional guide, Bosphorus cruise, Spice Bazaar visit, lunch', 'Beverages, personal expenses', 'active'),
(@org_id, 'Istanbul Two Continents Tour', 'IST-003', 'Istanbul', 1, 'PRIVATE', 'Professional guide, private vehicle, Dolmabahce Palace, Bosphorus Bridge, Camlica Hill', 'Entrance fees, lunch, personal expenses', 'active'),
(@org_id, 'Whirling Dervishes Show', 'IST-004', 'Istanbul', 1, 'SIC', 'Show ticket, transfer from/to hotel', 'Beverages, personal expenses', 'active'),
(@org_id, 'Ottoman Dinner & Show', 'IST-005', 'Istanbul', 1, 'SIC', 'Dinner, unlimited soft drinks, show, transfer', 'Alcoholic beverages, personal expenses', 'active');

-- Cappadocia Tours
INSERT INTO tours (organization_id, tour_name, tour_code, city, duration_days, tour_type, inclusions, exclusions, status) VALUES
(@org_id, 'Hot Air Balloon Flight Standard', 'CAP-001', 'Cappadocia', 1, 'SIC', 'Hotel pickup, light breakfast, 60-min flight, champagne celebration, flight certificate', 'Hotel drop-off (available for extra fee)', 'active'),
(@org_id, 'Hot Air Balloon Flight Deluxe', 'CAP-001D', 'Cappadocia', 1, 'SIC', 'Hotel pickup/drop-off, breakfast, 90-min flight, champagne celebration, flight certificate', 'Personal expenses', 'active'),
(@org_id, 'Cappadocia North Tour', 'CAP-002', 'Cappadocia', 1, 'SIC', 'Professional guide, lunch, entrance fees (Goreme Open Air Museum, Pasabag, Devrent Valley)', 'Beverages, personal expenses', 'active'),
(@org_id, 'Cappadocia South Tour', 'CAP-003', 'Cappadocia', 1, 'SIC', 'Professional guide, lunch, entrance fees (Derinkuyu Underground City, Ihlara Valley, Selime Monastery)', 'Beverages, personal expenses', 'active'),
(@org_id, 'Cappadocia Private Tour Full Day', 'CAP-004', 'Cappadocia', 1, 'PRIVATE', 'Professional guide, private vehicle, all entrance fees, lunch', 'Beverages, personal expenses', 'active'),
(@org_id, 'ATV Sunset Tour Cappadocia', 'CAP-005', 'Cappadocia', 1, 'SIC', 'ATV rental, helmet, guide, hotel transfer', 'Personal expenses', 'active');

-- Ephesus Tours
INSERT INTO tours (organization_id, tour_name, tour_code, city, duration_days, tour_type, inclusions, exclusions, status) VALUES
(@org_id, 'Ephesus Classical Tour', 'EPH-001', 'Kusadasi', 1, 'SIC', 'Professional guide, entrance fees (Ephesus, Terrace Houses, Temple of Artemis), lunch', 'Beverages, personal expenses', 'active'),
(@org_id, 'Ephesus & Virgin Mary House', 'EPH-002', 'Kusadasi', 1, 'SIC', 'Professional guide, entrance fees, lunch, hotel transfer', 'Beverages, personal expenses', 'active'),
(@org_id, 'Ephesus Private Tour', 'EPH-003', 'Kusadasi', 1, 'PRIVATE', 'Professional guide, private vehicle, all entrance fees', 'Lunch, beverages, personal expenses', 'active'),
(@org_id, 'Biblical Ephesus Tour', 'EPH-004', 'Selcuk', 1, 'SIC', 'Professional guide, entrance fees (Ephesus, House of Virgin Mary, St. John Basilica), lunch', 'Beverages, personal expenses', 'active');

-- Pamukkale Tours
INSERT INTO tours (organization_id, tour_name, tour_code, city, duration_days, tour_type, inclusions, exclusions, status) VALUES
(@org_id, 'Pamukkale & Hierapolis Tour', 'PAM-001', 'Pamukkale', 1, 'SIC', 'Professional guide, entrance fees, lunch, hotel transfer', 'Beverages, personal expenses', 'active'),
(@org_id, 'Pamukkale Hot Air Balloon', 'PAM-002', 'Pamukkale', 1, 'SIC', 'Hotel pickup, light breakfast, 60-min flight, champagne, certificate', 'Hotel drop-off, personal expenses', 'active'),
(@org_id, 'Pamukkale Private Full Day', 'PAM-003', 'Pamukkale', 1, 'PRIVATE', 'Professional guide, private vehicle, entrance fees, lunch', 'Beverages, personal expenses', 'active');

-- Antalya Tours
INSERT INTO tours (organization_id, tour_name, tour_code, city, duration_days, tour_type, inclusions, exclusions, status) VALUES
(@org_id, 'Antalya City & Waterfalls Tour', 'ANT-001', 'Antalya', 1, 'SIC', 'Professional guide, entrance fees (Duden Waterfalls, Kaleici), lunch', 'Beverages, personal expenses', 'active'),
(@org_id, 'Perge, Aspendos & Side Tour', 'ANT-002', 'Antalya', 1, 'SIC', 'Professional guide, entrance fees, lunch', 'Beverages, personal expenses', 'active'),
(@org_id, 'Boat Trip from Antalya', 'ANT-003', 'Antalya', 1, 'SIC', 'Boat trip, lunch on board, swimming stops', 'Beverages, personal expenses', 'active');

-- Multi-Day Tours
INSERT INTO tours (organization_id, tour_name, tour_code, city, duration_days, tour_type, inclusions, exclusions, status) VALUES
(@org_id, 'Turkey Highlights 7 Days', 'TRK-007', 'Istanbul', 7, 'SIC', '6 nights accommodation, all breakfasts, professional guides, entrance fees, domestic flights', 'Lunches, dinners, beverages, tips', 'active'),
(@org_id, 'Best of Turkey 10 Days', 'TRK-010', 'Istanbul', 10, 'SIC', '9 nights accommodation, all breakfasts, professional guides, entrance fees, domestic flights', 'Lunches, dinners, beverages, tips', 'active'),
(@org_id, 'Cappadocia Explorer 3 Days', 'CAP-003D', 'Cappadocia', 3, 'PRIVATE', '2 nights cave hotel, all breakfasts, professional guide, all transfers, all entrance fees', 'Lunches, dinners, hot air balloon', 'active');

-- Special Tours
INSERT INTO tours (organization_id, tour_name, tour_code, city, duration_days, tour_type, inclusions, exclusions, status) VALUES
(@org_id, 'Turkish Night Dinner Show', 'IST-006', 'Istanbul', 1, 'SIC', 'Dinner, unlimited soft drinks, belly dancing show, Turkish folklore, transfer', 'Alcoholic beverages, tips', 'active'),
(@org_id, 'Bosphorus Sunset Yacht Cruise', 'IST-007', 'Istanbul', 1, 'PRIVATE', 'Private yacht, captain, snacks, drinks, sunset cruise', 'Dinner, personal expenses', 'active'),
(@org_id, 'Cooking Class Turkish Cuisine', 'IST-008', 'Istanbul', 1, 'PRIVATE', 'Professional chef, ingredients, recipes, lunch/dinner', 'Transfer, personal expenses', 'active');

-- ============================================
-- TOUR PRICING
-- ============================================

-- Istanbul SIC Tours pricing (Summer 2025)
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, sic_price_2_pax, sic_price_4_pax, sic_price_6_pax, sic_price_8_pax, sic_price_10_pax, status, created_by) VALUES
(1, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 85.00, 75.00, 65.00, 60.00, 55.00, 'active', @user_id),
(3, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 65.00, 55.00, 50.00, 45.00, 42.00, 'active', @user_id),
(5, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 45.00, 42.00, 40.00, 38.00, 35.00, 'active', @user_id),
(6, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 75.00, 70.00, 65.00, 62.00, 60.00, 'active', @user_id),
(28, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 90.00, 85.00, 80.00, 75.00, 70.00, 'active', @user_id),
(30, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 550.00, 520.00, 500.00, 480.00, 450.00, 'active', @user_id);

-- Istanbul Private Tours pricing
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax, pvt_price_10_pax, status, created_by) VALUES
(2, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 180.00, 95.00, 70.00, 60.00, 52.00, 'active', @user_id),
(4, 'Summer 2025', '2025-06-01', '2025-09-30', 'EUR', 160.00, 85.00, 65.00, 55.00, 48.00, 'active', @user_id),
(29, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 650.00, 350.00, 250.00, 200.00, 175.00, 'active', @user_id);

-- Cappadocia Tours pricing (Summer 2025)
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, sic_price_2_pax, sic_price_4_pax, sic_price_6_pax, sic_price_8_pax, sic_price_10_pax, status, created_by) VALUES
(7, 'Summer 2025', '2025-04-01', '2025-11-30', 'EUR', 280.00, 280.00, 280.00, 280.00, 280.00, 'active', @user_id),
(8, 'Summer 2025', '2025-04-01', '2025-11-30', 'EUR', 350.00, 350.00, 350.00, 350.00, 350.00, 'active', @user_id),
(9, 'Summer 2025', '2025-04-01', '2025-11-30', 'EUR', 70.00, 60.00, 55.00, 50.00, 48.00, 'active', @user_id),
(10, 'Summer 2025', '2025-04-01', '2025-11-30', 'EUR', 75.00, 65.00, 58.00, 52.00, 50.00, 'active', @user_id),
(12, 'Summer 2025', '2025-04-01', '2025-11-30', 'EUR', 45.00, 42.00, 40.00, 38.00, 35.00, 'active', @user_id);

-- Cappadocia Private pricing
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax, pvt_price_10_pax, status, created_by) VALUES
(11, 'Summer 2025', '2025-04-01', '2025-11-30', 'EUR', 200.00, 110.00, 80.00, 70.00, 62.00, 'active', @user_id),
(27, 'Summer 2025', '2025-04-01', '2025-11-30', 'EUR', 380.00, 210.00, 155.00, 130.00, 115.00, 'active', @user_id);

-- Ephesus Tours pricing (All Year)
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, sic_price_2_pax, sic_price_4_pax, sic_price_6_pax, sic_price_8_pax, sic_price_10_pax, status, created_by) VALUES
(13, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 75.00, 65.00, 58.00, 52.00, 50.00, 'active', @user_id),
(14, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 80.00, 70.00, 62.00, 55.00, 52.00, 'active', @user_id),
(16, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 85.00, 75.00, 65.00, 58.00, 55.00, 'active', @user_id);

-- Ephesus Private pricing
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax, pvt_price_10_pax, status, created_by) VALUES
(15, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 180.00, 95.00, 70.00, 60.00, 52.00, 'active', @user_id);

-- Pamukkale Tours pricing (All Year)
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, sic_price_2_pax, sic_price_4_pax, sic_price_6_pax, sic_price_8_pax, sic_price_10_pax, status, created_by) VALUES
(17, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 70.00, 60.00, 55.00, 50.00, 48.00, 'active', @user_id),
(18, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 100.00, 100.00, 100.00, 100.00, 100.00, 'active', @user_id);

-- Pamukkale Private pricing
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax, pvt_price_10_pax, status, created_by) VALUES
(19, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 170.00, 90.00, 68.00, 58.00, 50.00, 'active', @user_id);

-- Antalya Tours pricing (Summer 2025)
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, sic_price_2_pax, sic_price_4_pax, sic_price_6_pax, sic_price_8_pax, sic_price_10_pax, status, created_by) VALUES
(20, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 60.00, 52.00, 48.00, 45.00, 42.00, 'active', @user_id),
(21, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 75.00, 65.00, 58.00, 52.00, 50.00, 'active', @user_id),
(22, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 55.00, 48.00, 45.00, 42.00, 40.00, 'active', @user_id);

-- Multi-day tours pricing
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, sic_price_2_pax, sic_price_4_pax, sic_price_6_pax, sic_price_8_pax, sic_price_10_pax, status, created_by) VALUES
(23, 'Summer 2025', '2025-04-01', '2025-10-31', 'EUR', 1250.00, 1150.00, 1050.00, 950.00, 850.00, 'active', @user_id),
(24, 'Summer 2025', '2025-04-01', '2025-10-31', 'EUR', 1750.00, 1650.00, 1550.00, 1450.00, 1350.00, 'active', @user_id);

-- ============================================
-- VEHICLES & TRANSFER PRICING
-- ============================================

-- Istanbul Vehicles
INSERT INTO vehicles (organization_id, vehicle_type, max_capacity, city, status) VALUES
(@org_id, 'Mercedes Vito', 6, 'Istanbul', 'active'),
(@org_id, 'Mercedes Sprinter', 14, 'Istanbul', 'active'),
(@org_id, 'Isuzu Midibus', 25, 'Istanbul', 'active'),
(@org_id, 'Coach Bus', 50, 'Istanbul', 'active');

-- Cappadocia Vehicles
INSERT INTO vehicles (organization_id, vehicle_type, max_capacity, city, status) VALUES
(@org_id, 'Mercedes Vito', 6, 'Cappadocia', 'active'),
(@org_id, 'Mercedes Sprinter', 14, 'Cappadocia', 'active'),
(@org_id, 'Isuzu Midibus', 25, 'Cappadocia', 'active');

-- Antalya Vehicles
INSERT INTO vehicles (organization_id, vehicle_type, max_capacity, city, status) VALUES
(@org_id, 'Mercedes Vito', 6, 'Antalya', 'active'),
(@org_id, 'Mercedes Sprinter', 14, 'Antalya', 'active'),
(@org_id, 'Coach Bus', 50, 'Antalya', 'active');

-- Other destinations
INSERT INTO vehicles (organization_id, vehicle_type, max_capacity, city, status) VALUES
(@org_id, 'Mercedes Vito', 6, 'Izmir', 'active'),
(@org_id, 'Mercedes Sprinter', 14, 'Izmir', 'active'),
(@org_id, 'Mercedes Vito', 6, 'Kusadasi', 'active'),
(@org_id, 'Mercedes Vito', 6, 'Pamukkale', 'active'),
(@org_id, 'Mercedes Vito', 6, 'Bodrum', 'active');

-- Vehicle Pricing (All Year 2025)
INSERT INTO vehicle_pricing (vehicle_id, season_name, start_date, end_date, currency, price_per_day, price_half_day, airport_to_hotel, hotel_to_airport, airport_roundtrip, status, created_by) VALUES
-- Istanbul vehicles
(1, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 120.00, 70.00, 45.00, 45.00, 80.00, 'active', @user_id),
(2, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 160.00, 95.00, 55.00, 55.00, 100.00, 'active', @user_id),
(3, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 220.00, 130.00, 75.00, 75.00, 135.00, 'active', @user_id),
(4, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 350.00, 200.00, 95.00, 95.00, 175.00, 'active', @user_id),

-- Cappadocia vehicles
(5, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 110.00, 65.00, 50.00, 50.00, 90.00, 'active', @user_id),
(6, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 150.00, 90.00, 65.00, 65.00, 120.00, 'active', @user_id),
(7, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 210.00, 125.00, 85.00, 85.00, 155.00, 'active', @user_id),

-- Antalya vehicles
(8, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 115.00, 68.00, 40.00, 40.00, 75.00, 'active', @user_id),
(9, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 155.00, 92.00, 50.00, 50.00, 95.00, 'active', @user_id),
(10, 'Summer 2025', '2025-05-01', '2025-10-31', 'EUR', 330.00, 190.00, 85.00, 85.00, 160.00, 'active', @user_id),

-- Other destinations
(11, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 105.00, 62.00, 42.00, 42.00, 78.00, 'active', @user_id),
(12, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 145.00, 85.00, 52.00, 52.00, 98.00, 'active', @user_id),
(13, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 100.00, 60.00, 38.00, 38.00, 72.00, 'active', @user_id),
(14, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 95.00, 58.00, 40.00, 40.00, 75.00, 'active', @user_id),
(15, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 105.00, 62.00, 45.00, 45.00, 85.00, 'active', @user_id);

-- ============================================
-- GUIDES PRICING
-- ============================================

-- Istanbul Guides (Multiple Languages)
INSERT INTO guides (organization_id, city, language, status) VALUES
(@org_id, 'Istanbul', 'English', 'active'),
(@org_id, 'Istanbul', 'Spanish', 'active'),
(@org_id, 'Istanbul', 'French', 'active'),
(@org_id, 'Istanbul', 'German', 'active'),
(@org_id, 'Istanbul', 'Italian', 'active'),
(@org_id, 'Istanbul', 'Russian', 'active'),
(@org_id, 'Istanbul', 'Arabic', 'active'),
(@org_id, 'Istanbul', 'Chinese', 'active'),
(@org_id, 'Istanbul', 'Portuguese', 'active');

-- Cappadocia Guides
INSERT INTO guides (organization_id, city, language, status) VALUES
(@org_id, 'Cappadocia', 'English', 'active'),
(@org_id, 'Cappadocia', 'Spanish', 'active'),
(@org_id, 'Cappadocia', 'French', 'active'),
(@org_id, 'Cappadocia', 'German', 'active'),
(@org_id, 'Cappadocia', 'Russian', 'active');

-- Ephesus/Kusadasi Guides
INSERT INTO guides (organization_id, city, language, status) VALUES
(@org_id, 'Kusadasi', 'English', 'active'),
(@org_id, 'Kusadasi', 'Spanish', 'active'),
(@org_id, 'Kusadasi', 'French', 'active'),
(@org_id, 'Kusadasi', 'German', 'active');

-- Other cities
INSERT INTO guides (organization_id, city, language, status) VALUES
(@org_id, 'Antalya', 'English', 'active'),
(@org_id, 'Antalya', 'German', 'active'),
(@org_id, 'Antalya', 'Russian', 'active'),
(@org_id, 'Pamukkale', 'English', 'active'),
(@org_id, 'Izmir', 'English', 'active');

-- Guide Pricing (All Year 2025)
INSERT INTO guide_pricing (guide_id, season_name, start_date, end_date, currency, full_day_price, half_day_price, night_price, status, created_by) VALUES
-- Istanbul guides
(1, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 120.00, 70.00, 80.00, 'active', @user_id),
(2, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 125.00, 75.00, 85.00, 'active', @user_id),
(3, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 125.00, 75.00, 85.00, 'active', @user_id),
(4, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 125.00, 75.00, 85.00, 'active', @user_id),
(5, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 125.00, 75.00, 85.00, 'active', @user_id),
(6, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 130.00, 78.00, 88.00, 'active', @user_id),
(7, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 135.00, 80.00, 90.00, 'active', @user_id),
(8, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 140.00, 85.00, 95.00, 'active', @user_id),
(9, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 125.00, 75.00, 85.00, 'active', @user_id),

-- Cappadocia guides
(10, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 100.00, 60.00, 70.00, 'active', @user_id),
(11, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 105.00, 65.00, 75.00, 'active', @user_id),
(12, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 105.00, 65.00, 75.00, 'active', @user_id),
(13, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 105.00, 65.00, 75.00, 'active', @user_id),
(14, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 110.00, 68.00, 78.00, 'active', @user_id),

-- Ephesus guides
(15, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 95.00, 58.00, NULL, 'active', @user_id),
(16, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 100.00, 62.00, NULL, 'active', @user_id),
(17, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 100.00, 62.00, NULL, 'active', @user_id),
(18, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 100.00, 62.00, NULL, 'active', @user_id),

-- Other cities
(19, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 90.00, 55.00, NULL, 'active', @user_id),
(20, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 95.00, 58.00, NULL, 'active', @user_id),
(21, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 95.00, 58.00, NULL, 'active', @user_id),
(22, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 85.00, 52.00, NULL, 'active', @user_id),
(23, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 90.00, 55.00, NULL, 'active', @user_id);

-- ============================================
-- ENTRANCE FEES (Major Turkish Tourist Sites)
-- ============================================

INSERT INTO entrance_fees (organization_id, site_name, city, description, status) VALUES
-- Istanbul
(@org_id, 'Hagia Sophia', 'Istanbul', 'Byzantine architectural masterpiece, converted mosque with stunning mosaics', 'active'),
(@org_id, 'Topkapi Palace', 'Istanbul', 'Ottoman palace museum with treasury and harem', 'active'),
(@org_id, 'Topkapi Palace Harem', 'Istanbul', 'Private quarters of the Ottoman sultans', 'active'),
(@org_id, 'Blue Mosque', 'Istanbul', 'Iconic mosque with blue Iznik tiles (free during non-prayer times)', 'active'),
(@org_id, 'Basilica Cistern', 'Istanbul', 'Ancient underground water reservoir with Medusa heads', 'active'),
(@org_id, 'Dolmabahce Palace', 'Istanbul', 'Lavish 19th-century Ottoman palace on the Bosphorus', 'active'),
(@org_id, 'Istanbul Archaeological Museum', 'Istanbul', 'Museum complex with artifacts from throughout Turkish history', 'active'),
(@org_id, 'Chora Church', 'Istanbul', 'Byzantine church with extraordinary mosaics and frescoes', 'active'),
(@org_id, 'Galata Tower', 'Istanbul', 'Medieval stone tower with panoramic views of Istanbul', 'active'),

-- Cappadocia
(@org_id, 'Goreme Open Air Museum', 'Cappadocia', 'UNESCO site with rock-cut churches and frescoes', 'active'),
(@org_id, 'Derinkuyu Underground City', 'Cappadocia', 'Ancient multi-level underground city', 'active'),
(@org_id, 'Kaymakli Underground City', 'Cappadocia', 'Another fascinating underground city in Cappadocia', 'active'),
(@org_id, 'Zelve Open Air Museum', 'Cappadocia', 'Former monastic valley with cave dwellings', 'active'),

-- Ephesus
(@org_id, 'Ancient City of Ephesus', 'Kusadasi', 'Best preserved classical city in the Mediterranean', 'active'),
(@org_id, 'Terrace Houses Ephesus', 'Kusadasi', 'Luxurious Roman houses with mosaics and frescoes', 'active'),
(@org_id, 'House of Virgin Mary', 'Kusadasi', 'Shrine believed to be final home of Virgin Mary', 'active'),
(@org_id, 'Temple of Artemis', 'Kusadasi', 'Remains of one of Seven Wonders of Ancient World', 'active'),
(@org_id, 'Ephesus Archaeological Museum', 'Selcuk', 'Museum with artifacts from Ephesus excavations', 'active'),

-- Pamukkale
(@org_id, 'Pamukkale Thermal Pools', 'Pamukkale', 'White travertine terraces with thermal waters', 'active'),
(@org_id, 'Hierapolis Ancient City', 'Pamukkale', 'Ancient Greco-Roman city above Pamukkale', 'active'),

-- Antalya
(@org_id, 'Perge Ancient City', 'Antalya', 'Important Greco-Roman archaeological site', 'active'),
(@org_id, 'Aspendos Theatre', 'Antalya', 'Best preserved Roman theatre in the world', 'active'),
(@org_id, 'Side Ancient City', 'Antalya', 'Coastal ancient city with temple and theatre', 'active'),
(@org_id, 'Antalya Archaeological Museum', 'Antalya', 'One of Turkey\'s largest museums', 'active'),

-- Other destinations
(@org_id, 'Bodrum Castle', 'Bodrum', 'Medieval crusader castle and underwater archaeology museum', 'active'),
(@org_id, 'Mausoleum at Halicarnassus', 'Bodrum', 'Remains of one of Seven Wonders', 'active'),
(@org_id, 'Pergamon Acropolis', 'Izmir', 'Ancient Greek city on hilltop', 'active');

-- Entrance Fee Pricing (2025 prices based on actual Turkish sites)
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, child_price, student_price, status, created_by) VALUES
-- Istanbul sites (converted from TRY to EUR at approximate rate)
(1, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 25.00, 0.00, 12.50, 'active', @user_id),
(2, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 77.00, 0.00, 38.50, 'active', @user_id),
(3, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 29.00, 0.00, 14.50, 'active', @user_id),
(4, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 0.00, 0.00, 0.00, 'active', @user_id),
(5, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 48.00, 0.00, 24.00, 'active', @user_id),
(6, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 32.00, 0.00, 16.00, 'active', @user_id),
(7, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 16.00, 0.00, 8.00, 'active', @user_id),
(8, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 14.00, 0.00, 7.00, 'active', @user_id),
(9, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 10.00, 5.00, 5.00, 'active', @user_id),

-- Cappadocia sites
(10, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 18.00, 0.00, 9.00, 'active', @user_id),
(11, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 14.00, 0.00, 7.00, 'active', @user_id),
(12, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 12.00, 0.00, 6.00, 'active', @user_id),
(13, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 10.00, 0.00, 5.00, 'active', @user_id),

-- Ephesus sites
(14, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 16.00, 0.00, 8.00, 'active', @user_id),
(15, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 10.00, 0.00, 5.00, 'active', @user_id),
(16, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 8.00, 4.00, 4.00, 'active', @user_id),
(17, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 5.00, 0.00, 2.50, 'active', @user_id),
(18, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 6.00, 0.00, 3.00, 'active', @user_id),

-- Pamukkale
(19, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 15.00, 0.00, 7.50, 'active', @user_id),
(20, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 0.00, 0.00, 0.00, 'active', @user_id),

-- Antalya sites
(21, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 12.00, 0.00, 6.00, 'active', @user_id),
(22, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 14.00, 0.00, 7.00, 'active', @user_id),
(23, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 10.00, 0.00, 5.00, 'active', @user_id),
(24, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 8.00, 0.00, 4.00, 'active', @user_id),

-- Other destinations
(25, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 18.00, 0.00, 9.00, 'active', @user_id),
(26, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 5.00, 0.00, 2.50, 'active', @user_id),
(27, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 14.00, 0.00, 7.00, 'active', @user_id);

-- ============================================
-- MEALS PRICING (Popular Restaurants)
-- ============================================

INSERT INTO meal_pricing (organization_id, restaurant_name, city, meal_type, season_name, start_date, end_date, currency, adult_lunch_price, child_lunch_price, adult_dinner_price, child_dinner_price, menu_description, status, created_by) VALUES
-- Istanbul Restaurants
(@org_id, 'Sultanahmet Koftecisi', 'Istanbul', 'Lunch', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 15.00, 10.00, NULL, NULL, 'Famous Turkish meatballs, salad, rice, dessert, soft drink', 'active', @user_id),
(@org_id, 'Pandeli Restaurant', 'Istanbul', 'Lunch', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 25.00, 15.00, NULL, NULL, 'Ottoman cuisine in Spice Bazaar, 3-course menu', 'active', @user_id),
(@org_id, 'Hamdi Restaurant', 'Istanbul', 'Both', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 28.00, 18.00, 32.00, 20.00, 'Kebabs with Golden Horn view, meze, main course, dessert', 'active', @user_id),
(@org_id, 'Karakoy Lokantasi', 'Istanbul', 'Lunch', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 22.00, 14.00, NULL, NULL, 'Modern Turkish cuisine, 3-course menu', 'active', @user_id),
(@org_id, 'Bosphorus Cruise Lunch', 'Istanbul', 'Lunch', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 35.00, 22.00, NULL, NULL, 'Lunch on boat, Turkish buffet with Bosphorus views', 'active', @user_id),
(@org_id, 'Galata Port', 'Istanbul', 'Dinner', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', NULL, NULL, 38.00, 24.00, 'Seafood dinner with Bosphorus view, 4-course menu', 'active', @user_id),

-- Cappadocia Restaurants
(@org_id, 'Dibek Restaurant', 'Cappadocia', 'Both', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 20.00, 12.00, 25.00, 15.00, 'Cave restaurant, traditional Anatolian cuisine', 'active', @user_id),
(@org_id, 'Seten Restaurant', 'Cappadocia', 'Lunch', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 18.00, 11.00, NULL, NULL, 'Turkish buffet lunch, pottery kebab option', 'active', @user_id),
(@org_id, 'Old Cappadocia Cafe', 'Cappadocia', 'Dinner', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', NULL, NULL, 22.00, 14.00, 'Dinner in cave setting, meze and pottery kebab', 'active', @user_id),
(@org_id, 'Turkish Night Dinner Show', 'Cappadocia', 'Dinner', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', NULL, NULL, 45.00, 25.00, 'Dinner with traditional Turkish folk dance and belly dancing show', 'active', @user_id),

-- Ephesus/Kusadasi Restaurants
(@org_id, 'Selcuk Artemis Restaurant', 'Selcuk', 'Lunch', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 16.00, 10.00, NULL, NULL, 'Turkish lunch buffet near Ephesus', 'active', @user_id),
(@org_id, 'Kusadasi Fish Restaurant', 'Kusadasi', 'Dinner', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', NULL, NULL, 30.00, 18.00, 'Fresh seafood dinner by the marina', 'active', @user_id),

-- Pamukkale Restaurants
(@org_id, 'White Heaven Restaurant', 'Pamukkale', 'Lunch', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 14.00, 9.00, NULL, NULL, 'Turkish lunch buffet with Pamukkale view', 'active', @user_id),

-- Antalya Restaurants
(@org_id, 'Kaleici Marina Restaurant', 'Antalya', 'Both', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 18.00, 11.00, 24.00, 15.00, 'Turkish and Mediterranean cuisine in old harbor', 'active', @user_id),
(@org_id, 'Vanilla Lounge', 'Antalya', 'Dinner', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', NULL, NULL, 28.00, 17.00, 'Rooftop dining with city views', 'active', @user_id);

-- ============================================
-- EXTRA EXPENSES
-- ============================================

INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
-- Parking Fees
(@org_id, 'Hotel Parking Istanbul', 'Parking', 'Istanbul', 'EUR', 12.00, 'per day', 'Daily parking at Istanbul hotels', 'active'),
(@org_id, 'Hotel Parking Cappadocia', 'Parking', 'Cappadocia', 'EUR', 8.00, 'per day', 'Daily parking at Cappadocia hotels', 'active'),
(@org_id, 'Hotel Parking Antalya', 'Parking', 'Antalya', 'EUR', 10.00, 'per day', 'Daily parking at Antalya resort', 'active'),
(@org_id, 'Istanbul Airport Parking', 'Parking', 'Istanbul', 'EUR', 15.00, 'per day', 'Airport parking fees', 'active'),

-- Highway Tolls
(@org_id, 'Bosphorus Bridge Toll', 'Tolls', 'Istanbul', 'EUR', 3.50, 'per crossing', 'Bridge crossing toll', 'active'),
(@org_id, 'Highway Toll Istanbul-Ankara', 'Tolls', 'Turkey', 'EUR', 18.00, 'one way', 'Highway toll Istanbul to Ankara', 'active'),
(@org_id, 'Highway Toll Istanbul-Izmir', 'Tolls', 'Turkey', 'EUR', 22.00, 'one way', 'Highway toll Istanbul to Izmir', 'active'),

-- Driver/Guide Tips (Suggested)
(@org_id, 'Driver Tip per Day', 'Tips', 'Turkey', 'EUR', 10.00, 'per day', 'Suggested tip for private driver', 'active'),
(@org_id, 'Guide Tip per Day', 'Tips', 'Turkey', 'EUR', 15.00, 'per day', 'Suggested tip for tour guide', 'active'),
(@org_id, 'Restaurant Service', 'Service', 'Turkey', 'EUR', 5.00, 'per person', 'Additional service charge if not included', 'active'),

-- Other Expenses
(@org_id, 'Istanbul Tourist Pass', 'Service', 'Istanbul', 'EUR', 85.00, 'per person', '3-day museum pass for Istanbul', 'active'),
(@org_id, 'Turkish SIM Card', 'Service', 'Turkey', 'EUR', 15.00, 'per card', 'Tourist SIM card with data', 'active'),
(@org_id, 'Porter Service Hotel', 'Service', 'Turkey', 'EUR', 3.00, 'per luggage', 'Luggage porter at hotels', 'active'),
(@org_id, 'Airport Meet & Greet', 'Service', 'Istanbul', 'EUR', 35.00, 'per person', 'Fast track and greeting service at airport', 'active');

-- ============================================
-- END OF MOCK DATA SCRIPT
-- ============================================
