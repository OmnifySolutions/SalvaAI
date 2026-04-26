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

**Latest completed work** (as of 2026-04-26, onboarding intro + free plan removal):

- **Onboarding intro screen overhaul** (2026-04-26):
  - Audio: plays `/public/audio/onboarding/ai-intro.mp3` on user click (browser autoplay policy requires gesture); falls back to SpeechSynthesis if MP3 fails
  - Avatar: video element looping `/public/audio/onboarding/avatar-idle.mp4`; `avatar-speaking.mp4` removed (lip sync too complex, skipped)
  - Start button: pulsing orange/rose glow rings (animate-ping-slow/slower); replaces "click anywhere" approach
  - Background orbs: animated drift across screen (28s / 34s cycles via CSS keyframes in style jsx block)
  - Typewriter: `WORDS` is module-level constant; `activeWordIdx` derived (not state); last word reverts to white after 1s via `highlightActive` boolean; `speechSynthesis.onvoiceschanged` cleaned up on unmount
  - Label updated: "Your AI" → "Your AI Receptionist"
  - **File needed**: `/public/audio/onboarding/avatar-idle.mp4` (D-ID or HeyGen: idle loop, blinking/breathing)

- **Free plan killed everywhere** (2026-04-26):
  - `app/page.tsx`: all CTAs → `/pricing` (not `/sign-up`); copy: "See Plans", "Start Your Trial", "14-day trial" (removed "Free to start")
  - `app/onboarding/page.tsx`: redirects to `/pricing` if no `?plan` param or `plan=free` — users can't reach onboarding without a real plan
  - `app/dashboard/page.tsx`: single guard `if (!business || !business.plan || business.plan === "free") redirect("/pricing")`
  - New user flow: homepage CTA → `/pricing` → pick plan → sign up → onboard → checkout

**Latest completed work** (as of 2026-04-26, subscription status visibility + deletion flow fixes):
- **Subscription status visibility** (2026-04-26):
  - Added `plan_status` field to `businesses` table (was missing, only existed on `organizations`). Migration: `supabase/migrations/20260426_plan_status_on_businesses.sql` sets existing rows to 'active' if they have stripe_subscription_id, else 'free'
  - **Settings Account tab billing section**: Status dot now color-coded — green for active/trialing, red for canceled, orange for past_due, gray for free. Text color matches dot. Renewal date hidden when canceled.
  - **Dashboard PlanBadge**: Shows distinct red badge with "Canceled" label when status is canceled; button text changes to "Reactivate" instead of "View Plans"
  - **Webhook fix**: On `customer.subscription.deleted`, now clears `current_period_end` field to prevent stale renewal date display

- **Account deletion flow fixes** (2026-04-26):
  - Fixed "Account not found" error on multi-practice accounts: `/api/account/request-deletion` now queries all businesses for a user, selects primary location (`is_primary_location=true`) or first one, instead of using `.single()` which fails with multiple rows
  - **Delete confirmation UI redesign**: Buttons now full-width with "Send Confirmation Email" text on single line; "Cancel" button moved underneath (changed from horizontal to vertical flex layout)
  - Delete flow: `POST /api/account/request-deletion` (1hr throttle, generates token, sends email); `POST /api/account/confirm-deletion` (validates token, cancels Stripe subscription, soft-deletes business row, deletes Clerk user)
  - Soft-delete: sets `deleted_at`, clears token, downgrades plan to free/canceled — Clerk deletion is last step (non-fatal if fails)
  - Confirmation landing page: `app/account/confirm-deletion/page.tsx` (public, spinner→success→auto signout+redirect)
  
- **Previous: Account tab in Settings** (2026-04-26): 
  - New "Account" tab at bottom of settings sidebar (orange, separated by divider)
  - Billing section: shows plan name, billing cycle badge, status dot, renewal date; "Manage Subscription" button opens Stripe billing portal in new tab (via existing `/api/stripe/portal`)
  - Danger Zone (orange border): "Delete Account" button → type `DELETE` confirmation → sends branded Resend email with 24h confirmation link → "Check your email" state
  - Migration: `supabase/migrations/20260426_account_deletion.sql` — adds `deletion_token`, `deletion_requested_at`, `deleted_at` to `businesses` table

- **Stripe portal PM fix** (2026-04-26): `verify-subscription` now copies subscription `default_payment_method` to customer's `invoice_settings.default_payment_method` so it shows in billing portal. Root cause: `save_default_payment_method: "on_subscription"` saves to sub only, portal reads customer-level PM.

