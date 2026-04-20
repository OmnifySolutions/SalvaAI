# SalvaAI QA Test Document

**Last updated:** 2026-04-21  
**Tester:** Daryll  
**Environment:** Vercel (prod) + Railway (voice server) + Supabase

---

## How to use this document

- Check off each item as you test it
- Leave comments in the `> Notes:` lines below each item
- Items marked 🤖 have been verified by Claude from the codebase side
- Items marked ⚠️ are known risks or inverted logic — pay extra attention

---

---

## SECTION 1 — Chat API (`/api/chat`)

### 1.1 Basic message flow

- [ ] Send a normal message to the demo business widget → AI responds correctly
  > Notes:

- [ ] Send a message with a question about services → AI answers from configured services list
  > Notes:

- [ ] Send a message asking about hours → AI answers from configured business hours
  > Notes:

- [ ] Send a message asking a custom FAQ question → AI uses the FAQ content
  > Notes:

---

### 1.2 Plan limits & rate limiting

- [ ] **Free plan (50 interaction limit):** Send 50 messages to a free-plan business → 51st message is blocked with a limit message
  > Notes:

- [ ] **Rate limit (20 msgs/hour per IP):** Send 21 messages rapidly → 21st message returns a rate-limit error
  > Notes:

- [ ] **Basic plan (500/month):** Confirm the counter increments per message (check `interaction_count` in Supabase)
  > Notes:

---

### 1.3 Security & access control

