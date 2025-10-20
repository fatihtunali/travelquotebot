-- Add quality scoring to training itineraries for better AI selection
-- Quality score: 1 (poor) to 5 (excellent)

ALTER TABLE training_itineraries
ADD COLUMN quality_score TINYINT DEFAULT 3 COMMENT 'Quality rating 1-5, used to prioritize training examples';

-- Add index for faster queries
CREATE INDEX idx_training_quality ON training_itineraries(days, tour_type, quality_score DESC);

-- Set high quality score for recently added itineraries (they're manually curated)
UPDATE training_itineraries
SET quality_score = 4
WHERE created_at >= '2025-10-01';

COMMIT;
