import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser / user-scoped operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side / webhook operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export type Business = {
  id: string;
  clerk_user_id: string;
  name: string;
  slug: string;
  business_type: string;
  phone_number: string | null;
  plan: "free" | "basic" | "pro";
  plan_status: string;
  faqs: { question: string; answer: string }[];
  hours: Record<string, { open: string | null; close: string | null; enabled: boolean }> | string;
  services: { name: string; description?: string }[] | string;
  ai_name: string;
  ai_greeting: string | null;
  custom_prompt: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  interaction_count: number;
  interaction_reset_date: string;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  business_id: string;
  channel: "chat" | "voice";
  caller_number: string | null;
  status: "active" | "ended";
  created_at: string;
  ended_at: string | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};
