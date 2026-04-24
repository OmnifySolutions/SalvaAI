-- Add billing period end tracking to businesses table
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP;

-- Migrate data from interaction_reset_date to current_period_end for paid plans
UPDATE businesses
SET current_period_end = interaction_reset_date
WHERE plan IN ('basic', 'pro', 'growth', 'multi')
  AND interaction_reset_date IS NOT NULL
  AND current_period_end IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_businesses_current_period_end ON businesses(current_period_end);
