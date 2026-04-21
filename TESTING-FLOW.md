# SalvaAI QA Test Flow (Efficient)

**Last updated:** 2026-04-21  
**Tester:** Daryll  
**Environment:** Vercel (prod) + Railway (voice server) + Supabase

---

## How to use this document

- Follow the flows top-to-bottom in order
- Each flow is designed to test multiple features in a single session (e.g., one chat conversation tests 5+ scenarios)
- Check off items as you go
- Leave comments in the `> Notes:` lines
- Items marked 🤖 have been verified by Claude from the codebase
- Items marked ⚠️ are known risks or inverted logic — pay extra attention

---

---

## PHASE 1 — Setup & Configuration (Do first)

These tests prepare the environment for all downstream tests. **Do these once at the beginning of your QA session.**

### 1.1 Configure Business Profile

- [ ] Go to Settings → Profile tab
  - [ ] Update business name → save → reload page → name persists
  - [ ] Update timezone → save → reload page → timezone persists
  - [ ] Verify business hours display correctly for all 7 days
  > Notes:

### 1.2 Configure Services

- [ ] Go to Settings → Services tab
  - [ ] Add a new service with name + duration → save → service appears in list
  - [ ] Try service with 0 or negative duration → verify validation (error or ignored)
  - [ ] Remove a service → save → service is gone on reload
  > Notes:

### 1.3 Configure AI Identity & Prompt

- [ ] Go to Settings → AI Config tab
  - [ ] Update AI name → save → note the name for voice testing later
  - [ ] Update custom prompt → save and note for later verification
  - [ ] Add 2 FAQs (e.g., "What's your address?", "Do you accept insurance?") → save
  > Notes:

### 1.4 Configure AI Features

- [ ] Go to Settings → Features tab
  - [ ] Enable: `instant_booking`, `emergency_detection`, `pricing_transparency`, `insurance_questions`
  - [ ] Note the `after_hours_handling` toggle state (⚠️ toggle is inverted)
  - [ ] Save
  > Notes:

### 1.5 Configure Notifications (Optional — needed for inbox testing)

- [ ] Go to Settings → Notifications tab
  - [ ] Enable Emergency Alerts → set SMS number
  - [ ] Enable Booking Notifications → set email
  - [ ] Enable Callback Notifications → set contact
  - [ ] Save
  > Notes:

### 1.6 Configure Voice Settings (Optional — if testing voice)

- [ ] Go to Settings → Voice Settings tab
  - [ ] Set voice tone to "Professional"
  - [ ] Configure emergency callback number
  - [ ] Ensure "Accept Calls" is ON
  - [ ] Save
  > Notes:

### 1.7 Configure Do's & Don'ts (Optional — for advanced testing)

- [ ] Go to Settings → Do's & Don'ts tab
  - [ ] Add a "Do" rule (e.g., "Always mention the free consultation")
  - [ ] Add a "Don't" rule (e.g., "Don't discuss competitors")
  - [ ] Save
  > Notes:

### 1.8 Test Open Dental Connection (Only if booking flow will be tested)

- [ ] Go to Settings → Integrations tab
  - [ ] Enter Open Dental credentials
  - [ ] Click "Test Connection" → verify success or error
  - [ ] Change booking window (3 / 7 / 14 days)
  - [ ] Save
  > Notes:

---

---

## PHASE 2 — Chat API Testing (Single Conversation Flow)

**One chat session can test 6+ scenarios without repetition.** Use the demo widget on the homepage or send messages to your demo business.

### 2.1 Open the chat widget

- [ ] Navigate to homepage (or open `/api/widget/embed?id=[businessId]` in a test HTML file)
- [ ] Widget appears at bottom-right
- [ ] Click to open chat
  > Notes:

### 2.2 Conversation flow (Sequential messages in one chat)

Send these messages **in order** within the same conversation:

#### Message 1: Services question (tests AI Config)
- [ ] Send: "What services do you offer?"
- [ ] Verify: AI lists the services you added in Phase 1
  > Notes:

#### Message 2: Hours question (tests business hours)
- [ ] Send: "What are your hours?"
- [ ] Verify: AI responds with correct hours from your profile
  > Notes:

