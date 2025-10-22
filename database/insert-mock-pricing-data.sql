-- Insert Mock Pricing Data for Istanbul Travel Agency (organization_id = 1)

-- HOTELS
INSERT INTO hotels (organization_id, hotel_name, city, star_rating, status) VALUES
(1, 'Hotel Sultanahmet Palace', 'Istanbul', 4, 'active'),
(1, 'Cappadocia Cave Hotel', 'Cappadocia', 5, 'active'),
(1, 'Antalya Beach Resort', 'Antalya', 5, 'active');

-- HOTEL PRICING
INSERT INTO hotel_pricing (hotel_id, season_name, start_date, end_date, currency, double_room_bb, single_supplement_bb, triple_room_bb, child_0_6_bb, child_6_12_bb, base_meal_plan, hb_supplement, fb_supplement, ai_supplement, notes, status) VALUES
(1, 'Summer 2025', '2025-04-01', '2025-10-31', 'EUR', 80, 40, 70, 0, 25, 'BB', 15, 30, 50, 'Peak season rates', 'active'),
(2, 'Winter 2025', '2025-11-01', '2026-03-31', 'EUR', 120, 60, 100, 0, 40, 'HB', 0, 15, 35, 'HB included in base price', 'active'),
(3, 'High Season 2025', '2025-05-01', '2025-09-30', 'EUR', 150, 75, 130, 0, 50, 'BB', 20, 40, 60, 'Beach resort premium', 'active');

-- TOURS
INSERT INTO tours (organization_id, tour_name, tour_code, city, duration_days, tour_type, inclusions, exclusions, status) VALUES
(1, 'Bosphorus Cruise & Asian Side', 'BOS-SIC-01', 'Istanbul', 1, 'SIC', 'Professional Guide, Transportation, Entrance Fees, Lunch', NULL, 'active'),
(1, 'Ephesus Full Day Private Tour', 'EPH-PVT-01', 'Ephesus', 1, 'PRIVATE', 'Private Transportation', 'Guide (€100/day), Entrance Fees (€15/person)', 'active'),
(1, 'Cappadocia Hot Air Balloon', 'CAP-SIC-02', 'Cappadocia', 1, 'SIC', 'Hot Air Balloon Flight, Hotel Pickup, Breakfast, Certificate', NULL, 'active');

-- TOUR PRICING
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, sic_price_2_pax, sic_price_4_pax, sic_price_6_pax, sic_price_8_pax, sic_price_10_pax, notes, status) VALUES
(1, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 65, 65, 65, 65, 65, 'Fixed SIC price', 'active'),
(3, 'High Season 2025', '2025-05-01', '2025-09-30', 'EUR', 200, 200, 200, 200, 200, 'Hot air balloon fixed price', 'active');

INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, currency, pvt_price_2_pax, pvt_price_4_pax, pvt_price_6_pax, pvt_price_8_pax, pvt_price_10_pax, notes, status) VALUES
(2, 'Summer 2025', '2025-04-01', '2025-10-31', 'EUR', 120, 85, 70, 60, 55, 'Private tour per person pricing', 'active');

-- VEHICLES
INSERT INTO vehicles (organization_id, vehicle_type, max_capacity, city, status) VALUES
(1, 'Vito', 4, 'Istanbul', 'active'),
(1, 'Vito', 4, 'Antalya', 'active'),
(1, 'Sprinter', 10, 'Istanbul', 'active'),
(1, 'Isuzu', 18, 'Cappadocia', 'active'),
(1, 'Coach', 46, 'Any', 'active');

-- VEHICLE PRICING
INSERT INTO vehicle_pricing (vehicle_id, season_name, start_date, end_date, currency, price_per_day, price_half_day, airport_to_hotel, hotel_to_airport, airport_roundtrip, notes, status) VALUES
(1, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 120, 70, 50, 50, 85, 'IST Airport - Comfortable for 4 passengers', 'active'),
(2, 'Summer 2025', '2025-04-01', '2025-10-31', 'EUR', 130, 75, 40, 40, 70, 'AYT Airport - Peak season', 'active'),
(3, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 180, 100, 70, 70, 120, 'Perfect for groups up to 10 pax', 'active'),
(4, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 220, 130, 90, 90, 150, 'NAV/ASR Airport - Medium groups', 'active'),
(5, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 350, 200, 120, 120, 200, 'Large coach for big groups', 'active');

-- GUIDES
INSERT INTO guides (organization_id, city, language, status) VALUES
(1, 'Istanbul', 'English', 'active'),
(1, 'Istanbul', 'Spanish', 'active'),
(1, 'Cappadocia', 'English', 'active'),
(1, 'Ephesus', 'German', 'active'),
(1, 'Antalya', 'Russian', 'active');

-- GUIDE PRICING
INSERT INTO guide_pricing (guide_id, season_name, start_date, end_date, currency, full_day_price, half_day_price, night_price, notes, status) VALUES
(1, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 100, 60, 80, 'Licensed professional guide', 'active'),
(2, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 120, 70, 90, 'Premium language - higher demand', 'active'),
(3, 'Summer 2025', '2025-04-01', '2025-10-31', 'EUR', 110, 65, 85, 'Peak season rates', 'active'),
(4, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 115, 68, 88, 'Archaeological site specialist', 'active'),
(5, 'High Season 2025', '2025-05-01', '2025-09-30', 'EUR', 125, 75, 95, 'High demand for Russian speakers', 'active');

