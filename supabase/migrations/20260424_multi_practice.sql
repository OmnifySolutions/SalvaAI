-- Multi-Practice support: organizations table + location extensions
-- Additive only -- existing businesses rows remain valid (organization_id stays NULL for single-practice users)

-- ================================================================
-- 1. organizations (billing anchor, parent of up to 5 locations)
-- ================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_clerk_user_id    TEXT NOT NULL,
  name                   TEXT NOT NULL,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  plan                   TEXT NOT NULL DEFAULT 'multi',
  plan_status            TEXT NOT NULL DEFAULT 'active',
  billing_cycle          TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','annual')),
  total_minutes_limit    INTEGER NOT NULL DEFAULT 3750,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_owner
  ON organizations (owner_clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer
  ON organizations (stripe_customer_id);

-- ================================================================
-- 2. Extend businesses to support multi-location
-- ================================================================
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS is_primary_location BOOLEAN NOT NULL DEFAULT false;

-- Display name override for the location switcher (e.g. "Downtown Office")
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS location_display_name TEXT;

CREATE INDEX IF NOT EXISTS idx_businesses_org_id
  ON businesses (organization_id) WHERE organization_id IS NOT NULL;

-- ================================================================
-- 3. Denormalize location_name onto conversations
--    Realtime payloads only contain the changed row's columns,
--    so we snapshot the name at insert time to avoid secondary fetches.
-- ================================================================
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS location_name TEXT;

-- ================================================================
-- 4. Row Level Security for organizations
-- ================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_owner_select" ON organizations
  FOR SELECT USING (owner_clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "org_owner_update" ON organizations
  FOR UPDATE USING (owner_clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "org_owner_insert" ON organizations
  FOR INSERT WITH CHECK (owner_clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "org_owner_delete" ON organizations
  FOR DELETE USING (owner_clerk_user_id = auth.jwt() ->> 'sub');

-- ================================================================
-- 5. updated_at trigger for organizations
-- ================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
