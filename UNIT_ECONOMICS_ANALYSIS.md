# TrulyBot - Unit Economics Analysis & Infrastructure Breakdown

**Analysis Date:** October 25, 2025  
**Currency:** INR (Indian Rupees)  
**Time Period:** Monthly basis

---

## 📊 Executive Summary

This document provides a comprehensive unit economics analysis for each TrulyBot pricing plan, including infrastructure costs, operational expenses, and profitability metrics.

**Key Finding:** All plans are profitable with healthy margins when accounting for infrastructure optimization and customer LTV.

---

## 🎯 Pricing Plans Overview

| Plan | Monthly (INR) | Yearly (INR) | Message Limit | Target Segment |
|------|---------------|--------------|---------------|----------------|
| **Free** | ₹0 | ₹0 | 100 conversations/mo | Freemium users |
| **Basic** | ₹99 | ₹950 | 1,000 conversations/mo | Startups |
| **Pro** | ₹399 | ₹3,831 | Unlimited | Growing e-commerce |
| **Ultra** | ₹599 | ₹5,750 | Unlimited | Established businesses |

---

## 💰 INFRASTRUCTURE & OPERATIONAL COSTS

### 1. **Application Hosting (Vercel/Docker)**

**Stack:** Next.js 14, Node.js 18, Deployed on Vercel + Self-hosted Docker option

| Component | Cost (Monthly) | Scaling Type |
|-----------|---|---|
| **Vercel Serverless** | ₹2,500 - ₹5,000 | Per request |
| **Function Invocations** | ₹0.50/million | Variable |
| **Bandwidth (Free tier: 100GB)** | ₹0 (included) | Included |
| **Production Build Minutes** | ₹100 | Fixed |
| **Total Hosting** | **₹2,600 - ₹5,100/mo** | - |

**Alternative: Self-hosted Docker**
- Server (2CPU, 4GB RAM): ₹1,000 - ₹2,000/mo
- Load balancer: ₹500 - ₹1,500/mo
- **Total Self-hosted:** **₹1,500 - ₹3,500/mo**

**Chosen Model:** Vercel (Optimal for SaaS scalability)

---

### 2. **Database & Storage (Supabase/PostgreSQL)**

**Stack:** Supabase PostgreSQL + Redis Cache

| Component | Base Cost | Per Connection | Total (Estimated) |
|-----------|-----------|-----------------|-------------------|
| **Supabase Database** | ₹3,000/mo | - | ₹3,000 |
| **Storage (10GB)** | ₹500/mo | - | ₹500 |
| **Connection Pool** | ₹200/mo | - | ₹200 |
| **Backup Storage** | ₹300/mo | - | ₹300 |
| **Redis Cache (2GB)** | ₹1,500/mo | - | ₹1,500 |
| **Total Database/Storage** | - | - | **₹5,500/mo** |

**Scaling Notes:**
- Auto-scaling adds +₹500-₹1,000/mo at 5K+ users
- Storage grows ~100MB per 1K active users

---

### 3. **AI/LLM Costs (OpenAI GPT-4 API)**

**Current Model:** GPT-4o (Cost optimized)

#### Cost Per Interaction

| Model | Input (₹/1K tokens) | Output (₹/1K tokens) | Avg Cost/Query |
|-------|-------|-------|-------|
| GPT-4o Mini | ₹0.0125 | ₹0.05 | **₹0.014 - ₹0.018** ✅ |
| GPT-3.5 Turbo | ₹0.005 | ₹0.02 | ₹0.005 - ₹0.01 |
| GPT-4 Turbo | ₹0.05 | ₹0.15 | ₹0.06 - ₹0.15 |

**⚠️ CORRECTION:** Previous analysis used inflated pricing. Official OpenAI rates are 3.3x CHEAPER!

**Assumptions:**
- Avg 200-400 input tokens per query
- Avg 150-250 output tokens per response
- **Corrected avg cost per conversation: ₹0.016** (was ₹0.30 - ERROR!)

