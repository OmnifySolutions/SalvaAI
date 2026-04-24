# Global Claude Code Rules

## Skill nudges
After meaningful changes → suggest `/commit`. After large feature → suggest `/simplify`. When building Claude API features → remind `/claude-api` is loaded.

## Model switching
- **Haiku** — fast, cheap; short Q&A, quick edits, single-file changes.
- **Sonnet** — balanced; multi-file features, refactoring, debugging.
- **Opus** — complex decisions, hard bugs, large rewrites.

Always suggest which model before starting work.

## Manual instructions
When the user needs to do something manually (UI, console, etc.), provide **every single step**: exact button/menu names, field names, values to paste, what to expect, where to find things. Never assume prior knowledge.

## Project context: SalvaAI

**Stack**: Next.js 16, React 19, Tailwind v4, Clerk, Supabase, Anthropic SDK, Twilio, Stripe  
**Deployed**: GitHub (`OmnifySolutions/SalvaAI`) → Vercel (auto-deploys `master`)  
**Domain**: Dental-only (general, ortho, oral surgery, pediatric). No drift to other verticals.  
**Copy policy**: FTC-safe: no uncited statistics. Use qualitative language. All numbers must be verifiable.  
**Key technical notes**:
- `tsconfig.json`: `plugins/` excluded (suppresses Claude plugin cache TS error—don't remove)
- Dashboard, AI Features, Inbox, and Notifications fully wired to real data
- Voice AI: 5-layer prompts, vertical profiles, barge-in debounce (150ms), sentence buffering
- All marketing mockups (Dashboard, Settings, Inbox) are 1:1 identical to real components
- SocialProof gated off at `app/page.tsx` — only enable with real customer quotes

## Current State

**Latest completed work** (as of 2026-04-24): 
- **Stripe post-payment redirect fix**: Clerk session was being lost during cross-domain Stripe redirect. Created public `/payment-success` page that waits for Clerk auth to load client-side, then routes to `/dashboard` if signed in or `/sign-in` if not. Updated checkout success_url to point there. Added `/payment-success` to proxy.ts public routes.
- **Checkout bug fix**: Added error handling to `/api/stripe/checkout` endpoint — was returning generic 500 without logging actual errors
- **PRICING OVERHAUL (7 of 8 tasks)**: Complete redesign from Free/$69/$219/$749 to Basic/$65-79 | Pro/$249-309 | Growth/$449-559 | Multi/$849-1049 with annual/monthly toggle
  - Pricing page refactor with 4 tiers, expanded feature lists (8+ per tier), new hero "Transparent pricing. No contracts."
  - Database migration: added `billing_cycle`, `minutes_used_this_period`, `minutes_limit_monthly` columns
  - Stripe integration: PRICE_IDS now supports 4 plans × 2 billing cycles (8 total); checkout accepts billingCycle param
  - Voice minute enforcement: quota checks at call init, MinuteUsageCard dashboard component
  - Homepage copy updated: metadata, CTA, schema pricing ($65–$1,049 range)
  - Comparison table vs Dentina.ai + DentalAI Assist; "Save 2 months free" framing on annual
  - Created `PRICING_ROLLOUT.md` (implementation guide) + `ACTION_LIST.md` (next steps)

**Blocking go-live**:
- Stripe price IDs: need to create 8 IDs in Stripe dashboard + add to `.env`
- Supabase migration: run `supabase migration up`
- Multi-Practice dashboard: not built (2–3 day task, blocks Multi tier sales)

**Active blockers** (pre-pricing):
- Anthropic credits exhausted; using Groq LLM (`llama-3.3-70b-versatile`)
- Twilio trial watermark (needs paid upgrade)
- Voice booking validation needs ngrok tunnel for local testing
- SocialProof component gated until real customer reviews collected
- ElevenLabs Creator plan ($22/mo): Sufficient for 1-2 Pro customers; upgrade strategy needed as customer base grows

**Next priorities** (post-pricing):
- ✋ **PAUSE**: Complete ACTION_LIST.md steps before building new features (Stripe setup, migration, testing)
- Voice selector dropdown in Settings (use multiple pre-built ElevenLabs voices) — tie to Pro plan
- Item 23 (voice UX): Microphone permission UI + end-to-end Open Dental booking validation
- Item 24: Real-time dashboard notifications (Supabase WebSocket)
- Item 26: Enable social proof (pending customer reviews)
- Multi-Practice dashboard: location switcher UI + aggregated stats (2–3 days, blocks Multi tier)

**Quick references**:
- Test guide: `TEST_AUTOMATION.md` (phase-based testing strategy)
- Database migrations: `supabase/migrations/` (Inbox, AI Features, notifications)
- Memory index: `.claude/projects/C--Users-Daryll-SalvaAI/memory/MEMORY.md` (project history + architectural decisions)
