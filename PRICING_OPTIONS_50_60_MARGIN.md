# TrulyBot Pricing Analysis: 50-60% Profit Margin Plans

## GPT-4o Mini Cost Base (Verified October 2025)

### API Pricing
- **Input**: $0.00015 per 1K tokens (₹0.0125/1K)
- **Pro Output**: $0.0006 per 1K tokens (₹0.05/1K)
- **Average per reply**: ~150 input tokens + ~200 output tokens = ₹0.01375/reply

### Supporting Infrastructure (Monthly Fixed Costs: ₹16,350)
- **Vercel Hosting**: ₹3,850/mo
- **Supabase PostgreSQL**: ₹4,000/mo
- **Redis Caching**: ₹1,500/mo
- **Support Tools & Monitoring**: ₹6,500/mo
- **Payment Processing Fee**: 2% of transactions
- **Buffer**: ₹500/mo

---

## Profit Margin Calculation Model

### Formula for Each Plan:
```
Gross Profit = (Monthly Revenue) - (AI Costs for all users in tier)
Profit Margin = Gross Profit / Monthly Revenue × 100%

For N users in a tier:
- Monthly Revenue = Price × N
- AI Costs = (Replies Allowed × ₹0.01375) × N
- Gross Profit = (Price × N) - (Replies × ₹0.01375 × N)
- Profit Margin = ((Price - (Replies × ₹0.01375)) / Price) × 100%
```

### Target: 50-60% Profit Margin per User

**This means:** Each user should generate ₹X where 50-60% is profit after AI costs

---

## OPTION SET A: Conservative (High Reply Allowances)

### Plan A1: Free
- **Price**: ₹0
- **Monthly Replies Allowed**: 100 replies/month
- **AI Cost per User**: ₹1.375
- **Margin**: 0% (Loss: -₹1.375) ✓ Acceptable for trial/acquisition

### Plan A2: Basic 
- **Price**: ₹199/month
- **Monthly Replies Allowed**: 2,000 replies/month
- **AI Cost per User**: ₹27.50
- **Profit per User**: ₹171.50
- **Profit Margin**: **86.2%** ✅ EXCELLENT (Well above 50-60%)

### Plan A3: Pro
- **Price**: ₹499/month
- **Monthly Replies Allowed**: 8,000 replies/month
- **AI Cost per User**: ₹110
- **Profit per User**: ₹389
- **Profit Margin**: **77.9%** ✅ EXCELLENT

### Plan A4: Ultra
- **Price**: ₹799/month
- **Monthly Replies Allowed**: Unlimited (assume 25,000 avg)
- **AI Cost per User**: ₹343.75
- **Profit per User**: ₹455.25
- **Profit Margin**: **57%** ✅ Perfect (60% target)

---

## OPTION SET B: Balanced (Medium Reply Allowances)

### Plan B1: Free
- **Price**: ₹0
- **Monthly Replies Allowed**: 100 replies/month
- **AI Cost per User**: ₹1.375
- **Margin**: 0% ✓ Acceptable

### Plan B2: Basic
- **Price**: ₹149/month
- **Monthly Replies Allowed**: 1,000 replies/month
- **AI Cost per User**: ₹13.75
- **Profit per User**: ₹135.25
- **Profit Margin**: **90.8%** ✅ (Most aggressive - good for volume)

### Plan B3: Pro
- **Price**: ₹399/month
- **Monthly Replies Allowed**: 5,000 replies/month
- **AI Cost per User**: ₹68.75
- **Profit per User**: ₹330.25
- **Profit Margin**: **82.8%** ✅

### Plan B4: Ultra
- **Price**: ₹699/month
- **Monthly Replies Allowed**: Unlimited (assume 20,000 avg)
- **AI Cost per User**: ₹275
- **Profit per User**: ₹424
- **Profit Margin**: **60.7%** ✅ Perfect target

---

## OPTION SET C: Aggressive (Lower Pricing, Lower Allowances)

### Plan C1: Free
- **Price**: ₹0
- **Monthly Replies Allowed**: 75 replies/month
- **AI Cost per User**: ₹1.03
- **Margin**: 0% ✓