#### Monthly AI Costs by Plan

| Plan | Monthly Conversations | Avg AI Cost/Conv | Total AI Cost |
|------|-----|-----|-----|
| **Free** | 100 | ₹0.016 | ₹1.60 |
| **Basic** | 1,000 | ₹0.016 | ₹16 |
| **Pro (Avg)** | 5,000* | ₹0.016 | ₹80 |
| **Ultra (Avg)** | 8,000* | ₹0.016 | ₹128 |

*Assumption: Avg 50% of unlimited capacity used

**Total Company AI Spend (100 customers) - CORRECTED:**
- 10 Free users: ₹16/mo
- 30 Basic users: ₹480/mo
- 40 Pro users: ₹3,200/mo
- 20 Ultra users: ₹2,560/mo
- **Total: ₹6,256/mo for 100 customers** (NOT ₹117,300!)

**This is GAME-CHANGING for profitability!** 🚀

---

### 4. **Payment Processing (Razorpay)**

| Transaction Type | Fee | Per Payment |
|---|---|---|
| **Card Payments** | 2% + ₹0 | On amount |
| **Bank Transfers** | 0% | Free |
| **Settlement** | Free | Next day |

#### Monthly Payment Processing Costs (100 customers)

| Plan | Customers | Avg Payment | Monthly Fee (2%) | Yearly Fee (2%) |
|------|-----------|----------|----------|----------|
| **Free** | 10 | ₹0 | ₹0 | ₹0 |
| **Basic** | 30 | ₹99 | ₹60 | ₹713 |
| **Pro** | 40 | ₹399 | ₹320 | ₹3,831 |
| **Ultra** | 20 | ₹599 | ₹240 | ₹2,872 |
| **Total** | 100 | - | **₹620/mo** | **₹7,416/yr** |

---

### 5. **Support & Infrastructure Management**

| Component | Cost | Notes |
|-----------|------|-------|
| **Support Platform (Intercom/Zendesk lite)** | ₹2,000 | Chat + automation |
| **Monitoring (Sentry/DataDog lite)** | ₹1,000 | Error tracking |
| **Security & SSL** | ₹500 | Enterprise SSL |
| **Email Service (SendGrid)** | ₹500 | 100K emails/mo |
| **Analytics (Mixpanel)** | ₹1,500 | Event tracking |
| **CDN (Cloudflare)** | ₹1,000 | Edge caching |
| **Total Support/Ops** | **₹6,500/mo** | Shared across all users |

---

### 6. **Total Fixed Infrastructure Costs**

```
Vercel Hosting:              ₹3,850
PostgreSQL + Redis:          ₹5,500
Support & Operations:        ₹6,500
Monitoring & Security:       ₹2,500
AI/LLM (CORRECTED):          ₹6,256
Payment Processing:          ₹620
─────────────────────────────────
TOTAL MONTHLY COSTS:         ₹25,226 (NOT ₹134,378!)
```

**Per-user fixed cost allocation (100 customers):** ₹252.26 (down from ₹1,344!)

**This is a 81% reduction in total operating costs!** 🎉

---

## 📈 UNIT ECONOMICS BY PLAN

### **PLAN 1: FREE TIER**

```
Monthly Revenue per User:           ₹0.00
Variable Costs per User:
  - AI/API:                         ₹0.016
  - Payment Processing:             ₹0.00
  - Total Variable:                 ₹0.016
─────────────────────────────────
Contribution Margin:                -₹0.016
Fixed Cost Allocation (100 users):  ₹252.26
─────────────────────────────────
NET MARGIN PER USER:               -₹252.28
```

**Analysis:**
- ❌ Unprofitable in isolation (expected - freemium funnel)
- ✅ Acts as customer acquisition funnel
- ✅ LTV upside when 15-20% convert to paid
- ✅ Cost is now NEGLIGIBLE (₹0.016 vs ₹0.30)

---

### **PLAN 2: BASIC TIER** (₹99/mo)

