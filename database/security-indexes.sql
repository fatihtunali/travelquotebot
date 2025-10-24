-- Security Performance Indexes
-- Created as part of security vulnerability fixes
-- These indexes improve performance of security-related queries

-- H8: Add database indexes for performance

-- Index for customer_itineraries queries by organization and status
-- Used in customer-requests API route
CREATE INDEX IF NOT EXISTS idx_customer_itineraries_org_status_date
ON customer_itineraries(organization_id, status, created_at DESC);

-- Index for UUID lookups (once UUID column is added)
-- Used for secure public itinerary access
CREATE INDEX IF NOT EXISTS idx_customer_itineraries_uuid
ON customer_itineraries(uuid);

-- Index for efficient email lookups during authentication
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- Index for organization slug lookups
CREATE INDEX IF NOT EXISTS idx_organizations_slug
ON organizations(slug);

-- Index for status-based filtering across all pricing tables
CREATE INDEX IF NOT EXISTS idx_hotels_org_status
ON hotels(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_tours_org_status
ON tours(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_vehicles_org_status
ON vehicles(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_guides_org_status
ON guides(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_entrance_fees_org_status
ON entrance_fees(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_meals_org_status
ON meals(organization_id, status);

-- Index for city-based searches (used in public cities API)
CREATE INDEX IF NOT EXISTS idx_hotels_city_status
ON hotels(city, status);

CREATE INDEX IF NOT EXISTS idx_tours_city_status
ON tours(city, status);

CREATE INDEX IF NOT EXISTS idx_vehicles_city_status
ON vehicles(city, status);

-- Composite index for efficient photo_reference lookups
CREATE INDEX IF NOT EXISTS idx_place_photos_place_id
ON place_photos(place_id, is_primary);

-- Index for Google Place ID lookups
CREATE INDEX IF NOT EXISTS idx_hotels_google_place_id
ON hotels(google_place_id);

CREATE INDEX IF NOT EXISTS idx_tours_google_place_id
ON tours(google_place_id);

-- Index for created_at timestamps (for time-based queries)
CREATE INDEX IF NOT EXISTS idx_customer_itineraries_created_at
ON customer_itineraries(created_at DESC);

-- Display index creation summary
SELECT
    'Security indexes created successfully' as message,
    NOW() as created_at;
