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
- **Voice AI infrastructure** ✅
  - Railway WebSocket server (`railway/server.js`) — listens for Twilio Media Streams
  - Twilio webhook (`/api/voice/incoming-call`) — handles incoming calls, creates conversation records
  - Schema: `businesses.voice_enabled` (boolean), `conversations.channel` supports 'voice', `conversations.twilio_call_sid`
  - Auth: `/api/voice/(.*)` exempted from Clerk in `proxy.ts`
  - Env vars: `RAILWAY_URL`, `DEEPGRAM_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
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
- Free: $0, 50 interactions/month, chat only, branded — demo/lead gen only
- Basic: $49/month, unlimited chat, no voice, no branding
- Pro: $189/month, unlimited chat + voice AI (up to 500 calls/month), 92.6% margin
- Multi-Practice: $649/month, up to 5 locations, everything in Pro, 89.2% margin
- Competitors: Arini $249, TrueLark/Weave $345 — Pro is $60 cheaper than Arini, $156 cheaper than TrueLark
- Multi-Practice saves customers $296/month vs buying 5 individual Pro plans ($945)
- `businesses.plan` values: `"free" | "basic" | "pro" | "multi"`

## Product decisions (locked)
- Omnichannel: web chat (live) + voice/Twilio (next) + email (post-launch) + SMS (post-launch, needs A2P 10DLC)
- Voice works via phone forwarding — dental office forwards their number to a Twilio number we provision
- Voice AI architecture: **Option B — full conversational Media Streams** (NOT IVR). Twilio Media Streams → Railway WebSocket server → Deepgram STT → Claude Haiku → ElevenLabs TTS → audio back to caller. Sub-second latency, natural conversation.
- Voice infra: Railway hosts the WebSocket server (Next.js/Vercel can't do persistent WebSockets). ~$6/month.
- Voice is the main product. Chat is a bonus. All homepage messaging should lead with voice/missed calls.
- No mobile SDK for MVP
- Free trial requires credit card (Stripe charges $0 now, auto-bills after 30 days) — messaging: "cancel anytime"
- Cancel anytime policy: yes, keep it, it increases conversions
- Competitor messaging: never on homepage (signals insecurity). Pricing page only. One soft nudge line on homepage: "Most practices save $60–160/month vs competitors."

## Homepage messaging rules (locked)
- Lead with pain: missed calls, lost patients, lost revenue ($150k/year stat is the headline)
- Voice AI is the hero feature — chat is secondary
- No competitor tables on homepage — pricing page only
- One competitive nudge line only: "Most practices save $60–160/month vs competitors"
- Don't oversell: no "revolutionary", no "best-in-class" — let the numbers speak

## Approved build queue (next session, do in order)
1. **Update pricing everywhere** — pricing page (Free/Basic/Pro/Multi-Practice), CLAUDE.md ✅, Stripe price ID placeholders, plan enum
2. **Rewrite homepage hero** — voice AI + missed call pain leads, not chat. "$150,000 lost annually" is the headline stat.
3. **Flip feature section order** — voice first, chat second throughout homepage
4. **Pre-recorded audio demo section** — 3 scenarios (new patient, after-hours, insurance), simple MP3 player, $0 ongoing cost. Generate with ElevenLabs once.
5. **Competitive nudge line** — one line near pricing on homepage
6. **Update pricing page** — new 4-tier pricing, updated competitor table
7. **Twilio voice AI** — ✅ DONE. Railway WebSocket server deployed + Twilio webhook working + schema updated + auth fixed. Still TODO: add voice settings UI to dashboard, integrate Deepgram + Claude + ElevenLabs into media stream handler
8. **Browser voice demo** (Phase 2, after voice is live) — talk to AI in browser via WebRTC, no phone needed

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
- Pro margin: ~92.6% ($175 profit on $189) — voice cost ~$14/customer/month
- Multi-Practice margin: ~89.2% ($579 profit on $649) — voice cost ~$70 (5 locations)
- Main costs: Stripe 2.9%+$0.30, Claude Haiku ~$0.001/msg, Twilio $1.15/number + $0.0085/min, Deepgram $0.0059/min, ElevenLabs ~$7-10/Pro customer/month, Railway ~$6/month flat
- Infrastructure (Supabase/Vercel/Clerk) free until ~50-80 customers
- Path to $20K MRR: ~106 Pro customers or ~80 Pro + a few Multi-Practice

## Workflow rules
- **Git: no approval needed** — run all git commands (add, commit, push, branch, etc.) without asking for permission first. Just do it.
- `/commit` is NOT available — use `git add -A && git commit` directly via Bash
- After large feature builds → suggest `/simplify` for a code review pass
