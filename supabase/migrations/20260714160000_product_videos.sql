ALTER TABLE products ADD COLUMN IF NOT EXISTS videos jsonb DEFAULT '[]'::jsonb;
