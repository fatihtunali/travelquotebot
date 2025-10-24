-- Add UUID Column to customer_itineraries
-- C3 Security Fix: Use UUIDs instead of sequential IDs for public access
-- This prevents enumeration attacks and unauthorized access to itineraries

-- Step 1: Add UUID column
ALTER TABLE customer_itineraries
ADD COLUMN uuid VARCHAR(36) NULL AFTER id;

-- Step 2: Generate UUIDs for existing records
-- MySQL 8.0+ has UUID() function, for older versions use custom UUID generation
UPDATE customer_itineraries
SET uuid = UUID()
WHERE uuid IS NULL;

-- Step 3: Make UUID column NOT NULL and UNIQUE
ALTER TABLE customer_itineraries
MODIFY COLUMN uuid VARCHAR(36) NOT NULL,
ADD UNIQUE KEY unique_uuid (uuid);

-- Step 4: Create index for fast UUID lookups
CREATE INDEX idx_customer_itineraries_uuid
ON customer_itineraries(uuid);

-- Verification query
SELECT
    'UUID column added successfully' as message,
    COUNT(*) as total_records,
    COUNT(DISTINCT uuid) as unique_uuids,
    COUNT(CASE WHEN uuid IS NULL THEN 1 END) as null_uuids
FROM customer_itineraries;

-- Usage Instructions:
-- After running this migration:
-- 1. Update frontend to use UUID in URLs: /itinerary/[uuid] instead of /itinerary/[id]
-- 2. API already supports both UUID and numeric ID for backward compatibility
-- 3. New itineraries will automatically get UUIDs on INSERT via database trigger (optional)
-- 4. For new inserts, generate UUID in application code before INSERT

-- Optional: Create trigger to auto-generate UUIDs for new records
DELIMITER //
CREATE TRIGGER before_insert_customer_itineraries
BEFORE INSERT ON customer_itineraries
FOR EACH ROW
BEGIN
    IF NEW.uuid IS NULL THEN
        SET NEW.uuid = UUID();
    END IF;
END//
DELIMITER ;

-- Display trigger creation status
SELECT
    'UUID auto-generation trigger created' as message,
    NOW() as created_at;
