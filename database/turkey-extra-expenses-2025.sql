-- Turkey Tour Operator Extra Expenses 2025
-- Common additional costs for tour packages

-- Get user ID for created_by field
SET @org_id = 5; -- Funny Tourism

-- ============================================
-- CATEGORY: Tips & Gratuities
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'Driver Tip', 'Tips & Gratuities', NULL, 'EUR', 2.00, 'per day', 'Recommended tip for driver per day', 'active'),
(@org_id, 'Guide Tip', 'Tips & Gratuities', NULL, 'EUR', 3.00, 'per day', 'Recommended tip for tour guide per day', 'active'),
(@org_id, 'Restaurant Service Tip', 'Tips & Gratuities', NULL, 'EUR', 3.00, 'per person', 'Service tip at restaurants (if not included)', 'active'),
(@org_id, 'Hotel Staff Tip', 'Tips & Gratuities', NULL, 'EUR', 2.00, 'per day', 'Tip for hotel bellhop/porter', 'active');

-- ============================================
-- CATEGORY: Transportation Fees
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'Highway Toll - Istanbul to Ankara', 'Transportation Fees', 'Istanbul', 'EUR', 15.00, 'per vehicle', 'Highway toll for Istanbul-Ankara route', 'active'),
(@org_id, 'Highway Toll - Istanbul to Izmir', 'Transportation Fees', 'Istanbul', 'EUR', 18.00, 'per vehicle', 'Highway toll for Istanbul-Izmir route', 'active'),
(@org_id, 'Bridge Crossing - Bosphorus', 'Transportation Fees', 'Istanbul', 'EUR', 3.50, 'per crossing', '15 July Martyrs or Fatih Sultan Mehmet Bridge', 'active'),
(@org_id, 'Airport Parking Fee', 'Transportation Fees', NULL, 'EUR', 8.00, 'per day', 'Airport parking for transfer vehicles', 'active'),
(@org_id, 'City Center Parking', 'Transportation Fees', NULL, 'EUR', 5.00, 'per day', 'City center parking fees', 'active'),
(@org_id, 'Fuel Surcharge', 'Transportation Fees', NULL, 'EUR', 0.15, 'per km', 'Additional fuel cost for long distances', 'active');

-- ============================================
-- CATEGORY: Visa & Documentation
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'Turkey e-Visa Processing', 'Visa & Documentation', NULL, 'EUR', 50.00, 'per person', 'e-Visa application and processing service', 'active'),
(@org_id, 'Document Translation Service', 'Visa & Documentation', NULL, 'EUR', 25.00, 'per document', 'Official document translation', 'active'),
(@org_id, 'Travel Insurance', 'Visa & Documentation', NULL, 'EUR', 15.00, 'per person', 'Basic travel insurance coverage', 'active');

-- ============================================
-- CATEGORY: Airport Services
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'Meet & Greet Service - Istanbul Airport', 'Airport Services', 'Istanbul', 'EUR', 30.00, 'per group', 'VIP meet and greet at Istanbul Airport', 'active'),
(@org_id, 'Meet & Greet Service - Antalya Airport', 'Airport Services', 'Antalya', 'EUR', 25.00, 'per group', 'VIP meet and greet at Antalya Airport', 'active'),
(@org_id, 'Fast Track Immigration', 'Airport Services', NULL, 'EUR', 20.00, 'per person', 'Fast track through immigration and security', 'active'),
(@org_id, 'Airport Lounge Access', 'Airport Services', NULL, 'EUR', 35.00, 'per person', 'Airport lounge access for 3 hours', 'active'),
(@org_id, 'Luggage Porter Service', 'Airport Services', NULL, 'EUR', 5.00, 'per person', 'Porter service for luggage handling', 'active');

-- ============================================
-- CATEGORY: Communication
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'Tourist SIM Card - 7 Days', 'Communication', NULL, 'EUR', 15.00, 'per person', '7-day tourist SIM with 10GB data', 'active'),
(@org_id, 'Tourist SIM Card - 14 Days', 'Communication', NULL, 'EUR', 25.00, 'per person', '14-day tourist SIM with 20GB data', 'active'),
(@org_id, 'Pocket WiFi Device', 'Communication', NULL, 'EUR', 8.00, 'per day', 'Portable WiFi device rental (up to 5 devices)', 'active');

-- ============================================
-- CATEGORY: Special Equipment
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'Wheelchair Accessible Vehicle', 'Special Equipment', NULL, 'EUR', 50.00, 'per day', 'Additional cost for wheelchair accessible transport', 'active'),
(@org_id, 'Baby Seat/Child Seat', 'Special Equipment', NULL, 'EUR', 5.00, 'per day', 'Child safety seat for vehicle', 'active'),
(@org_id, 'Audio Guide System', 'Special Equipment', NULL, 'EUR', 3.00, 'per person', 'Personal audio guide device rental', 'active'),
(@org_id, 'Photography Permit - Museum', 'Special Equipment', NULL, 'EUR', 10.00, 'per person', 'Professional photography permit at museums', 'active');

