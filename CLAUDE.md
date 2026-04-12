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
- `businesses.plan` → `"free" | "basic" | "pro" | "multi"`
- `businesses.voice_enabled` (boolean)
- `businesses.twilio_sid` (E.164 phone number string e.g. `+16626232482`)
- `businesses.phone_number` (practice's real phone for SMS notifications)
- See `docs/SCHEMA.sql` for full schema

## What's built
- Landing page (`/`) — voice-first hero ("$150k lost" headline), pain stats strip, floating bubbles, chat card carousel, stats carousel, audio demo (3 scenarios), features grid (voice first), CTA banner, competitive nudge line
- Pricing page (`/pricing`) — Free/Basic/Pro/Multi-Practice (4 tiers), competitor table, auth-aware CTAs (UpgradeButton)
- Auth: sign-in, sign-up (Clerk), onboarding (`/onboarding`)
- Dashboard (`/dashboard`) — stats, billing section, voice AI card (status + forwarding number), embed code, conversation list
- Settings (`/settings`) — name, hours (HoursPicker), services, AI config, FAQs, voice toggle (Pro/Multi only)
- Setup guide (`/setup`) — embed instructions + phone forwarding guide
- Chat widget (`/widget/[businessId]`) + embed script (`/api/widget/embed`)
- Chat API (`/api/chat`) — real Claude Haiku or mock fallback if no API key
- Stripe billing (`/api/stripe/checkout|portal|webhook`) — 30-day trial, plan sync, 4 plans
- **Voice AI pipeline** ✅ (fully working, tested end-to-end via browser)
  - Railway WebSocket server (`railway/server.js`) — Deepgram STT → Groq LLM → Deepgram TTS → Twilio
  - TTS: Deepgram Aura (`aura-asteria-en`, mulaw 8kHz) — replaced ElevenLabs (free plan blocks API)
  - LLM: Groq `llama-3.3-70b-versatile` for testing; set `GROQ_API_KEY` in Railway to activate, remove to fall back to Claude Haiku
  - Sentence streaming: LLM streams tokens → sentence boundaries → TTS fires per sentence (~600ms first audio)
  - Barge-in: SpeechStarted VAD (~50ms) → AbortController abort + Twilio clear — instant stop
  - Heard-sentence tracking: only fully-played sentences in message history on barge-in
  - Pre-buffer 300ms (15 frames) then real-time pacing — no mid-sentence dropouts
  - 20s silence auto-disconnect with farewell message
  - Deepgram auto-reconnect + 10s keepalive + unhandledRejection guard
  - AI tone: professional/efficient, uses practice name naturally — NOT warm/empathetic
  - Post-call SMS summary to business owner (requires `businesses.phone_number` set)
  - Twilio webhook (`/api/voice/incoming-call`) — creates conversation, returns TwiML with correct Railway URL
  - Browser call demo (`/voice-test`) — Twilio Client JS SDK, no phone needed
  - Token endpoint (`/api/voice/browser-token`) + TwiML App webhook (`/api/voice/browser-call`)
  - Auth: `/api/voice/(.*)` exempted from Clerk in `proxy.ts`
  - Twilio TwiML App SID: `APb69c7c65d2d8e75d4f55a416a3447b68`
  - `vad_events=true` required in Deepgram params for SpeechStarted to fire
- Components: `ChatCardSpread`, `FloatingBubbles`, `SignOutButton`, `SettingsForm`, `HoursPicker`, `UpgradeButton`, `StatsCarousel`, `AudioDemo`
- Hooks: `useCarousel` — shared infinite-scroll logic

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
- Voice AI architecture: **Option B — full conversational Media Streams** (NOT IVR). Twilio Media Streams → Railway WebSocket server → Deepgram STT → Groq/Claude LLM → Deepgram TTS → audio back to caller. Sub-second latency, natural conversation.
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
1. ✅ **Update pricing everywhere** — 4 tiers, Stripe price IDs, plan enum "multi" added
2. ✅ **Rewrite homepage hero** — voice-first, "$150k lost" headline, pain stats strip
3. ✅ **Flip feature section order** — voice first, chat second
4. ✅ **Pre-recorded audio demo section** — AudioDemo component built, MP3s still need generating
5. ✅ **Competitive nudge line** — added to homepage
6. ✅ **Update pricing page** — 4-tier, updated competitor table
7. ✅ **Voice AI pipeline** — Deepgram STT + Groq LLM + Deepgram TTS wired, barge-in, post-call SMS
8. ✅ **Swap to Groq for testing** — GROQ_API_KEY env flag in Railway, falls back to Claude Haiku when removed
9. ✅ **Fix TTS** — switched from ElevenLabs to Deepgram Aura (`aura-asteria-en`)
10. ✅ **Browser voice demo** — `/voice-test` page, Twilio Client JS SDK, tested and working
11. ✅ **Sentence streaming** — ~600ms first audio, streams LLM by sentence to TTS immediately
12. ✅ **Barge-in overhaul** — SpeechStarted VAD, heard-context tracking, race condition fixes
13. ✅ **Connection stability** — keepalive, Deepgram reconnect, pre-buffer, silence auto-disconnect
14. **Settings — voice customization** — tone preset, emergency handling, deflection topics, scenario builder
15. **Real-time dashboard notifications** — Supabase Realtime WebSocket push when new conversation arrives
16. **Switch back to Claude Haiku** — when Anthropic credits arrive, remove GROQ_API_KEY from Railway

## Blockers
- **Anthropic credits** — out of credits; Groq is the active LLM until resolved
- **Audio demo MP3s** — generate 3 files via Deepgram TTS, save to `/public/audio/`
- **Twilio trial account** — plays watermark message before every call; upgrade account to remove

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
- Main costs: Stripe 2.9%+$0.30, Claude Haiku ~$0.001/msg, Twilio $1.15/number + $0.0085/min, Deepgram STT $0.0059/min, Deepgram TTS ~$1-2/customer/month, Railway ~$6/month flat
- TTS decision: Deepgram Aura replaces ElevenLabs — ~$1-2/customer/month vs $7-10. Phone codec (mulaw 8kHz) is the quality bottleneck, not the TTS engine.
- Infrastructure (Supabase/Vercel/Clerk) free until ~50-80 customers
- Path to $20K MRR: ~106 Pro customers or ~80 Pro + a few Multi-Practice

## Workflow rules
- **Git: no approval needed** — run all git commands (add, commit, push, branch, etc.) without asking for permission first. Just do it.
- `/commit` is NOT available — use `git add -A && git commit` directly via Bash
- After large feature builds → suggest `/simplify` for a code review pass
