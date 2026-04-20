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

**Website & Dashboard Overhaul (2026-04-18)** — 17 polishing changes
- ✅ Reordered homepage: AudioDemo → CustomizabilityDemo → StatsCarousel → ChatCardSpread (audio → customize flow)
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

**CustomizabilityDemo Polish (2026-04-18)** — Interactive demo fully refined
- ✅ Removed auto-cycling animation; back to manual click-through
- ✅ Removed "Custom AI Name" toggle, added "Insurance Questions" toggle with ShieldCheck icon
- ✅ Converted toggles to **radio button behavior** (only one active at a time)
- ✅ All toggles default to OFF
- ✅ Live preview shows on/off responses for focused toggle
- ✅ **Arrow SVG replaced** with user's custom Arrow.svg from /public (140×180px, bouncing animation preserved)
- ✅ Added brain emoji + voice agent notice: "🧠 Works for voice calls, chat, and all AI interactions"
- ✅ Fixed toggle styling: OFF toggles never greyed out

### 🔧 Active Next Steps

**Item 23: Voice call UX tuning** — PARTIALLY COMPLETE, needs final validation
- ✅ LLM reasoning/flow: Implemented 5-layer prompt + vertical profile system + service duration resolution
- ✅ Barge-in: Fixed with 150ms debounce + 2-word partial transcript confirmation (prevents false triggers on coughs)
- ✅ Choppy audio: Implemented sentence buffering (accumulates short sentences <40 chars before TTS)
- ✅ Code quality: Critical timer cleanup, regex pre-compilation, listener cleanup, CRUD consolidation
- ⏳ Remaining: End-to-end Open Dental booking validation (needs ngrok), microphone permission UI flow

**Item 23.5: SalvaAI demo chatbot fixes** — COMPLETE (2026-04-19)
- ✅ Fixed Groq model from deprecated `mixtral-8x7b-32768` to `llama-3.3-70b-versatile`
- ✅ Implemented SalvaAI-specific system prompt (team member positioning, pricing, features)
- ✅ SalvaAI-aware fallback mock responses (pricing, voice AI, setup, integrations, HIPAA)
- ✅ Added logging for API errors
- ✅ Consolidated Groq API keys: using original key (stored in Vercel env, proven working in Railway) for both voice and chat
- ✅ Added `GROQ_API_KEY` to Vercel environment variables
- ✅ Verified `.env.local` configured correctly

**Item 32: AI Features toggle system** — COMPLETE (2026-04-19)
- ✅ New "Features" tab in settings (between AI Config and Voice Settings)
- ✅ 8 feature toggles across 3 groups: Booking & Availability (instant_booking, after_hours_handling, waitlist_offers), Clinical & Triage (emergency_detection, insurance_questions, new_patient_flow), Financial (pricing_transparency, payment_plans)
- ✅ Each toggle injects contextual instructions into system prompt (both chat and voice)
- ✅ `instant_booking` toggle now controls `opendental_booking_mode` (ON=autonomous, OFF=pending)
- ✅ Features stored as JSONB array in `ai_features` column
- ✅ Shared `FEATURE_DEFINITIONS` (lib/ai-features.ts + railway/ai-features.js) ensures consistent prompt injection
- ⚠️ **Manual step required**: Run Supabase migration `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ai_features JSONB DEFAULT '[]'`

**Item 33: Inbox + Notifications System** — COMPLETE (2026-04-19)
- ✅ **Dashboard Inbox** (`components/InboxSection.tsx`): Three-tab view (Emergencies | Pending Bookings | Callbacks) with priority sorting
- ✅ **Notification triggers** wired into both chat (`app/api/chat/route.ts`) and voice (`railway/server.js`) APIs
- ✅ **Three notification channels**: SMS (Twilio), Email (Resend), WhatsApp (Twilio), all with graceful fallback if not configured
- ✅ **Settings tab** (`components/SettingsForm.tsx`): "Notifications" tab with toggles for Emergency/Booking/Callback alerts + contact field management
- ✅ **Inbox API** (`app/api/inbox/route.ts`): GET unresolved items, POST to mark resolved; filters by type and priority
- ✅ **Callback detection** (`lib/classify.ts`): Added `detectCallbackIntent()` alongside existing appointment/urgency classification
- ✅ **Database schema** (`supabase/migrations/20260419_inbox_notifications.sql`): `resolved_at`, `appointment_notes` on conversations; notification config on businesses
- ✅ **Code quality**: Parallelized notifications via Promise.all(), removed duplicate emergency classification in voice server, consolidated 6 notification state vars into 1 nested object
- ⚠️ **Manual steps required**: 
  1. Run Supabase migration: `supabase/migrations/20260419_inbox_notifications.sql`
  2. Add to Vercel env: `RESEND_API_KEY` (free account at resend.com) + `RESEND_FROM_EMAIL` (onboarding@resend.dev or custom domain)
  3. Add same vars to Railway env for voice server
  4. Add to `.env.local` for local development

