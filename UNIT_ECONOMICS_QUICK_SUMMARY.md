# TrulyBot Unit Economics - Executive Dashboard

## 🎯 Quick Summary

### Current Situation: ❌ UNPROFITABLE
- **100 customers** generating ₹61,410/mo
- **Costs** running ₹134,378/mo (due to high LLM costs)
- **Monthly loss:** -₹72,968
- **Margin:** -118%

### Root Cause: 🔴 LLM COSTS TOO HIGH
- Spending ₹117,300/mo on OpenAI
- Only earning ₹61,410/mo from subscriptions
- AI costs are **191% of total revenue**

---

## 💰 UNIT ECONOMICS BY PLAN

### PLAN 1: FREE (₹0/mo)
```
┌─────────────────────────────────┐
│ Revenue:          ₹0            │
│ AI Cost:          -₹30          │
│ Fixed Overhead:   -₹183.50      │
├─────────────────────────────────┤
│ Net:              -₹213.50      │
│ Status:           ❌ LOSS       │
│ Purpose:          Customer funnel│
└─────────────────────────────────┘
```
**Strategy:** Accept the loss. Convert 20% to paid tiers.

---

### PLAN 2: BASIC (₹99/mo) → NEEDS FIX
```
CURRENT:                      RECOMMENDED:
┌──────────────────┐         ┌──────────────────┐
│ Revenue:  ₹99    │         │ Revenue:  ₹249   │
│ AI Cost:  -₹300  │         │ AI Cost:  -₹100  │
│ Fee:      -₹2    │         │ Fee:      -₹5    │
│ Fixed:    -₹183.50│        │ Fixed:    -₹183.50│
├──────────────────┤         ├──────────────────┤
│ Net:   -₹386.50  │         │ Net:   -₹39.50   │
│ ❌ LOSS  │ Margin: -390%│   │ ~Breakeven       │
└──────────────────┘         │ Viable ✓        │
                              └──────────────────┘
```

**Action:** Raise to ₹249/mo OR reduce feature scope

---

### PLAN 3: PRO (₹399/mo) → NEEDS FIX  
```
CURRENT:                      OPTIMIZED:
┌──────────────────┐         ┌──────────────────┐
│ Revenue:  ₹399   │         │ Revenue:  ₹699   │
│ AI Cost:  -₹1,500│         │ AI Cost:  -₹600  │
│ Fee:      -₹8    │         │ Fee:      -₹14   │
│ Fixed:    -₹183.50│        │ Fixed:    -₹183.50│
├──────────────────┤         ├──────────────────┤
│ Net: -₹1,292.50  │         │ Net:   +₹-98.50  │
│ ❌ MAJOR LOSS    │         │ ~Breakeven       │
│ Margin: -324%    │         │ Viable ✓        │
└──────────────────┘         │ Margin: -14%    │
                              └──────────────────┘
```

**Action:** Raise to ₹699/mo + implement AI caching

---

### PLAN 4: ULTRA (₹599/mo) → YOUR BEST BET 💎
```
CURRENT:                      WITH ADD-ONS:
┌──────────────────┐         ┌──────────────────┐
│ Revenue:  ₹599   │         │ Base:     ₹1,299 │
│ AI Cost:  -₹2,400│         │ Add-ons:  +₹400  │
│ Fee:      -₹12   │         │ Total:    ₹1,699 │
│ Fixed:    -₹183.50│        │ AI Cost:  -₹960  │
├──────────────────┤         │ Fee:      -₹34   │
│ Net: -₹1,996.50  │         │ Fixed:    -₹183.50│
│ ❌ HUGE LOSS     │         ├──────────────────┤
│ Margin: -333%    │         │ Net:   +₹521.50  │
└──────────────────┘         │ ✅ PROFITABLE   │
                              │ Margin: +31%    │
                              └──────────────────┘
```

**Action:** Ultra plan is your profit center—focus here!

---

## 📊 COST BREAKDOWN (100 Customers)

### Monthly Expenses
```
Infrastructure:
  ├─ Vercel Hosting        ₹3,850    (5%)
  ├─ Supabase Database     ₹5,500    (8%)
  ├─ Redis Cache           ₹1,500    (2%)
  ├─ Support Tools         ₹6,500    (10%)
  └─ Monitoring & Security ₹2,500    (4%)
  ├─────────────────────────────────
  └─ SUBTOTAL: ₹20,350     (29%)

AI/LLM (OpenAI):
  └─ SUBTOTAL: ₹117,300    (63%) ⚠️ MAIN PROBLEM

Payment Processing:
  └─ SUBTOTAL: ₹1,228      (2%)

TOTAL MONTHLY: ₹138,878
```

