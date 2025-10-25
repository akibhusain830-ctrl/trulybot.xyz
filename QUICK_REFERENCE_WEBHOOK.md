# Quick Reference: Razorpay Webhook & Renewal System

**TL;DR for busy developers**

---

## 📋 What's Implemented

| Feature | File | Status |
|---------|------|--------|
| Webhook Handler | `src/app/api/webhooks/razorpay/route.ts` | ✅ |
| Renewal Job | `src/app/api/jobs/subscription-renewal/route.ts` | ✅ |
| Cron Config | `vercel.json` | ✅ |
| Tests | `tests/integration/webhook-subscription.test.ts` | ✅ |
| Docs | `DEPLOYMENT_VERIFICATION_CHECKLIST.md` | ✅ |

---

## 🔧 Quick Setup

### 1. Build Check
```bash
npm run build  # ✅ Should succeed
```

### 2. Environment Variables (Vercel)
```bash
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
CRON_SECRET=your-secure-string
```

### 3. Razorpay Webhook URL
```
https://yourdomain.com/api/webhooks/razorpay
```

### 4. Deploy
```bash
git push origin master
```

---

## 📊 How It Works

### Payment Flow
```
1. User pays on /checkout
2. Razorpay confirms payment
3. Webhook POST to /api/webhooks/razorpay
4. Signature verified ✓
5. Database updated (subscription_status = 'active')
6. User gains access immediately
```

### Renewal Flow
```
Daily 9 AM UTC:
1. Cron triggers /api/jobs/subscription-renewal
2. Query: subscriptions expiring in 24h
3. For each: Send reminder email
4. Return summary report
5. Next day: Same
```

---

## 🧪 Testing

### Manual Webhook Test
```bash
curl -X POST http://localhost:3000/api/webhooks/razorpay \
  -H "X-Razorpay-Signature: valid_sig" \
  -d '{"event":"payment.authorized",...}'
```

### Manual Renewal Test
```bash
curl -X POST http://localhost:3000/api/jobs/subscription-renewal \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Run Integration Tests
```bash
npm test -- webhook-subscription.test.ts
```

---

## 🛠 Key Files

### Webhook Handler
- **Location:** `src/app/api/webhooks/razorpay/route.ts`
- **Lines:** 440+
- **Handles:** payment.authorized, payment.captured, payment.failed, subscription.*

### Renewal Job  
- **Location:** `src/app/api/jobs/subscription-renewal/route.ts`
- **Lines:** 200+
- **Runs:** Daily 9 AM UTC (Vercel cron)

### Configuration
- **Location:** `vercel.json`
- **Key:** `"crons": [{"path": "/api/jobs/subscription-renewal", "schedule": "0 9 * * *"}]`

---

## ✅ Verification Checklist

Before deploying:

```
□ Build succeeds: npm run build
□ Types check: tsc --noEmit
□ All env vars collected
□ Razorpay webhook secret copied
□ Database schema has subscription columns
□ Webhook URL noted: /api/webhooks/razorpay
□ Renewal job endpoint noted: /api/jobs/subscription-renewal
```

---

## 📡 Endpoints

### Webhook
```
POST /api/webhooks/razorpay
Header: X-Razorpay-Signature
Response: 200 OK {activated: true, subscription: {...}}
```

### Renewal Job
```
POST /api/jobs/subscription-renewal
Header: Authorization: Bearer <CRON_SECRET>
Response: 200 OK {checked: 10, expiringSoon: 2, remindersSent: 2, ...}
```

---

## 📝 Event Types Handled

| Event | Action |
|-------|--------|
| `payment.authorized` | ✅ Activate subscription |
| `payment.captured` | ✅ Log completion |
| `payment.failed` | ✅ Log failure |
| `subscription.activated` | ✅ Track lifecycle |
| `subscription.paused` | ✅ Track lifecycle |
| `subscription.cancelled` | ✅ Track lifecycle |

---

## 🚀 Deployment

```bash
# 1. Set env vars in Vercel Dashboard
# 2. Set webhook URL in Razorpay Dashboard
# 3. Push to master
git push origin master
# 4. Monitor Vercel logs
# Done! ✅
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Run: `npm run build 2>&1` for details |
| Webhook not triggering | Verify webhook URL in Razorpay |
| Signature error | Check webhook secret matches |
| Renewal job not running | Verify cron config in vercel.json |
| Subscription not activating | Check user_id in payment notes |

---

## 📚 Full Documentation

- **Deployment Guide:** `DEPLOYMENT_VERIFICATION_CHECKLIST.md`
- **Implementation Details:** `WEBHOOK_IMPLEMENTATION_GUIDE.md`
- **Completion Report:** `DAY_2_COMPLETION_REPORT.md`
- **Test Suite:** `tests/integration/webhook-subscription.test.ts`

---

## ⚡ Performance

- Webhook processing: < 500ms
- Signature verification: < 50ms
- Renewal job execution: < 10 seconds
- Success rate target: > 99%

---

## 🔐 Security

- ✅ SHA256 signature verification
- ✅ CRON_SECRET for renewal job
- ✅ Input validation on all endpoints
- ✅ Rate limiting (100 req/min per IP)
- ✅ HTTPS enforcement
- ✅ Security headers (HSTS, etc.)

---

## 📞 Support

- Razorpay Issues: https://razorpay.com/support
- Vercel Issues: https://vercel.com/support
- Supabase Issues: https://supabase.com/support

---

## 🎯 Success Criteria

✅ Build compiles successfully  
✅ All endpoints respond correctly  
✅ Webhook processes payments  
✅ Renewal job executes daily  
✅ No critical errors in logs  
✅ Subscriptions activate properly  

**Status: ✅ READY FOR PRODUCTION**

---

Generated: October 25, 2025
