# HustleClaude: Zero-Money Budget — Cost Breakdown

## Total Cost to Build & Launch MVP: $0

### Phase 1: Accounts (Day 1-2)
| Service | Free Tier | Cost |
|---------|-----------|------|
| GitHub | Unlimited public repos | $0 |
| Vercel | Hobby tier (unlimited deployments, 100GB bandwidth) | $0 |
| Supabase | 500MB storage, 50K database rows | $0 |
| Clerk | 10,000 monthly active users | $0 |
| Twilio | $15 trial credit (covers ~100 calls) | $0 (trial) |
| Stripe | No charges until customer pays | $0 |
| **SUBTOTAL** | — | **$0** |

### Phase 2: API Usage (Week 1-4 Development)

#### Anthropic Claude API (~$3-5 total)
- Week 1: ~$0.50 (2-3 real API calls to verify prompt works; rest are mock)
- Week 2: ~$1.50 (voice testing, 10-20 calls)
- Week 3: ~$1.00 (light testing)
- Week 4: ~$0.50 (final polish)
- **Strategy:** Use mock responses in development; only hit real API for verification
- **Total:** ~$3-5 over 4 weeks

#### Twilio ($0 from trial credit)
- Trial credit: $15
- Cost breakdown:
  - 1 phone number: $1/month
  - Call duration: $0.01/min
  - SMS (not used): $0.02/msg
  - Estimate: ~$3-4 for all development + testing
  - **Trial credit covers this** ✓

#### Stripe ($0 — paid by customer)
- No charges until customer signs up and pays
- When customer pays $49: Stripe takes 2.9% + $0.30 = $1.72
- You keep: $47.28 ✓

### Phase 3: First Customer Acquisition

**Customer pays:** $49/month (Basic plan)

**Cost breakdown:**
- Stripe fee: -$1.72
- Anthropic API per customer: ~$0.50-1.00/month (their conversations)
- Twilio calls (if phone): ~$1-2/month
- **Your margin:** $44-46/month per customer ✓

### Summary: True Cost to Launch

| What | Cost | Notes |
|------|------|-------|
| Accounts & setup | $0 | All free tiers |
| API development | $3-5 | Anthropic usage during 4-week dev |
| Phone number (Twilio) | $0 | Covered by $15 trial |
| Database & hosting | $0 | Free tiers cover MVP scale |
| Domain (optional) | $0 | Use `hustleclaude.vercel.app` instead |
| **Total to launch** | **$3-5** | Truly bootstrapped |

---

## Revenue Model (Starting Month 1)

### Pricing
- **Basic:** $49/month (500 interactions)
- **Pro:** $99/month (unlimited interactions)

### Unit Economics (per customer)

#### Customer on Basic Plan ($49/month)
```
Revenue:                           $49.00
- Stripe processing (2.9% + $0.30): -$1.72
- Anthropic API (~5 convos/mo):     -$0.75
- Twilio voice (if used):           -$1.50
- Infrastructure (free tier):       -$0.00
─────────────────────────────────────────
Gross profit per customer:          $45.03
Gross margin:                       91.9%
```

#### Customer on Pro Plan ($99/month)
```
Revenue:                           $99.00
- Stripe processing (2.9% + $0.30): -$3.18
- Anthropic API (~15 convos/mo):    -$2.00
- Twilio voice (if used):           -$3.00
- Infrastructure (free tier):       -$0.00
─────────────────────────────────────────
Gross profit per customer:          $90.82
Gross margin:                       91.7%
```

---

## Path to $20K Revenue Goal

### Customer Acquisition Targets

| Milestone | Customers | MRR | Timeline |
|-----------|-----------|-----|----------|
| Target 1 | 5 Basic | $245 | Week 3-4 |
| Target 2 | 15 customers (mix) | $850 | Month 1-2 |
| Target 3 | 30 customers (mix) | $1,800 | Month 2-3 |
| Target 4 | **100 customers** | **$5,000+** | Month 3-4 |
| **Final goal** | **400 customers** | **$20,000+** | Month 6-8 |

### How to Acquire Customers (Free/Cheap)
1. **Cold email to dental offices** (free, ~2-3% conversion)
2. **Dental office Facebook groups** (free, organic)
3. **Reddit r/dentistry, r/dentalhygiene** (free)
4. **Offer free 30-day trial** to first 10 customers (loss leader to get testimonials)
5. **Instagram sponsorship revenue** ($500-1000/mo) → reinvest into Google Ads

---

## Budget for First 3 Months (Optional Reinvestment)

**Month 1 revenue (5 customers):** $245
```
- Reinvest $100 into Google Ads (targeting "dental office AI answering service")
- Keep $145 as cash reserve
```

**Month 2 revenue (15 customers):** $850
```
- Reinvest $200-300 into Google Ads
- Reinvest $50 on domain (hustleclaude.com)
- Keep $400-600 as cash
```

**Month 3 revenue (30 customers):** $1,800
```
- Reinvest $300-500 into paid ads (Google, Facebook)
- Marketing team salary: $0 (you + Claude)
- Keep $1,000-1,500 as profit
```

---

## What Happens When Free Tiers Exceed Limits

### If Supabase exceeds 500MB (unlikely in Year 1)
- **When:** After ~500 customers
- **Cost:** $25/month for Pro tier
- **At this point:** You're making $25K+/month revenue

### If Vercel exceeds bandwidth limits (very unlikely)
- **When:** After millions of requests/month
- **Cost:** $0.50 per additional 1GB
- **At this point:** Scale is good problem

### If Clerk exceeds 10K MAU
- **When:** After ~1,000 customers
- **Cost:** $0.07 per additional MAU
- **At this point:** Revenue covers cost 100× over

---

## Bottom Line

**You need $0 upfront to build and launch.**

First customer pays $49 → you keep $45-47.

At 100 customers ($5K/mo), your unit cost per customer is under $4/month. Gross margins stay above 90%.

This is a **profitable, capital-efficient business** from day one.
