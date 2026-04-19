-- Inbox & Notifications system
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS appointment_notes TEXT;

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notify_on_emergency BOOLEAN DEFAULT true;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notify_emergency_phone TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notify_emergency_email TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notify_emergency_whatsapp TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notify_on_new_booking BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notify_on_callback BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_conversations_resolved ON conversations (business_id, resolved_at) WHERE resolved_at IS NULL;
