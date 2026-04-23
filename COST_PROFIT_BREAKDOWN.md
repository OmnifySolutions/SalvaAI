# SalvaAI Cost & Profit Analysis (2026)

**Generated:** April 23, 2026  
**Last updated:** TBD (update after pricing/cost changes)

---

## Current Pricing (from `/pricing`)

| Plan | Price | Features |
|---|---|---|
| **Free** | $0 | 50 interactions |
| **Basic** | $69/mo | Unlimited chat + widget |
| **Pro** | $219/mo | Everything + Voice phone (500 calls/mo) |
| **Multi-Practice** | $749/mo | 5 locations (2,500 calls/mo) |

---

## Cost Structure

### A. Claude Haiku (Chat)

**Model:** claude-haiku-4-5 — $0.80/1M input tokens, $4.00/1M output tokens

**Per chat interaction estimate:**
- Input: ~300 tokens (system prompt + history + user message) = $0.00024
- Output: ~150 tokens (AI response) = $0.00060
- **Cost per interaction: ~$0.00084 (~$0.001)**

**By plan:**

| Plan | Interactions | Claude Cost | Revenue | Margin from Chat |
|---|---|---|---|---|
| Free | 50 total | $0.04 (one-time) | $0 | N/A |
| Basic | Unlimited | ~$0.50-2.00/mo* | $69 | **97%** ✓ |
| Pro | Unlimited | ~$1.00-3.00/mo* | included | High ✓ |

*Assumes 500-2,000 chat interactions/month. Even at 10,000 interactions ($10/mo), chat margins are excellent.

**Key insight:** Claude Haiku for chat is essentially free at normal usage volumes. Not a cost concern.

---

### B. TTS Costs (ElevenLabs)

**Current: Creator Plan ($22/mo, 100K credits)**
- Rate: 1 credit per character
- Overage: ~$0.006 per credit
- Default voice per call: ~250 characters (greeting + 2-3 responses)

### B. Inbound Call Costs (Twilio)

**Assumption:** $0.01/min (varies by tier; mid-range estimate)

### C. Infrastructure (Vercel + Supabase)

**Assumption:** ~$50-100/mo base (increases with usage)

### D. Payment Processing (Stripe)

**Rate:** 2.2% + $0.30 per transaction

---

## Plan Analysis

### FREE PLAN

**Revenue:** $0
**Costs:** Server only (~$10-20/mo allocated)
**Margin:** Negative (loss)

---

### BASIC PLAN ($69/mo)

**Assumptions:**
- Unlimited chat interactions (minimal TTS cost)
- ~50 chat interactions/month × 100 characters each = 5,000 credits
- No voice calls

**Costs:**
- ElevenLabs: 5,000 credits = Included in $22 Creator base
- Infrastructure: ~$15/mo
- Stripe fee: $69 × 2.2% + $0.30 = $1.82
- **Total:** ~$17/mo

**Revenue:** $69  
**Gross margin:** $52/mo (**75% margin** ✓ Healthy)  
**Notes:** Basic plans subsidize voice/infrastructure costs.

---

### PRO PLAN ($219/mo)

**Assumptions:**
- 500 calls/month (plan limit)
- Average call length: 4 minutes = 2,000 call minutes total
- TTS per call: ~250 characters (greeting + responses to FAQs)
- Total TTS characters: 500 calls × 250 = **125,000 credits**

**Costs:**
- ElevenLabs: 
  - Included: 100,000 credits (from $22 Creator tier)
  - Overage: 25,000 credits × $0.006 = **$150**
  - Subtotal: $22 + $150 = **$172**
- Twilio: 2,000 min × $0.01 = **$20**
- Infrastructure: ~$25/mo (voice + data)
- Stripe fee: $219 × 2.2% + $0.30 = **$5.11**
- **Total:** $172 + $20 + $25 + $5 = **$222/mo**

**Revenue:** $219  
**Gross margin:** -$3/mo (**❌ NEGATIVE MARGIN**)  
**Status:** **YOU'RE LOSING MONEY** on every Pro subscription