#### Message 3: FAQ question (tests FAQ integration)
- [ ] Send one of your FAQ questions (e.g., "What's your address?")
- [ ] Verify: AI responds with the FAQ answer you configured
  > Notes:

#### Message 4: Emergency language (tests urgency classification + Do's & Don'ts if enabled)
- [ ] Send: "I have severe tooth pain and swelling"
- [ ] Verify in Supabase: 
  - [ ] Conversation marked `urgency=emergency`
  - [ ] Inbox will show this under Emergencies
  - [ ] If Do rule enabled: AI mentions the extra behavior (e.g., consultation)
  > Notes:

#### Message 5: Booking request (tests booking classification)
- [ ] Send: "I'd like to book an appointment"
- [ ] Verify in Supabase: `appointment_requested=true`
  - [ ] This will appear in Inbox under Pending Bookings
  > Notes:

#### Message 6: Callback request (tests callback classification)
- [ ] Send: "Can you have someone call me back?"
- [ ] Verify in Supabase: `callback_requested=true`
  - [ ] This will appear in Inbox under Callbacks
  > Notes:

#### Message 7: Routine question (tests that routine conversations don't appear in inbox)
- [ ] Send: "Do you do cleanings?"
- [ ] Verify in Supabase: `urgency=routine`, should NOT appear in inbox
  > Notes:

### 2.3 Security & Access Control (New chat window)

- [ ] Open a new chat window with the same business
  - [ ] Note the new `conversationId` from browser DevTools or Supabase
- [ ] In the database, manually note a `conversationId` from a **different** business
- [ ] Try to access that conversation via API (simulate cross-business access):
  - [ ] `curl "https://[domain]/api/chat" -d '{"businessId": "[your-business]", "conversationId": "[OTHER-BUSINESS-ID]"}'`
  - [ ] Verify: API rejects or creates a new conversation, does NOT return the other business's history
  > Notes:

### 2.4 Plan limits (Free plan only)

If your business is on the **free plan (50-interaction limit)**:

