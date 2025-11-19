-- Migration: Create countries table and seed with initial countries
-- Date: 2025-11-19
-- Description: Foundation for multi-country support

-- ============================================================================
-- STEP 1: Create countries table
-- ============================================================================

CREATE TABLE IF NOT EXISTS countries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  country_code VARCHAR(2) NOT NULL UNIQUE COMMENT 'ISO 3166-1 alpha-2 code',
  country_name VARCHAR(100) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'EUR' COMMENT 'ISO 4217 currency code',
  flag_emoji VARCHAR(10),
  timezone_default VARCHAR(50) COMMENT 'IANA timezone identifier',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_country_code (country_code),
  INDEX idx_status (status),
  INDEX idx_country_name (country_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master list of countries for multi-country tour operator support';

-- ============================================================================
-- STEP 2: Seed with initial countries
-- ============================================================================

INSERT INTO countries (country_code, country_name, currency_code, flag_emoji, timezone_default) VALUES
-- Mediterranean & Europe
('TR', 'Turkey', 'EUR', '🇹🇷', 'Europe/Istanbul'),
('GR', 'Greece', 'EUR', '🇬🇷', 'Europe/Athens'),
('IT', 'Italy', 'EUR', '🇮🇹', 'Europe/Rome'),
('ES', 'Spain', 'EUR', '🇪🇸', 'Europe/Madrid'),
('FR', 'France', 'EUR', '🇫🇷', 'Europe/Paris'),
('PT', 'Portugal', 'EUR', '🇵🇹', 'Europe/Lisbon'),
('HR', 'Croatia', 'EUR', '🇭🇷', 'Europe/Zagreb'),

-- Middle East
('AE', 'United Arab Emirates', 'AED', '🇦🇪', 'Asia/Dubai'),
('EG', 'Egypt', 'USD', '🇪🇬', 'Africa/Cairo'),
('JO', 'Jordan', 'USD', '🇯🇴', 'Asia/Amman'),
('IL', 'Israel', 'USD', '🇮🇱', 'Asia/Jerusalem'),
('LB', 'Lebanon', 'USD', '🇱🇧', 'Asia/Beirut'),

-- Asia
('TH', 'Thailand', 'USD', '🇹🇭', 'Asia/Bangkok'),
('JP', 'Japan', 'USD', '🇯🇵', 'Asia/Tokyo'),
('CN', 'China', 'USD', '🇨🇳', 'Asia/Shanghai'),
('IN', 'India', 'USD', '🇮🇳', 'Asia/Kolkata'),
('ID', 'Indonesia', 'USD', '🇮🇩', 'Asia/Jakarta'),

-- Americas
('US', 'United States', 'USD', '🇺🇸', 'America/New_York'),
('MX', 'Mexico', 'USD', '🇲🇽', 'America/Mexico_City'),
('BR', 'Brazil', 'USD', '🇧🇷', 'America/Sao_Paulo'),
('PE', 'Peru', 'USD', '🇵🇪', 'America/Lima'),

-- Africa
('MA', 'Morocco', 'USD', '🇲🇦', 'Africa/Casablanca'),
('ZA', 'South Africa', 'USD', '🇿🇦', 'Africa/Johannesburg'),
('KE', 'Kenya', 'USD', '🇰🇪', 'Africa/Nairobi'),

-- Oceania
('AU', 'Australia', 'AUD', '🇦🇺', 'Australia/Sydney'),
('NZ', 'New Zealand', 'NZD', '🇳🇿', 'Pacific/Auckland')

ON DUPLICATE KEY UPDATE
  country_name = VALUES(country_name),
  currency_code = VALUES(currency_code),
  flag_emoji = VALUES(flag_emoji),
  timezone_default = VALUES(timezone_default);

-- ============================================================================
-- STEP 3: Create organization_countries junction table
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_countries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  country_id INT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE COMMENT 'Primary country for this organization',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (country_id) REFERENCES countries(id),
  UNIQUE KEY unique_org_country (organization_id, country_id),
  INDEX idx_org_id (organization_id),
  INDEX idx_country_id (country_id),
  INDEX idx_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps which countries each organization serves';

-- ============================================================================
-- STEP 4: Assign Turkey as default country to all existing organizations
-- ============================================================================

INSERT INTO organization_countries (organization_id, country_id, is_primary)
SELECT id, 1, TRUE
FROM organizations
WHERE id NOT IN (SELECT organization_id FROM organization_countries)
ON DUPLICATE KEY UPDATE is_primary = TRUE;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify migration)
-- ============================================================================

-- Verify countries were created
-- SELECT * FROM countries ORDER BY country_name;

-- Verify all organizations have Turkey assigned
-- SELECT o.id, o.name, c.country_name
-- FROM organizations o
-- JOIN organization_countries oc ON o.id = oc.organization_id
-- JOIN countries c ON oc.country_id = c.id;

-- Count: Should match number of organizations
-- SELECT COUNT(*) as total_orgs FROM organizations;
-- SELECT COUNT(DISTINCT organization_id) as orgs_with_countries FROM organization_countries;