**Item 33.5: Inbox UX polish + Realtime sync (2026-04-19)**
- ✅ Fixed emergency section disappearing on load: removed early `return null` that hid component when empty
- ✅ Added Supabase Realtime subscription + polling fallback (30s interval, fallback to polling if Realtime silent >60s) — no cost impact, zero extra infrastructure
- ✅ Auto-rotating tabs: cycles through Emergencies → Pending Bookings → Callbacks every 10 seconds until user clicks a tab (then stays static until page refresh)
- ✅ Changed placeholder text: "nothing to action here" → "nothing to do here"
- ✅ Do's & Don'ts layout: converted from 2-column grid to vertical stack with wider textareas (easier to read/write rules)
- ✅ Fixed Supabase service role key: made `SUPABASE_SERVICE_ROLE_KEY` optional in `lib/supabase.ts` (falls back to anon key if missing, preventing crashes on client)
- ✅ Inbox now displays data even without PMS integration: shows pending requests/emergencies as read-only info for manual follow-up

**Item 34: /how-it-works marketing page (2026-04-20)** — COMPLETE
- ✅ Built comprehensive 9-section product tour page at `/how-it-works`
- ✅ Section 1: Hero with gradient headline, two CTAs (Start free trial, See pricing)
- ✅ Section 2: Dashboard Analytics — 2-col layout with real `DashboardMockup` component + bullet points
- ✅ Section 3: AI Features (most complex) — 8 clickable toggles grouped by category (Booking, Clinical, Financial) with live chat preview that updates on every click
- ✅ Section 4: Settings Mockup — Interactive 8-tab sidebar, 3 fully detailed panels (AI Config, Voice, Notifications)
- ✅ Section 5: Inbox Demo — Auto-rotating 3-tab mockup, notification channel cards with toggle UI
- ✅ Section 6: Do's & Don'ts — IntersectionObserver typewriter animation, items appear sequentially as user scrolls in
- ✅ Section 7: Voice AI — Tone selector (Professional/Warm/Clinical) with live transcript swap per tone
- ✅ Section 8: Integrations — Open Dental featured card + 6 "coming soon" cards
- ✅ Section 9: Final CTA — "Ready to transform...", two primary CTAs
- ✅ Added `middleware.ts` with Clerk publicRoutes: `/`, `/pricing`, `/how-it-works`, sign-in/sign-up
- ✅ Animations: `animate-typewriter` (0.4s stagger), `animate-fade-slide` (0.25s entrance)
- ✅ Nav links updated on homepage and pricing page
- ✅ All CTAs use "Start free trial" (no "no credit card" language)

**Item 35: /how-it-works interactive polish & feature refinements (2026-04-20)** — COMPLETE
- ✅ Hero button: Changed "See pricing" to orange "How it works" CTA with anchor link to settings section (stands out with shadow effect)
- ✅ Settings section: Auto-rotate through all 8 tabs every 4 seconds, starting at Profile; rotation stops on user click (manual control)
- ✅ Populated all Settings tabs with dummy data: Profile (practice name/email/tz), Services (6 service checkboxes), Features (status toggles), Do's & Don'ts (rules textareas), Integrations (connected services with status)
- ✅ AI Features section: Implement radio-button behavior (only one feature can be ON at a time; clicking enabled feature turns all OFF) matching CustomizabilityDemo on homepage
- ✅ Dashboard preview: Removed internal max-w constraint, display at natural 1200px width with overflow:hidden for natural edge cutoff (no scaling/cropping internals)
- ✅ Checkmark spacing: Improved vertical alignment and consistent gap-4 spacing between bullet points

**Item 35.5: Dashboard preview & homepage CTA refinements (2026-04-20)** — COMPLETE
- ✅ **Homepage hero CTA shuffle**: Orange "How it works" button moved to homepage (replacing "Compare plans"), placed above "Start 14-day free trial" in centered column layout
- ✅ **How-it-works page**: Only "Start free trial" button displayed (orange "How it works" removed), button has glow-pulse animation + wider padding (px-12)
- ✅ **Added glow-pulse animation** to globals.css (orange glow effect that pulses every 2s)
- ✅ **DashboardMockup complete rebuild**: Matched exact design from Image #1 (Intelligence Center layout)
  - Header: "Intelligence Center" + subtitle + "Agent Active" status badge
  - Action Required section: 3 tabs (Emergencies, Pending Bookings, Callbacks) with "All clear" empty state
  - Overview section: Date filter buttons (All time selected by default)
  - 6 stat cards (2-column grid): Total Interactions (0), Appointments Booked (0), Phone Calls (29), Chats (2), After-Hours Handled (0), Emergency Flags (0)
