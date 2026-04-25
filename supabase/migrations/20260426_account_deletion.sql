-- Account soft-deletion support
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS deletion_token       TEXT,
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at            TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_businesses_deletion_token ON businesses (deletion_token) WHERE deletion_token IS NOT NULL;
