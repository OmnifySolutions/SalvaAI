@AGENTS.md

# HustleClaude — Project Rules & Current State

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Auth: Clerk v7 — middleware lives in `proxy.ts` (not `middleware.ts`)
- Database: Supabase — use `supabaseAdmin` (service role, bypasses RLS) for all server routes
- AI: Anthropic SDK (`claude-haiku-4-5-20251001`) via `/api/chat`
- Icons: `lucide-react` — never use emoji as icons
- Payments: Stripe (`lib/stripe.ts`) — checkout, portal, webhook wired

## Schema (Supabase)
Key column names — use exactly:
- `businesses.name` (NOT `business_name`)
- `businesses.slug` (NOT NULL, auto-generated on insert)
- `businesses.plan` → `"free" | "basic" | "pro"`
- See `docs/SCHEMA.sql` for full schema

## What's built
- Landing page (`/`) — floating bubbles, 2-card slide carousel (4 scenarios), stats carousel (5 stats), features grid, CTA banner
- Pricing page (`/pricing`) — Free/Basic/Pro, competitor table, auth-aware CTAs (UpgradeButton), current plan state
- Auth: sign-in, sign-up (Clerk), onboarding (`/onboarding`)
- Dashboard (`/dashboard`) — stats, billing section (upgrade/manage), embed code, conversation list
- Settings (`/settings`) — name, hours (HoursPicker), services, AI config, FAQs
- Setup guide (`/setup`) — embed instructions (Squarespace/Wix/WordPress/HTML) + phone forwarding guide (GSM global-first, VoIP, US carriers)
- Chat widget (`/widget/[businessId]`) + embed script (`/api/widget/embed`)
- Chat API (`/api/chat`) — real Claude or mock fallback if no API key
- Stripe billing (`/api/stripe/checkout|portal|webhook`) — 30-day trial, plan sync
- Components: `ChatCardSpread`, `FloatingBubbles`, `SignOutButton`, `SettingsForm`, `HoursPicker`, `UpgradeButton`, `StatsCarousel`
- Hooks: `useCarousel` — shared infinite-scroll logic used by ChatCardSpread + StatsCarousel

## Design system (locked — do not change)
- Option B: clean, warm, Stripe-like
- Background: white (`bg-white`)
- Headlines: `text-gray-900`, bold, tight tracking
- Body: `text-gray-500` / `text-gray-600`
- Primary accent: `blue-600` (used on icons, links, badges)
- CTA buttons: `bg-gray-900 text-white` (primary), outlined gray (secondary)
- Cards: `border border-gray-200 rounded-2xl`
- Nav: sticky, `bg-white/80 backdrop-blur-md border-b border-gray-100`
- Icon style: Lucide, `size={20} strokeWidth={1.5}`, color `text-blue-600`

## Pricing (locked)
- Free: $0, 50 interactions/month
- Basic: $49/month, 500 interactions, chat only, no branding
- Pro: $149/month (raised from $99), unlimited, chat + voice
- Competitors: Arini $249, TrueLark/Weave $345 — we are cheapest with same features

## Product decisions (locked)
- Omnichannel: web chat (live) + voice/Twilio (Week 2) + email (post-launch) + SMS (post-launch, needs A2P 10DLC)
- Voice works via phone forwarding — dental office forwards their number to a Twilio number we provision
- No mobile SDK for MVP
- Free trial requires credit card (Stripe charges $0 now, auto-bills after 30 days) — messaging: "cancel anytime"
- Cancel anytime policy: yes, keep it, it increases conversions

## Approved build queue (do these in order)
1. **Landing page fixes:**
   - Chat card carousel: slide mechanic (left exits left, right shifts left, new enters from right), always 2 cards side by side, 4 scenarios (insurance, after-hours, new patient, pricing), 6s interval
   - Floating bubbles: increase size significantly (readable text)
   - Feature icons: change color to `blue-600`
   - Stats carousel: all 5 stats, 3 visible at a time, same slide mechanic, content below

2. **Stats copy (use these exactly):**
   - 35% of dental calls go unanswered
   - 78% hang up when they reach voicemail
   - 65% of missed calls are potential new patients
   - $8,000 lifetime value of a new patient
   - $150,000 lost annually from missed calls

3. **Pricing page updates:**
   - Raise Pro price to $149/month
   - Add competitor comparison table (HustleClaude vs Arini vs TrueLark)
   - Add "upgrade anytime" messaging
   - Logged-in users see "Upgrade to this plan" CTA instead of "Start free trial"

4. **Setup guide page** (`/setup`) — step-by-step embed instructions for non-technical dental staff, tabs for Squarespace / Wix / WordPress / custom HTML

5. **Phone forwarding guide** — how to forward calls by carrier (AT&T / Verizon / T-Mobile / RingCentral / Vonage), lives in setup guide or onboarding

6. **Hours picker** — replace text input in settings/onboarding with structured day-by-day picker (Mon–Sun, open/close time, enabled toggle per day)

7. **Stripe billing** — wire up Basic/Pro subscriptions, upgrade path from dashboard

8. **Twilio voice AI** — Week 2

## Key stats (verified, use in copy)
- 35% of dental calls go unanswered (>50% during busy hours)
- Average practice misses 300 calls/month
- 78% hang up at voicemail without leaving a message
- 65% of missed calls = potential new patients
- $8,000 average new patient lifetime value
- $850 immediate revenue loss per missed new patient call
- $150,000 lost annually from missed calls

## Unit economics
- Basic margin: ~96% ($47 profit on $49)
- Pro margin: ~94% ($140 profit on $149)
- Main costs: Stripe 2.9%+$0.30, Claude Haiku API ~$0.001/msg, Twilio $1.15/number + $0.0085/min
- Infrastructure (Supabase/Vercel/Clerk) free until ~50-80 customers

## Workflow rules
- **Git: no approval needed** — run all git commands (add, commit, push, branch, etc.) without asking for permission first. Just do it.
- `/commit` is NOT available — use `git add -A && git commit` directly via Bash
- After large feature builds → suggest `/simplify` for a code review pass
