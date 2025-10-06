# 🚨 URGENT: Fix Logo Upload - Step by Step

## The Problem:
Your dashboard shows "Failed to upload logo" because the storage policies are missing.

## 📋 EXACT STEPS TO FIX:

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Click **Storage** in the left sidebar
3. Click **Policies** 
4. You should see `chatbot-assets` bucket listed

### Step 2: Create Policy 1 - Allow Uploads
1. Click **"New Policy"** next to `chatbot-assets`
2. Choose **"For full customization"**
3. Fill in:
   ```
   Policy name: Allow authenticated uploads
   Allowed operation: INSERT
   Target roles: authenticated
   WITH CHECK expression: auth.uid() IS NOT NULL
   ```
4. Click **Review** → **Save policy**

### Step 3: Create Policy 2 - Allow Public Reads
1. Click **"New Policy"** again next to `chatbot-assets`
2. Choose **"For full customization"**
3. Fill in:
   ```
   Policy name: Allow public reads
   Allowed operation: SELECT  
   Target roles: public
   WITH CHECK expression: true
   ```
4. Click **Review** → **Save policy**

### Step 4: Create Policy 3 - Allow Updates
1. Click **"New Policy"** again next to `chatbot-assets`
2. Choose **"For full customization"**
3. Fill in:
   ```
   Policy name: Allow authenticated updates
   Allowed operation: UPDATE
   Target roles: authenticated
   WITH CHECK expression: auth.uid() IS NOT NULL
   ```
4. Click **Review** → **Save policy**

### Step 5: Create Policy 4 - Allow Deletes
1. Click **"New Policy"** again next to `chatbot-assets`
2. Choose **"For full customization"**
3. Fill in:
   ```
   Policy name: Allow authenticated deletes
   Allowed operation: DELETE
   Target roles: authenticated
   WITH CHECK expression: auth.uid() IS NOT NULL
   ```
4. Click **Review** → **Save policy**

### Step 6: Verify All Policies Created
After creating all 4 policies, your `chatbot-assets` bucket should show:
```
📁 chatbot-assets
   ├── 🔒 Allow authenticated uploads (INSERT)
   ├── 🌍 Allow public reads (SELECT)
   ├── ✏️ Allow authenticated updates (UPDATE)
   └── 🗑️ Allow authenticated deletes (DELETE)
```

### Step 7: Test Logo Upload
1. Go back to your dashboard: http://localhost:3001/dashboard/settings
2. Try uploading a logo again
3. Should work without "Failed to upload logo" error!

## 🚨 CRITICAL NOTES:

1. **You MUST create all 4 policies** - missing any one will cause upload failures
2. **Policy 2 must be "public" role with "true" expression** - this allows customer logos to show on their websites
3. **Use exact expressions**: `auth.uid() IS NOT NULL` and `true`
4. **Choose "For full customization"** not the templates

## 🆘 If Still Not Working:

1. Check browser console for specific errors
2. Verify you're logged in to the dashboard
3. Make sure all 4 policies show in Supabase Storage Policies
4. Restart dev server: `npm run dev`

**Customer logos are critical - they appear on customer websites when chatbot is embedded!**