### Plan C2: Basic
- **Price**: ₹99/month
- **Monthly Replies Allowed**: 500 replies/month (2.5x cheaper than original ₹99)
- **AI Cost per User**: ₹6.88
- **Profit per User**: ₹92.12
- **Profit Margin**: **93%** ✅ (Most accessible tier - great for SMBs)

### Plan C3: Pro
- **Price**: ₹299/month
- **Monthly Replies Allowed**: 3,000 replies/month
- **AI Cost per User**: ₹41.25
- **Profit per User**: ₹257.75
- **Profit Margin**: **86.2%** ✅

### Plan C4: Ultra
- **Price**: ₹599/month
- **Monthly Replies Allowed**: Unlimited (assume 15,000 avg)
- **AI Cost per User**: ₹206.25
- **Profit per User**: ₹392.75
- **Profit Margin**: **65.6%** ✅ (Slightly above target)

---

## OPTION SET D: Premium (Higher Pricing, Premium Allowances)

### Plan D1: Free
- **Price**: ₹0
- **Monthly Replies Allowed**: 100 replies/month
- **AI Cost per User**: ₹1.375
- **Margin**: 0%

### Plan D2: Basic
- **Price**: ₹249/month
- **Monthly Replies Allowed**: 3,000 replies/month
- **AI Cost per User**: ₹41.25
- **Profit per User**: ₹207.75
- **Profit Margin**: **83.4%** ✅

### Plan D3: Pro
- **Price**: ₹599/month
- **Monthly Replies Allowed**: 10,000 replies/month (BEST VALUE)
- **AI Cost per User**: ₹137.50
- **Profit per User**: ₹461.50
- **Profit Margin**: **77%** ✅

### Plan D4: Ultra
- **Price**: ₹999/month
- **Monthly Replies Allowed**: Unlimited (assume 30,000 avg)
- **AI Cost per User**: ₹412.50
- **Profit per User**: ₹586.50
- **Profit Margin**: **58.7%** ✅ Near perfect

---

## OPTION SET E: Value-Focused (Best for Growth, Lower Margins)

### Plan E1: Free
- **Price**: ₹0
- **Monthly Replies Allowed**: 50 replies/month
- **AI Cost per User**: ₹0.69
- **Margin**: 0%

### Plan E2: Basic
- **Price**: ₹79/month
- **Monthly Replies Allowed**: 250 replies/month
- **AI Cost per User**: ₹3.44
- **Profit per User**: ₹75.56
- **Profit Margin**: **95.6%** ✅ (MOST AGGRESSIVE - Best for acquisition)

### Plan E3: Pro
- **Price**: ₹249/month
- **Monthly Replies Allowed**: 2,000 replies/month
- **AI Cost per User**: ₹27.50
- **Profit per User**: ₹221.50
- **Profit Margin**: **88.9%** ✅

### Plan E4: Ultra
- **Price**: ₹499/month
- **Monthly Replies Allowed**: Unlimited (assume 12,000 avg)
- **AI Cost per User**: ₹165
- **Profit per User**: ₹334
- **Profit Margin**: **67%** ✅ (Good margin with lower price)

---

## Comparison Matrix

| Option | Free Replies | Basic (Replies/Price) | Pro (Replies/Price) | Ultra (Replies/Price) | Recommended For |
|--------|-------------|----------------------|--------------------|-----------------------|-----------------|
| **A** | 100 | 2K/₹199 | 8K/₹499 | Unlimited/₹799 | B2B Premium |
| **B** | 100 | 1K/₹149 | 5K/₹399 | Unlimited/₹699 | **BALANCED** ⭐ |
| **C** | 75 | 500/₹99 | 3K/₹299 | Unlimited/₹599 | Mass Market/SMBs |
| **D** | 100 | 3K/₹249 | 10K/₹599 | Unlimited/₹999 | Enterprise Focus |
| **E** | 50 | 250/₹79 | 2K/₹249 | Unlimited/₹499 | Growth Hacking |

---

## Profitability at Different Customer Volumes

### Scenario: 100 Customers (Mixed Tier Distribution)

**Assumptions**: 70% Free tier, 15% Basic, 10% Pro, 5% Ultra

