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

**Latest completed work** (as of 2026-04-23): 
- Onboarding intro audio: Improved browser speech synthesis with voice loading fallback (plays on every refresh)
- Onboarding colors: Migrated from orange/rose gradient to blue theme throughout (buttons, focus states, accents)
- Onboarding Step 3 logic: Voice demo & phone preview now conditional on `?plan=pro` or `?plan=multi`
- SetupChecklist: Redesigned as compact full-width horizontal bar with blue progress indicator (moved from sidebar to dashboard top)
- Cost/Profit analysis: Added Claude Haiku chat costs, ElevenLabs scaling analysis, pricing strategy recommendation (hard cap + Growth tier)
- Created `COST_PROFIT_BREAKDOWN.md` with comprehensive unit economics for all plans

**Active blockers**:
- Anthropic credits exhausted; using Groq LLM (`llama-3.3-70b-versatile`)
- Twilio trial watermark (needs paid upgrade)
- Voice booking validation needs ngrok tunnel for local testing
- SocialProof component gated until real customer reviews collected
- ElevenLabs Creator plan ($22/mo): Sufficient for 1-2 Pro customers; upgrade strategy needed as customer base grows

**Next priorities**:
- Implement voice selector dropdown in Settings (use multiple pre-built ElevenLabs voices)
- Item 23 (voice UX): Microphone permission UI + end-to-end Open Dental booking validation
- Item 24: Real-time dashboard notifications (Supabase WebSocket)
- Item 26: Enable social proof (pending customer reviews)
- Pricing: Consider adding Growth tier ($399/mo for 2,500 min) when first Pro customers reach volume; move Pro cap from 500 → 1,000 min

**Quick references**:
- Test guide: `TEST_AUTOMATION.md` (phase-based testing strategy)
- Database migrations: `supabase/migrations/` (Inbox, AI Features, notifications)
- Memory index: `.claude/projects/C--Users-Daryll-SalvaAI/memory/MEMORY.md` (project history + architectural decisions)