- [ ] Send 49 messages total (you've already sent ~7, so send ~42 more)
- [ ] Send the 50th message → confirm it succeeds
- [ ] Send the 51st message → confirm it's blocked with a limit message
- [ ] Verify in Supabase: `interaction_count` = 50
  > Notes:

### 2.5 Rate limiting

- [ ] From the same IP, send 21 messages as fast as possible in new conversations
- [ ] 21st message should return a rate-limit error (20 msgs/hour per IP)
  > Notes:

### 2.6 Input edge cases

- [ ] Send a message with only emoji (e.g., "😷")
  - [ ] Verify: AI handles it without crashing
- [ ] Send a message with HTML/script tags (e.g., "<script>alert('x')</script>")
  - [ ] Verify: Not rendered as HTML in the UI
- [ ] Send an empty message → verify graceful error
  > Notes:

---

---

## PHASE 3 — Voice Call Testing (Single Call Flow)

**One phone call can test 8+ voice scenarios.** Call your Twilio number and follow this conversation.

> ⚠️ Requires Twilio number + Railway server running. Skip if not available.

### 3.1 Call setup & greeting

- [ ] Call your Twilio number
- [ ] Verify:
  - [ ] Call connects and AI answers
  - [ ] AI uses the configured `ai_name` from Phase 1
  - [ ] AI uses your practice name
  - [ ] Conversation record created in Supabase
  > Notes:

### 3.2 Sequential voice conversation (One continuous call)

#### Ask 1: Hours (tests business hours)
- [ ] Ask: "What are your hours?"
- [ ] Verify: AI gives correct hours
- [ ] Audio quality OK? (no robotic clipping at start)
  > Notes:

#### Ask 2: Services (tests service info)
- [ ] Ask: "How much is a cleaning?"
- [ ] Verify: AI responds with service info or pricing (based on `pricing_transparency` toggle)
  > Notes:

#### Ask 3: Emergency services
- [ ] Ask: "What do I do if this is an emergency?"
- [ ] Verify: AI acknowledges urgency and provides emergency contact/guidance
  > Notes:

#### Ask 4: Off-topic (tests deflection)
- [ ] Ask: "Who won the World Cup?"
- [ ] Verify: AI deflects appropriately back to dental topics
  > Notes:

#### Ask 5: Barge-in test (caller interrupts)
- [ ] Wait for AI to finish speaking something long
- [ ] Interrupt mid-sentence with: "Actually, I wanted to ask about..."
- [ ] Verify: AI stops talking and responds to what you just said
  > Notes:

#### Ask 6: Check cough filter (barge-in debounce)
- [ ] Wait for AI to speak again
- [ ] Cough or make a short noise (1-2 words max)
- [ ] Verify: AI does NOT stop (150ms debounce + 2-word confirmation should filter this)
  > Notes:

#### Ask 7: Audio quality (long response)
- [ ] Ask: "Tell me everything about your services"
- [ ] Verify: 
  - [ ] Long response (3+ sentences) plays smoothly
  - [ ] No noticeable lag between sentences
  - [ ] TTS sounds natural (sentence buffering working)
  > Notes:

#### Ask 8: Silence timeout (test hangup)
- [ ] Say: "OK, I'm going to stay silent now" or similar
- [ ] Stay completely silent for 20+ seconds
- [ ] Verify: AI says farewell and call ends
  > Notes:

#### (Optional) Ask 9: After-hours handling
- [ ] If calling outside business hours:
  - [ ] Verify: If toggle is OFF, AI mentions it's after hours
  - [ ] Verify: If toggle is ON (⚠️ inverted), AI treats it as normal
  > Notes:

### 3.3 Call end & summary

- [ ] Call ends or you hang up
- [ ] Verify in Supabase:
  - [ ] Conversation record has a `summary` field filled
  - [ ] `channel=voice`
  > Notes:

---

---

## PHASE 4 — Voice Booking Flow (Optional, needs ngrok)

**One booking call tests the entire flow from intent to confirmation.**

> ⚠️ Requires ngrok tunnel to Open Dental running. Skip and mark blocked if not available.

### 4.1 Initiate booking intent

- [ ] Call in and say: "I'd like to make an appointment"
- [ ] Verify: AI shifts into booking collection mode
- [ ] Verify in Supabase: `appointment_requested=true`
  > Notes:

### 4.2 Patient data collection (Sequential in same call)

- [ ] AI asks for name → provide: "John Smith"
- [ ] AI asks for DOB → provide: "January 15 1990" (non-ISO format)
- [ ] AI asks for phone → provide: "+1 415 555 0123" (international format)
- [ ] AI asks for reason → provide: "General cleaning"
- [ ] AI asks for provider preference → provide: "Any available" or a provider name
  > Notes:

### 4.3 Availability check

- [ ] AI fetches available slots from Open Dental
- [ ] Verify:
  - [ ] If slots exist: AI offers 2–3 options (not overwhelming)
  - [ ] If no slots: AI offers callback or waitlist
  > Notes:

### 4.4 Slot selection & confirmation

- [ ] Say yes to first offered slot
- [ ] Verify in Supabase: Appointment created with:
  - [ ] If `instant_booking=true`: `AptStatus=1` (autonomous)
  - [ ] If `instant_booking=false`: `AptStatus=6` (pending, front desk confirms)
- [ ] Check Open Dental directly: appointment visible
  > Notes:

### 4.5 Patient lookup (New call, existing patient)

- [ ] Call again
- [ ] Say: "I'd like to book an appointment"
- [ ] AI asks for name → provide: "John Smith" (same as before)
- [ ] AI asks for DOB → provide: "January 15 1990"
- [ ] Verify: AI finds existing patient record and continues booking
  > Notes:

---

---

## PHASE 5 — Dashboard & Notifications Testing

**Run these tests after completing PHASE 2 & 3 (chat and voice tests).**

### 5.1 Stats accuracy

- [ ] Go to Dashboard
- [ ] Verify stats match your test activity:
  - [ ] Total Interactions: count all chat + voice conversations
  - [ ] Phone Calls: count only voice conversations
  - [ ] Chats: count only chat conversations
  - [ ] Appointments Booked: count conversations with `appointment_requested=true`
  > Notes:

### 5.2 Date range filters

- [ ] Test each filter:
  - [ ] Today → only today's conversations
  - [ ] This Week → only this week's
  - [ ] This Month → verify timezone handling
  - [ ] All Time → all conversations
  > Notes:

### 5.3 Charts

- [ ] Verify charts render with data (not blank):
  - [ ] Call volume chart shows data points
  - [ ] Urgency breakdown shows proportions
  - [ ] Peak contact hours heatmap renders
  > Notes:

### 5.4 Inbox section (if you have emergency/booking/callback conversations)

- [ ] Emergencies tab:
  - [ ] Shows conversations with `urgency=emergency`
  - [ ] Does NOT show routine conversations
  > Notes:

- [ ] Pending Bookings tab:
  - [ ] Shows conversations with `appointment_requested=true`
  > Notes:

- [ ] Callbacks tab:
  - [ ] Shows conversations with `callback_requested=true`
  > Notes:

- [ ] Tab auto-rotation:
  - [ ] Tabs rotate every 10 seconds automatically
  - [ ] Clicking a tab stops auto-rotation
  > Notes:

- [ ] Resolve action:
  - [ ] Click "Resolve" on an emergency conversation
  - [ ] Verify: It disappears from Emergencies tab
  - [ ] Verify in Supabase: `resolved_at` is set
  > Notes:

### 5.5 Real-time updates

- [ ] Keep dashboard open in one browser window
- [ ] Send a new chat message from a different window
- [ ] Within 30 seconds:
  - [ ] Inbox updates to show the new conversation
  - [ ] Stats increment
  > Notes:

### 5.6 Notifications (if configured in Phase 1.5)

- [ ] Send an emergency chat message
  - [ ] Verify: SMS notification received (if emergency SMS enabled)
- [ ] Send a booking request chat message
  - [ ] Verify: Email notification received (if booking email enabled)
- [ ] Trigger a callback request chat message
  - [ ] Verify: Callback notification received (if enabled)
  > Notes:

---

---

## PHASE 6 — Auth & Onboarding (One-time test)

**Only needed if testing a new user or fresh sign-up flow.**

### 6.1 Sign-up → Onboarding → Dashboard

- [ ] New user signs up via Clerk
- [ ] Redirected to `/onboarding`
- [ ] Fill onboarding form → submit
- [ ] Verify:
  - [ ] Business created in Supabase
  - [ ] Redirected to `/dashboard`
- [ ] Submit form twice (accidental double-click) → verify no duplicate business
  > Notes:

### 6.2 Protected routes

- [ ] Try to access `/dashboard` without auth → redirected to sign-in
- [ ] Try to access `/settings` without auth → redirected to sign-in
- [ ] Verify public routes work without auth:
  - [ ] `/` (homepage)
  - [ ] `/pricing`
  - [ ] `/how-it-works`
  - [ ] `/faq`
  - [ ] `/privacy`
  > Notes:

---

---

## PHASE 7 — Marketing Pages & Widget Testing

**Test homepage and public pages. No sign-in required.**

### 7.1 Homepage

- [ ] Verify all nav links work: How it works, Pricing, FAQ
- [ ] Verify CTAs:
  - [ ] "Get started free" → sign-up
  - [ ] "How it works" orange CTA → `/how-it-works`
- [ ] CustomizabilityDemo:
  - [ ] Only one toggle active at a time (radio behavior)
  - [ ] Chat preview updates correctly per toggle
- [ ] AudioDemo: audio plays without errors
- [ ] Floating chat widget: appears at bottom-right
- [ ] Click widget → chat opens and works with `NEXT_PUBLIC_DEMO_BUSINESS_ID`
  > Notes:

### 7.2 /how-it-works page

- [ ] Settings section auto-rotates through all 8 tabs every 4 seconds
- [ ] Click a tab → auto-rotation stops
- [ ] AI Features section: radio-button behavior (one at a time)
- [ ] Do's & Don'ts section: items animate in on scroll
- [ ] All CTAs link to sign-up
  > Notes:

### 7.3 /pricing page

- [ ] All 4 plans visible: Free, Basic, Pro, Multi
- [ ] "Get started free" on Free plan → sign-up
- [ ] "Start 14-day free trial" on paid plans → Stripe Checkout
- [ ] FAQPage JSON-LD schema in page source (right-click → View Page Source, search for "FAQPage")
  > Notes:

### 7.4 /faq page

- [ ] All FAQs load without layout issues
- [ ] Page publicly accessible without auth
  > Notes:

### 7.5 /privacy, /terms, /baa pages

- [ ] Load without auth
- [ ] Hero sections render with animated glow
  > Notes:

### 7.6 Embed code generation

- [ ] Navigate to `/api/widget/embed?id=[businessId]`
- [ ] JavaScript embed code returned
- [ ] Copy code → paste into plain HTML file
- [ ] Widget loads and works on external site
  > Notes:

---

---

## PHASE 8 — Billing & Stripe (Optional)

**Only test if upgrading to paid plan.**

### 8.1 Upgrade flow (new customer)

- [ ] Click upgrade on `/pricing` page
- [ ] Stripe Checkout loads
- [ ] Enter test card: `4242 4242 4242 4242`, any exp/CVC
- [ ] Payment succeeds
- [ ] Verify:
  - [ ] Plan updated in Supabase (`businesses.plan` column)
  - [ ] Plan limits updated (e.g., Basic gets 500 interactions)
  > Notes:

### 8.2 Webhook verification

- [ ] Check Stripe webhook logs (Stripe Dashboard → Developers → Webhooks)
- [ ] Verify events fired:
  - [ ] `checkout.session.completed` → plan saved
  - [ ] Fire same webhook twice → second is idempotent (no-op)
  > Notes:

---

---

## PHASE 9 — Edge Cases & Stress Tests

**These are optional advanced tests.**

### 9.1 Concurrent access

- [ ] Open two browser tabs with the same chat widget
- [ ] Send messages simultaneously
- [ ] Verify: Two separate conversations created
  > Notes:

- [ ] Have two people call the Twilio number simultaneously
- [ ] Verify: Both calls handled independently
  > Notes:

### 9.2 Network failures

- [ ] Kill Railway server mid-call
- [ ] Verify: Twilio shows error, call ends gracefully (no hang/silent drop)
  > Notes:

- [ ] (Simulated) Supabase down → send chat message
- [ ] Verify: API returns 500 (graceful failure, not silent data loss)
  > Notes:

### 9.3 Mobile / browser compatibility

- [ ] Chat widget on iOS Safari → opens, functions correctly
- [ ] Chat widget on Android Chrome → opens, functions correctly
- [ ] Dashboard on mobile → readable, all tabs accessible
- [ ] Settings form on mobile → all tabs accessible, inputs usable
  > Notes:

---

---

## PHASE 10 — Environment Verification (Pre-Launch)

**One final check before launch.**

### 10.1 Vercel environment variables

- [ ] `NEXT_PUBLIC_DEMO_BUSINESS_ID` — set and points to real demo business
- [ ] `GROQ_API_KEY` — set and valid
- [ ] `ANTHROPIC_API_KEY` — set (fallback)
- [ ] `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — set (test mode)
- [ ] `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — set
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — set
- [ ] `SUPABASE_URL` + `SUPABASE_ANON_KEY` — set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — set
  > Notes:

### 10.2 Railway environment variables

- [ ] `GROQ_API_KEY` — same as Vercel
- [ ] `ANTHROPIC_API_KEY` — same as Vercel
- [ ] `DEEPGRAM_API_KEY` — set and valid
- [ ] `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_PHONE_NUMBER` — set
- [ ] `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — set
- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — set
- [ ] `OPENDENTAL_DEVELOPER_KEY` — set (if booking enabled)
- [ ] `RAILWAY_URL` — set to correct public URL
  > Notes:

### 10.3 Supabase migrations applied

- [ ] `20260418_ai_dos_donts.sql` — `ai_dos`, `ai_donts` columns exist
- [ ] `20260419_ai_features.sql` — `ai_features JSONB` column exists
- [ ] `20260419_inbox_notifications.sql` — `resolved_at`, notification config columns exist
  > Notes:

---

---

## Sign-off

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Setup | | |
| Phase 2: Chat | | |
| Phase 3: Voice | | |
| Phase 4: Booking | | |
| Phase 5: Dashboard | | |
| Phase 6: Auth | | |
| Phase 7: Marketing Pages | | |
| Phase 8: Billing | | |
| Phase 9: Edge Cases | | |
| Phase 10: Env Vars | | |

---

*SalvaAI QA Flow · OmnifySolutions · 2026*