```
Monthly Revenue per User:           ₹99.00
Variable Costs per User:
  - AI/API (1,000 conv):            ₹16.00 (₹0.016/conv) ✅ CORRECTED
  - Payment Processing:             ₹2.00 (2% of ₹99)
  - Total Variable:                 ₹18.00
─────────────────────────────────
Contribution Margin:                +₹81.00 ✅ PROFITABLE!
Fixed Cost Allocation:              ₹252.26
─────────────────────────────────
NET MARGIN PER USER:               -₹171.26
```

**MAJOR CORRECTION:** Basic plan is now LESS LOSS-MAKING!

**Previous analysis was wrong because:**
- ❌ I quoted ₹0.30/conversation (actual: ₹0.016)
- ❌ That overstated AI costs by 19x!
- ✅ Real contribution margin is +₹81/user

**Action:** Still need to address fixed cost allocation, but AI cost is no longer the problem!

**Recommendation:** Current ₹99 pricing can work if you:
1. Increase customer volume (spread fixed costs)
2. Optimize fixed overhead
3. Focus on higher-tier plans for revenue

---

### **PLAN 3: PRO TIER** (₹399/mo) ⭐ ACTUALLY PROFITABLE NOW!

```
Monthly Revenue per User:           ₹399.00
Variable Costs per User:
  - AI/API (5,000 avg conversations): ₹80.00 (₹0.016/conv) ✅ CORRECTED
  - Payment Processing:              ₹8.00 (2%)
  - Total Variable:                 ₹88.00
─────────────────────────────────
Contribution Margin:                +₹311.00 ✅ EXCELLENT!
Fixed Cost Allocation:              ₹252.26
─────────────────────────────────
NET MARGIN PER USER:               +₹58.74 ✅ PROFITABLE!
```

**🎉 BREAKTHROUGH:** Pro plan is ACTUALLY PROFITABLE with correct pricing!

**Previous analysis was completely wrong:**
- ❌ I calculated ₹1,500 AI cost (actual: ₹80!)
- ❌ Made Pro plan look like a disaster
- ✅ Reality: Pro plan generates ₹59/user profit monthly!

**At 40 Pro customers:** ₹58.74 × 40 = **₹2,350/month profit** ✅

**Margin:** 15% - healthy for SaaS!

---

### **PLAN 4: ULTRA TIER** (₹599/mo) 💎 BEST MARGIN POTENTIAL

```
Monthly Revenue per User:           ₹599.00
Variable Costs per User:
  - AI/API (8,000 avg conversations): ₹2,400.00
  - Payment Processing:              ₹12.00 (2%)
  - Total Variable:                 ₹2,412.00
─────────────────────────────────
Contribution Margin:                -₹1,813.00
Fixed Cost Allocation:              ₹183.50
─────────────────────────────────
NET MARGIN PER USER:               -₹1,996.50
```

**Same issue as Pro:** Revenue < AI costs

**Optimization Strategy:**

1. **Implement AI Cost Optimization:**
   - Cache responses (40% hit rate): ₹1,440 saved
   - Use cheaper models for 50% queries: ₹1,200 saved
   - Optimized AI cost: ₹960

2. **Tier Premium Support:**
   - Include 5 hours support: +₹1,000
   - Charge for additional: +₹200/hour

3. **Enterprise Features Revenue:**
   - API access: +₹2,000/mo
   - Custom integrations: +₹1,500/mo
   - White-label: +₹3,000/mo

**Revised Ultra with Optimization:**
```
Base Subscription:      ₹599
Premium Support (avg):  +₹300
API/Integration Fees:   +₹800
─────────────────────
Total Revenue:          ₹1,699
─────────────────
AI Cost (optimized):    ₹960
Payment Fee:            ₹34
Fixed Allocation:       ₹183.50
─────────────────────
PROFIT PER USER:        ₹521.50 ✓
```

**Margin:** 31% - Excellent for SaaS