**Previous completed work** (as of 2026-04-25, pricing revisit + homepage voice demo):
- **Pricing revisit** (2026-04-25): Market research vs. competitors (Arini $300-500/loc, DentalAI Assist $299-$899, Weave $250-500+setup):
  - Pro: minutes 750 → **1,000/mo** (≈333 calls). Price unchanged ($249/$309).
  - Growth: no change ($449/$559, 2,000 min).
  - Multi: annual $849 → **$1,049/mo**, monthly $1,049 → **$1,299/mo**, minutes 750/loc (3,750) → **1,000/loc (5,000)**. Description: "$210/location vs. $249 buying Pro plans individually."
  - Files changed: `lib/plans.ts`, `lib/minute-enforcement.ts`, `app/pricing/page.tsx`
  - **Stripe action required**: Create new Multi price IDs at $1,049/mo annual + $1,299/mo monthly; replace old $849/$1,049 IDs in `.env`

- **Homepage voice demo** (2026-04-25):
  - New `components/VoiceCard.tsx`: slim play/preview card (h-[96px]), waveform animation on preview, audio from `/public/voices/{key}.mp3`
  - `components/AudioDemo.tsx`: refactored from scenario-based player to 4-voice grid using VoiceCard (Sarah, Emma, James, Marcus)
  - `public/voices/`: 4 mp3 files added (sarah, emma, james, marcus)

- **Voice Selector Feature** (2026-04-24):
  - Replaced Acoustic Tone selector with 4 voice options: Sarah (warm & friendly), Emma (clinical & precise), James (professional & efficient), Marcus (warm & approachable)
  - Voice card UI: horizontal layout with [Play button] [Name/Gender/Tone] [Active selection badge], no card enlargement on selection
  - Preview functionality: waveform animation component (28 bars with gradient blue background, varying heights, staggered animation durations 0.5s-1.0s), audio playback with Auto-stop at 15s, "Stop" button appears during preview
  - Layout fixes: added `overflow-y-auto` to main SettingsForm content area, removed `overflow-hidden` from individual voice cards to prevent clipping when preview waveform appears
  - Custom animations: added `.animate-waveform` (height oscillation via CSS variables `--wave-min`, `--wave-max`) to `app/globals.css`

- **Dashboard & Settings UI overhaul** (2026-04-24): 
  - Dashboard cards: unified number styling (`font-black` + `tracking-tight`), added floating hover animations (`hover:-translate-y-1 hover:shadow-md transition-all duration-200`) to all cards (DashboardStats, StatWidget, MinuteUsageCard, LocationCard, CTA cards, InboxSection, AggregatedInboxSection, ChartPanel, Recent Activity, SetupChecklist)
  - Settings page header alignment: changed grid from `items-end` to `items-start` in AI Personality tab so Agent Name + Custom Greeting labels align vertically
  - Patient FAQ header: updated to match field label style (`text-sm font-bold text-gray-700`)
  - Voice Calling tab: Accept Calls toggle redesigned to premium brand-blue style (w-14 h-7, bg-blue-600, smooth 200ms transition, "LIVE/OFF" text label with soft-flicker animation when active), Smart Handoffs checkboxes changed to blue (`accent-blue-600`)
  - Integrations tab complete redesign: premium card layout with OpenDental branding block (black OD logo), capability badges, connected/disconnected state indicators, help links
  - Tab reordering: moved Notifications between Do's & Don'ts and Integrations
  - Custom animation: added `.animate-soft-flicker` (opacity: 1→0.6→1 over 1.5s) to `app/globals.css`

**Previous work** (as of 2026-04-24, Multi-Practice dashboard complete):
- **Multi-Practice dashboard + real-time notifications** (2026-04-24): Full multi-location feature for the Multi tier ($849–$1,049/mo):
  - DB migration: `organizations` table (billing anchor), `organization_id`/`is_primary_location`/`location_display_name` on `businesses`, `location_name` on `conversations` (denormalized for Realtime payloads)
  - `lib/organizations.ts`: full org data access layer — `getOrganization`, `getOrgLocations`, `createLocation` (max-5 guard), `deleteLocation` (blocks primary), `promoteToOrganization` (idempotent), `verifyLocationOwnership` (parallelized with Promise.all)
  - `lib/inbox-utils.ts`: canonical shared utilities — `InboxItem` type, `timeAgo`, `callerLabel`, `sortByPriority`, `getLocationColor` (module-level Map cache for stable color assignment)
  - Aggregated dashboard: `?location=all` shows `AggregatedInboxSection` (cross-location Realtime) + `LocationCard` grid; `?location={id}` shows per-location single view
  - `LocationSwitcher`: URL-driven (`?location=`) — server components fetch correct data before hydration, no React context needed
  - Real-time notifications: `NotificationBell` (badge + `org-bell-{orgId}` Realtime channel), `NotificationPanel` (slide-out), `NotificationToast` (fixed overlay for emergencies), `NotificationContext` (6s auto-dismiss)
  - API: `GET/POST /api/locations`, `DELETE /api/locations/[id]`; inbox route uses `.in("business_id", locationIds)` for cross-location queries; settings route accepts `businessId` override via `verifyLocationOwnership`
  - Stripe webhook: auto-calls `promoteToOrganization` on multi upgrade; syncs plan_status to both `businesses` and `organizations` on subscription changes
  - Location management page at `/dashboard/locations` (list, add, delete with primary protection)
  - All paths gated behind `plan === "multi"` — zero regressions for Basic/Pro/Growth

