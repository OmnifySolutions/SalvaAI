# Test Suite Guide

This document explains the automated test suite and how to use it alongside manual testing.

## Running Tests

Jest is already installed. Just run:

```bash
npm test
```

That's it. This runs all 93 automated tests in 2-3 seconds.

(Optional: `npm run test:watch` to re-run on file changes, or `npm run test:coverage` for a coverage report—but you don't need these now.)

## Test Structure

Tests are organized in `__tests__/` with the same folder structure as the source code:

```
__tests__/
├── lib/
│   ├── classify.test.ts      # Urgency, appointment, callback detection
│   └── ai-features.test.ts   # Feature toggle injection
└── api/
    ├── chat.test.ts           # Chat API logic
    └── inbox.test.ts          # Inbox retrieval & management
```

## What's Already Tested (✅ Automated)

### 1. **Classification Logic** (`lib/classify.test.ts`)
- ✅ Emergency detection (keywords: severe pain, bleeding, knocked out tooth, etc.)
- ✅ Urgent detection (pain, sensitive, cavity, appointment requests)
- ✅ Routine classification (fallback)
- ✅ Appointment intent detection (book, schedule, reschedule, cancel)
- ✅ Callback intent detection (call me back, contact me, etc.)
- ✅ Contact extraction (phone numbers, emails)
- ✅ After-hours detection (business hours validation)
- ✅ Edge cases (empty input, malformed data)

**Why this matters:**
These classifiers populate dashboard metrics (emergency flags, appointment requests, callbacks). If broken, the inbox shows wrong priorities.

**Test it with:**
```bash
npm test -- classify.test.ts
```

### 2. **AI Features System** (`lib/ai-features.test.ts`)
- ✅ Feature toggle definitions (8 features, 3 groups)
- ✅ Feature layer building (prompt injection)
- ✅ Custom rule integration (Do's & Don'ts)
- ✅ Feature validity validation
- ✅ Prompt instruction integrity

**Why this matters:**
When a user toggles "Instant Booking" ON/OFF in settings, this code injects/removes instructions from the LLM prompt. If broken, toggles don't actually change AI behavior.

**Test it with:**
```bash
npm test -- ai-features.test.ts
```

### 3. **Chat API** (`api/chat.test.ts`)
- ✅ Request validation (missing fields, invalid JSON, message too long)
- ✅ Business lookup & error handling (404 when not found)
- ✅ Interaction limits (free tier 50/mo, basic 500/mo)
- ✅ Rate limiting (20 msgs/hour per IP)
- ✅ Conversation creation & history
- ✅ Feature toggle injection into system prompt
- ✅ Custom guidelines (Do's & Don'ts) in prompt
- ✅ SalvaAI demo bot system prompt
- ✅ Mock response generation (fallback when LLM fails)
- ✅ Message persistence (saving to DB)
- ✅ Interaction counter increment
- ✅ Error handling & logging

**Why this matters:**
This is your core chat endpoint. Tests verify:
- Free users can't exceed 50 interactions
- Feature toggles actually change behavior
- Custom rules are enforced
- Rate limiting blocks abuse

**Test it with:**
```bash
npm test -- chat.test.ts
```

### 4. **Inbox API** (`api/inbox.test.ts`)
- ✅ Fetching unresolved conversations by priority
- ✅ Filtering by type (emergency, booking, callback)
- ✅ Marking conversations resolved
- ✅ Updating appointment notes
- ✅ Data structure validation
- ✅ Authentication checks

**Why this matters:**
The inbox is the core dashboard experience. Tests verify:
- Emergencies show first (priority sorting)
- Resolved items disappear
- Notes persist

**Test it with:**
```bash
npm test -- inbox.test.ts
```

## What You Still Need to Test (🧪 Manual Only)

These require YOU to actually use the chat/voice and judge if it feels right:

### 1️⃣ Chat Response Quality (CRITICAL)
✅ **Automated test confirms:** Classification logic works (emergency/urgent/routine)  
🧪 **YOU test:** Does the AI response *sound* natural and helpful?

**How to test (10 mins):**
1. Go to `http://localhost:3000` (homepage)
2. Open chat widget (bottom-right)
3. Send 5 sample messages across categories:
   - "I'd like to schedule a cleaning" → Should AI sound welcoming?
   - "I have severe tooth pain" → Should AI sound urgent?
   - "Do you take Delta Dental?" → Should AI answer or defer to staff?
   - "What are your hours?" → Should AI provide info?
   - "Can I book online?" → Should AI guide them?
4. Rate: Is the response natural, concise (2-4 sentences), and helpful?

### 2️⃣ Feature Toggle Effects (IMPORTANT)
✅ **Automated test confirms:** Toggling features injects instructions into the AI prompt  
🧪 **YOU test:** Does the AI *actually behave differently* when you toggle features?

**How to test (15 mins):**
1. Go to dashboard at `http://localhost:3000/dashboard`
2. Settings → Features tab
3. Toggle "Insurance Questions" ON
4. Open chat widget, ask: "Do you take my insurance?"
5. Check: Does the AI answer directly (instead of deferring)?
6. Toggle "Insurance Questions" OFF
7. Ask same question again
8. Check: Does the AI defer to staff now?
9. Repeat for other toggles: "After-Hours Handling", "Emergency Detection", etc.

### 3️⃣ Custom AI Name (NICE-TO-HAVE)
✅ **Automated test confirms:** Settings save correctly  
🧪 **YOU test:** Does changing the AI name actually show up in chat?

**How to test (5 mins):**
1. Dashboard → Settings → AI Config
2. Change "AI Assistant Name" from "Claire" to "Sara"
3. Open chat widget
4. Check: Does greeting say "Hi, I'm Sara"?

### 4️⃣ Custom Do's & Don'ts (NICE-TO-HAVE)
✅ **Automated test confirms:** Custom rules are stored  
🧪 **YOU test:** Does the AI actually *follow* the rules?

**How to test (10 mins):**
1. Dashboard → Settings → Do's & Don'ts tab
2. Add a rule under "DO": "Always mention our new patient special"
3. Open chat, ask: "What should I know before my first visit?"
4. Check: Does the AI mention the special?
5. Add a rule under "DON'T": "Never recommend other dentists"
6. Ask: "Can you recommend another dentist?"
7. Check: Does the AI politely decline?

### 5️⃣ Voice Calls (OPTIONAL - requires Twilio setup)
✅ **Automated test confirms:** Call classification works  
🧪 **YOU test:** Does the voice AI sound natural and respond fast?

**How to test (if Twilio is set up):**
1. Call your Twilio phone number
2. AI should answer in your voice
3. Ask a question
4. Check: Does it respond in 1-2 seconds? Sound natural?
5. Interrupt the AI mid-sentence (barge-in test)
6. Check: Does it listen to you?

### 6️⃣ Dashboard Updates (OPTIONAL)
✅ **Automated test confirms:** Inbox retrieval logic works  
🧪 **YOU test:** Does the dashboard real-time sync work?

**How to test (5 mins):**
1. Open dashboard in one tab
2. Send an emergency message in chat ("severe pain")
3. Check: Does inbox show it immediately?
4. Refresh dashboard
5. Check: Is it still there?
6. Mark as resolved in dashboard
7. Check: Does it disappear?

## Test Execution Strategy

### Phase 1: Quick Win (30 mins)
Run all automated tests to catch obvious logic errors:

```bash
npm test
```

**Look for:**
- ❌ Any failing tests (red output)
- ✅ All tests passing (green output)
- ⚠️ Warnings (yellow output)

If tests fail, fix the underlying logic before manual testing.

### Phase 2: Quick Manual Testing (40 minutes total)

Do these in order:

1. **Chat quality** (10 mins) — Send 5 sample messages, rate responses
2. **Feature toggles** (15 mins) — Toggle each feature, verify behavior changes
3. **Custom rules** (10 mins) — Test Do's & Don'ts enforcement
4. **Dashboard sync** (5 mins) — Send message, check if inbox updates

### Phase 3: Edge Cases (1 hour)
After core flows work:

1. **Boundary conditions**
   - Send message exactly 1000 chars long (should work)
   - Send message 1001 chars (should fail with 400)
   - Send 20 messages in rapid succession (should work)
   - Send 21 messages in 1 hour (should fail with 429)

2. **Malformed input**
   - Try to chat with nonexistent business ID (should 404)
   - Try to use conversation ID from different business (should 401)
   - Send message with special characters: "!@#$%^&*()"
   - Send message in different language: "你好"

3. **Integration failure modes**
   - Disable Groq API key → verify fallback to Anthropic
   - Disable Anthropic API key → verify mock response
   - Break Supabase connection → verify 500 error with message

## Integration Testing (Beyond Jest)

While Jest tests the logic in isolation, you need to verify the whole system works together:

### E2E Flow: New Patient Inquiry
1. Patient opens chat widget
2. Patient types: "I'm new and want to schedule a cleaning"
3. Verify:
   - Inbox shows "Pending Booking" (not emergency)
   - Dashboard counter increments
   - AI response includes new patient welcome
   - If "New Patient Welcome" feature ON, response is extra warm
   - If feature OFF, response is standard

### E2E Flow: Emergency Escalation
1. Patient calls phone number
2. AI answers in your voice
3. Patient says: "I have severe bleeding and knocked out a tooth"
4. Verify:
   - Voice AI detects emergency
   - Inbox shows "EMERGENCY" tab first
   - Browser notification fires (if configured)
   - SMS/email alert sent (if configured)
   - AI prioritizes response: "This is urgent..."

### E2E Flow: Customization Enforcement
1. Go to Settings → Do's & Don'ts
2. Add rule: "DON'T ever mention other dentists"
3. Chat and ask: "Can you recommend another dentist?"
4. Verify AI politely declines (respects custom rule)

## Common Issues & Solutions

### Tests fail with "Cannot find module '@/...'"
**Solution:** Make sure `moduleNameMapper` in `jest.config.js` matches your `tsconfig.json` paths.

### Tests fail with "supabaseAdmin is not a mock"
**Solution:** Verify Jest mock is before the import:
```ts
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: { from: jest.fn() }
}));
import { supabaseAdmin } from "@/lib/supabase";
```

### Rate limiter test doesn't work (always passes)
**Solution:** Rate limiter is in-memory and resets on server restart. Can't test across multiple requests in Jest. Test manually: spam 20+ requests in 1 hour from same IP, expect 429 on request 21.

### Mock responses seem fake
**Solution:** They are intentional fallbacks for when both Groq and Anthropic fail. In production:
1. Groq free tier (primary) — should handle 95%+ of requests
2. Anthropic fallback — handles 5% when Groq is down
3. Mock only fires if both fail (rare)

## Continuous Integration

When you're ready to deploy, add this to GitHub Actions:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

This runs all tests on every push and ensures nothing breaks before merging.

## Your Testing Checklist

- [ ] **Run automated tests**: `npm test` (should see "93 passed")
- [ ] **Chat quality** (10 mins) — Type 5 messages, rate responses
- [ ] **Feature toggles** (15 mins) — Toggle features, verify behavior changes
- [ ] **Custom rules** (10 mins) — Test Do's & Don'ts
- [ ] **Dashboard** (5 mins) — Send message, check inbox updates
- [ ] **Once done** → `/security-review` → make repo private → deploy

That's it. You're done testing. 40 minutes of manual work + the automated suite catches logic errors.
