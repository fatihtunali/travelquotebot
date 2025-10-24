-- Turkey Complete Entrance Fees for Funny Tourism (Organization ID: 5)
-- Updated: October 24, 2025
-- Corrected version with proper column names

-- First, get user ID for created_by
SET @operator_user_id = (SELECT id FROM users WHERE email = 'info@funnytourism.com' LIMIT 1);

-- ====================
-- ISTANBUL - MOST POPULAR SITES
-- ====================

-- Topkapi Palace (Complete with Harem)
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Topkapi Palace (Complete with Harem)', 'Istanbul', 'Former Ottoman Empire royal residence including Harem and Hagia Irene Church. UNESCO World Heritage Site.', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 34.95, 'Foreign visitor price. Includes Palace + Hagia Irene + Harem.', 'active', @operator_user_id);

-- Topkapi Palace Harem Only
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Topkapi Palace Harem', 'Istanbul', 'Harem section of Topkapi Palace only', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 12.33, 'Foreign visitor price. Harem section only.', 'active', @operator_user_id);

-- Dolmabahce Palace
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Dolmabahce Palace', 'Istanbul', 'Magnificent Ottoman palace on European Bosphorus shore with Selamlık, Harem and Museum', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 24.67, 'Foreign visitor price. Complete tour including Selamlık + Harem + Museum.', 'active', @operator_user_id);

-- Galata Tower
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Galata Tower', 'Istanbul', 'Medieval stone tower with 360-degree panoramic views of Istanbul', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 30.00, 'Foreign visitor price. One of Istanbul''s most iconic landmarks.', 'active', @operator_user_id);

-- Maiden Tower (Kız Kulesi)
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Maiden Tower', 'Istanbul', 'Iconic tower on small islet in Bosphorus strait', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 27.00, 'Foreign visitor price. Includes boat transfer.', 'active', @operator_user_id);

-- Istanbul Archaeological Museums
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Istanbul Archaeological Museums', 'Istanbul', 'Complex of three museums: Archaeological Museum, Ancient Orient Museum, and Tiled Kiosk Museum', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 15.00, 'Foreign visitor price. Three museums in one ticket.', 'active', @operator_user_id);

-- Turkish and Islamic Arts Museum
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Turkish and Islamic Arts Museum', 'Istanbul', 'Museum of Islamic art and Turkish cultural artifacts in Ibrahim Pasha Palace', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 17.00, 'Foreign visitor price. Located in Sultanahmet Square.', 'active', @operator_user_id);

-- Hagia Irene Church
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Hagia Irene Church', 'Istanbul', 'Ancient Byzantine church in Topkapi Palace first courtyard', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 12.33, 'Foreign visitor price. Also included in Topkapi combo.', 'active', @operator_user_id);

-- Beylerbeyi Palace
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Beylerbeyi Palace', 'Istanbul', 'Ottoman summer palace on Asian side of Bosphorus with beautiful gardens', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 8.22, 'Foreign visitor price. Spectacular Bosphorus views.', 'active', @operator_user_id);

-- Rumeli Fortress
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Rumeli Fortress', 'Istanbul', 'Ottoman fortress on European Bosphorus shore, built for conquest of Constantinople', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 6.00, 'Foreign visitor price. Built by Mehmed II in 1452.', 'active', @operator_user_id);

-- ====================
-- CAPPADOCIA
-- ====================

-- Göreme Open Air Museum (TOP ATTRACTION)
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Göreme Open Air Museum', 'Cappadocia', 'UNESCO World Heritage Site with Byzantine rock-cut churches and spectacular frescoes', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 20.00, 'Foreign visitor price. Main Cappadocia attraction. Dark Church separate.', 'active', @operator_user_id);

-- Dark Church (Karanlık Kilise)
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Dark Church (Karanlık Kilise)', 'Cappadocia', 'Best-preserved Byzantine frescoes in Göreme due to minimal light exposure', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 6.00, 'Foreign visitor price. Additional ticket within Göreme museum.', 'active', @operator_user_id);

-- Derinkuyu Underground City
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Derinkuyu Underground City', 'Cappadocia', 'Largest underground city in Cappadocia, 8 levels deep, could shelter 20,000 people', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 13.00, 'Foreign visitor price. Most impressive underground city.', 'active', @operator_user_id);

-- Kaymakli Underground City
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Kaymakli Underground City', 'Cappadocia', 'Second largest underground city with 4 accessible levels, easier to navigate', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 13.00, 'Foreign visitor price. Alternative to Derinkuyu.', 'active', @operator_user_id);

-- Zelve Open Air Museum
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Zelve Open Air Museum', 'Cappadocia', 'Abandoned village of cave dwellings and churches, less touristy than Göreme', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 12.00, 'Foreign visitor price. More authentic experience.', 'active', @operator_user_id);

-- Pasabag (Monks Valley)
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Pasabag (Monks Valley)', 'Cappadocia', 'Famous mushroom-shaped fairy chimneys and hermit cells', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 12.00, 'Foreign visitor price. Most photogenic fairy chimneys.', 'active', @operator_user_id);