-- ENTRANCE FEES (Official Turkish Ministry data)
INSERT INTO entrance_fees (organization_id, site_name, city, status) VALUES
(1, 'Topkapı Palace Museum', 'Istanbul', 'active'),
(1, 'Ephesus Archaeological Site', 'Izmir', 'active'),
(1, 'Pamukkale (Hierapolis Ancient City)', 'Denizli', 'active'),
(1, 'Galata Tower', 'Istanbul', 'active'),
(1, 'Göreme Open-Air Museum', 'Cappadocia', 'active'),
(1, 'Troy Museum & Archaeological Site', 'Çanakkale', 'active'),
(1, 'Kız Kulesi (Maiden\'s Tower)', 'Istanbul', 'active'),
(1, 'Bodrum Underwater Archaeology Museum', 'Muğla', 'active'),
(1, 'Hagia Sophia Grand Mosque', 'Istanbul', 'active'),
(1, 'Basilica Cistern', 'Istanbul', 'active');

-- ENTRANCE FEE PRICING
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, child_price, student_price, notes, status) VALUES
(1, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 30, 0, 15, 'Harem section requires separate ticket. Free for children under 6. MüzeKart valid.', 'active'),
(2, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 40, 0, 20, 'UNESCO World Heritage Site. Free for children under 6. Student ID required.', 'active'),
(3, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 30, 0, 15, 'Natural thermal travertines + ancient ruins. Free for children under 6.', 'active'),
(4, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 30, 0, 15, 'Panoramic city views. Long queues in summer. Free for children under 6.', 'active'),
(5, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 20, 0, 10, 'UNESCO site. Rock-cut churches with frescoes. Free for children under 6.', 'active'),
(6, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 27, 0, 13.50, 'UNESCO World Heritage Site. Museum + ruins. Free for children under 6.', 'active'),
(7, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 27, 0, 13.50, 'Iconic Bosphorus landmark. Includes boat transfer. Free for children under 6.', 'active'),
(8, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 20, 0, 10, 'Located in Bodrum Castle. Unique underwater archaeological finds. Free for children under 6.', 'active'),
(9, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 0, 0, 0, 'FREE - Currently operates as a mosque. No entrance fee. Modest dress required.', 'active'),
(10, 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 15, 0, 7.50, 'Underground Byzantine water reservoir. Medusa head columns. Free for children under 6.', 'active');

-- MEAL PRICING
INSERT INTO meal_pricing (organization_id, restaurant_name, city, meal_type, season_name, start_date, end_date, currency, adult_lunch_price, child_lunch_price, adult_dinner_price, child_dinner_price, menu_description, notes, status) VALUES
(1, 'Sultanahmet Koftecisi', 'Istanbul', 'Both', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 15, 10, 20, 12, 'Traditional Turkish cuisine - Famous meatballs, mixed grill, salads', 'Popular tourist spot in Old City', 'active'),
(1, 'Cappadocia Cave Restaurant', 'Cappadocia', 'Dinner', 'High Season 2025', '2025-04-01', '2025-10-31', 'EUR', 0, 0, 28, 16, 'Traditional Anatolian cuisine in authentic cave setting with pottery kebab', 'Dinner only. Advance booking required.', 'active'),
(1, 'Balik Lokantasi (Fish Restaurant)', 'Istanbul', 'Both', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 18, 12, 25, 15, 'Fresh fish from Bosphorus, meze appetizers, salads', 'Located by the waterfront', 'active'),
(1, 'Ephesus Terrace Restaurant', 'Izmir', 'Lunch', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 14, 9, 0, 0, 'Mediterranean cuisine, vegetarian options, Turkish specialties', 'Lunch only. Near ancient Ephesus site.', 'active'),
(1, 'Ottoman Palace Cuisine', 'Istanbul', 'Dinner', 'All Year 2025', '2025-01-01', '2025-12-31', 'EUR', 0, 0, 35, 20, 'Fine dining Ottoman cuisine, live music, Bosphorus view', 'Premium restaurant. Dress code applies.', 'active');

-- EXTRA EXPENSES
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(1, 'Daily Parking Fee', 'Parking', 'Istanbul - City Center', 'EUR', 12, 'per day', 'Daily parking for tour vehicles in central Istanbul areas', 'active'),
(1, 'Highway Toll (Istanbul-Ankara)', 'Tolls', 'Istanbul-Ankara Route', 'EUR', 18, 'per trip', 'One-way motorway toll from Istanbul to Ankara', 'active'),
(1, 'Driver Daily Tip', 'Tips', 'Any', 'EUR', 5, 'per day', 'Recommended daily tip for driver', 'active'),
(1, 'Guide Daily Tip', 'Tips', 'Any', 'EUR', 8, 'per day', 'Recommended daily tip for tour guide', 'active'),
(1, 'Porter Service', 'Service', 'Any', 'EUR', 2, 'per bag', 'Luggage handling at hotels', 'active'),
(1, 'Airport Parking (IST)', 'Parking', 'Istanbul Airport', 'EUR', 8, 'per hour', 'Hourly parking at Istanbul Airport', 'active'),
(1, 'Bosphorus Bridge Toll', 'Tolls', 'Istanbul', 'EUR', 3.50, 'per crossing', 'Toll for crossing Bosphorus bridges', 'active'),
(1, 'Restaurant Service Charge', 'Service', 'Any', 'EUR', 1.50, 'per person', 'Service charge at some restaurants', 'active'),
(1, 'Whirling Dervish Show Tip', 'Tips', 'Cappadocia', 'EUR', 3, 'per person', 'Customary tip for performers', 'active'),
(1, 'Hamam (Turkish Bath) Tips', 'Tips', 'Any', 'EUR', 10, 'per person', 'Tips for massage therapist and attendant', 'active');
