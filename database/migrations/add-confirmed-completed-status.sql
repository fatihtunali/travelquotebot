-- Migration: Add 'confirmed' and 'completed' to customer_itineraries status ENUM
-- Date: October 27, 2025
-- Reason: Frontend uses 'confirmed' and 'completed' statuses but database only had 'pending', 'booked', 'cancelled'

-- Add 'confirmed' and 'completed' to the status ENUM
ALTER TABLE customer_itineraries
MODIFY COLUMN status ENUM('pending', 'confirmed', 'booked', 'completed', 'cancelled')
DEFAULT 'pending';

-- Verify the change
SHOW COLUMNS FROM customer_itineraries LIKE 'status';
