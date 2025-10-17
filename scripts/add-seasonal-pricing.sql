-- Add seasonal/date-based pricing support
-- This allows operators to set different prices for different date ranges

-- Price variations table for accommodations
CREATE TABLE IF NOT EXISTS accommodation_price_variations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  accommodation_id CHAR(36) NOT NULL,
  season_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  min_stay_nights INT DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE,
  INDEX idx_accommodation_dates (accommodation_id, start_date, end_date)
);

-- Price variations table for activities
CREATE TABLE IF NOT EXISTS activity_price_variations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  activity_id CHAR(36) NOT NULL,
  season_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  INDEX idx_activity_dates (activity_id, start_date, end_date)
);

-- Price variations table for transport
CREATE TABLE IF NOT EXISTS transport_price_variations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  transport_id CHAR(36) NOT NULL,
  season_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (transport_id) REFERENCES operator_transport(id) ON DELETE CASCADE,
  INDEX idx_transport_dates (transport_id, start_date, end_date)
);

-- Price variations table for guide services
CREATE TABLE IF NOT EXISTS guide_price_variations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  guide_id CHAR(36) NOT NULL,
  season_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_per_day DECIMAL(10, 2),
  price_per_hour DECIMAL(10, 2),
  price_half_day DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (guide_id) REFERENCES operator_guide_services(id) ON DELETE CASCADE,
  INDEX idx_guide_dates (guide_id, start_date, end_date)
);

-- Price variations table for restaurants
CREATE TABLE IF NOT EXISTS restaurant_price_variations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  restaurant_id CHAR(36) NOT NULL,
  season_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  breakfast_price DECIMAL(10, 2),
  lunch_price DECIMAL(10, 2),
  dinner_price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES operator_restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurant_dates (restaurant_id, start_date, end_date)
);

-- Price variations table for additional services
CREATE TABLE IF NOT EXISTS additional_service_price_variations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_id CHAR(36) NOT NULL,
  season_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES operator_additional_services(id) ON DELETE CASCADE,
  INDEX idx_service_dates (service_id, start_date, end_date)
);

-- Update base tables to make base_price optional/default
-- The base_price will serve as a fallback when no date-specific pricing is found

ALTER TABLE accommodations
  MODIFY COLUMN base_price_per_night DECIMAL(10, 2) DEFAULT 0 COMMENT 'Default price when no seasonal pricing matches';

ALTER TABLE activities
  MODIFY COLUMN base_price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Default price when no seasonal pricing matches';

ALTER TABLE operator_transport
  MODIFY COLUMN base_price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Default price when no seasonal pricing matches';

ALTER TABLE operator_guide_services
  MODIFY COLUMN price_per_day DECIMAL(10, 2) DEFAULT 0 COMMENT 'Default price when no seasonal pricing matches',
  MODIFY COLUMN price_per_hour DECIMAL(10, 2) DEFAULT 0 COMMENT 'Default price when no seasonal pricing matches',
  MODIFY COLUMN price_half_day DECIMAL(10, 2) DEFAULT 0 COMMENT 'Default price when no seasonal pricing matches';

ALTER TABLE operator_restaurants
  MODIFY COLUMN breakfast_price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Default price when no seasonal pricing matches',
  MODIFY COLUMN lunch_price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Default price when no seasonal pricing matches',
  MODIFY COLUMN dinner_price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Default price when no seasonal pricing matches';

ALTER TABLE operator_additional_services
  MODIFY COLUMN price DECIMAL(10, 2) DEFAULT 0 COMMENT 'Default price when no seasonal pricing matches';
