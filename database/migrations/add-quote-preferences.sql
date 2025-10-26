-- Migration: Add quote_preferences column to quotes table
-- Date: October 26, 2025
-- Purpose: Allow operators to lock specific hotels, tours, and transfers for quotes

START TRANSACTION;

-- Add quote_preferences JSON column
ALTER TABLE quotes
ADD COLUMN quote_preferences JSON NULL
COMMENT 'Stores locked hotel/tour/transfer selections for customized quotes';

-- Add index for faster queries on quotes with preferences
ALTER TABLE quotes
ADD INDEX idx_has_preferences ((CAST(quote_preferences IS NOT NULL AS UNSIGNED)));

SELECT 'Migration completed successfully: quote_preferences column added' AS status;

COMMIT;

-- Rollback instructions (if needed):
-- ALTER TABLE quotes DROP COLUMN quote_preferences;
-- ALTER TABLE quotes DROP INDEX idx_has_preferences;

/* Example quote_preferences structure:
{
  "locked_hotels": {
    "Istanbul": 1366,
    "Antalya": 1580
  },
  "locked_tours": [55, 84, 90],
  "locked_transfers": {
    "arrival": 90,
    "departure": 86
  },
  "customization_notes": "Customer requested specific 5-star hotels",
  "locked_at": "2025-10-26T10:30:00Z",
  "locked_by_user_id": 5
}
*/
