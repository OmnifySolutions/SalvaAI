-- Part D — Dashboard Metrics Migration
-- Adds appointment tracking, revenue config, urgency/after-hours classification,
-- unique_visitors view, and campaigns table.

-- Appointment tracking on conversations
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS appointment_requested BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS appointment_booked_status TEXT CHECK (appointment_booked_status IN ('pending','confirmed','failed')),
  ADD COLUMN IF NOT EXISTS appointment_booked_at TIMESTAMPTZ;

-- Visitor capture (phone/email) on conversations — for unique visitor aggregation
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS visitor_phone TEXT,
  ADD COLUMN IF NOT EXISTS visitor_email TEXT;

-- Revenue-per-appointment configurability
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS avg_appointment_value INT DEFAULT 150;

-- Urgency / intent classification on conversations
-- Set by AI classifier in ingest (chat + voice routes)
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('emergency','urgent','routine')) DEFAULT 'routine',
  ADD COLUMN IF NOT EXISTS is_after_hours BOOLEAN DEFAULT FALSE;

-- Unique visitor aggregation
CREATE OR REPLACE VIEW unique_visitors AS
SELECT DISTINCT business_id, COALESCE(visitor_phone, visitor_email) AS contact_id
FROM conversations
WHERE visitor_phone IS NOT NULL OR visitor_email IS NOT NULL;

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,                    -- 'sms'|'email'|'recall'
  status TEXT DEFAULT 'active',          -- 'active'|'paused'|'completed'
  recipients_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  appointments_booked INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_business ON campaigns(business_id);

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id);

-- Helpful indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_conversations_business_created ON conversations(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_business_urgency ON conversations(business_id, urgency);
CREATE INDEX IF NOT EXISTS idx_conversations_business_afterhours ON conversations(business_id, is_after_hours);
