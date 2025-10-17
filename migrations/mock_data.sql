-- Mock data for activity pricing system
-- Set the operator_id to Funny Tourism
SET @operator_id = 'ed58206d-f600-483b-b98a-79805310e9be';

-- Insert sample activities
INSERT INTO activities (id, operator_id, name, city, category, duration_hours, base_price, currency, description, min_participants, max_participants, is_active) VALUES
(UUID(), @operator_id, 'Istanbul Full Day Tour', 'Istanbul', 'cultural', 8.00, 120.00, 'USD', 'Explore the best of Istanbul including Hagia Sophia, Blue Mosque, Topkapi Palace, and Grand Bazaar. Includes transport, professional guide, entrance fees, and lunch.', 1, 50, 1),
(UUID(), @operator_id, 'Bosphorus Sunset Cruise', 'Istanbul', 'entertainment', 2.50, 45.00, 'USD', 'Romantic sunset cruise on the Bosphorus with stunning views of Istanbul skyline, palaces, and bridges.', 1, 100, 1),
(UUID(), @operator_id, 'Cappadocia Hot Air Balloon', 'Cappadocia', 'adventure', 3.00, 180.00, 'USD', 'Unforgettable hot air balloon experience over fairy chimneys and unique rock formations at sunrise.', 1, 20, 1),
(UUID(), @operator_id, 'Turkish Cooking Class', 'Istanbul', 'cultural', 4.00, 85.00, 'USD', 'Learn to cook authentic Turkish dishes with a local chef. Includes all ingredients, cooking session, and meal.', 2, 12, 1),
(UUID(), @operator_id, 'Pamukkale Day Trip', 'Denizli', 'nature', 10.00, 95.00, 'USD', 'Visit the stunning white travertine terraces and ancient Hierapolis ruins. Includes transport, guide, and entrance fees.', 1, 40, 1);

-- Get activity IDs for pricing
SET @activity1 = (SELECT id FROM activities WHERE name = 'Istanbul Full Day Tour' AND operator_id = @operator_id LIMIT 1);
SET @activity2 = (SELECT id FROM activities WHERE name = 'Bosphorus Sunset Cruise' AND operator_id = @operator_id LIMIT 1);
SET @activity3 = (SELECT id FROM activities WHERE name = 'Cappadocia Hot Air Balloon' AND operator_id = @operator_id LIMIT 1);
SET @activity4 = (SELECT id FROM activities WHERE name = 'Turkish Cooking Class' AND operator_id = @operator_id LIMIT 1);
SET @activity5 = (SELECT id FROM activities WHERE name = 'Pamukkale Day Trip' AND operator_id = @operator_id LIMIT 1);

-- Activity 1: Istanbul Full Day Tour - SIC Standard
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, sic_price_adult, sic_price_child_0_2, sic_price_child_3_5, sic_price_child_6_11, sic_price_child_12_17, season, valid_from, valid_until, currency, notes, is_active) VALUES
(UUID(), @activity1, @operator_id, 'sic', 150.00, 0.00, 75.00, 100.00, 125.00, 'standard', '2025-03-01', '2025-05-31', 'USD', 'Includes transport, guide, entrance fees, and lunch', 1);

-- Activity 1: Istanbul Full Day Tour - SIC High Season
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, sic_price_adult, sic_price_child_0_2, sic_price_child_3_5, sic_price_child_6_11, sic_price_child_12_17, season, valid_from, valid_until, currency, notes, is_active) VALUES
(UUID(), @activity1, @operator_id, 'sic', 180.00, 0.00, 90.00, 120.00, 150.00, 'high_season', '2025-06-01', '2025-09-30', 'USD', 'Summer season - Includes transport, guide, entrance fees, and lunch', 1);

-- Activity 1: Istanbul Full Day Tour - Private 2-6 pax
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, transport_cost, guide_cost, entrance_fee_adult, entrance_fee_child_6_11, meal_cost_adult, meal_cost_child, min_pax, max_pax, season, valid_from, valid_until, currency, notes, is_active) VALUES
(UUID(), @activity1, @operator_id, 'private', 200.00, 150.00, 45.00, 22.50, 25.00, 15.00, 2, 6, 'standard', '2025-03-01', '2025-05-31', 'USD', 'Private minivan up to 6 people', 1);

-- Activity 1: Istanbul Full Day Tour - Private 7-14 pax
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, transport_cost, guide_cost, entrance_fee_adult, entrance_fee_child_6_11, meal_cost_adult, meal_cost_child, min_pax, max_pax, season, valid_from, valid_until, currency, notes, is_active) VALUES
(UUID(), @activity1, @operator_id, 'private', 350.00, 180.00, 45.00, 22.50, 25.00, 15.00, 7, 14, 'standard', '2025-03-01', '2025-05-31', 'USD', 'Private minibus up to 14 people', 1);

-- Activity 2: Bosphorus Sunset Cruise - SIC
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, sic_price_adult, sic_price_child_0_2, sic_price_child_3_5, sic_price_child_6_11, sic_price_child_12_17, entrance_fee_adult, entrance_fee_child_6_11, season, currency, notes, is_active) VALUES
(UUID(), @activity2, @operator_id, 'sic', 55.00, 0.00, 20.00, 30.00, 45.00, 25.00, 15.00, 'standard', 'USD', 'Includes boat ticket and soft drinks', 1);

-- Activity 2: Bosphorus Sunset Cruise - Private Boat
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, transport_cost, entrance_fee_adult, entrance_fee_child_6_11, meal_cost_adult, meal_cost_child, min_pax, max_pax, season, currency, notes, is_active) VALUES
(UUID(), @activity2, @operator_id, 'private', 800.00, 25.00, 15.00, 30.00, 20.00, 10, 30, 'standard', 'USD', 'Private yacht charter for groups', 1);