- 🤖 `/api/chat` has no Clerk auth — it's intentionally public (widget on patient-facing site). Rate limiting + businessId ownership check is the protection layer.
- [ ] Send a message with a known `businessId` + a `conversationId` from a **different** business → confirm API rejects or creates a new conversation (does not return the other business's history)
  > Notes:

- [ ] Try sending a message with an unknown/fake `businessId` → should return 404 or empty AI response
  > Notes:

- [ ] Send a message > 1000 characters → confirm it's handled (truncated or rejected, not a crash)
  > Notes:

- [ ] Send an empty or whitespace-only message → should not crash, returns a graceful error
  > Notes:

---

### 1.4 LLM fallback chain

- 🤖 Chain is: Groq → Anthropic → mock response
- [ ] Temporarily set an invalid `GROQ_API_KEY` in Vercel → send a message → confirm it falls back to Anthropic (check server logs)
  > Notes:

- [ ] With both LLMs broken (test locally), confirm mock fallback response is returned
  > Notes:

---

### 1.5 Classification (urgency, booking, callback)

- [ ] Send "I have severe tooth pain and swelling" → conversation marked `urgency=emergency`, inbox shows it under Emergencies
  > Notes:

- [ ] Send "I'd like to book an appointment" → `appointment_requested=true`, inbox shows under Pending Bookings
  > Notes:

- [ ] Send "Can someone call me back?" → `callback_requested=true`, inbox shows under Callbacks
  > Notes:

- [ ] Send "I need a cleaning" (routine) → `urgency=routine`, does not appear in inbox
  > Notes:

- [ ] Send "My tooth fell out, I'm in pain" → `urgency=emergency`, emergency notification fires (check SMS/email)
  > Notes:

---

### 1.6 Do's & Don'ts injection

- [ ] Configure a "Don't discuss competitors" rule in settings → send "What about SmileDirectClub?" → AI refuses or deflects
  > Notes:

- [ ] Configure a "Do always offer a free consultation" rule → send any question → AI mentions free consultation
  > Notes:

---

---

## SECTION 2 — Voice Calls (Railway Server)

### 2.1 Incoming call setup

- [ ] Call your Twilio number → call connects and AI answers with greeting
  > Notes:

- [ ] AI introduces itself using the configured `ai_name` (from settings)
  > Notes:

- [ ] AI uses the correct practice name
  > Notes:

- [ ] Conversation record is created in Supabase on call start
  > Notes:

---

### 2.2 Basic conversation flow

- [ ] Ask about hours → AI gives correct hours from configuration
  > Notes:

- [ ] Ask about a specific service (e.g., "How much is a cleaning?") → AI responds with info or pricing transparency if enabled
  > Notes:

- [ ] Ask about emergency services → AI acknowledges urgency and provides emergency contact if configured
  > Notes:

- [ ] Ask an off-topic question (e.g., sports) → AI deflects appropriately
  > Notes:

---

### 2.3 Barge-in (caller interrupts AI)

- [ ] Wait for AI to start speaking → interrupt mid-sentence → AI stops and listens to you
  > Notes:

- [ ] Cough or make a short noise during AI speech → AI should **not** stop (150ms debounce + 2-word confirmation should filter this)
  > Notes:

- [ ] Interrupt with a complete phrase → AI responds to what you said, not the previous answer
  > Notes:

---

### 2.4 Silence timeout

- [ ] Stay completely silent for 20 seconds after the AI speaks → AI says farewell and hangs up
  > Notes:

- [ ] Stay silent for 15 seconds, then speak → AI continues the conversation (doesn't hang up early)
  > Notes:

---

### 2.5 After-hours handling

- ⚠️ The `after_hours_handling` toggle is **inverted**: enabling it in Settings **disables** the after-hours instruction in the prompt. Verify the UX matches expectation.
- [ ] Call outside of business hours with toggle OFF → AI acknowledges it's after hours, offers to take a message
  > Notes:

- [ ] Call outside of business hours with toggle ON → AI handles the call without mentioning after-hours
  > Notes:

- [ ] Call during business hours → AI treats it as a normal call regardless of toggle state
  > Notes:

---

### 2.6 Audio quality

- [ ] AI voice is clear and natural-sounding (no robotic clipping at start of sentences)
  > Notes:

- [ ] Long AI responses (3+ sentences) don't cause noticeable lag between sentences
  > Notes:

- [ ] Short AI responses (1 sentence) play cleanly without gaps
  > Notes:

---

### 2.7 Summary & notifications

- [ ] End a call → summary is generated and stored in the conversation record in Supabase
  > Notes:

- [ ] Emergency detected during call → SMS notification sent to configured emergency contact
  > Notes:

- [ ] Booking requested during call → booking notification sent to configured contact
  > Notes:

---

---

## SECTION 3 — Voice Booking Flow (Open Dental)

> ⚠️ Requires ngrok tunnel to Open Dental running. Skip and mark blocked if not set up.

### 3.1 Booking intent detection

- [ ] Say "I'd like to make an appointment" → AI shifts into booking collection mode
  > Notes:

- [ ] Say "Can I book a cleaning?" → AI enters booking flow
  > Notes:

- [ ] Say "I'm just checking hours" → AI does NOT enter booking flow
  > Notes:

---

### 3.2 Patient data collection

- [ ] AI asks for: full name, phone number, date of birth, reason for visit, provider preference
  > Notes:

- [ ] Say an international phone number format → AI handles it or flags it
  > Notes:

- [ ] Say date of birth in "month/day/year" format (not ISO) → AI captures it correctly
  > Notes:

- [ ] Skip a field (say "I don't know") → AI gracefully handles and continues or re-asks
  > Notes:

---

### 3.3 Slot availability check

- [ ] AI fetches available slots from Open Dental and reads them back
  > Notes:

- [ ] Multiple slots available → AI offers 2–3 options (not all at once)
  > Notes:

- [ ] No slots available → AI offers to add to waitlist or take a callback
  > Notes:

---

### 3.4 Appointment confirmation

- [ ] Say yes to a slot → AI confirms and creates the appointment in Open Dental
  > Notes:

- [ ] Say no to first slot → AI offers the next available
  > Notes:

- [ ] Confirm appointment → check Open Dental that appointment was created (AptStatus=1 for autonomous, 6 for pending)
  > Notes:

- [ ] **Instant booking toggle ON** → appointment is created autonomously (AptStatus=1)
  > Notes:

- [ ] **Instant booking toggle OFF** → appointment is created as pending (AptStatus=6), front desk must confirm
  > Notes:

---

### 3.5 Slot race condition

- [ ] Two callers try to book the same slot simultaneously → first one wins, second caller gets a graceful fallback (new slot offered or callback)
  > Notes:

---

### 3.6 Patient not found in Open Dental

- [ ] Call as a new patient with no existing record → AI creates a new patient in Open Dental and books
  > Notes:

- [ ] Call as existing patient with matching name + DOB → AI finds and uses existing record
  > Notes:

---

---

## SECTION 4 — Dashboard

### 4.1 Stats accuracy

- [ ] Total Interactions count matches number of conversations in Supabase for selected time range
  > Notes:

- [ ] Appointments Booked count matches `appointment_requested=true` conversations
  > Notes:

- [ ] Phone Calls count matches `channel=voice` conversations
  > Notes:

- [ ] Chats count matches `channel=chat` conversations
  > Notes:

---

### 4.2 Date range filter

- [ ] Switch between Today / This Week / This Month / Last 3 Months / All Time → stats update correctly
  > Notes:

- [ ] "Today" filter shows only conversations created today (check timezone handling)
  > Notes:

---

### 4.3 Charts

- [ ] Call volume chart renders with data (not blank)
  > Notes:

- [ ] Urgency breakdown chart shows correct proportions
  > Notes:

- [ ] Peak contact hours heatmap renders correctly
  > Notes:

- [ ] All charts show an empty state (not a crash) when there's no data
  > Notes:

---

### 4.4 Inbox

- [ ] Emergencies tab shows conversations with `urgency=emergency` and `resolved_at=null`
  > Notes:

- [ ] Pending Bookings tab shows conversations with `appointment_requested=true` and not confirmed
  > Notes:

- [ ] Callbacks tab shows conversations with `callback_requested=true`
  > Notes:

- [ ] Tabs auto-rotate every 10 seconds
  > Notes:

- [ ] Clicking a tab stops auto-rotation
  > Notes:

- [ ] Resolve button marks conversation as resolved → it disappears from inbox
  > Notes:

- [ ] After resolving, resolved conversation does not reappear on next poll
  > Notes:

- [ ] Empty tab shows "nothing to do here" (not a blank space or spinner)
  > Notes:

---

### 4.5 Real-time updates

- [ ] Leave dashboard open → send a chat message from a different window → inbox updates within 30 seconds (Supabase Realtime or polling fallback)
  > Notes:

---

---

## SECTION 5 — Settings

### 5.1 Profile tab

- [ ] Update business name → save → reload page → name persists
  > Notes:

- [ ] Update timezone → save → reload page → timezone persists
  > Notes:

- [ ] Business hours display correctly for all 7 days
  > Notes:

---

### 5.2 Services tab

- [ ] Add a new service with name + duration → save → service appears in list
  > Notes:

- [ ] Remove a service → save → service is gone on reload
  > Notes:

- [ ] Service with 0 or negative duration minutes → what happens? (expected: validation error or ignored)
  > Notes:

---

### 5.3 AI Config tab

- [ ] Update AI name → save → voice call AI uses new name
  > Notes:

- [ ] Update custom prompt → save → chat response reflects new instructions
  > Notes:

- [ ] Add a FAQ → save → chat AI uses FAQ answer when asked that question
  > Notes:

---

### 5.4 Features tab

- ⚠️ `after_hours_handling` toggle is inverted — verify UX matches what the user expects
- [ ] Enable `instant_booking` → save → booking mode in Supabase changes to `autonomous`
  > Notes:

- [ ] Disable `instant_booking` → save → booking mode changes back to `pending`
  > Notes:

- [ ] Enable `emergency_detection` → make a chat with emergency language → AI flags it as urgent
  > Notes:

- [ ] Enable `pricing_transparency` → ask about costs → AI discusses pricing
  > Notes:

- [ ] Disable `pricing_transparency` → ask about costs → AI declines to discuss specific pricing
  > Notes:

- [ ] Enable `insurance_questions` → ask about insurance → AI answers basic questions
  > Notes:

---

### 5.5 Notifications tab

- [ ] Enable Emergency Alerts → configure SMS number → trigger an emergency chat → SMS is received
  > Notes:

- [ ] Enable Booking Notifications → configure email → trigger a booking request → email is received
  > Notes:

- [ ] Enable Callback Notifications → configure contact → trigger callback request → notification is received
  > Notes:

- [ ] Configure WhatsApp notification number → trigger emergency → WhatsApp message received
  > Notes:

- [ ] Disable all notifications → trigger all 3 event types → confirm no messages sent
  > Notes:

---

### 5.6 Voice Settings tab

- [ ] Change voice tone (Professional / Warm / Clinical) → save → call in → verify tone feels different
  > Notes:

- [ ] Configure emergency callback number → say "this is an emergency" → AI reads back the emergency number
  > Notes:

- [ ] Toggle "Accept Calls" OFF → call in → what happens? (expected: call not picked up or declined gracefully)
  > Notes:

---

### 5.7 Do's & Don'ts tab

- [ ] Add a "Do" rule → save → chat AI follows the rule in response
  > Notes:

- [ ] Add a "Don't" rule → save → chat AI avoids the behavior
  > Notes:

- [ ] Add a rule with special characters or long text → save → confirm no crash or data corruption
  > Notes:

---

### 5.8 Integrations tab (Open Dental)

- [ ] Enter valid Open Dental server URL + API key → click "Test Connection" → success message
  > Notes:

- [ ] Enter invalid API key → click "Test Connection" → error message shown
  > Notes:

- [ ] Enter server URL with typo (unreachable) → test times out within 8 seconds → error shown
  > Notes:

- [ ] Save invalid credentials → confirm they're stored → voice booking will fall back gracefully
  > Notes:

- [ ] Change booking window (3 / 7 / 14 days) → save → availability check uses new window
  > Notes:

---

---

## SECTION 6 — Stripe & Billing

### 6.1 Upgrade flow (new customer)

- [ ] Click upgrade on pricing page → Stripe Checkout loads
  > Notes:

- [ ] Complete payment with test card `4242 4242 4242 4242` → plan upgraded to selected tier
  > Notes:

- [ ] After upgrade, plan reflected in Supabase `businesses.plan` column
  > Notes:

- [ ] After upgrade, plan limits update (e.g., basic gets 500 interactions)
  > Notes:

---

### 6.2 Upgrade flow (existing subscriber)

- [ ] Already on Basic → upgrade to Pro → should update subscription inline (no new Checkout page)
  > Notes:

- [ ] Proration: billing reflects partial month correctly
  > Notes:

---

### 6.3 Webhook events

- 🤖 Stripe webhook verifies signature — must match `STRIPE_WEBHOOK_SECRET` env var
- [ ] `checkout.session.completed` → plan + Stripe IDs saved to Supabase
  > Notes:

- [ ] `customer.subscription.updated` → plan updated in Supabase
  > Notes:

- [ ] `customer.subscription.deleted` → plan downgraded to "free" in Supabase
  > Notes:

- [ ] `invoice.payment_failed` → `plan_status=past_due` set in Supabase (plan NOT removed)
  > Notes:

- [ ] Webhook fires twice for same event → second fire is a no-op (idempotent)
  > Notes:

---

---

## SECTION 7 — Auth & Onboarding

### 7.1 Sign-up flow

- [ ] New user signs up → redirected to `/onboarding`
  > Notes:

- [ ] Onboarding form submitted → business created → redirected to `/dashboard`
  > Notes:

- [ ] Submit onboarding form twice (double-click or back button) → second call is a no-op, no duplicate business created
  > Notes:

---

### 7.2 Sign-in flow

- [ ] Existing user signs in with no business → redirected to `/onboarding`
  > Notes:

- [ ] Existing user signs in with business → redirected to `/dashboard`
  > Notes:

---

### 7.3 Protected routes

- [ ] Try to access `/dashboard` without auth → redirected to sign-in
  > Notes:

- [ ] Try to access `/settings` without auth → redirected to sign-in
  > Notes:

- [ ] Public routes accessible without auth: `/`, `/pricing`, `/how-it-works`, `/faq`, `/privacy`, `/terms`, `/baa`
  > Notes:

---

---

## SECTION 8 — Chat Widget & Embedding

### 8.1 Floating demo widget (homepage)

- [ ] Widget button appears bottom-right on homepage
  > Notes:

- [ ] Clicking widget opens the chat iframe
  > Notes:

- [ ] Chat works with the demo business ID (NEXT_PUBLIC_DEMO_BUSINESS_ID)
  > Notes:

- [ ] AI uses the SalvaAI-specific system prompt (knows it's a demo for SalvaAI, not a dental practice)
  > Notes:

---

### 8.2 Embed code generation

- [ ] Go to `/api/widget/embed?id=[businessId]` → JavaScript embed code is returned
  > Notes:

- [ ] Copy embed code → paste into a plain HTML file → widget loads and works
  > Notes:

- [ ] Widget on external site: second widget injection is blocked by `window.__salvaai` guard
  > Notes:

---

### 8.3 Widget rate limiting

- [ ] Send 20 chat messages in under 1 hour from same IP → 21st is rate-limited
  > Notes:

---

---

## SECTION 9 — Marketing Pages & UI

### 9.1 Homepage

- [ ] All navigation links work (How it works, Pricing, FAQ)
  > Notes:

- [ ] "Get started free" CTA links to sign-up
  > Notes:

- [ ] "How it works" orange CTA scrolls or links to `/how-it-works`
  > Notes:

- [ ] CustomizabilityDemo: only one toggle active at a time (radio behavior)
  > Notes:

- [ ] CustomizabilityDemo: chat preview updates correctly for each toggle
  > Notes:

- [ ] AudioDemo: audio plays correctly
  > Notes:

- [ ] Animated glow effect visible in hero section
  > Notes:

---

### 9.2 /how-it-works page

- [ ] Settings section auto-rotates through all 8 tabs every 4 seconds
  > Notes:

- [ ] Clicking a tab in settings stops auto-rotation
  > Notes:

- [ ] AI Features section: radio-button behavior (one toggle at a time)
  > Notes:

- [ ] Dashboard section renders at correct scale (not cropped or zoomed oddly)
  > Notes:

- [ ] Do's & Don'ts section: items animate in sequentially on scroll
  > Notes:

- [ ] All CTAs ("Get started free") link to sign-up correctly
  > Notes:

---

### 9.3 /pricing page

- [ ] All 4 plans displayed (Free, Basic, Pro, Multi)
  > Notes:

- [ ] "Get started free" on Free plan links to sign-up
  > Notes:

- [ ] "Start 14-day free trial" on paid plans links to Stripe Checkout
  > Notes:

- [ ] FAQPage JSON-LD schema present in page source (for SEO)
  > Notes:

---

### 9.4 /faq page

- [ ] All 85 Q&As render without layout issues
  > Notes:

- [ ] Page is publicly accessible without auth
  > Notes:

---

### 9.5 /privacy, /terms, /baa pages

- [ ] Pages load without auth
  > Notes:

- [ ] Hero sections render with animated glow
  > Notes:

---

---

## SECTION 10 — Edge Cases & Stress Tests

### 10.1 Input edge cases

- [ ] Send a message with only emoji → AI handles it
  > Notes:

- [ ] Send a message in a non-English language → AI responds (in English or the same language?)
  > Notes:

- [ ] Send a message with HTML/script tags → not rendered as HTML in UI
  > Notes:

- [ ] Send a phone number in various formats during voice booking → AI captures correctly
  > Notes:

---

### 10.2 Concurrent / race conditions

- [ ] Open two browser tabs with the same chat widget → send messages simultaneously → both conversations are created separately
  > Notes:

- [ ] Two users call in at the same time → both calls handled independently (separate WebSocket sessions)
  > Notes:

---

### 10.3 Network / failure scenarios

- [ ] Kill Railway server mid-call → Twilio shows error → call ends gracefully
  > Notes:

- [ ] Supabase goes down briefly → API calls fail gracefully with 500 (not silent data loss)
  > Notes:

- [ ] Deepgram API unreachable → voice call falls back or errors clearly
  > Notes:

---

### 10.4 Mobile / browser compatibility

- [ ] Chat widget on mobile (iOS Safari) → opens and functions correctly
  > Notes:

- [ ] Chat widget on mobile (Android Chrome) → opens and functions correctly
  > Notes:

- [ ] Dashboard on mobile → readable, usable
  > Notes:

- [ ] Settings form on mobile → all tabs accessible, inputs usable
  > Notes:

---

---

## SECTION 11 — Pre-Launch Checklist (Environment)

### Vercel environment variables

- [ ] `NEXT_PUBLIC_DEMO_BUSINESS_ID` — set and points to a real demo business
  > Notes:

- [ ] `GROQ_API_KEY` — set and valid
  > Notes:

- [ ] `ANTHROPIC_API_KEY` — set (even if credits are low, needed as fallback key)
  > Notes:

- [ ] `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` — set and pointing to correct mode (test vs. live)
  > Notes:

- [ ] `RESEND_API_KEY` and `RESEND_FROM_EMAIL` — set for email notifications
  > Notes:

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` — set
  > Notes:

- [ ] `SUPABASE_URL` and `SUPABASE_ANON_KEY` — set
  > Notes:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` — set (used for admin DB operations)
  > Notes:

---

### Railway environment variables

- [ ] `GROQ_API_KEY` — same key as Vercel
  > Notes:

- [ ] `ANTHROPIC_API_KEY` — same key as Vercel
  > Notes:

- [ ] `DEEPGRAM_API_KEY` — set and valid
  > Notes:

- [ ] `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — set
  > Notes:

- [ ] `RESEND_API_KEY` and `RESEND_FROM_EMAIL` — set for voice call notifications
  > Notes:

- [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — set
  > Notes:

- [ ] `OPENDENTAL_DEVELOPER_KEY` — set
  > Notes:

- [ ] `RAILWAY_URL` — set to the correct Railway public URL (used as WebSocket endpoint in TwiML)
  > Notes:

---

### Supabase migrations applied

- [ ] `20260418_ai_dos_donts.sql` — `ai_dos`, `ai_donts` columns added
  > Notes:

- [ ] `20260419_ai_features.sql` — `ai_features JSONB` column added
  > Notes:

- [ ] `20260419_inbox_notifications.sql` — `resolved_at`, notification config columns added
  > Notes:

---

---

## Sign-off

| Area | Status | Tested by | Date |
|------|--------|-----------|------|
| Chat API | | | |
| Voice calls (basic) | | | |
| Voice booking (Open Dental) | | | |
| Dashboard | | | |
| Settings (all 8 tabs) | | | |
| Stripe & Billing | | | |
| Auth & Onboarding | | | |
| Chat Widget | | | |
| Marketing Pages | | | |
| Environment Variables | | | |

---

*SalvaAI QA · OmnifySolutions · 2026*
