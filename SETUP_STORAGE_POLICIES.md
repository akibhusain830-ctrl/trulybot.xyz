# 🚨 URGENT: Setup Storage Policies for Logo Upload

## The storage.policies table doesn't exist in your Supabase version, so we need to create policies via the Dashboard UI.

## 📋 Step-by-Step Instructions:

### 1. Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Navigate to **Storage** → **Policies** (left sidebar)
3. You should see the `chatbot-assets` bucket listed

### 2. Create Upload Policy
1. Click **New Policy** next to the `chatbot-assets` bucket
2. Choose **For full customization** (custom policy)
3. Fill in these details:
   - **Policy Name**: `Allow authenticated uploads`
   - **Allowed Operation**: `INSERT`
   - **Target Roles**: `authenticated`
   - **Policy Definition**: 
     ```sql
     auth.uid() IS NOT NULL
     ```

### 3. Create Read Policy
1. Click **New Policy** again for the `chatbot-assets` bucket
2. Choose **For full customization** (custom policy)
3. Fill in these details:
   - **Policy Name**: `Allow public reads`
   - **Allowed Operation**: `SELECT`
   - **Target Roles**: `public`
   - **Policy Definition**: 
     ```sql
     true
     ```

### 4. Create Update Policy (for logo replacement)
1. Click **New Policy** again for the `chatbot-assets` bucket
2. Choose **For full customization** (custom policy)
3. Fill in these details:
   - **Policy Name**: `Allow authenticated updates`
   - **Allowed Operation**: `UPDATE`
   - **Target Roles**: `authenticated`
   - **Policy Definition**: 
     ```sql
     auth.uid() IS NOT NULL
     ```

### 5. Create Delete Policy (for logo removal)
1. Click **New Policy** again for the `chatbot-assets` bucket
2. Choose **For full customization** (custom policy)
3. Fill in these details:
   - **Policy Name**: `Allow authenticated deletes`
   - **Allowed Operation**: `DELETE`
   - **Target Roles**: `authenticated`
   - **Policy Definition**: 
     ```sql
     auth.uid() IS NOT NULL
     ```

## ✅ After Creating All 4 Policies:

Your `chatbot-assets` bucket should have these policies:
- ✅ Allow authenticated uploads (INSERT)
- ✅ Allow public reads (SELECT) 
- ✅ Allow authenticated updates (UPDATE)
- ✅ Allow authenticated deletes (DELETE)

## 🧪 Test Logo Upload:

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3001/dashboard

3. Try uploading a logo - it should now work!

## 🚨 CRITICAL: This Must Be Done Before Dashboard Will Work

The logo upload feature is essential because:
- Customer logos appear on their websites when chatbot is embedded
- This is a core branding feature for your customers
- Dashboard will show errors until storage policies are in place

---

**After setting up policies, the dashboard should be fully functional!**