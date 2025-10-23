-- Add missing fields to quotes table for itinerary tracking and customer engagement

-- Add customer phone field
ALTER TABLE quotes
ADD COLUMN customer_phone VARCHAR(50) AFTER customer_email;

-- Add tracking timestamps
ALTER TABLE quotes
ADD COLUMN sent_at TIMESTAMP NULL AFTER updated_at,
ADD COLUMN viewed_at TIMESTAMP NULL AFTER sent_at,
ADD COLUMN last_follow_up_at TIMESTAMP NULL AFTER viewed_at;

-- Add follow-up notes field
ALTER TABLE quotes
ADD COLUMN follow_up_notes TEXT AFTER last_follow_up_at;

-- Add indexes for performance
CREATE INDEX idx_quotes_sent_at ON quotes(sent_at);
CREATE INDEX idx_quotes_viewed_at ON quotes(viewed_at);
CREATE INDEX idx_quotes_customer_email ON quotes(customer_email);
