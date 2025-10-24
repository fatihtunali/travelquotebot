-- Turkey Tourist Guide Fees 2025
-- Source: TUREB (Turkish Tourist Guides Association)
-- https://www.tureb.org.tr/Sayfa?id=16
-- Conversion rate: 1 TRY = 0.020556 EUR
--
-- TUREB Base Rates (Taban Ücret) 2025 - Foreign Language Guides:
--   - Daily Tour: 4,435 TL = €91.17
--   - Transfer/Half Day: 2,223 TL = €45.70
--   - Evening/Night Tour: 2,223 TL = €45.70

-- Get user ID for created_by field
SET @created_by = (SELECT id FROM users WHERE email = 'info@funnytourism.com' LIMIT 1);

-- Insert Professional Guides for major tourist cities
-- Istanbul
INSERT INTO guides (organization_id, city, language, description, status) VALUES
(5, 'Istanbul', 'English', 'Guide in Istanbul', 'active'),
(5, 'Istanbul', 'German', 'Guide in Istanbul', 'active'),
(5, 'Istanbul', 'French', 'Guide in Istanbul', 'active'),
(5, 'Istanbul', 'Spanish', 'Guide in Istanbul', 'active'),
(5, 'Istanbul', 'Italian', 'Guide in Istanbul', 'active'),
(5, 'Istanbul', 'Russian', 'Guide in Istanbul', 'active'),
(5, 'Istanbul', 'Chinese', 'Guide in Istanbul', 'active'),
(5, 'Istanbul', 'Arabic', 'Guide in Istanbul', 'active');

-- Cappadocia
INSERT INTO guides (organization_id, city, language, description, status) VALUES
(5, 'Cappadocia', 'English', 'Guide in Cappadocia', 'active'),
(5, 'Cappadocia', 'German', 'Guide in Cappadocia', 'active'),
(5, 'Cappadocia', 'French', 'Guide in Cappadocia', 'active'),
(5, 'Cappadocia', 'Spanish', 'Guide in Cappadocia', 'active'),
(5, 'Cappadocia', 'Russian', 'Guide in Cappadocia', 'active');

-- Antalya
INSERT INTO guides (organization_id, city, language, description, status) VALUES
(5, 'Antalya', 'English', 'Guide in Antalya', 'active'),
(5, 'Antalya', 'German', 'Guide in Antalya', 'active'),
(5, 'Antalya', 'Russian', 'Guide in Antalya', 'active');

-- Bodrum
INSERT INTO guides (organization_id, city, language, description, status) VALUES
(5, 'Bodrum', 'English', 'Guide in Bodrum', 'active'),
(5, 'Bodrum', 'German', 'Guide in Bodrum', 'active');

-- Izmir
INSERT INTO guides (organization_id, city, language, description, status) VALUES
(5, 'Izmir', 'English', 'Guide in Izmir', 'active'),
(5, 'Izmir', 'German', 'Guide in Izmir', 'active');

-- Ephesus
INSERT INTO guides (organization_id, city, language, description, status) VALUES
(5, 'Ephesus', 'English', 'Guide in Ephesus', 'active'),
(5, 'Ephesus', 'German', 'Guide in Ephesus', 'active'),
(5, 'Ephesus', 'French', 'Guide in Ephesus', 'active'),
(5, 'Ephesus', 'Spanish', 'Guide in Ephesus', 'active');

-- Pamukkale
INSERT INTO guides (organization_id, city, language, description, status) VALUES
(5, 'Pamukkale', 'English', 'Guide in Pamukkale', 'active'),
(5, 'Pamukkale', 'German', 'Guide in Pamukkale', 'active');

-- Fethiye
INSERT INTO guides (organization_id, city, language, description, status) VALUES
(5, 'Fethiye', 'English', 'Guide in Fethiye', 'active'),
(5, 'Fethiye', 'German', 'Guide in Fethiye', 'active');

-- Konya
INSERT INTO guides (organization_id, city, language, description, status) VALUES
(5, 'Konya', 'English', 'Guide in Konya', 'active');

-- Trabzon
INSERT INTO guides (organization_id, city, language, description, status) VALUES
(5, 'Trabzon', 'English', 'Guide in Trabzon', 'active');

-- Add pricing for all guides (Foreign Language Rates Only)
-- Full Day €91.17, Half Day €45.70, Night €45.70

-- Season: Winter 2025-26
INSERT INTO guide_pricing (guide_id, season_name, start_date, end_date, currency, full_day_price, half_day_price, night_price, created_by, notes, status)
SELECT
    id,
    'Winter 2025-26',
    '2025-11-01',
    '2026-03-14',
    'EUR',
    91.17,
    45.70,
    45.70,
    @created_by,
    'TUREB 2025 base rates - Foreign language guide',
    'active'
FROM guides
WHERE organization_id = 5;

-- Season: Summer 2026
INSERT INTO guide_pricing (guide_id, season_name, start_date, end_date, currency, full_day_price, half_day_price, night_price, created_by, notes, status)
SELECT
    id,
    'Summer 2026',
    '2026-03-15',
    '2026-10-31',
    'EUR',
    91.17,
    45.70,
    45.70,
    @created_by,
    'TUREB 2025 base rates - Foreign language guide',
    'active'
FROM guides
WHERE organization_id = 5;