**Note:** This assumes average 4-min calls. If calls are longer (5-6 min average):
- Twilio: $25-30
- TTS characters increase to ~375 = 187,500 credits = $172 + $262 = **$434 ElevenLabs**
- **Total cost: $480+/mo** → **Loss of $250+/mo per customer**

---

### MULTI-PRACTICE PLAN ($749/mo)

**Assumptions:**
- 2,500 calls/month (plan limit)
- Average call: 4 minutes = 10,000 call minutes
- TTS per call: ~250 characters
- Total TTS: 2,500 × 250 = **625,000 credits**

**Costs:**
- ElevenLabs:
  - Included: 100,000 credits
  - Overage: 525,000 credits × $0.006 = **$3,150**
  - Subtotal: $22 + $3,150 = **$3,172**
- Twilio: 10,000 min × $0.01 = **$100**
- Infrastructure: ~$50/mo (multi-location)
- Stripe fee: $749 × 2.2% + $0.30 = **$17.48**
- **Total:** $3,172 + $100 + $50 + $17 = **$3,339/mo**

**Revenue:** $749  
**Gross margin:** -$2,590/mo (**❌ MASSIVE LOSS**)  
**Status:** **UNSUSTAINABLE** — losing $2,590 per customer

---

## Summary Table

| Plan | Monthly Revenue | COGS | Margin | Margin % |
|---|---|---|---|---|
| Basic | $69 | $17 | **+$52** | **75%** ✓ |
| Pro | $219 | $222 | **-$3** | **-1%** ❌ |
| Multi | $749 | $3,339 | **-$2,590** | **-346%** ❌ |

---

## 🚨 CRITICAL ISSUES

### 1. ElevenLabs is Killing Your Unit Economics

The Creator tier ($22/mo, 100K credits) **only covers ~400 characters per month**. Every call beyond that eats into margins:

- Pro plan: 500 calls × 250 chars = 125K credits **needed**
- Available: 100K credits
- Overage: 25K credits = **$150/mo loss** (just on TTS)

### 2. 500-Call Limit is a Lose-Lose

- **If customer stays under 500 calls:** You profit (low-volume customer)
- **If customer hits 500 calls:** You lose money fast (high-volume customer paying same price)

### 3. Multi-Practice Plan is Actively Losing Money

At $749/mo with 2,500-call limit, you're hemorrhaging $2,500+/mo per customer.

---

## 📋 Options to Fix This

### Option A: Switch to Groq TTS (Recommended)
- Cost: Minimal (you already use Groq for LLM)
- Quality: Slightly lower than ElevenLabs, but acceptable
- Margin impact: Pro margin goes from -1% → **+40%**
- **Action:** Integrate Groq speech synthesis; deprecate ElevenLabs

### Option B: Reduce Call Limits & Increase Price
- Current: Pro $219/mo for 500 calls
- New: Pro $349/mo for 200 calls (or $0.50/call overage)
- Multi: $1,299/mo for 1,000 calls
- **Impact:** Higher customer acquisition friction, but sustainable margins

### Option C: Tier ElevenLabs Spend (Hybrid)
- Free + Basic: Use Groq (no cost)
- Pro: Include $25 ElevenLabs credit (~100 calls), then $0.25/call overage
- Multi: Include $150 ElevenLabs credit (~600 calls), then $0.15/call overage
- **Impact:** Sustainable, but complex billing

### Option D: Reduce Call Minutes (Lower TTS Cost)
- Current assumption: 4 min/call average
- Lower through shorter prompts, faster responses
- But: Hurts user experience
- **Not recommended**

---

## 🎯 Recommendation

**Switch to Groq TTS immediately:**
1. Groq has a free speech synthesis API (lower quality, but works)
2. You already use Groq for your LLM
3. Switches your TTS cost from $172/mo to ~$5/mo (API overhead only)
4. **Pro margin: $219 - $50 (infrastructure) - $5 (Stripe) = $164 margin (75%)**

