-- Add market cap and category fields to existing tokens table
ALTER TABLE tokens 
ADD COLUMN IF NOT EXISTS ath DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS ath_last24hrs DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS idx_tokens_category ON tokens (category);

-- Add index for market cap filtering
CREATE INDEX IF NOT EXISTS idx_tokens_ath ON tokens (ath);
CREATE INDEX IF NOT EXISTS idx_tokens_ath_last24hrs ON tokens (ath_last24hrs);

