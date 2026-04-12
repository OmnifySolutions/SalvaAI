-- HustleClaude Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- businesses table: one per paying customer
-- ============================================================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  twilio_sid TEXT,
  website_url TEXT,
  business_type TEXT DEFAULT 'dental',
  timezone TEXT DEFAULT 'America/New_York',

  -- AI config
  ai_name TEXT DEFAULT 'Claire',
  ai_greeting TEXT,
  custom_prompt TEXT,

  -- Business hours (JSON for simplicity)
  hours JSONB DEFAULT '{
    "monday":    {"open": "08:00", "close": "17:00", "enabled": true},
    "tuesday":   {"open": "08:00", "close": "17:00", "enabled": true},
    "wednesday": {"open": "08:00", "close": "17:00", "enabled": true},
    "thursday":  {"open": "08:00", "close": "17:00", "enabled": true},
    "friday":    {"open": "08:00", "close": "17:00", "enabled": true},
    "saturday":  {"open": "09:00", "close": "13:00", "enabled": false},
    "sunday":    {"open": null,    "close": null,     "enabled": false}
  }',

  -- Services offered (for AI context)
  services JSONB DEFAULT '[]',

  -- FAQs
  faqs JSONB DEFAULT '[]',

  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free',
  plan_status TEXT DEFAULT 'active',
  interaction_count INT DEFAULT 0,
  interaction_reset_date TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month'),

  -- Voice AI
  voice_enabled BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- conversations table: one per chat session or phone call
-- ============================================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('chat', 'voice')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'missed')),

  -- Caller/visitor info
  visitor_name TEXT,
  visitor_phone TEXT,
  visitor_email TEXT,

  -- Voice specifics
  twilio_call_sid TEXT,
  caller_phone TEXT,

  -- Chat specifics
  session_id TEXT,

  -- Outcome tracking
  callback_requested BOOLEAN DEFAULT false,
  appointment_requested BOOLEAN DEFAULT false,
  summary TEXT,

  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- messages table: individual turns in a conversation
-- ============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  audio_duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================
CREATE INDEX idx_conversations_business_id ON conversations(business_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_businesses_clerk_user_id ON businesses(clerk_user_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);

-- ============================================================================
-- Row Level Security (RLS) — protect data by user
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Businesses: Users can only see/edit their own
CREATE POLICY "businesses_own" ON businesses
  USING (clerk_user_id = auth.uid()::text)
  WITH CHECK (clerk_user_id = auth.uid()::text);

-- Conversations: Only accessible through business ownership
CREATE POLICY "conversations_own" ON conversations
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE clerk_user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE clerk_user_id = auth.uid()::text
    )
  );

-- Messages: Accessible through conversation ownership
CREATE POLICY "messages_own" ON messages
  USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN businesses b ON c.business_id = b.id
      WHERE b.clerk_user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN businesses b ON c.business_id = b.id
      WHERE b.clerk_user_id = auth.uid()::text
    )
  );

-- ============================================================================
-- Functions: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Done! All tables, indexes, RLS policies, and functions created.
-- ============================================================================
