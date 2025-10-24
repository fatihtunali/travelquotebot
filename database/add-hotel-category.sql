-- ============================================
-- Add Hotel Category System for Turkey
-- ============================================
-- Turkey has 5 hotel categories:
-- 1. 3 Stars (Standard)
-- 2. 4 Stars (Standard)
-- 3. 5 Stars (Standard)
-- 4. Special Class (Boutique hotels - high quality but can't get official star rating due to room count)
-- 5. Budget/2 Stars (Optional - for completeness)

-- Add hotel_category column
ALTER TABLE hotels
ADD COLUMN hotel_category ENUM(
  'budget',           -- 2-star equivalent
  'standard_3star',   -- Official 3-star hotels
  'standard_4star',   -- Official 4-star hotels
  'standard_5star',   -- Official 5-star hotels
  'special_class',    -- Boutique/Special Class (e.g., Museum Hotel, cave hotels)
  'luxury'            -- Ultra-luxury (6-star equivalent like Çırağan Palace)
) DEFAULT 'standard_3star' AFTER star_rating,
ADD COLUMN room_count INT NULL COMMENT 'Number of rooms - helps identify boutique hotels' AFTER hotel_category,
ADD COLUMN is_boutique BOOLEAN DEFAULT FALSE COMMENT 'Boutique/Special Class indicator' AFTER room_count;

-- Create index for filtering by category
CREATE INDEX idx_hotel_category ON hotels(organization_id, hotel_category, status);

-- ============================================
-- Auto-classify existing hotels based on star_rating
-- ============================================

-- Standard classifications
UPDATE hotels SET hotel_category = 'standard_3star' WHERE star_rating = 3;
UPDATE hotels SET hotel_category = 'standard_4star' WHERE star_rating = 4;
UPDATE hotels SET hotel_category = 'standard_5star' WHERE star_rating = 5;
UPDATE hotels SET hotel_category = 'budget' WHERE star_rating <= 2;

-- Identify potential Special Class hotels using Google data
-- Criteria: High Google rating (4.5+) AND low review count (< 500) = likely boutique
UPDATE hotels
SET
  hotel_category = 'special_class',
  is_boutique = TRUE
WHERE star_rating >= 4
  AND rating >= 4.5
  AND user_ratings_total < 500
  AND user_ratings_total > 50; -- Has enough reviews to be legitimate

-- Identify ultra-luxury hotels (very high rating + many reviews)
UPDATE hotels
SET hotel_category = 'luxury'
WHERE star_rating = 5
  AND rating >= 4.7
  AND user_ratings_total > 5000;

-- ============================================
-- Hotel Category Display Names
-- ============================================

-- Create a reference table for category metadata
CREATE TABLE hotel_categories (
  category_code VARCHAR(20) PRIMARY KEY,
  display_name_en VARCHAR(100) NOT NULL,
  display_name_tr VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_tr TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert category metadata
INSERT INTO hotel_categories (category_code, display_name_en, display_name_tr, description_en, description_tr, sort_order) VALUES
('budget', 'Budget (2-3★)', 'Ekonomik (2-3★)', 'Budget-friendly hotels', 'Ekonomik oteller', 1),
('standard_3star', '3-Star Standard', '3 Yıldız Standart', 'Official 3-star hotels', 'Resmi 3 yıldızlı oteller', 2),
('standard_4star', '4-Star Standard', '4 Yıldız Standart', 'Official 4-star hotels', 'Resmi 4 yıldızlı oteller', 3),
('standard_5star', '5-Star Standard', '5 Yıldız Standart', 'Official 5-star hotels', 'Resmi 5 yıldızlı oteller', 4),
('special_class', 'Special Class (Boutique)', 'Özel Sınıf (Butik)', 'Boutique hotels that cannot receive official star rating due to room count or unique characteristics (e.g., Museum Hotel, Cave Hotels)', 'Oda sayısı veya benzersiz özellikleri nedeniyle resmi yıldız alamayan butik oteller', 5),
('luxury', 'Luxury (6★ Equivalent)', 'Lüks (6★ Seviyesi)', 'Ultra-luxury hotels beyond 5-star standard', '5 yıldızın üzerinde ultra lüks oteller', 6);

-- ============================================
-- Verification Queries
-- ============================================

-- Check distribution
SELECT
  hotel_category,
  COUNT(*) as count,
  AVG(rating) as avg_google_rating,
  AVG(user_ratings_total) as avg_reviews
FROM hotels
GROUP BY hotel_category
ORDER BY FIELD(hotel_category, 'budget', 'standard_3star', 'standard_4star', 'standard_5star', 'special_class', 'luxury');

-- Show potential Special Class hotels
SELECT
  id,
  hotel_name,
  city,
  star_rating,
  hotel_category,
  is_boutique,
  rating as google_rating,
  user_ratings_total as google_reviews
FROM hotels
WHERE hotel_category = 'special_class'
ORDER BY rating DESC;