- ✅ **Removed "Revenue Saved" chart** from dashboard (was removed in Item 35 but needed full rebuild)
- ✅ **Removed "After-hours coverage" checkmark** from left-side bullets, replaced with "Inbox notifications"
- ✅ **Dashboard scales properly** in both homepage and how-it-works page (0.625 scale factor fits in 520px height container)

**Item 36: Domain & email setup (2026-04-20)** — COMPLETE
- ✅ **Domain purchased**: getsalvaai.com (€9.33/yr via Namecheap, waiting for activation)
- ✅ **Email infrastructure decided**: Gmail + email forwarding + "Send As" feature
  - Emails to support@getsalvaai.com will forward to daryllvasconcellos@gmail.com
  - Reply from Gmail using "Send As" to maintain professional support@getsalvaai.com appearance
  - Zero additional cost, reliable, used by most startups initially
- ⏳ **Pending**: Domain activation (usually 24-48 hours), then configure email forwarding on registrar control panel

**Item 37: Full content & SEO audit (2026-04-21)** — COMPLETE
- ✅ **Trial language contradiction fixed**: Hero CTA now clarifies free plan vs 14-day paid trial
  - "Start free — no card needed" (free forever), "Start 14-day free trial" only on paid plan CTAs
  - Trust line updated to separate free and paid offerings
- ✅ **Unverified stats softened**: Replaced specific numbers with qualitative language (FTC compliance)
  - "1 in 3" → "Most calls", "4 in 5" → "Few callers", "$850" → "Every missed call", "$1,000+" → "High value"
  - Removed uncited statistics from hero strip and StatsCarousel
- ✅ **Inaccurate claims corrected**:
  - "in your voice" → "in your practice's tone" (AI voice description)
  - "Automatic booking confirmations" → "Booking request routing to front desk" (unvalidated claim)
  - "Insurance often covers 50%" → softened to "may cover a portion" (unverifiable percentage)
  - $149 demo price removed from ChatCardSpread
  - "Medicaid routing" tag → "Eligibility screening"
  - Dashboard mockup test data (29, 2) reset to 0
- ✅ **Integration status aligned**: Eaglesoft/Dentrix "waitlist integrations active" → "Waitlist open" for consistency
- ✅ **Setup time standardized**: All references now "under 5 minutes" (was "2-minute" in features)
- ✅ **SEO optimized**:
  - Pricing page title: "Pricing" → "Dental AI Receptionist Pricing — Plans & Comparison"
  - How-it-works meta description: benefit-oriented (outcomes-focused)
  - Added FAQPage JSON-LD schema to pricing page
  - Added SoftwareApplication JSON-LD schema to how-it-works page
  - Footer: added "How it works" navigation link
- ✅ **Grammar & brand polish**:
  - "Real Time" → "Real-time" (hyphenation)
  - "Disable After Hours Handling" → "After-Hours Handling" (label inversion fix)
  - "HIPAA-compliant" → "Designed for HIPAA compliance" (defensible language)
  - Eaglesoft capitalization standardized
  - CTA copy consistency: "Get started free" across all primary CTAs
- ✅ **Files modified** (8 total): app/page.tsx, app/pricing/page.tsx, app/how-it-works/page.tsx, app/how-it-works/client.tsx, components/StatsCarousel.tsx, components/ChatCardSpread.tsx, components/DashboardMockup.tsx, lib/ai-features.ts