#### Using Option B (Balanced):
```
Free Tier (70 users): ₹0 revenue, -₹96.25 cost = -₹6,738
Basic (15 users): ₹2,235 revenue, -₹206.25 cost = +₹2,029
Pro (10 users): ₹3,990 revenue, -₹687.50 cost = +₹3,303
Ultra (5 users): ₹3,495 revenue, -₹1,375 cost = +₹2,120

Total Revenue: ₹9,720
Total AI Costs: ₹2,365
Total Fixed Costs: ₹16,350
Total Expenses: ₹18,715

NET PROFIT/LOSS: -₹8,995 (Still unprofitable)
```

**To break even with Option B**: Need ~155 customers (or 30% conversion to paid)

#### Using Option E (Value-Focused):
```
Free Tier (70 users): ₹0 revenue, -₹48.30 cost = -₹3,381
Basic (15 users): ₹1,185 revenue, -₹51.60 cost = +₹1,134
Pro (10 users): ₹2,490 revenue, -₹275 cost = +₹2,215
Ultra (5 users): ₹2,495 revenue, -₹825 cost = +₹1,670

Total Revenue: ₹6,170
Total AI Costs: ₹1,150
Total Fixed Costs: ₹16,350
Total Expenses: ₹17,500

NET PROFIT/LOSS: -₹11,330 (More loss due to lower pricing)
```

---

## Strategic Recommendation: Option B (Balanced)

### Why Option B is Best:
1. **50-60% Margin on Premium Tiers**: Ultra at 60.7% exactly hits target
2. **Aggressive Basic Pricing**: ₹149 appeals to SMBs, still 90% margin
3. **Competitive Pro**: ₹399 with 5K replies is strong value positioning
4. **Scalable**: Margins remain healthy across all tiers
5. **Customer Acquisition**: Lower basic price accelerates user growth

### Current vs Recommended:
```
CURRENT PRICING:
Free: 100 replies      → Basic: 1K/₹99     → Pro: ∞/₹399      → Ultra: ∞/₹599
Margins: Variable      → 72.9%              → N/A (unlimited)   → 64%

OPTION B (RECOMMENDED):
Free: 100 replies      → Basic: 1K/₹149    → Pro: 5K/₹399     → Ultra: ∞/₹699
Margins: 0% (loss)     → 90.8% ✅          → 82.8% ✅          → 60.7% ✅
                           ↑                    ↑                    ↑
                        50%+ margin         50%+ margin         60% target
```

---

## Implementation Priority

### Immediate Changes (High Impact):
1. ✅ **Keep Current Free**: 100 replies/month (no change needed)
2. ✨ **Update Basic**: Raise price from ₹99 → ₹149 (increase replies to 1,000)
3. ✨ **Update Pro**: Keep price ₹399, but clarify 5,000 replies (not unlimited)
4. ✨ **Update Ultra**: Keep price ₹599 → ₹699 (or keep at ₹599 if aggressive growth target)

### Why This Works:
- **Revenue increase**: Basic moves from ₹99 → ₹149 (+50.5% per user)
- **Clearer value**: Pro tier now has defined limit (better UX)
- **Ultra improves margins**: From 64% → 60.7% (hits target exactly)
- **Pro maintains ceiling**: At 5K replies vs unlimited, more sustainable

---

## Next Steps

1. **Update PRICING_TIERS** in `src/lib/constants/pricing.ts`
2. **Update UI messaging** to highlight reply allowances
3. **Monitor CAC** (Customer Acquisition Cost) and adjust if needed
4. **Test pricing** with small cohort before full rollout
5. **Track margin% monthly** to ensure 50-60% on paid tiers

---

## Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Users hit reply limits | Medium | Churn | Generous limits, easy upgrade path |
| Lower Basic price undercuts | Low | Brand confusion | Keep positioning premium (5x more replies) |
| Margin compression from heavy users | Medium | Revenue loss | Implement tiered pricing surge pricing if usage spikes |

---

**Document Generated**: October 25, 2025
**Profit Target**: 50-60% margins on paid tiers
**Recommendation**: **Option B - Balanced** (₹149/₹399/₹699)
