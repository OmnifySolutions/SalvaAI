# Pricing Launch — Action List

**Status**: Code complete. Awaiting manual steps before go-live.
**Date Created**: 2026-04-23
**Priority**: 🔴 HIGH — Blocking launch

## 📋 REQUIRED ACTIONS (In Order)

### 1. Stripe Price IDs Setup
**What**: Create 8 Stripe price IDs in Stripe dashboard  
**Why**: Pricing page routes to these IDs at checkout  
**Estimated Time**: 30 minutes  
**Detailed Guide**: See `PRICING_ROLLOUT.md` section "Manual Step Required"

**Price IDs to create**:
```
STRIPE_BASIC_ANNUAL_PRICE_ID     = Basic, $65/mo billed yearly ($780/year)
STRIPE_BASIC_MONTHLY_PRICE_ID    = Basic, $79/mo
STRIPE_PRO_ANNUAL_PRICE_ID       = Pro, $249/mo billed yearly ($2,988/year)
STRIPE_PRO_MONTHLY_PRICE_ID      = Pro, $309/mo
STRIPE_GROWTH_ANNUAL_PRICE_ID    = Growth, $449/mo billed yearly ($5,388/year)
STRIPE_GROWTH_MONTHLY_PRICE_ID   = Growth, $559/mo
STRIPE_MULTI_ANNUAL_PRICE_ID     = Multi, $849/mo billed yearly ($10,188/year)
STRIPE_MULTI_MONTHLY_PRICE_ID    = Multi, $1,049/mo
```

### 2. Update `.env` with Price IDs
**What**: Add 8 env vars to `.env`  
**Why**: Checkout endpoint reads from these vars  
**Example**:
```
STRIPE_BASIC_ANNUAL_PRICE_ID=price_xyz...
STRIPE_BASIC_MONTHLY_PRICE_ID=price_abc...
... (6 more)
```

### 3. Run Supabase Migration
**What**: Execute `supabase migration up`  
**Why**: Adds growth plan, billing_cycle, minute tracking columns  
**Estimated Time**: 2 minutes  
**Details**: Migration file at `supabase/migrations/20260423_growth_plan_and_billing.sql`

### 4. Test Pricing Page
**What**: Load `/pricing` → test annual/monthly toggle → test signup flow  
**Why**: Verify page renders, toggle swaps prices, signup routes correctly  
**Estimated Time**: 10 minutes  
**Checklist**:
- [ ] Page loads without errors
- [ ] Annual toggle selected by default
- [ ] Click "Monthly" → all prices update
- [ ] Click "Billed annually" → prices revert
- [ ] "Save 2 months free" badge appears/disappears
- [ ] Click "Start 14-day free trial" on Pro → redirects to /sign-up?plan=pro
- [ ] Sign-up flow works → Stripe checkout appears
- [ ] Checkout shows correct price & plan

### 5. Verify Minute Enforcement
**What**: Test that calls are rejected when quota exhausted  
**Why**: Core safety feature preventing over-usage  
**Estimated Time**: 15 minutes  
**Steps**:
- [ ] Create test business with Pro plan (750 min limit)
- [ ] Manually set `minutes_used_this_period = 750` in Supabase
- [ ] Attempt incoming voice call via Twilio
- [ ] Verify call is rejected with message: "Your account has reached its monthly voice minute limit"
- [ ] Reset minutes to 0, retry → call should succeed

### 6. Review Copy Consistency
**What**: Audit homepage, pricing page, /how-it-works for consistent messaging  
**Why**: Avoid confusion from conflicting pricing info  
**Estimated Time**: 10 minutes  
**Checklist**:
- [ ] No references to "Free plan" (removed everywhere)
- [ ] No "$69" or "$219" mentions (updated to new prices)
- [ ] All CTAs say "Start free trial" or "Start 14-day free trial" (not "Get started free")
- [ ] Pricing described as "voice minutes" not "calls"
- [ ] No "no credit card required" copy (card is always required)
- [ ] Hero messaging consistent: "Transparent pricing. Setup in 5 minutes. Cancel anytime."

## 📊 Tracking

| Action | Status | Owner | ETA | Notes |
|--------|--------|-------|-----|-------|
| 1. Create Stripe price IDs | ⏳ Pending | User | — | Stripe dashboard work |
| 2. Update .env | ⏳ Pending | User | — | After Stripe IDs created |
| 3. Run migration | ⏳ Pending | User | — | ~2 min |
| 4. Test pricing page | ⏳ Pending | User | — | ~10 min |
| 5. Test minute enforcement | ⏳ Pending | User | — | ~15 min |
| 6. Review copy consistency | ⏳ Pending | User | — | ~10 min |

## ❓ Next Request

When you ask "How do I complete the action list?" or "What's next on pricing?" → I will provide a **full step-by-step guide** with exact commands, button clicks, and verification steps.

---

**Completion Target**: All 6 actions complete before go-live  
**Current Blockers**: None (waiting on manual Stripe setup)