-- ============================================
-- CATEGORY: Medical & Health
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'PCR Test', 'Medical & Health', NULL, 'EUR', 30.00, 'per person', 'COVID-19 PCR test if required', 'active'),
(@org_id, 'First Aid Kit', 'Medical & Health', NULL, 'EUR', 15.00, 'per group', 'Complete first aid kit for tour group', 'active'),
(@org_id, 'Doctor On Call Service', 'Medical & Health', NULL, 'EUR', 100.00, 'per visit', 'Emergency doctor visit to hotel', 'active');

-- ============================================
-- CATEGORY: Entertainment & Activities
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'Turkish Night Show', 'Entertainment & Activities', 'Istanbul', 'EUR', 45.00, 'per person', 'Traditional Turkish folklore show with dinner', 'active'),
(@org_id, 'Bosphorus Dinner Cruise', 'Entertainment & Activities', 'Istanbul', 'EUR', 65.00, 'per person', 'Evening Bosphorus cruise with dinner', 'active'),
(@org_id, 'Turkish Bath (Hammam) Experience', 'Entertainment & Activities', NULL, 'EUR', 35.00, 'per person', 'Traditional Turkish bath experience', 'active'),
(@org_id, 'Whirling Dervish Ceremony', 'Entertainment & Activities', 'Konya', 'EUR', 25.00, 'per person', 'Traditional Whirling Dervish ceremony', 'active'),
(@org_id, 'Hot Air Balloon Ride', 'Entertainment & Activities', 'Cappadocia', 'EUR', 180.00, 'per person', 'Sunrise hot air balloon ride over Cappadocia', 'active'),
(@org_id, 'Wine Tasting Tour', 'Entertainment & Activities', 'Cappadocia', 'EUR', 30.00, 'per person', 'Local wine tasting at Cappadocia wineries', 'active'),
(@org_id, 'Cooking Class - Turkish Cuisine', 'Entertainment & Activities', NULL, 'EUR', 50.00, 'per person', 'Traditional Turkish cooking class', 'active');

-- ============================================
-- CATEGORY: Shopping & Souvenirs
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'Shopping Tour Guide', 'Shopping & Souvenirs', NULL, 'EUR', 40.00, 'per half day', 'Personal shopping guide service', 'active'),
(@org_id, 'Carpet Shopping Commission', 'Shopping & Souvenirs', NULL, 'EUR', 50.00, 'per group', 'Guide service for carpet shopping', 'active');

-- ============================================
-- CATEGORY: Emergency & Assistance
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, '24/7 Emergency Assistance', 'Emergency & Assistance', NULL, 'EUR', 10.00, 'per day', '24-hour emergency support hotline', 'active'),
(@org_id, 'Lost Luggage Assistance', 'Emergency & Assistance', NULL, 'EUR', 50.00, 'per case', 'Assistance with lost luggage claims', 'active'),
(@org_id, 'Flight Change/Rebooking Fee', 'Emergency & Assistance', NULL, 'EUR', 75.00, 'per person', 'Service fee for flight changes or rebooking', 'active');

-- ============================================
-- CATEGORY: Seasonal & Event Fees
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'New Year Gala Dinner', 'Seasonal & Event Fees', NULL, 'EUR', 120.00, 'per person', 'Special New Year Eve gala dinner', 'active'),
(@org_id, 'Peak Season Surcharge', 'Seasonal & Event Fees', NULL, 'EUR', 25.00, 'per day', 'High season surcharge (July-August)', 'active'),
(@org_id, 'Religious Holiday Surcharge', 'Seasonal & Event Fees', NULL, 'EUR', 20.00, 'per day', 'Surcharge during Ramadan/Eid holidays', 'active');

-- ============================================
-- CATEGORY: Miscellaneous
-- ============================================
INSERT INTO extra_expenses (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status) VALUES
(@org_id, 'Bottled Water (Daily)', 'Miscellaneous', NULL, 'EUR', 2.00, 'per person', 'Daily bottled water supply per person', 'active'),
(@org_id, 'Umbrella Rental (Rainy Day)', 'Miscellaneous', NULL, 'EUR', 3.00, 'per person', 'Umbrella rental for rainy days', 'active'),
(@org_id, 'Laundry Service', 'Miscellaneous', NULL, 'EUR', 15.00, 'per load', 'Hotel laundry service per load', 'active'),
(@org_id, 'Late Check-out Fee', 'Miscellaneous', NULL, 'EUR', 30.00, 'per room', 'Hotel late check-out (after 12:00)', 'active'),
(@org_id, 'Early Check-in Fee', 'Miscellaneous', NULL, 'EUR', 25.00, 'per room', 'Hotel early check-in (before 14:00)', 'active'),
(@org_id, 'Name Board at Airport', 'Miscellaneous', NULL, 'EUR', 5.00, 'per person', 'Personalized name board for airport pickup', 'active'),
(@org_id, 'Group Photo Service', 'Miscellaneous', NULL, 'EUR', 40.00, 'per group', 'Professional group photo at landmarks', 'active');
