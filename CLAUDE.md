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

**Latest completed work** (as of 2026-04-24, Multi-Practice dashboard complete):
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

**Blocking go-live**:
- Stripe price IDs: need to create 8 IDs in Stripe dashboard + add to `.env`
- Supabase migration: run `supabase migration up` (20260424_multi_practice.sql already applied to linked project)

**Active blockers**:
- Anthropic credits exhausted; using Groq LLM (`llama-3.3-70b-versatile`)
- Twilio trial watermark (needs paid upgrade)
- Voice booking validation needs ngrok tunnel for local testing
- SocialProof component gated until real customer reviews collected
- ElevenLabs Creator plan ($22/mo): Sufficient for 1-2 Pro customers; upgrade strategy needed as customer base grows

**Next priorities**:
- ✋ **PAUSE**: Complete ACTION_LIST.md steps before building new features (Stripe setup, migration, testing)
- Voice selector dropdown in Settings (use multiple pre-built ElevenLabs voices) — tie to Pro plan
- Item 23 (voice UX): Microphone permission UI + end-to-end Open Dental booking validation
- Item 26: Enable social proof (pending customer reviews)
- Multi-Practice: manual QA pass (single-practice regression + multi full flow) before launching Multi tier sales

**Quick references**:
- Test guide: `TEST_AUTOMATION.md` (phase-based testing strategy)
- Database migrations: `supabase/migrations/` (Inbox, AI Features, notifications)
- Memory index: `.claude/projects/C--Users-Daryll-SalvaAI/memory/MEMORY.md` (project history + architectural decisions)