**Biggest lever:** Reduce AI costs from ₹117,300 to ₹46,920 (-60%)

---

## 🚨 PROFITABILITY SCENARIOS

### Scenario 1: Do Nothing (Current Path)
```
100 customers
$61,410 revenue
$138,378 costs
────────────────
-$72,968 LOSS per month
```
**Timeline to bankruptcy:** 12-18 months

---

### Scenario 2: Quick Wins (AI Optimization)
```
✅ Implement response caching (-40%)
✅ Use GPT-3.5 for 50% queries (-25%)
✅ Batch process 20% queries (-10%)
────────────────────────────────────
AI costs: ₹117,300 → ₹46,920 (-60%)
────────────────────────────────────
New Monthly:
  Revenue:  ₹61,410
  Costs:    ₹75,778
  Net:      -₹14,368

Status: Nearly breakeven ✓
Timeline to profitability: 2-3 months
```

**Easy win—do this immediately!**

---

### Scenario 3: With Pricing Adjustment
```
✅ All quick wins above
✅ New pricing:
   - Basic: ₹249/mo (↑)
   - Pro: ₹699/mo (↑)
   - Ultra: ₹1,299/mo (↑)
────────────────────────────────────
Revenue:  ₹138,270 (+125%)
Costs:    ₹75,778
Net:      +₹62,492 ✓

Status: PROFITABLE
Margin: 45%
Timeline: Achievable in 1 month
```

**This is realistic.**

---

### Scenario 4: Full Optimization (Aggressive)
```
✅ All above +
✅ Launch add-ons:
   - Analytics: +₹6,470/mo
   - API access: +₹6,141/mo
   - Priority support: +₹18,423/mo
   - White-label: +₹2,399/mo
────────────────────────────────────
Revenue:  ₹171,703 (+180%)
Costs:    ₹59,462
Net:      +₹112,241 ✓✓

Status: HIGHLY PROFITABLE
Margin: 65%
Timeline: 6-12 months
```

**This is your goal state.**

---

## 🎯 ACTION PRIORITY MATRIX

### 🔴 CRITICAL (This Week)
1. **Implement AI response caching**
   - Saves: ₹46,920/mo
   - Effort: 4-8 hours
   - Risk: Low
   - Impact: **Immediate -60% AI cost**

2. **Set up cost monitoring per user**
   - Saves: Identify abuse + optimize
   - Effort: 2 hours
   - Risk: None
   - Impact: Track burn, control costs

### 🟠 HIGH PRIORITY (This Month)
3. **Update pricing for new customers**
   - Saves: +₹76,860/mo from new signups
   - Effort: 1 hour
   - Risk: Low (grandfather existing)
   - Impact: +125% revenue per customer

4. **Switch 50% queries to GPT-3.5**
   - Saves: ₹29,325/mo
   - Effort: 2-4 hours
   - Risk: Slight quality drop
   - Impact: -25% AI cost with minimal UX impact

### 🟡 MEDIUM PRIORITY (Next 3 Months)
5. **Launch add-on features**
   - Revenue: +₹33,433/mo
   - Effort: 40-60 hours
   - Risk: Feature scope creep
   - Impact: Major revenue driver

6. **Infrastructure optimization**
   - Saves: ₹12,242/mo
   - Effort: 16 hours
   - Risk: Low
   - Impact: Reduce infrastructure costs

### 🟢 FUTURE (6-12 Months)
7. **Build proprietary LLM**
   - Saves: ₹82,000+/mo
   - Effort: 400+ hours
   - Risk: High technical complexity
   - Impact: Long-term cost structure

---

## 💡 QUICK MATH: WHAT PRICING DO YOU NEED?

### If you DON'T optimize AI costs:
```
Revenue needed to break even (100 customers):
Cost: ₹134,378
Average revenue per customer: ₹1,344/mo
```
**You'd need to charge ₹400-600/mo average. Too high.**

### If you DO optimize AI (50% reduction):
```
Cost: ₹75,778
Average revenue per customer: ₹758/mo
```
**Your new pricing (Basic ₹249, Pro ₹699, Ultra ₹1,299) hits this! ✓**

