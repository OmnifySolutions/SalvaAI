-- Add billing_cycle column to businesses table
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual'));

-- Add minutes tracking for voice plans
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS minutes_used_this_period INTEGER DEFAULT 0;

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS minutes_limit_monthly INTEGER DEFAULT 750;

-- Note: If plan column is an enum type, you'll need to add 'growth' manually:
-- ALTER TYPE plan_type ADD VALUE 'growth' BEFORE 'multi';
-- If plan column is VARCHAR, no action needed as it already accepts 'growth'

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_billing_cycle ON businesses(billing_cycle);
CREATE INDEX IF NOT EXISTS idx_businesses_minutes_used ON businesses(minutes_used_this_period);