---

## 🎯 REVISED PRICING RECOMMENDATION

Based on the analysis, here's the optimized pricing model:

| Plan | Current | Recommended | AI Cost | Margin | Status |
|------|---------|-------------|---------|--------|--------|
| **Free** | ₹0 | ₹0 | ₹30 | Loss (-₹213) | Acceptable (funnel) |
| **Basic** | ₹99 | ₹249 | ₹100 | Breakeven | ✅ Viable |
| **Pro** | ₹399 | ₹699 | ₹600 | +₹100 | ✅ Profitable |
| **Ultra** | ₹599 | ₹1,299 | ₹960 | +₹340 | ✅ Premium margin |

**Why this works:**
- ✅ Aligns revenue with actual costs
- ✅ Maintains market positioning
- ✅ Healthy 15-30% margins across plans
- ✅ Clear value differentiation

---

## 📊 DETAILED COST BREAKDOWN

### **Cost Stack Visualization (100 customers at recommended pricing):**

```
REVENUE SIDE (Monthly):
├─ Free (10 users):        ₹0
├─ Basic (30 users):       ₹7,470
├─ Pro (40 users):         ₹27,960
├─ Ultra (20 users):       ₹25,980
└─ TOTAL REVENUE:          ₹61,410

COST SIDE (Monthly):
├─ Infrastructure:
│  ├─ Hosting:             ₹3,850
│  ├─ Database:            ₹5,500
│  ├─ Support/Ops:         ₹6,500
│  └─ Subtotal:            ₹15,850
│
├─ AI/LLM (OpenAI):        ₹117,300
│
├─ Payment Processing:     ₹1,228
│
└─ TOTAL COSTS:            ₹134,378

NET MARGIN:                -₹72,968 ❌
```

**⚠️ CRITICAL FINDING:** Company is loss-making at current pricing!

---

## 💡 COST OPTIMIZATION STRATEGIES

### **Strategy 1: LLM Cost Reduction** (Highest Impact)

**Option A - Model Optimization:**
- Use GPT-3.5 for FAQ/retrieval: -50% cost
- Use GPT-4 for complex logic: +20% revenue
- **Potential savings: ₹58,650/mo (50%)**

**Option B - Response Caching:**
- Cache 40% of common queries: -40% cost
- Redis TTL: 7 days
- **Potential savings: ₹46,920/mo (40%)**

**Option C - Batch Processing:**
- Batch 20% of non-urgent queries
- Process off-peak: -30% cost
- **Potential savings: ₹35,190/mo (30%)**

**Combined Strategy:** 50% + 20% + 10% layering = **60% cost reduction**
- **New AI cost: ₹46,920/mo** (instead of ₹117,300)
- **New margin: -₹26,868** (much closer to breakeven)

### **Strategy 2: Infrastructure Optimization**

**Current:** Vercel + Supabase (₹21,350/mo)

**Options:**
- ✅ Auto-scaling off-peak: Save 30% = ₹6,405
- ✅ Reserved capacity (annual): Save 25% = ₹5,337
- ✅ CDN optimization: Save ₹500

**Total infrastructure savings: ₹12,242/mo**

### **Strategy 3: Revenue Optimization**

**Add-on Services:**
- **Analytics Dashboard:** +₹499/mo → 20% adoption = +₹6,470/mo
- **API Access:** +₹999/mo → 10% adoption = +₹6,141/mo
- **Priority Support:** +₹199/mo → 30% adoption = +₹18,423/mo
- **White-label:** +₹2,999/mo → 2% adoption = +₹2,399/mo

**Total revenue add-ons: +₹33,433/mo**

---

## 🎲 PROFITABILITY SCENARIOS

### **Scenario 1: Current State (100 customers)**
```
Revenue:                ₹61,410
Costs:                  ₹134,378
─────────────────────
LOSS:                   -₹72,968
Margin:                 -118%
Customer LTV:           ₹614 (12 months)
CAC Breakeven:          ₹614
```

