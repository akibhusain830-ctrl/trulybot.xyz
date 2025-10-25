# 📋 PRODUCTION DEPLOYMENT CHECKLIST

## Step 1: Gather Your Credentials (5 minutes)

### Supabase Credentials
1. Go to: https://app.supabase.com/projects
2. Click your project
3. Click "Settings" → "API"
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (KEEP SECRET!)

### OpenAI API Key
1. Go to: https://platform.openai.com/account/api-keys
2. Create or copy your API key
3. Paste → `OPENAI_API_KEY`

### Razorpay (Live Keys - NOT Test Keys!)
1. Go to: https://dashboard.razorpay.com/app/settings/api-keys
2. Make sure you're in **Production** mode (not Test)
3. Copy:
   - **Key ID** → `RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`

### Sentry (Error Monitoring)
1. Go to: https://sentry.io (create free account if needed)
2. Create a new Next.js project
3. Copy the DSN → `NEXT_PUBLIC_SENTRY_DSN`

### Session Secret (Generate random string)
```bash
# Run this in your terminal to generate a secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy output → `SESSION_SECRET`

---

## Step 2: Create .env.production File

1. Open your project in VS Code
2. Create new file: `.env.production`
3. Copy template from `.env.production.template`
4. Fill in your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SESSION_SECRET=<generated-from-node-command>
ALLOWED_ORIGINS=https://trulybot.xyz,https://www.trulybot.xyz
```

5. **⚠️ IMPORTANT: DO NOT commit `.env.production` to git**
   - It's already in `.gitignore`
   - Never share these secrets

---

## Step 3: Deploy to Vercel

### Option A: Using Deploy Script (Recommended)
```bash
cd c:\Users\akib\Desktop\trulybot.xyz
./deploy.sh production vercel
```

### Option B: Manual Vercel Deployment
1. Go to: https://vercel.com/import
2. Select your GitHub repo
3. Add environment variables from `.env.production`
4. Click "Deploy"

---

## Step 4: Verify Production is Working

### Check Health Endpoints
```bash
curl https://trulybot.xyz/api/health
curl https://trulybot.xyz/api/healthz
```

Expected responses:
- Health endpoint shows: database ✓, openai ✓, environment ✓
- Healthz endpoint returns 200 OK

### Test Payment System
1. Go to https://trulybot.xyz/pricing
2. Click "Subscribe"
3. Use Razorpay test card: 4111 1111 1111 1111
4. Should complete without errors

### Monitor Errors
- Check Sentry dashboard: https://sentry.io
- Should see 0 errors in production

---

## ✅ When You're Ready

Once you have all credentials, run:
```bash
npm run build
./deploy.sh production vercel
```

Then share the Vercel deployment URL with me!

