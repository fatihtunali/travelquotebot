-- Migration: Add duration_hours field to tours table
-- Date: 2025-10-24
-- Description: Adds a duration_hours field to allow specifying tour duration in hours (e.g., 4hrs half-day, 8hrs full-day)

ALTER TABLE tours
ADD COLUMN duration_hours DECIMAL(4,1) NULL COMMENT 'Tour duration in hours (e.g., 4.0 for half day, 8.0 for full day)'
AFTER duration_days;

-- Optional: Update existing tours with estimated hours based on days
-- UPDATE tours SET duration_hours = duration_days * 8 WHERE duration_hours IS NULL;

-- Note: You can keep both duration_days and duration_hours for flexibility
-- or eventually deprecate duration_days if you prefer hours-only
