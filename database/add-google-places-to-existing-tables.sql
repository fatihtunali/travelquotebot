-- Add Google Places data columns to existing tables (hotels, tours, entrance_fees, etc.)

-- ALTER hotels table
ALTER TABLE hotels
ADD COLUMN google_place_id VARCHAR(255) UNIQUE AFTER id,
ADD COLUMN latitude DECIMAL(10, 8) AFTER address,
ADD COLUMN longitude DECIMAL(11, 8) AFTER latitude,
ADD COLUMN google_maps_url VARCHAR(500) AFTER longitude,
ADD COLUMN photo_url_1 VARCHAR(1000) COMMENT 'Primary photo from Google Places',
ADD COLUMN photo_url_2 VARCHAR(1000) COMMENT 'Second photo from Google Places',
ADD COLUMN photo_url_3 VARCHAR(1000) COMMENT 'Third photo from Google Places',
ADD COLUMN rating DECIMAL(2, 1) COMMENT 'Google rating',
ADD COLUMN user_ratings_total INT COMMENT 'Number of Google reviews',
ADD COLUMN website VARCHAR(500),
ADD INDEX idx_google_place_id (google_place_id);

-- ALTER tours table
ALTER TABLE tours
ADD COLUMN google_place_id VARCHAR(255) UNIQUE AFTER id,
ADD COLUMN latitude DECIMAL(10, 8) AFTER description,
ADD COLUMN longitude DECIMAL(11, 8) AFTER latitude,
ADD COLUMN google_maps_url VARCHAR(500) AFTER longitude,
ADD COLUMN photo_url_1 VARCHAR(1000) COMMENT 'Primary photo from Google Places',
ADD COLUMN photo_url_2 VARCHAR(1000) COMMENT 'Second photo from Google Places',
ADD COLUMN photo_url_3 VARCHAR(1000) COMMENT 'Third photo from Google Places',
ADD COLUMN rating DECIMAL(2, 1) COMMENT 'Google rating',
ADD COLUMN user_ratings_total INT COMMENT 'Number of Google reviews',
ADD COLUMN website VARCHAR(500),
ADD INDEX idx_google_place_id (google_place_id);

-- ALTER entrance_fees table
ALTER TABLE entrance_fees
ADD COLUMN google_place_id VARCHAR(255) UNIQUE AFTER id,
ADD COLUMN latitude DECIMAL(10, 8) AFTER description,
ADD COLUMN longitude DECIMAL(11, 8) AFTER latitude,
ADD COLUMN google_maps_url VARCHAR(500) AFTER longitude,
ADD COLUMN photo_url_1 VARCHAR(1000) COMMENT 'Primary photo from Google Places',
ADD COLUMN photo_url_2 VARCHAR(1000) COMMENT 'Second photo from Google Places',
ADD COLUMN photo_url_3 VARCHAR(1000) COMMENT 'Third photo from Google Places',
ADD COLUMN rating DECIMAL(2, 1) COMMENT 'Google rating',
ADD COLUMN user_ratings_total INT COMMENT 'Number of Google reviews',
ADD COLUMN website VARCHAR(500),
ADD INDEX idx_google_place_id (google_place_id);

-- Check the results
SELECT 'Hotels table updated' as status;
SELECT 'Tours table updated' as status;
SELECT 'Entrance fees table updated' as status;