-- Activity 3: Cappadocia Hot Air Balloon - SIC Standard
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, sic_price_adult, sic_price_child_0_2, sic_price_child_3_5, sic_price_child_6_11, sic_price_child_12_17, season, valid_from, valid_until, currency, notes, is_active) VALUES
(UUID(), @activity3, @operator_id, 'sic', 220.00, 0.00, 0.00, 0.00, 180.00, 'standard', '2025-04-01', '2025-10-31', 'USD', 'Includes hotel pickup, flight, champagne toast, and certificate. Children under 6 not permitted.', 1);

-- Activity 3: Cappadocia Hot Air Balloon - SIC Peak
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, sic_price_adult, sic_price_child_0_2, sic_price_child_3_5, sic_price_child_6_11, sic_price_child_12_17, season, valid_from, valid_until, currency, notes, is_active) VALUES
(UUID(), @activity3, @operator_id, 'sic', 280.00, 0.00, 0.00, 0.00, 220.00, 'peak', '2025-07-01', '2025-08-31', 'USD', 'Peak summer season', 1);

-- Activity 3: Cappadocia Hot Air Balloon - Private Charter
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, transport_cost, guide_cost, min_pax, max_pax, season, currency, notes, is_active) VALUES
(UUID(), @activity3, @operator_id, 'private', 2800.00, 200.00, 8, 12, 'standard', 'USD', 'Exclusive balloon charter for your group', 1);

-- Activity 4: Turkish Cooking Class - SIC
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, sic_price_adult, sic_price_child_0_2, sic_price_child_3_5, sic_price_child_6_11, sic_price_child_12_17, season, currency, notes, is_active) VALUES
(UUID(), @activity4, @operator_id, 'sic', 95.00, 0.00, 40.00, 55.00, 75.00, 'standard', 'USD', 'Includes all ingredients, cooking session, meal, and recipe book', 1);

-- Activity 4: Turkish Cooking Class - Private
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, guide_cost, meal_cost_adult, meal_cost_child, min_pax, max_pax, season, currency, notes, is_active) VALUES
(UUID(), @activity4, @operator_id, 'private', 350.00, 45.00, 25.00, 4, 10, 'standard', 'USD', 'Private cooking class with dedicated chef', 1);

-- Activity 5: Pamukkale Day Trip - SIC
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, sic_price_adult, sic_price_child_0_2, sic_price_child_3_5, sic_price_child_6_11, sic_price_child_12_17, season, currency, notes, is_active) VALUES
(UUID(), @activity5, @operator_id, 'sic', 110.00, 0.00, 50.00, 70.00, 90.00, 'standard', 'USD', 'Includes round-trip transport, guide, entrance fees, and lunch', 1);

-- Activity 5: Pamukkale Day Trip - Private
INSERT INTO activity_pricing (id, activity_id, operator_id, pricing_type, transport_cost, guide_cost, entrance_fee_adult, entrance_fee_child_6_11, meal_cost_adult, meal_cost_child, min_pax, max_pax, season, currency, notes, is_active) VALUES
(UUID(), @activity5, @operator_id, 'private', 450.00, 200.00, 35.00, 15.00, 20.00, 12.00, 2, 8, 'standard', 'USD', 'Private tour with flexible schedule', 1);

-- Transportation: Airport Transfer - Sedan
INSERT INTO transportation_pricing (id, operator_id, vehicle_type, vehicle_capacity, base_cost, route_description, estimated_duration_hours, season, currency, notes, is_active) VALUES
(UUID(), @operator_id, 'Sedan', 3, 50.00, 'Istanbul Airport to Sultanahmet', 1.00, 'standard', 'USD', 'Comfortable sedan for up to 3 passengers', 1);

-- Transportation: Airport Transfer - Minivan
INSERT INTO transportation_pricing (id, operator_id, vehicle_type, vehicle_capacity, base_cost, route_description, estimated_duration_hours, season, currency, notes, is_active) VALUES
(UUID(), @operator_id, 'Minivan', 7, 80.00, 'Istanbul Airport to Sultanahmet', 1.00, 'standard', 'USD', 'Spacious minivan for up to 7 passengers with luggage', 1);

-- Transportation: Airport Transfer - Minibus
INSERT INTO transportation_pricing (id, operator_id, vehicle_type, vehicle_capacity, base_cost, route_description, estimated_duration_hours, season, currency, notes, is_active) VALUES
(UUID(), @operator_id, 'Minibus', 14, 120.00, 'Istanbul Airport to Sultanahmet', 1.00, 'standard', 'USD', 'Minibus for groups up to 14 passengers', 1);

-- Transportation: Full Day City Tour
INSERT INTO transportation_pricing (id, operator_id, vehicle_type, vehicle_capacity, base_cost, per_hour_cost, route_description, estimated_duration_hours, season, currency, notes, is_active) VALUES
(UUID(), @operator_id, 'Luxury Van', 6, 200.00, 25.00, 'Istanbul City Tour - Full Day', 8.00, 'standard', 'USD', 'Luxury vehicle with professional driver for full day touring', 1);

-- Transportation: Intercity Transfer
INSERT INTO transportation_pricing (id, operator_id, vehicle_type, vehicle_capacity, base_cost, per_km_cost, route_description, estimated_distance_km, estimated_duration_hours, season, currency, notes, is_active) VALUES
(UUID(), @operator_id, 'Minivan', 7, 150.00, 1.50, 'Istanbul to Cappadocia', 730.00, 9.00, 'standard', 'USD', 'Long-distance intercity transfer', 1);

SELECT 'Mock data inserted successfully!' AS status;
