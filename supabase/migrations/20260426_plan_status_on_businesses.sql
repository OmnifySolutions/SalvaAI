-- Add plan_status to businesses table (was missing from earlier migrations)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active';

-- Set existing rows to 'active' if they have a stripe subscription
UPDATE businesses
SET plan_status = 'active'
WHERE plan_status IS NULL AND stripe_subscription_id IS NOT NULL;

-- Set to 'free' if no stripe subscription
UPDATE businesses
SET plan_status = 'free'
WHERE plan_status IS NULL AND stripe_subscription_id IS NULL;
