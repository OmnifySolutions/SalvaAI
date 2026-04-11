@AGENTS.md

# HustleClaude — Project Rules

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Auth: Clerk v7 (`@clerk/nextjs`) — middleware lives in `proxy.ts`, not `middleware.ts`
- Database: Supabase — `supabaseAdmin` (service role, bypasses RLS) for all server routes
- AI: Anthropic SDK (`claude-haiku-4-5-20251001`) via `/api/chat`
- Payments: Stripe (not yet wired)

## Schema (Supabase)
Key column names — use these exactly:
- `businesses.name` (not `business_name`)
- `businesses.slug` (NOT NULL, auto-generated on insert)
- `businesses.plan` → `"free" | "basic" | "pro"`
- See `docs/SCHEMA.sql` for full schema

## What's built
- Landing page (`/`), pricing page (`/pricing`)
- Auth: sign-in, sign-up, onboarding (`/onboarding`)
- Dashboard (`/dashboard`) — stats, embed code, conversation list
- Settings (`/settings`) — name, hours, services, AI config, FAQs
- Chat widget (`/widget/[businessId]`) + embed script (`/api/widget/embed`)
- Chat API (`/api/chat`) — real Claude or mock fallback

## What's next (in order)
1. High-end UI redesign (landing + dashboard)
2. Stripe billing (Basic $49/mo, Pro $99/mo)
3. Twilio voice AI (Week 2)
4. Clerk webhook (sync user creation)

## Skill nudges
Tell the user which skill to invoke at the right moment. Name the command and why.
- After a batch of changes → suggest `/commit`
- After a large feature → suggest `/simplify`
