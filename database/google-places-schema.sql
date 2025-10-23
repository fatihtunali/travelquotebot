-- Google Places Data Storage Schema
-- This schema stores location data and photos from Google Places API for use in itineraries

-- Table: places
-- Stores location/place information from Google Places API
CREATE TABLE IF NOT EXISTS places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  formatted_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  place_types JSON COMMENT 'Array of Google place types (e.g., ["restaurant", "tourist_attraction"])',
  rating DECIMAL(2, 1),
  user_ratings_total INT,
  price_level INT COMMENT '0-4 scale from Google',
  opening_hours JSON COMMENT 'Opening hours data from Google',
  phone_number VARCHAR(50),
  website VARCHAR(500),
  description TEXT COMMENT 'Place description/editorial summary',
  google_maps_url VARCHAR(500),
  icon_url VARCHAR(500),
  business_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_place_id (place_id),
  INDEX idx_name (name(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: place_photos
-- Stores photo references and URLs from Google Places API
CREATE TABLE IF NOT EXISTS place_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id VARCHAR(255) NOT NULL,
  photo_reference VARCHAR(500) NOT NULL COMMENT 'Google photo reference token',
  photo_url VARCHAR(1000) COMMENT 'Full photo URL from Google or Cloudinary',
  width INT,
  height INT,
  html_attributions JSON COMMENT 'Array of attribution strings required by Google',
  is_primary BOOLEAN DEFAULT FALSE COMMENT 'Primary/featured photo for the place',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES places(place_id) ON DELETE CASCADE,
  INDEX idx_place_photos (place_id),
  INDEX idx_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: itinerary_places
-- Links places to specific itineraries with day/order information
CREATE TABLE IF NOT EXISTS itinerary_places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itinerary_id INT NOT NULL COMMENT 'Reference to quotes.id or separate itineraries table',
  place_id VARCHAR(255) NOT NULL,
  day_number INT NOT NULL COMMENT 'Which day of the itinerary',
  order_in_day INT NOT NULL COMMENT 'Order within that day',
  visit_duration_minutes INT COMMENT 'Planned visit duration',
  notes TEXT COMMENT 'Custom notes for this place in this itinerary',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES places(place_id) ON DELETE CASCADE,
  INDEX idx_itinerary (itinerary_id),
  INDEX idx_place (place_id),
  INDEX idx_day (day_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data comment:
-- After creating these tables, you can populate them using the Google Places API
-- Example: Search for "Hagia Sophia Istanbul" -> Store place data -> Store photos
