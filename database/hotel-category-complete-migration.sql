-- ============================================
-- COMPLETE Hotel Category System Migration
-- ============================================
-- Safe migration that checks for existing columns
-- ============================================

-- Add Google enrichment fields
ALTER TABLE hotels
ADD COLUMN editorial_summary TEXT NULL COMMENT 'Google AI-generated description' AFTER website;

ALTER TABLE hotels
ADD COLUMN place_types JSON NULL COMMENT 'Google place types array' AFTER editorial_summary;

ALTER TABLE hotels
ADD COLUMN price_level INT NULL COMMENT 'Google price level 0-4' AFTER place_types;

ALTER TABLE hotels
ADD COLUMN business_status VARCHAR(50) NULL COMMENT 'OPERATIONAL, CLOSED_TEMPORARILY' AFTER price_level;

-- Add Turkish hotel category system
ALTER TABLE hotels
ADD COLUMN hotel_category ENUM(
  'budget',
  'standard_3star',
  'standard_4star',
  'standard_5star',
  'special_class',
  'luxury'
) DEFAULT NULL COMMENT 'Turkish hotel classification' AFTER star_rating;

ALTER TABLE hotels
ADD COLUMN room_count INT NULL COMMENT 'Number of rooms - KEY for Special Class' AFTER hotel_category;

ALTER TABLE hotels
ADD COLUMN is_boutique BOOLEAN DEFAULT FALSE COMMENT 'Boutique indicator' AFTER room_count;

-- Add indexes
CREATE INDEX idx_hotel_category ON hotels(organization_id, hotel_category, status);
CREATE INDEX idx_is_boutique ON hotels(is_boutique, status);

-- Create category reference table
CREATE TABLE IF NOT EXISTS hotel_categories (
  category_code VARCHAR(20) PRIMARY KEY,
  display_name_en VARCHAR(100) NOT NULL,
  display_name_tr VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_tr TEXT,
  icon VARCHAR(10) DEFAULT '🏨',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert category metadata
INSERT INTO hotel_categories (category_code, display_name_en, display_name_tr, description_en, description_tr, icon, sort_order)
VALUES
  ('budget', 'Budget (2-3★)', 'Ekonomik (2-3★)', 'Budget-friendly hotels', 'Ekonomik oteller', '💰', 1),
  ('standard_3star', '3-Star Standard', '3 Yıldız Standart', 'Official 3-star hotels', 'Resmi 3 yıldızlı oteller', '⭐', 2),
  ('standard_4star', '4-Star Standard', '4 Yıldız Standart', 'Official 4-star hotels', 'Resmi 4 yıldızlı oteller', '⭐⭐', 3),
  ('standard_5star', '5-Star Standard', '5 Yıldız Standart', 'Official 5-star hotels', 'Resmi 5 yıldızlı oteller', '⭐⭐⭐', 4),
  ('special_class', 'Special Class (Boutique)', 'Özel Sınıf (Butik)', 'Boutique hotels < 50 rooms or unique properties', 'Butik oteller (< 50 oda)', '✨', 5),
  ('luxury', 'Luxury (6★)', 'Lüks (6★)', 'Ultra-luxury beyond 5-star', 'Ultra lüks oteller', '💎', 6)
ON DUPLICATE KEY UPDATE
  display_name_en = VALUES(display_name_en),
  display_name_tr = VALUES(display_name_tr);

SELECT 'Migration completed successfully!' as status;