**Item 37.5: Settings mockup preview polish (2026-04-21)** — COMPLETE
- ✅ **Profile tab**: Added Business Hours display (7-day schedule), Specialty dropdown selector, 2-column grid layout
- ✅ **Services tab**: Updated to show 6 services with duration in minutes, Clock icon, and descriptions (matches real form)
- ✅ **AI Config tab**: Added Patient FAQs section with 3 sample FAQs (Q&A format), improved layout
- ✅ **Features tab**: Added icons + descriptions for features grouped by category (Booking, Clinical, Financial), proper blue toggle styling
- ✅ **Notifications tab**: Made Emergency Alerts **expandable** (shows contact fields when enabled), matching real form behavior with collapsible sections
- ✅ **Voice Settings tab**: Complete redesign with blue virtual number badge, Acoustic Tone selector, **Smart Handoffs** section with 3 checkable items, Accept Calls toggle in header
- ✅ **Do's & Don'ts tab**: Green/red styling with checkmark/X icons, 4 sample items per section, proper textarea styling
- ✅ **Integrations tab**: Complete redesign with Open Dental "Connected" badge, Server URL + API Key fields, Test Sync button, upcoming integrations list
- ✅ **Realistic dummy data**: All tabs now show live account data (multiple services, FAQs, notifications enabled, connected integrations)
- ✅ All 8 tabs now **1:1 identical** to actual SettingsForm component — perfect marketing preview

**Item 38: Logo component refactor + transparent background (2026-04-21)** — COMPLETE
- ✅ Fixed hydration error: Removed nested `<Link>` from Logo.tsx component (was causing "cannot be descendant of <a>" error)
- ✅ Converted Logo wrapper from `<Link>` to `<div>` for pure presentational component
- ✅ Updated logo.png with transparent background (removed white background)
- ✅ Logo component now cleanly renders transparent logo across all 12 pages without blend modes or CSS workarounds
- ✅ Cleared Next.js cache to ensure fresh logo rendering

**Item 39: Hero section animations + UI refinements (2026-04-21)** — COMPLETE
- ✅ **Animated glow effect**: Added `glow-float` animation to all hero sections (homepage, how-it-works, FAQ, BAA, Privacy, Terms)
  - Glow moves 200-250px across the section (smooth, obvious movement)
  - 15-second cycle for slow, elegant motion
  - Opacity varies 0.4-0.5 for breathing effect
- ✅ **Shimmer overlay**: Added faint white shimmer that sweeps diagonally across the glow
  - Synchronized with glow movement (same 15s duration)
  - Opacity 0-0.2 for subtle luxury feel
  - Pseudo-element (::after) for clean implementation
- ✅ **Added hero sections to Privacy & Terms pages**: Matching FAQ/BAA style with dark bg-gray-950 + animated glow
  - Privacy: Shield icon + "Data Protection" badge
  - Terms: FileText icon + "Service Terms" badge
- ✅ **Reduced header logo sizes**: Standardized all pages to 110×27 (was 120×30 or 130×32)
  - Updated 10 files: homepage, how-it-works, FAQ, BAA, Privacy, Terms, Pricing, Setup, Dashboard, Settings
- ✅ **Cleaned up header navigation**: Removed "Features" links from homepage, pricing, and setup pages
  - Simplified to: How it works, Pricing, FAQ (consistent across all pages)
- ✅ **Files modified**: app/globals.css (new animations), 9 page files (hero sections + logo sizes + nav)

### 🟡 Pending (Blocked/In Progress)

**Item 24: Real-time dashboard notifications** — Supabase Realtime WebSocket push when new conversation arrives

**Item 25: Switch back to Claude Haiku** — BLOCKED: Anthropic credits exhausted; currently using Groq LLM (changed strategy: now using Groq free tier as primary)

**Item 26: Enable social proof section** — BLOCKED: Needs first real customer review (flip `{false &&` to `{true &&}` in `app/page.tsx`)

**Item 27: SalvaAI chat agent tuning** — IN PROGRESS
- Fine-tune responses for tone, accuracy, feature explanations
- Ensure consistent brand voice across all interactions
- Test conversation flows for edge cases

**Item 28: Chatwidget customization options** — PENDING
- Allow users to customize widget colors, position, greeting message
- Theme toggle support in dashboard settings
- Preview changes in real-time

**Item 29: Chat preview on homepage revision** — PENDING
- Update CustomizabilityDemo to show pricing/feature questions
- Ensure homepage demo reflects actual SalvaAI capabilities
- A/B test messaging effectiveness

**Item 30: Full end-to-end testing (voice + chat)** — PENDING
- Test all conversation paths: new patient, insurance, booking, after-hours
- Test voice barge-in, chat responsiveness
- Test across different dental practice types
- Verify PMS integrations work correctly

**Item 31: Edge case testing** — PENDING
- Test malformed input, very long messages
- Test rapid-fire questions
- Test concurrent conversations
- Test high-volume traffic scenarios

### 🔴 Current Blockers

- **Anthropic credits** — Out of credits; Groq LLM active (impacts Item 25)
- **Twilio trial account** — Plays watermark on calls; needs paid upgrade to remove
- **Open Dental ngrok** — Local testing requires ngrok tunnel for end-to-end booking validation
