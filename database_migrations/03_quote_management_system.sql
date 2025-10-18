-- TravelQuoteBot Professional Quote Management System
-- Migration 03: Quote Days and Expenses Tables
-- Author: Claude Code
-- Date: 2025-10-18

-- ============================================================================
-- QUOTE_DAYS TABLE
-- Stores daily breakdown for each itinerary
-- ============================================================================

CREATE TABLE IF NOT EXISTS quote_days (
    id CHAR(36) PRIMARY KEY,
    itinerary_id CHAR(36) NOT NULL,
    day_number INT NOT NULL,
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    description TEXT,
    meal_code VARCHAR(10) DEFAULT 'B',  -- B=Breakfast, L=Lunch, D=Dinner (e.g., "B,L,D")
    highlights JSON,  -- Array of day highlights
    free_time TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    INDEX idx_itinerary_day (itinerary_id, day_number),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- QUOTE_EXPENSES TABLE
-- Stores individual expense items (hotels, activities, meals, transport)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quote_expenses (
    id CHAR(36) PRIMARY KEY,
    quote_day_id CHAR(36) NOT NULL,
    category ENUM(
        'accommodation',
        'activity',
        'meal',
        'transport',
        'guide',
        'additional_service',
        'entrance_fee',
        'other'
    ) NOT NULL,

    -- Reference to actual service in database
    service_id CHAR(36),  -- Links to accommodations, activities, restaurants, etc.
    service_type VARCHAR(50),  -- 'accommodation', 'activity', 'restaurant', 'transport', 'guide'

    -- Expense details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    time TIME,  -- Start time for activity/meal
    end_time TIME,
    duration_hours DECIMAL(4,2),

    -- Pricing (base prices before pax calculation)
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_per_person DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantity INT DEFAULT 1,  -- For rooms: number of nights, for activities: number of people

    -- Contact and location info
    address VARCHAR(500),
    phone VARCHAR(50),
    meeting_point VARCHAR(500),

    -- Additional metadata
    booking_required BOOLEAN DEFAULT FALSE,
    difficulty_level VARCHAR(20),
    included_items JSON,  -- Array of included items
    excluded_items JSON,  -- Array of excluded items
    tips TEXT,

    -- Sorting and display
    display_order INT DEFAULT 0,
    is_optional BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (quote_day_id) REFERENCES quote_days(id) ON DELETE CASCADE,
    INDEX idx_quote_day (quote_day_id),
    INDEX idx_category (category),
    INDEX idx_service (service_id, service_type),
    INDEX idx_time (time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PRICING_TIERS TABLE
-- Stores pax-based pricing for itineraries
-- ============================================================================

CREATE TABLE IF NOT EXISTS pricing_tiers (
    id CHAR(36) PRIMARY KEY,
    itinerary_id CHAR(36) NOT NULL,

    -- Pax tier (2, 4, 6, 10, 15, 20+)
    min_pax INT NOT NULL,
    max_pax INT,  -- NULL means unlimited

    -- Hotel category pricing
    three_star_double DECIMAL(10,2),
    three_star_triple DECIMAL(10,2),
    three_star_single_supplement DECIMAL(10,2),

    four_star_double DECIMAL(10,2),
    four_star_triple DECIMAL(10,2),
    four_star_single_supplement DECIMAL(10,2),

    five_star_double DECIMAL(10,2),
    five_star_triple DECIMAL(10,2),
    five_star_single_supplement DECIMAL(10,2),

    -- Cost breakdown
    total_accommodation_cost DECIMAL(10,2) DEFAULT 0.00,
    total_activity_cost DECIMAL(10,2) DEFAULT 0.00,
    total_meal_cost DECIMAL(10,2) DEFAULT 0.00,
    total_transport_cost DECIMAL(10,2) DEFAULT 0.00,

    -- Margins
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    markup_percentage DECIMAL(5,2) DEFAULT 0.00,
    markup_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_percentage DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) DEFAULT 0.00,
    per_person DECIMAL(10,2) DEFAULT 0.00,

    currency VARCHAR(3) DEFAULT 'USD',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    INDEX idx_itinerary (itinerary_id),
    INDEX idx_pax_range (min_pax, max_pax)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Add hotel_category to itineraries for tracking selected tier
-- ============================================================================

ALTER TABLE itineraries
ADD COLUMN IF NOT EXISTS hotel_category ENUM('3-star', '4-star', '5-star') DEFAULT '4-star' AFTER num_travelers;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Already created above with tables, but adding explicit ones for common queries
CREATE INDEX IF NOT EXISTS idx_quote_days_itinerary_date ON quote_days(itinerary_id, date);
CREATE INDEX IF NOT EXISTS idx_quote_expenses_category_day ON quote_expenses(quote_day_id, category);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_lookup ON pricing_tiers(itinerary_id, min_pax, max_pax);

-- ============================================================================
-- DONE
-- ============================================================================

SELECT 'Migration 03: Quote Management System completed successfully!' as status;