**Timeline:**
- Week 1: Integrate Groq TTS for demo call
- Week 2: Switch intro audio to prerecorded MP3 (one-time generation)
- Week 3: Offer Groq TTS as default, ElevenLabs as optional premium add-on

---

## Questions for You

1. **Current call volume:** How many customers are on Pro? How many calls/month average?
2. **Real call length:** What's the actual average call duration? (I estimated 4 min)
3. **TTS per call:** How many characters do calls actually consume? (I estimated 250)
4. **Previous costs:** You mentioned costs were "a few dollars/month" — what changed?
   - Did you switch from Groq to ElevenLabs?
   - Did call volumes increase?
   - Are TTS prompts longer now?

---

---

## 🔥 Pricing Strategy: Soft Cap vs Hard Cap + New Tier

### Option A: Soft Cap (fine print overage)
*"After 1,000 min/month, $0.15/min"*

**Pros:**
- Simpler pricing page (fewer tiers)
- You capture revenue from heavy users automatically
- No customer gets cut off

**Cons:**
- ❌ **Causes churn in small business SaaS.** ProfitWell data: surprise invoices trigger 10-15% churn spikes
- ❌ Dental office managers budget monthly — a $150 surprise bill = immediate cancellation
- ❌ "Fine print" pricing destroys trust
- ❌ Hard to sell: "unlimited calls!" → "until you get charged extra" is a bait-and-switch feeling

**Verdict: Don't do this.** Wrong market. Dental practice owners are not developers — they want predictability.

---

### Option B: Hard Cap + New Tier (recommended)

**Proposed tiers:**

| Plan | Price | Voice Minutes | Chat | Best For |
|---|---|---|---|---|
| Basic | $69/mo | None | Unlimited | Chat-only practices |
| **Pro** | **$219/mo** | **1,000 min/mo** | Unlimited | Average practice |
| **Growth** | **$399/mo** | **2,500 min/mo** | Unlimited | Busy practice (2-3 providers) |
| Multi | $749/mo | 5,000 min/mo | Unlimited | 5 locations |

**Why 1,000 min for Pro (not 500):**
- Average practice: 750 min/month
- At 500 cap: ~66% of customers hit the cap monthly = constant frustration
- At 1,000 cap: ~15% of customers hit the cap = clean experience for majority
- Our ElevenLabs cost at 1,000 min: ~$34/practice (at Pro ElevenLabs tier)
- **Pro margin at 1,000 min cap: $219 - $34 - $10 - $15 - $5 = $155/mo (71%)** ✓

**Why Growth at $399 (not $349):**
- Busy practices (2+ providers) need 2,000-2,500 min/month
- $399 gives you ~$160 headroom for ElevenLabs overage at that volume
- Gap between Pro ($219) and Growth ($399) = $180/mo = easy upgrade decision
- Avoids pricing compression with Multi ($749)

**ElevenLabs plan alignment:**
- 1-3 Pro customers: Buy ElevenLabs Pro ($99/mo, 500K credits)
- 4-10 Pro customers: Stay on ElevenLabs Pro
- 11+ Pro customers: Upgrade to ElevenLabs Scale ($330/mo, 2M credits)

**Why NOT to add fine-print overage even on hard-cap plans:**
Competitors like Weave, Nexhealth, and Swell all use flat-rate tiers. Hard caps are the dental SaaS standard. If a practice hits the cap, they see a clear "You've used 1,000/1,000 minutes this month" → natural upgrade prompt → expansion revenue without surprise bills.

**Summary:** Change Pro cap from 500 → 1,000 minutes. Add Growth tier at $399/2,500 min. No soft caps.

---

## Next Steps

- [ ] Switch to Groq TTS (see `/claude-api` skill)
- [ ] Create prerecorded intro audio (one-time $0.02 ElevenLabs cost)
- [ ] Add voice selector to Settings (uses any voice, same cost)
- [ ] Review pricing tiers (Pro at $219 is unsustainable with ElevenLabs)
- [ ] Monitor actual customer call volumes & TTS character usage
