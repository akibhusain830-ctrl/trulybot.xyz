# ⚡ QUICK ACTION PLAN - Production Deployment

## Current Status: 82/100 ✅

**Good News:**
- ✅ Build verified and working
- ✅ Database schema fixed (FK constraints working)
- ✅ Authentication solid
- ✅ Payment system 88/100
- ✅ Error handling good
- ✅ 3 valid orders, all data consistent

---

## 🚨 CRITICAL ISSUES - MUST FIX FIRST

### 1. Rate Limiting (Currently Memory-Based ❌)
**Problem:** Not shared across multiple servers  
**Impact:** Can be bypassed with 1 load balancer restart  
**Fix Time:** 2 hours  

```typescript
// REPLACE: src/lib/security/rateLimiting.ts
// Use Redis instead of Map<string, number>
import redis from 'redis-client';

export class RateLimiter {
  async checkLimit(key: string, max: number, window: number): Promise<boolean> {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, window);
    }
    return count <= max;
  }
}
```

**Action Items:**
- [ ] Install redis package: `npm install redis`
- [ ] Create redis client in `src/lib/redisClient.ts`
- [ ] Update rateLimiter to use Redis
- [ ] Test with multiple server instances
- **Estimated:** 2 hours

---

### 2. Razorpay Webhooks (Missing Handler ❌)
**Problem:** Payment confirmation is manual only  
**Impact:** Users' subscriptions not auto-activated  
**Fix Time:** 3 hours

```typescript
// CREATE: src/app/api/webhooks/razorpay/route.ts
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.text();
  
  // Verify signature
  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');
  
  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }
  
  const event = JSON.parse(body);
  
  if (event.event === 'payment.authorized') {
    // Activate subscription
    const { user_id, plan_id } = event.payload.payment.entity.notes;
    await ProfileManager.activateSubscription(user_id, plan_id, event.payload.payment.entity.id);
  }
  
  return NextResponse.json({ success: true });
}
```

**Action Items:**
- [ ] Create webhook endpoint
- [ ] Add webhook secret to `.env.production`
- [ ] Register webhook in Razorpay dashboard
- [ ] Implement retry logic
- [ ] Add logging for webhook events
- **Estimated:** 3 hours

---

### 3. Security Headers (Missing CSP, HSTS ❌)
**Problem:** XSS, clickjacking, HTTPS downgrade possible  
**Impact:** High security risk  
**Fix Time:** 30 minutes

```typescript
// ADD TO: src/middleware.ts or next.config.js
export const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' checkout.razorpay.com"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  }
];
```

**Action Items:**
- [ ] Add headers to `next.config.js` or middleware
- [ ] Test with curl/browser dev tools
- [ ] Verify no scripts blocked
- **Estimated:** 30 minutes

---

### 4. Subscription Renewal (Not Automated ❌)
**Problem:** Subscriptions expire but don't auto-renew  
**Impact:** Users lose access without warning  
**Fix Time:** 2 hours

```typescript
// CREATE: src/jobs/subscription-renewal.ts
export async function renewSubscriptions() {
  // Find subscriptions expiring in 1 day
  const expiringSubscriptions = await supabase
    .from('profiles')
    .select('*')
    .eq('subscription_status', 'active')
    .lte('subscription_ends_at', tomorrow)
    .gte('subscription_ends_at', today);
  
  for (const profile of expiringSubscriptions.data) {
    // Send renewal reminder email
    // If has saved payment method, attempt auto-renewal
  }
}

// Schedule via: https://vercel.com/docs/crons
```

**Action Items:**
- [ ] Create renewal job function
- [ ] Set up Vercel cron (daily at 9 AM)
- [ ] Add renewal email template
- [ ] Test renewal flow
- **Estimated:** 2 hours

---

### 5. Integration Tests (Currently Missing ❌)
**Problem:** Can't verify full payment flow works  
**Impact:** Bugs slip to production  
**Fix Time:** 4 hours