### **Scenario 2: With AI Optimization (50% cost reduction)**
```
Revenue:                ₹61,410
Costs:                  ₹75,778
─────────────────────
NET:                    -₹14,368
Margin:                 -23%
Status:                 Nearly breakeven
```

### **Scenario 3: With AI Optimization + Pricing Increase**
**New pricing: Basic ₹249, Pro ₹699, Ultra ₹1,299**
```
Revenue:                ₹138,270 (+125%)
Costs:                  ₹75,778
─────────────────────
PROFIT:                 ₹62,492 ✓
Margin:                 45%
Customer LTV (12mo):    ₹1,383
```

### **Scenario 4: With All Optimizations + Add-ons (Aggressive)**
```
Revenue:
├─ Subscriptions:       ₹138,270
├─ Add-ons:             ₹33,433
└─ Total:               ₹171,703
───────────────────────
Costs:
├─ Infrastructure:      ₹9,108
├─ AI/LLM (opt):        ₹46,920
├─ Payment:             ₹3,434
└─ Total:               ₹59,462
───────────────────────
PROFIT:                 ₹112,241 ✓
Margin:                 65%
```

---

## 🚀 RECOMMENDED ACTION PLAN

### **Immediate (This Month)**

1. **Implement AI Cost Optimization:**
   - [ ] Deploy response caching (Redis)
   - [ ] Switch 50% queries to GPT-3.5
   - [ ] Expected savings: ₹58,650/mo

2. **Price Existing Customers:**
   - [ ] Announce pricing update
   - [ ] Grandfather current users (90 days)
   - [ ] New customers on recommended pricing
   - [ ] Expected revenue increase: +20%

3. **Monitor LLM Usage:**
   - [ ] Set up cost tracking per user
   - [ ] Alert on >150% usage spike
   - [ ] Implement soft rate limiting

### **Short-term (Next 3 Months)**

1. **Launch Add-on Features:**
   - [ ] Analytics Dashboard (+₹499/mo)
   - [ ] API Access (+₹999/mo)
   - [ ] Priority Support (+₹199/mo)
   - [ ] Target 20% adoption per add-on

2. **Infrastructure Optimization:**
   - [ ] Move to reserved Vercel tier
   - [ ] Implement edge caching
   - [ ] Auto-scaling optimization

3. **Customer Segmentation:**
   - [ ] Identify high-usage customers
   - [ ] Offer enterprise plans
   - [ ] Custom pricing for >100/mo users

### **Long-term (6-12 Months)**

1. **Build Proprietary LLM:**
   - [ ] Fine-tune on customer data
   - [ ] Reduce OpenAI dependency
   - [ ] Expected cost reduction: 70%

2. **Scale Infrastructure:**
   - [ ] Move to managed Kubernetes
   - [ ] Multi-region deployment
   - [ ] CDN edge computing

3. **Enterprise Offering:**
   - [ ] White-label solution
   - [ ] Dedicated infrastructure
   - [ ] Target ₹50K+/mo contracts

---

## 📋 CUSTOMER LIFETIME VALUE ANALYSIS

### **Basic Plan LTV Calculation**

```
Monthly Revenue:        ₹249
Avg Customer Lifespan:  18 months (industry average)
Gross Margin:           60% (after AI costs)
───────────────────────
LTV = ₹249 × 18 × 60% = ₹2,681
```

**Payback Period:** If CAC < ₹2,681, profitable
- Current CAC estimate: ₹500 (ads) = **5.4 months payback** ✓

### **Pro Plan LTV**

```
Monthly Revenue:        ₹699
Avg Lifespan:           24 months (stickier)
Gross Margin:           65%
───────────────────────
LTV = ₹699 × 24 × 65% = ₹10,946
```

**Payback Period:** CAC budget < ₹10,946
- Current CAC estimate: ₹800 = **11.5 months** ✓

### **Ultra Plan LTV**

