# Global Claude Code Rules

## Skill nudges
At the right moment, always tell the user which skill to invoke and why. Be specific — name the skill, the slash command, and one sentence on what it does right now. Do this proactively; do not wait for the user to ask.

Examples of when to nudge:
- After a meaningful batch of changes → suggest `/commit`
- After a large feature is complete → suggest `/simplify` for a code review pass
- When the user is about to build something Claude API-related → remind them `/claude-api` is loaded

## Model switching guidance
Proactively suggest which model the user should use based on the task. Prompt them in real time when a switch would help. Use these guidelines:

- **Haiku** (`claude-haiku-4-5-20251001`) — fast, cheap, good for: short Q&A, simple edits, quick lookups, single-file changes. Default for high-volume tasks.
- **Sonnet** (`claude-sonnet-4-6`) — balanced speed + intelligence. Use for: multi-file features, debugging, refactoring, most coding tasks. **Default recommendation for HustleClaude sessions.**
- **Opus** (`claude-opus-4-6`) — highest capability. Use for: complex architecture decisions, hard bugs requiring deep reasoning, large multi-file rewrites, anything where Sonnet struggles.

Nudge the user to switch **before** starting the task, not after it goes wrong. Examples:
- "This is a multi-file feature — switch to Sonnet with `/model sonnet` for better results."
- "This is a complex architecture decision — suggest `/model opus` to get the best reasoning."
- "This is a quick one-liner fix — Haiku is fine, but you're already on Sonnet so no need to switch."

Never silently use the wrong model. Always tell the user what model you think they should be on.

## Manual instructions: be exhaustively detailed
When the user needs to do something manually (in a UI, dashboard, console, etc.), provide **every single step**. Include:
- Exact button/menu names to click
- Exact field names
- Exact values or URLs to paste
- What to expect after each step
- Where to find things (left sidebar, top right, etc.)
Never assume the user knows where things are or how to navigate a UI. Be 95%+ confident in accuracy before sending instructions. If vague, the user will waste time asking clarifying questions.

## Project context: SalvaAI

- **Stack**: Next.js 16, React 19, Tailwind v4, Clerk auth, Supabase, Anthropic SDK, Twilio, Stripe
- **Deployed via**: GitHub (`OmnifySolutions/SalvaAI`) → Vercel (auto-deploys on push to `master`)
- **Brand scope**: Dental-only (general dental, orthodontics, oral surgery, pediatric). Do not drift to "small businesses" or other verticals.
- **Copy policy**: No specific uncited statistics in marketing copy (FTC risk). Use qualitative or range-based language. All stats must have a verifiable source before using a specific number.
- **SocialProof**: Component exists but is gated off via `{false && <SocialProof />}` in `app/page.tsx`. Do not enable until real verified customer quotes are collected.
- **Dashboard wiring (Part D — COMPLETE)**: All metrics wired to real data (appointments, unique visitors, after-hours, urgency breakdown, peak contact hours, campaigns). Migration applied 2026-04-17. Code reviewed and optimized (type safety, parallelization, semantic HTML, ChartPanel wrapper). See memory `project_part_d_complete.md` for implementation details and pending RPC optimizations.
- **Voice AI tuning (Item 23 — PARTIAL COMPLETION)**: Implemented 5-layer prompt architecture with vertical profile system (dental_general), service duration awareness, sentence buffering (choppiness fix), and barge-in debounce (150ms VAD filter). Code quality pass completed 2026-04-17 (critical: timer cleanup, regex pre-compilation, listener cleanup, CRUD hook extraction). Still need: end-to-end Open Dental booking validation, microphone permission UI flow. See memory `voice_ai_tuning_complete.md` for architecture and code quality fixes.
- **tsconfig.json**: `plugins/` is excluded to suppress pre-existing TS error from Claude plugin cache — do not remove that exclusion.

## Pre-Launch Checklist (Approved Build Queue)

### ✅ Recently Completed

**Website & Dashboard Overhaul (2026-04-18)** — 16 polishing changes
- ✅ Reordered homepage: AudioDemo → StatsCarousel → ChatCardSpread (audio has priority)
- ✅ Added interactive "AI Customizability Demo" section showing toggle-based AI response changes
- ✅ Floating chat widget on homepage (reads `NEXT_PUBLIC_DEMO_BUSINESS_ID`, displays at bottom-right)
- ✅ Updated pricing free tier: "50 interactions total" (was "/month") to emphasize trial graduation
- ✅ Dashboard redesign: removed "Total Patients Engaged", added "Phone Calls" stat, renamed "Active Chats" to "Chats", removed Campaigns section, added date filters (Today/Week/Month/Quarter/All time)
- ✅ Settings improvements: removed greeting hint, added Patient FAQs help text, fixed "telephony" typo, added "Do's & Don'ts" tab with green/red textareas
- ✅ DashboardCharts: removed "Revenue Saved" panel entirely
- ✅ Created new components: FloatingChatWidget, CustomizabilityDemo, DashboardStats (with client-side date filtering)
- ⚠️ **Manual step required**: Run Supabase migration to add `ai_dos` and `ai_donts` TEXT columns; set `NEXT_PUBLIC_DEMO_BUSINESS_ID` env var

**Chat API Security Fixes (2026-04-18)** — 3 critical vulnerabilities closed
- ✅ Free tier interaction limit: Added enforcement for 50-interaction lifetime trial limit (free plan)
- ✅ Conversation access control: Added `business_id` verification to prevent cross-business conversation access
- ✅ Do's & Don'ts enforcement: Integrated `ai_dos` and `ai_donts` into Claude system prompt so custom rules actually affect AI responses

**CustomizabilityDemo Polish (2026-04-18)** — Interactive demo refinements
- ✅ Removed auto-cycling animation; back to manual click-through
- ✅ Removed "Custom AI Name" toggle, added "Insurance Questions" toggle with ShieldCheck icon
- ✅ Fixed toggle state: each setting can be toggled on/off independently (not exclusive)
- ✅ Live preview shows on/off responses for focused toggle
- ✅ Added hand-drawn orange arrow (outlined style, white interior) bouncing above first card
- ⏳ **Next**: Replace arrow SVG with custom PNG/SVG image asset (user creating design)

### 🔧 Active Next Steps

**Item 23: Voice call UX tuning** — PARTIALLY COMPLETE, needs final validation
- ✅ LLM reasoning/flow: Implemented 5-layer prompt + vertical profile system + service duration resolution
- ✅ Barge-in: Fixed with 150ms debounce + 2-word partial transcript confirmation (prevents false triggers on coughs)
- ✅ Choppy audio: Implemented sentence buffering (accumulates short sentences <40 chars before TTS)
- ✅ Code quality: Critical timer cleanup, regex pre-compilation, listener cleanup, CRUD consolidation
- ⏳ Remaining: End-to-end Open Dental booking validation (needs ngrok), microphone permission UI flow

### 🟡 Pending (Blocked)

**Item 24: Real-time dashboard notifications** — Supabase Realtime WebSocket push when new conversation arrives

**Item 25: Switch back to Claude Haiku** — BLOCKED: Anthropic credits exhausted; currently using Groq LLM

**Item 26: Enable social proof section** — BLOCKED: Needs first real customer review (flip `{false &&` to `{true &&}` in `app/page.tsx`)

### 🔴 Current Blockers

- **Anthropic credits** — Out of credits; Groq LLM active (impacts Item 25)
- **Twilio trial account** — Plays watermark on calls; needs paid upgrade to remove
- **Open Dental ngrok** — Local testing requires ngrok tunnel for end-to-end booking validation
