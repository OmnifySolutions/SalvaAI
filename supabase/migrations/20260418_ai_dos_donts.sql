-- Add Do's & Don'ts columns to businesses table
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS ai_dos TEXT,
  ADD COLUMN IF NOT EXISTS ai_donts TEXT;