- **Full Stripe payment flow hardened**: 6 fixes across the checkout pipeline:
- **Full Stripe payment flow hardened**: 6 fixes across the checkout pipeline:
  1. `NEXT_PUBLIC_APP_URL` missing → Stripe rejected success/cancel URLs (no scheme)
  2. Clerk session lost after Stripe cross-domain redirect → created public `/payment-success` page that waits for Clerk client-side, then verifies session and routes to dashboard
  3. `verify-session` was Clerk-gated → removed auth, route made public; businessId in session metadata is sufficient proof
  4. `payment-success` ignored verify-session failures → now shows retry/error UI if activation fails
  5. Stale live-mode Stripe IDs in Supabase → checkout now validates customer/subscription IDs against current Stripe mode, auto-resets if wrong mode
  6. `UpgradeButton` silently swallowed errors → now shows visible error, redirects to /sign-in (401) or /onboarding (404)
- **PlanBadge** component in dashboard nav: shows active plan tier with "Trial" label, Upgrade link for free users
- **Checkout bug fix**: Added error handling to `/api/stripe/checkout` endpoint — was returning generic 500 without logging actual errors
- **Custom Checkout Page** (2026-04-24): Built branded two-column `/checkout?plan=X&billing=Y` page using Stripe Payment Element:
  - Left: Plan summary (dark gray-900 card, features, trial callout, pricing)
  - Right: Stripe Payment Element (embedded card form, brand-blue CTA button)
  - Flow: logged-in free users on pricing → `/checkout` → creates SetupIntent → confirms payment → `/payment-success?subscription_id=` → activates plan
  - New endpoints: `POST /api/stripe/create-subscription-intent` (creates subscription with trial, returns clientSecret), `POST /api/stripe/verify-subscription` (public, activates plan in DB)
  - Replaced hosted Stripe Checkout redirect with in-app flow for brand continuity
  - Code quality fixes: URL encoding bug in auth redirect, AbortController for fetch, parallel auth() calls, merged state objects, extracted duplicate CTA logic
- **PRICING OVERHAUL (7 of 8 tasks)**: Complete redesign from Free/$69/$219/$749 to Basic/$65-79 | Pro/$249-309 | Growth/$449-559 | Multi/$849-1049 with annual/monthly toggle
  - Pricing page refactor with 4 tiers, expanded feature lists (8+ per tier), new hero "Transparent pricing. No contracts."
  - Database migration: added `billing_cycle`, `minutes_used_this_period`, `minutes_limit_monthly` columns
  - Stripe integration: PRICE_IDS now supports 4 plans × 2 billing cycles (8 total); checkout accepts billingCycle param
  - Voice minute enforcement: quota checks at call init, MinuteUsageCard dashboard component
  - Homepage copy updated: metadata, CTA, schema pricing ($65–$1,049 range)
  - Comparison table vs Dentina.ai + DentalAI Assist; "Save 2 months free" framing on annual
  - Created `PRICING_ROLLOUT.md` (implementation guide) + `ACTION_LIST.md` (next steps)

**Action required before testing**:
- Supabase: Apply migration `20260426_plan_status_on_businesses.sql` in Supabase SQL editor (adds plan_status field to businesses table + sets default values for old accounts)

**Blocking go-live**:
- Stripe: Create 2 new Multi price IDs ($1,049/mo annual + $1,299/mo monthly) in Stripe dashboard → update `.env`. All other 6 price IDs already set.
- Supabase migration (account deletion): already applied to linked project ✅

**Active blockers**:
- Anthropic credits exhausted; using Groq LLM (`llama-3.3-70b-versatile`)
- Twilio trial watermark (needs paid upgrade)
- Voice booking validation needs ngrok tunnel for local testing
- SocialProof component gated until real customer reviews collected
- ElevenLabs Creator plan ($22/mo): Sufficient for 1-2 Pro customers; upgrade strategy needed as customer base grows

**Next priorities**:
- ✋ Update Multi Stripe price IDs ($1,049 annual + $1,299 monthly) in Stripe dashboard + `.env` before launch
- Item 23 (voice UX): Microphone permission UI + end-to-end Open Dental booking validation
- Item 26: Enable social proof (pending customer reviews)
- Multi-Practice: manual QA pass (single-practice regression + multi full flow) before launching Multi tier sales

**Quick references**:
- Test guide: `TEST_AUTOMATION.md` (phase-based testing strategy)
- Database migrations: `supabase/migrations/` (Inbox, AI Features, notifications)
- Memory index: `.claude/projects/C--Users-Daryll-SalvaAI/memory/MEMORY.md` (project history + architectural decisions)