---

## 📈 CUSTOMER LTV vs CAC

### Break-even Payback Period

**Basic Plan (₹249/mo with AI optimization):**
```
Monthly revenue:    ₹249
Cost of goods:      ₹80
Gross profit/mo:    ₹169

If CAC = ₹500:      3 months payback ✓
If CAC = ₹1,000:    6 months payback ✓
If CAC = ₹2,000:    12 months payback ⚠️
```

**Pro Plan (₹699/mo):**
```
Monthly revenue:    ₹699
Cost of goods:      ₹220
Gross profit/mo:    ₹479

If CAC = ₹500:      1 month payback ✓✓
If CAC = ₹1,000:    2 months payback ✓
If CAC = ₹2,000:    4 months payback ✓
```

**Ultra Plan (₹1,299/mo):**
```
Monthly revenue:    ₹1,299
Cost of goods:      ₹400
Gross profit/mo:    ₹899

If CAC = ₹2,000:    2 months payback ✓✓✓
If CAC = ₹5,000:    5 months payback ✓✓
If CAC = ₹10,000:   11 months payback ✓
```

**Conclusion:** Pro and Ultra have excellent unit economics!

---

## 🚀 30-DAY IMPLEMENTATION ROADMAP

### Week 1: AI Cost Reduction
- [ ] Deploy Redis caching layer (target 40% hit rate)
- [ ] Implement GPT-3.5 routing for 50% queries
- [ ] Set up cost tracking by plan
- [ ] **Expected: -₹58,650/mo savings**

### Week 2: Monitoring & Quality
- [ ] Monitor LLM quality metrics
- [ ] Set up alerts for high-usage accounts
- [ ] Implement soft rate limiting
- [ ] **Expected: Maintain 95%+ quality**

### Week 3: Revenue
- [ ] Announce pricing updates (1 month grandfathering)
- [ ] Update pricing page (new customers only)
- [ ] Document plan comparison
- [ ] **Expected: +₹10K/mo from new signups**

### Week 4: Scale
- [ ] Monitor uptake on new pricing
- [ ] Iterate on feature communication
- [ ] Prepare add-ons for launch
- [ ] **Expected: -₹14K/mo loss → near breakeven**

---

## 🎯 FINANCIAL TARGETS (12 Months)

| Metric | Month 1 | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|----------|
| **Customers** | 100 | 150 | 250 | 500 |
| **Revenue** | ₹138K | ₹180K | ₹310K | ₹650K |
| **AI Costs** | ₹47K | ₹65K | ₹105K | ₹185K |
| **Net Profit** | ₹62K | ₹95K | ₹180K | ₹420K |
| **Margin** | 45% | 53% | 58% | 65% |

**This is achievable with proper execution.**

---

## 🏆 SUCCESS METRICS

Track these weekly:
- [ ] AI cost per customer (target: <₹500/mo)
- [ ] Revenue per customer (target: >₹700/mo)
- [ ] Gross margin (target: >50%)
- [ ] Customer acquisition cost (target: <₹1,000)
- [ ] Payback period (target: <3 months)
- [ ] Churn rate (target: <5%/mo)

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Customers churn due to price increase | -₹20K/mo | Grandfather for 90 days |
| AI quality drops with GPT-3.5 | Churn ↑ | A/B test 20% traffic first |
| OpenAI raises prices | +₹30K/mo cost | Lock in current rates, explore alternatives |
| Competitors undercut prices | Churn ↑ | Focus on Ultra plan (premium positioning) |
| Infrastructure breaks under scale | Outage = churn | Load test before scaling |

---

## 📞 Questions to Answer

1. **What's your actual current customer base?** (This analysis assumes 100)
2. **What's your average CAC?** (Customer Acquisition Cost)
3. **What's your current churn rate?**
4. **Are you open to raising prices?** (Critical for profitability)
5. **Can you implement AI caching?** (Your biggest lever)

---

## 🎬 NEXT STEPS

1. **Read full analysis:** `UNIT_ECONOMICS_ANALYSIS.md`
2. **Review your actual metrics** against this model
3. **Prioritize quick wins** (AI optimization)
4. **Implement by end of month**
5. **Track & iterate weekly**

**Timeline to profitability: 1-3 months with proper execution** ✓

---

**Created:** October 25, 2025
**Status:** Ready for action
