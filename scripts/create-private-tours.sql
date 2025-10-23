-- Create PRIVATE versions of all SIC tours

-- Antalya
INSERT INTO tours (organization_id, tour_name, city, tour_type, status, description)
SELECT organization_id, CONCAT(tour_name, ' Private'), city, 'PRIVATE', 'active', description
FROM tours
WHERE city = 'Antalya' AND tour_type = 'SIC' AND status = 'active'
AND NOT EXISTS (SELECT 1 FROM tours t2 WHERE t2.tour_name = CONCAT(tours.tour_name, ' Private'));

-- Cappadocia
INSERT INTO tours (organization_id, tour_name, city, tour_type, status, description)
SELECT organization_id, CONCAT(tour_name, ' Private'), city, 'PRIVATE', 'active', description
FROM tours
WHERE city = 'Cappadocia' AND tour_type = 'SIC' AND status = 'active'
AND tour_name NOT LIKE '%Balloon%'  -- Skip balloon tours (they're always shared)
AND NOT EXISTS (SELECT 1 FROM tours t2 WHERE t2.tour_name = CONCAT(tours.tour_name, ' Private'));

-- Istanbul
INSERT INTO tours (organization_id, tour_name, city, tour_type, status, description)
SELECT organization_id, CONCAT(tour_name, ' Private'), city, 'PRIVATE', 'active', description
FROM tours
WHERE city = 'Istanbul' AND tour_type = 'SIC' AND status = 'active'
AND tour_name NOT LIKE '%Days%' -- Skip multi-day packages
AND NOT EXISTS (SELECT 1 FROM tours t2 WHERE t2.tour_name = CONCAT(tours.tour_name, ' Private'));

-- Kusadasi
INSERT INTO tours (organization_id, tour_name, city, tour_type, status, description)
SELECT organization_id, CONCAT(tour_name, ' Private'), city, 'PRIVATE', 'active', description
FROM tours
WHERE city = 'Kusadasi' AND tour_type = 'SIC' AND status = 'active'
AND NOT EXISTS (SELECT 1 FROM tours t2 WHERE t2.tour_name = CONCAT(tours.tour_name, ' Private'));

-- Pamukkale
INSERT INTO tours (organization_id, tour_name, city, tour_type, status, description)
SELECT organization_id, CONCAT(tour_name, ' Private'), city, 'PRIVATE', 'active', description
FROM tours
WHERE city = 'Pamukkale' AND tour_type = 'SIC' AND status = 'active'
AND tour_name NOT LIKE '%Balloon%'
AND NOT EXISTS (SELECT 1 FROM tours t2 WHERE t2.tour_name = CONCAT(tours.tour_name, ' Private'));

-- Selcuk
INSERT INTO tours (organization_id, tour_name, city, tour_type, status, description)
SELECT organization_id, CONCAT(tour_name, ' Private'), city, 'PRIVATE', 'active', description
FROM tours
WHERE city = 'Selcuk' AND tour_type = 'SIC' AND status = 'active'
AND NOT EXISTS (SELECT 1 FROM tours t2 WHERE t2.tour_name = CONCAT(tours.tour_name, ' Private'));

-- Now add pricing for all new PRIVATE tours (approximately 2.5x SIC prices)
INSERT INTO tour_pricing (tour_id, season_name, start_date, end_date, pvt_price_2_pax, pvt_price_3_pax, pvt_price_4_pax, pvt_price_5_pax, pvt_price_6_pax, status)
SELECT
    t_new.id,
    tp_sic.season_name,
    tp_sic.start_date,
    tp_sic.end_date,
    ROUND(tp_sic.sic_price_2_pax * 2.5, 2),
    ROUND(tp_sic.sic_price_2_pax * 2.0, 2),
    ROUND(tp_sic.sic_price_2_pax * 1.8, 2),
    ROUND(tp_sic.sic_price_2_pax * 1.6, 2),
    ROUND(tp_sic.sic_price_2_pax * 1.5, 2),
    'active'
FROM tours t_new
JOIN tours t_sic ON REPLACE(t_new.tour_name, ' Private', '') = t_sic.tour_name
    AND t_new.city = t_sic.city
    AND t_sic.tour_type = 'SIC'
JOIN tour_pricing tp_sic ON t_sic.id = tp_sic.tour_id AND tp_sic.status = 'active'
WHERE t_new.tour_type = 'PRIVATE'
AND NOT EXISTS (SELECT 1 FROM tour_pricing tp WHERE tp.tour_id = t_new.id AND tp.season_name = tp_sic.season_name);
