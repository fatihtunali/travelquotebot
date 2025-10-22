-- ============================================
-- PRICING MANAGEMENT SCHEMA
-- Multi-tenant, multi-currency, seasonal pricing
-- ============================================

-- HOTELS TABLE
CREATE TABLE hotels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  hotel_name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  star_rating INT,
  address TEXT,
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  notes TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_org_city (organization_id, city)
);

-- HOTEL PRICING (with seasons and meal plans)
CREATE TABLE hotel_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hotel_id INT NOT NULL,
  season_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Base price is always BB (Bed & Breakfast)
  double_room_bb DECIMAL(10,2) NOT NULL COMMENT 'Per person in double room with BB',
  single_supplement_bb DECIMAL(10,2) NOT NULL COMMENT 'Single room supplement with BB',
  triple_room_bb DECIMAL(10,2) NOT NULL COMMENT 'Per person in triple room with BB',
  child_0_6_bb DECIMAL(10,2) DEFAULT 0 COMMENT 'Child 0-5.99 years with BB',
  child_6_12_bb DECIMAL(10,2) DEFAULT 0 COMMENT 'Child 6-11.99 years with BB',

  -- Optional meal plans (NULL if not offered)
  hb_supplement DECIMAL(10,2) NULL COMMENT 'Half Board supplement per person',
  fb_supplement DECIMAL(10,2) NULL COMMENT 'Full Board supplement per person',
  ai_supplement DECIMAL(10,2) NULL COMMENT 'All Inclusive supplement per person',

  -- Some hotels have HB or AI as base price
  base_meal_plan ENUM('BB', 'HB', 'FB', 'AI') DEFAULT 'BB',

  effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  notes TEXT,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_hotel_dates (hotel_id, start_date, end_date, status)
);

-- TOURS TABLE
CREATE TABLE tours (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  tour_name VARCHAR(255) NOT NULL,
  tour_code VARCHAR(50),
  city VARCHAR(100) NOT NULL,
  duration_days INT DEFAULT 1,
  description TEXT,
  tour_type ENUM('SIC', 'PRIVATE') NOT NULL,
  inclusions TEXT COMMENT 'What is included in the tour',
  exclusions TEXT COMMENT 'What is NOT included',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_org_type (organization_id, tour_type)
);

-- TOUR PRICING (SIC and Private)
CREATE TABLE tour_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tour_id INT NOT NULL,
  season_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- SIC Tours: Fixed per person price (includes guide, transport, entrance fees)
  sic_price_2_pax DECIMAL(10,2) NULL COMMENT 'SIC price per person for 2 people',
  sic_price_4_pax DECIMAL(10,2) NULL,
  sic_price_6_pax DECIMAL(10,2) NULL,
  sic_price_8_pax DECIMAL(10,2) NULL,
  sic_price_10_pax DECIMAL(10,2) NULL,

  -- Private Tours: Per person price (excludes guide, entrance fees)
  pvt_price_2_pax DECIMAL(10,2) NULL,
  pvt_price_4_pax DECIMAL(10,2) NULL,
  pvt_price_6_pax DECIMAL(10,2) NULL,
  pvt_price_8_pax DECIMAL(10,2) NULL,
  pvt_price_10_pax DECIMAL(10,2) NULL,

  effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  notes TEXT,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_tour_dates (tour_id, start_date, end_date, status)
);

-- VEHICLES TABLE
CREATE TABLE vehicles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL COMMENT 'Vito, Sprinter, Isuzu, Coach',
  max_capacity INT NOT NULL COMMENT 'Maximum passengers',
  city VARCHAR(100) NULL COMMENT 'For airport transfers - specify city',
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_org_city (organization_id, city)
);

-- VEHICLE PRICING
CREATE TABLE vehicle_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  season_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  price_per_day DECIMAL(10,2) NOT NULL COMMENT 'Full day rental',
  price_half_day DECIMAL(10,2) NULL COMMENT 'Half day rental',

  -- Airport Transfers
  airport_to_hotel DECIMAL(10,2) NULL COMMENT 'Airport to hotel one way',
  hotel_to_airport DECIMAL(10,2) NULL COMMENT 'Hotel to airport one way',
  airport_roundtrip DECIMAL(10,2) NULL COMMENT 'Round trip (both ways)',

  effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  notes TEXT,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_vehicle_dates (vehicle_id, start_date, end_date, status)
);

-- GUIDES TABLE
CREATE TABLE guides (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  city VARCHAR(100) NOT NULL,
  language VARCHAR(50) NOT NULL DEFAULT 'English',
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_org_city_lang (organization_id, city, language)
);

-- GUIDE PRICING
CREATE TABLE guide_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  guide_id INT NOT NULL,
  season_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  full_day_price DECIMAL(10,2) NOT NULL,
  half_day_price DECIMAL(10,2) NOT NULL,
  night_price DECIMAL(10,2) NULL COMMENT 'Night tour guide price',

  effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  notes TEXT,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_guide_dates (guide_id, start_date, end_date, status)
);

-- ENTRANCE FEES (Museums, Historical Sites, etc.)
CREATE TABLE entrance_fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  site_name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- ENTRANCE FEE PRICING
CREATE TABLE entrance_fee_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entrance_fee_id INT NOT NULL,
  season_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  adult_price DECIMAL(10,2) NOT NULL,
  child_price DECIMAL(10,2) DEFAULT 0,
  student_price DECIMAL(10,2) NULL,

  effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  notes TEXT,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (entrance_fee_id) REFERENCES entrance_fees(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_fee_dates (entrance_fee_id, start_date, end_date, status)
);

-- MEALS PRICING (Restaurant meals - Lunch, Dinner)
CREATE TABLE meal_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  meal_type ENUM('Lunch', 'Dinner', 'Both') NOT NULL,
  season_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  adult_lunch_price DECIMAL(10,2) NULL,
  child_lunch_price DECIMAL(10,2) NULL,
  adult_dinner_price DECIMAL(10,2) NULL,
  child_dinner_price DECIMAL(10,2) NULL,

  menu_description TEXT,
  effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  notes TEXT,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_org_dates (organization_id, start_date, end_date, status)
);

-- EXTRA EXPENSES (Parking, Tips, etc.)
CREATE TABLE extra_expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  expense_name VARCHAR(255) NOT NULL,
  expense_category VARCHAR(100) COMMENT 'Parking, Tips, Tolls, etc.',
  city VARCHAR(100),
  currency VARCHAR(3) DEFAULT 'EUR',
  unit_price DECIMAL(10,2) NOT NULL,
  unit_type VARCHAR(50) DEFAULT 'per item' COMMENT 'per day, per item, per pax, etc.',
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- CURRENCY EXCHANGE RATES (for multi-currency support)
CREATE TABLE currency_rates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  rate DECIMAL(10,6) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_currencies_date (from_currency, to_currency, effective_date)
);

-- Insert default currency rates (EUR as base)
INSERT INTO currency_rates (from_currency, to_currency, rate, effective_date) VALUES
('EUR', 'EUR', 1.000000, CURDATE()),
('USD', 'EUR', 0.920000, CURDATE()),
('GBP', 'EUR', 1.180000, CURDATE()),
('TRY', 'EUR', 0.032000, CURDATE());
