-- Pump.fun Token Explorer Database Schema
-- This schema is designed for Supabase (PostgreSQL)

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  address TEXT PRIMARY KEY,
  launch_date TIMESTAMPTZ NOT NULL,
  name TEXT,
  symbol TEXT,
  description TEXT,
  image_uri TEXT,
  ath DOUBLE PRECISION,
  ath_last24hrs DOUBLE PRECISION,
  category TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tokens_launch_date ON tokens(launch_date DESC);
CREATE INDEX IF NOT EXISTS idx_tokens_name ON tokens(name);
CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol);

-- Create a GIN index for JSONB metadata for efficient querying
CREATE INDEX IF NOT EXISTS idx_tokens_metadata_json ON tokens USING GIN (metadata_json);

-- Create a GIN index for description full-text search
CREATE INDEX IF NOT EXISTS idx_tokens_description ON tokens USING GIN (to_tsvector('english', description));

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS update_tokens_updated_at ON tokens;
CREATE TRIGGER update_tokens_updated_at
  BEFORE UPDATE ON tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE tokens IS 'Stores Pump.fun token data enriched with on-chain metadata';
COMMENT ON COLUMN tokens.address IS 'Solana token mint address (Primary Key)';
COMMENT ON COLUMN tokens.launch_date IS 'Token launch date from Dune Analytics';
COMMENT ON COLUMN tokens.name IS 'Token name from Metaplex metadata';
COMMENT ON COLUMN tokens.symbol IS 'Token symbol/ticker from Metaplex metadata';
COMMENT ON COLUMN tokens.image_uri IS 'Token image URI (PFP) from off-chain metadata';
COMMENT ON COLUMN tokens.metadata_json IS 'Additional metadata including social links (twitter, website, telegram)';
COMMENT ON COLUMN tokens.created_at IS 'Timestamp when the record was first created';
COMMENT ON COLUMN tokens.updated_at IS 'Timestamp when the record was last updated';