```typescript
// CREATE: src/tests/integration/payment-flow.test.ts
import { test, expect } from 'vitest';

test('Complete payment flow: order → payment → verification → subscription', async () => {
  // 1. Create order
  const order = await fetch('/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ planId: 'pro', currency: 'INR', billingPeriod: 'monthly' })
  }).then(r => r.json());
  
  expect(order.id).toBeDefined();
  
  // 2. Mock Razorpay payment
  const paymentId = 'pay_' + Date.now();
  
  // 3. Verify payment
  const verification = await fetch('/api/payments/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      razorpay_order_id: order.id,
      razorpay_payment_id: paymentId,
      razorpay_signature: generateSignature(order.id, paymentId)
    })
  }).then(r => r.json());
  
  expect(verification.success).toBe(true);
  
  // 4. Verify subscription activated
  const profile = await getProfile();
  expect(profile.subscription_status).toBe('active');
  expect(profile.subscription_tier).toBe('pro');
});
```

**Action Items:**
- [ ] Create integration test file
- [ ] Add test fixtures (mock orders, users)
- [ ] Write payment flow test
- [ ] Write subscription test
- [ ] Add to CI/CD pipeline
- **Estimated:** 4 hours

---

## 📋 PRE-PRODUCTION CHECKLIST

### Must Have Before Deployment
- [ ] Rate limiting using Redis
- [ ] Razorpay webhook handler
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Subscription renewal automation
- [ ] Integration tests passing
- [ ] `.env.production` configured with real secrets
- [ ] Backup restoration tested
- [ ] Monitoring/alerting set up
- [ ] On-call engineer assigned

### Nice to Have
- [ ] E2E tests
- [ ] Load testing results
- [ ] 2FA implementation
- [ ] API versioning
- [ ] Audit logging

---

## 🎯 ESTIMATED TIMELINE

| Task | Duration | Priority |
|------|----------|----------|
| Redis rate limiting | 2 hours | CRITICAL |
| Razorpay webhooks | 3 hours | CRITICAL |
| Security headers | 30 min | CRITICAL |
| Subscription renewal | 2 hours | CRITICAL |
| Integration tests | 4 hours | HIGH |
| Monitoring setup | 2 hours | HIGH |
| **Total** | **~13.5 hours** | - |

**Realistic Timeline:**
- Day 1: Rate limiting + security headers (2.5 hours)
- Day 2: Razorpay webhooks + renewal (5 hours)
- Day 3: Integration tests + monitoring (6 hours)
- **Deploy:** Day 4 morning

---

## 🚀 DEPLOYMENT STEPS

### 1. Pre-Deployment (Day 3 evening)
```bash
# Verify build
npm run build

# Run tests
npm run test:unit -- --run
npm run test:integration -- --run

# Check security headers
curl -I https://localhost:3000
```

### 2. Deploy to Staging
```bash
# Merge to staging branch
git push origin staging

# Deploy via Vercel (or your pipeline)
vercel deploy --prod
```

### 3. Smoke Tests on Staging
```bash
# Health check
curl https://staging.trulybot.xyz/api/health

# Test payment flow manually
# Test auth flow manually
# Test subscription manually
```

### 4. Production Deployment
```bash
# Set production environment variables
vercel env add RAZORPAY_WEBHOOK_SECRET

# Deploy
vercel deploy --prod

# Verify
curl https://trulybot.xyz/api/health
```

### 5. Post-Deployment Monitoring
```bash
# Watch logs
vercel logs --follow

# Monitor Sentry
# Monitor uptime
# Monitor database
```

---

## 📞 SUPPORT CONTACTS

While deploying, have these ready:
- Supabase support for database issues
- Razorpay support for payment issues
- Vercel support for deployment issues
- Redis support if using managed Redis

---

## ⚠️ ROLLBACK PLAN

If critical issue found:
```bash
# Vercel has automatic rollback
# Just redeploy previous version
vercel deploy --prod --yes

# Or use Vercel dashboard to promote previous deployment
```

---

**Last Updated:** October 25, 2025  
**Status:** READY FOR IMPLEMENTATION  
**Estimated Completion:** 3 days
