-- Migration 04: Pricing Configuration System
-- Adds operator-specific pricing rules for room types, child slabs, and hotel categories

-- Operator pricing configuration table
CREATE TABLE IF NOT EXISTS operator_pricing_config (
    id CHAR(36) PRIMARY KEY,
    operator_id CHAR(36) NOT NULL,

    -- Room Type Pricing Rules
    single_supplement_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    single_supplement_value DECIMAL(10,2) DEFAULT 50.00, -- 50% extra or fixed amount
    triple_room_discount_percentage DECIMAL(5,2) DEFAULT 10.00, -- 10% discount for triple

    -- Hotel Category Multipliers
    three_star_multiplier DECIMAL(5,2) DEFAULT 0.70, -- 30% cheaper than 4-star
    four_star_multiplier DECIMAL(5,2) DEFAULT 1.00,  -- Base price
    five_star_multiplier DECIMAL(5,2) DEFAULT 1.40,  -- 40% more expensive

    -- Markup & Tax
    default_markup_percentage DECIMAL(5,2) DEFAULT 15.00,
    default_tax_percentage DECIMAL(5,2) DEFAULT 0.00,

    -- Currency
    currency VARCHAR(3) DEFAULT 'USD',

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
    UNIQUE KEY unique_operator_config (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Child pricing slabs table
CREATE TABLE IF NOT EXISTS operator_child_pricing (
    id CHAR(36) PRIMARY KEY,
    operator_id CHAR(36) NOT NULL,

    -- Age Range
    min_age INT NOT NULL, -- e.g., 0, 3, 7
    max_age INT NOT NULL, -- e.g., 2, 6, 11

    -- Discount
    discount_type ENUM('percentage', 'fixed', 'free') DEFAULT 'percentage',
    discount_value DECIMAL(10,2) DEFAULT 0.00, -- e.g., 50 for 50% off, or fixed amount

    -- Description
    label VARCHAR(100), -- e.g., "Infant (0-2 years)", "Child (3-6 years)"

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
    INDEX idx_operator_age (operator_id, min_age, max_age)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default configuration for existing operators
INSERT INTO operator_pricing_config (id, operator_id, single_supplement_type, single_supplement_value, triple_room_discount_percentage, three_star_multiplier, four_star_multiplier, five_star_multiplier, default_markup_percentage, default_tax_percentage, currency)
SELECT
    UUID() as id,
    id as operator_id,
    'percentage' as single_supplement_type,
    50.00 as single_supplement_value,
    10.00 as triple_room_discount_percentage,
    0.70 as three_star_multiplier,
    1.00 as four_star_multiplier,
    1.40 as five_star_multiplier,
    15.00 as default_markup_percentage,
    0.00 as default_tax_percentage,
    'USD' as currency
FROM operators
WHERE NOT EXISTS (
    SELECT 1 FROM operator_pricing_config WHERE operator_pricing_config.operator_id = operators.id
);

-- Insert default child pricing slabs for existing operators
INSERT INTO operator_child_pricing (id, operator_id, min_age, max_age, discount_type, discount_value, label, display_order)
SELECT
    UUID() as id,
    o.id as operator_id,
    slabs.min_age,
    slabs.max_age,
    slabs.discount_type,
    slabs.discount_value,
    slabs.label,
    slabs.display_order
FROM operators o
CROSS JOIN (
    SELECT 0 as min_age, 2 as max_age, 'free' as discount_type, 0.00 as discount_value, 'Infant (0-2 years) - Free' as label, 1 as display_order
    UNION ALL
    SELECT 3, 6, 'percentage', 50.00, 'Child (3-6 years) - 50% off', 2
    UNION ALL
    SELECT 7, 11, 'percentage', 25.00, 'Child (7-11 years) - 25% off', 3
    UNION ALL
    SELECT 12, 17, 'percentage', 10.00, 'Teen (12-17 years) - 10% off', 4
) as slabs
WHERE NOT EXISTS (
    SELECT 1 FROM operator_child_pricing WHERE operator_child_pricing.operator_id = o.id
);

-- Migration complete
SELECT 'Migration 04: Pricing Configuration System - COMPLETED' as status;