-- ====================
-- EPHESUS & AEGEAN
-- ====================

-- Ephesus Ancient City (MAJOR ATTRACTION)
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Ephesus Ancient City', 'Ephesus', 'Best-preserved Roman city in Turkey with Library of Celsus and Great Theater', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 40.00, 'Foreign visitor price. Terrace Houses separate ticket. UNESCO Site.', 'active', @operator_user_id);

-- Ephesus Terrace Houses
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Ephesus Terrace Houses (Slope Houses)', 'Ephesus', 'Luxurious Roman houses with stunning mosaics and frescoes', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 15.00, 'Foreign visitor price. Additional ticket within Ephesus. Must-see!', 'active', @operator_user_id);

-- House of Virgin Mary
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'House of Virgin Mary', 'Ephesus', 'Believed to be the final residence of Virgin Mary, Catholic pilgrimage site', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 6.00, 'Foreign visitor price. Peaceful mountain setting.', 'active', @operator_user_id);

-- Pamukkale & Hierapolis (TOP ATTRACTION)
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Pamukkale & Hierapolis', 'Pamukkale', 'White travertine terraces and ancient Roman city with spectacular thermal pools', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 30.00, 'Foreign visitor price. UNESCO World Heritage Site. Includes travertines and city.', 'active', @operator_user_id);

-- Pergamon Acropolis
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Pergamon Acropolis', 'Bergama', 'Ancient Greek city with dramatic hilltop theater and Library, UNESCO Site', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 15.00, 'Foreign visitor price. Spectacular views.', 'active', @operator_user_id);

-- ====================
-- ANTALYA & MEDITERRANEAN
-- ====================

-- Aspendos Theater
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Aspendos Ancient Theater', 'Antalya', 'Best-preserved Roman theater in the world, hosts opera and ballet festivals', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 15.00, 'Foreign visitor price. Perfect acoustics.', 'active', @operator_user_id);

-- Antalya Archaeological Museum
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Antalya Archaeological Museum', 'Antalya', 'One of Turkey''s largest museums with extensive Roman and Lycian collection', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 15.00, 'Foreign visitor price. Hall of Gods spectacular.', 'active', @operator_user_id);

-- St. Nicholas Church (Santa Claus)
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'St. Nicholas Church (Santa Claus Museum)', 'Demre', 'Original tomb of St. Nicholas (Santa Claus)', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 17.00, 'Foreign visitor price. Popular pilgrimage site.', 'active', @operator_user_id);

-- Myra Ancient City
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Myra Ancient City', 'Demre', 'Spectacular Lycian rock tombs carved into cliff face with Roman theater', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 13.00, 'Foreign visitor price. Very photogenic.', 'active', @operator_user_id);

-- ====================
-- BODRUM
-- ====================

-- Bodrum Underwater Archaeology Museum
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Bodrum Underwater Archaeology Museum', 'Bodrum', 'World''s first underwater archaeology museum in Crusader castle', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 20.00, 'Foreign visitor price. Unique collection.', 'active', @operator_user_id);

-- ====================
-- ANKARA
-- ====================

-- Museum of Anatolian Civilizations (TOP MUSEUM)
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Museum of Anatolian Civilizations', 'Ankara', 'Turkey''s most important museum with Hittite artifacts. European Museum of Year 1997', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 12.00, 'Foreign visitor price. World-class museum.', 'active', @operator_user_id);

-- ====================
-- TROY
-- ====================

-- Troy Ancient City & Museum
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Troy Ancient City & Museum', 'Canakkale', 'Legendary city of Trojan War with famous wooden horse replica', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 27.00, 'Foreign visitor price. UNESCO World Heritage Site.', 'active', @operator_user_id);

-- ====================
-- EASTERN TURKEY
-- ====================

-- Göbekli Tepe (WORLD'S OLDEST TEMPLE)
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Göbekli Tepe', 'Sanliurfa', 'World''s oldest known temple complex (10,000 BC), predates Stonehenge by 6000 years', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 20.00, 'Foreign visitor price. UNESCO World Heritage Site. Revolutionary discovery.', 'active', @operator_user_id);

-- Nemrut Mountain
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Nemrut Mountain', 'Adiyaman', 'Mountain-top tomb sanctuary with giant stone heads, famous for sunrise/sunset', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 10.00, 'Foreign visitor price. UNESCO World Heritage Site.', 'active', @operator_user_id);

-- Sumela Monastery
INSERT INTO entrance_fees (organization_id, site_name, city, description, status)
VALUES (5, 'Sumela Monastery', 'Trabzon', 'Greek Orthodox monastery dramatically perched on cliff face in mountains', 'active');
SET @site_id = LAST_INSERT_ID();
INSERT INTO entrance_fee_pricing (entrance_fee_id, season_name, start_date, end_date, currency, adult_price, notes, status, created_by)
VALUES (@site_id, 'Year Round 2025', '2025-01-01', '2025-12-31', 'EUR', 20.00, 'Foreign visitor price. Spectacular mountain setting.', 'active', @operator_user_id);

COMMIT;