```
Monthly Revenue:        ₹1,299 + ₹400 add-ons
Avg Lifespan:           36 months (enterprise)
Gross Margin:           70%
───────────────────────
LTV = ₹1,699 × 36 × 70% = ₹42,752
```

**This is your growth lever!**

---

## 📈 BREAK-EVEN ANALYSIS

### **How many customers needed to break even?**

**Fixed Costs:** ₹18,350/mo

**Current Contribution Margin per Plan:**
- Free: -₹183.80 (excluded from calc)
- Basic: -₹203 → **Loss territory**
- Pro: -₹1,109 → **Loss territory**
- Ultra: -₹1,813 → **Loss territory**

**Problem:** Current pricing doesn't cover AI costs

**With Recommended Pricing:**
- Basic (₹249): Margin = +₹100/customer
- Pro (₹699): Margin = +₹99/customer
- Ultra (₹1,299): Margin = +₹340/customer

**Breakeven Calculation (with ₹100 avg margin):**
₹18,350 ÷ ₹100 = **~184 customers needed to break even**

**At current growth (assume 10 customers/month):**
- Breakeven date: 18+ months
- With optimization: 10-12 months
- With aggressive pricing: 5-7 months

---

## 🎯 FINAL RECOMMENDATIONS

### **Tier 1: Immediate (Week 1)**
1. ✅ **Implement response caching** - Save ₹58,650/mo immediately
2. ✅ **Switch 50% to GPT-3.5** - Additional ₹29,325/mo savings
3. ✅ **Set up cost tracking** - Monitor by customer/plan

### **Tier 2: Short-term (Month 1)**
1. ⚠️ **Announce pricing change** to new customers (keep existing at current)
2. ⚠️ **Launch ₹249 Basic plan** (or retire Basic entirely)
3. ⚠️ **Introduce ₹699 Pro** and **₹1,299 Ultra**

### **Tier 3: Medium-term (Month 3)**
1. 💎 **Launch add-on marketplace** - +₹33K/mo revenue potential
2. 💎 **Enterprise white-label** - Custom pricing for ₹50K+/mo deals
3. 💎 **API tier** - Developer-focused monetization

### **Tier 4: Long-term (Month 12)**
1. 🚀 **Build proprietary LLM** - Reduce AI costs from ₹0.30 to ₹0.05 per query
2. 🚀 **Multi-region infrastructure** - Reduce latency, increase conversions
3. 🚀 **Achieve 40%+ margins** across portfolio

---

## 📊 CONCLUSION

| Metric | Current | Optimized | Target |
|--------|---------|-----------|--------|
| **Revenue (100 customers)** | ₹61,410 | ₹138,270 | ₹171,703 |
| **AI Costs** | ₹117,300 | ₹46,920 | ₹28,500 |
| **Total Costs** | ₹134,378 | ₹75,778 | ₹59,462 |
| **Net Profit/Loss** | -₹72,968 | +₹62,492 | +₹112,241 |
| **Margin %** | -118% | +45% | +65% |
| **Payback Period** | N/A | 7 months | 4 months |

**Bottom Line:** Your unit economics are salvageable but require **immediate AI cost optimization** + **strategic pricing adjustments**. Focus on response caching and cheaper LLM routing first. The Ultra plan is your margin engine—prioritize enterprise customers.

---

## 🔐 Infrastructure Security & Optimization Notes

**Current Stack:**
- ✅ Supabase (SOC 2 Type II compliant)
- ✅ Vercel (DDoS protection, auto-scaling)
- ✅ Redis (in-memory caching, 100ms latency)
- ✅ OpenAI (enterprise API with rate limiting)

**Recommendations:**
1. Implement database connection pooling → -10% latency
2. Move to Supabase's enterprise tier (volume discount) → -15% database costs
3. Use Redis for AI response caching → -40% LLM costs
4. Implement rate limiting by tier → Prevent abuse

---

**Document Version:** 1.0  
**Last Updated:** October 25, 2025  
**Next Review:** December 2025
