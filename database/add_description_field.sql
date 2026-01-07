-- Add description field to tokens table
ALTER TABLE tokens 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add index for description search
CREATE INDEX IF NOT EXISTS idx_tokens_description ON tokens USING GIN (to_tsvector('english', description));

