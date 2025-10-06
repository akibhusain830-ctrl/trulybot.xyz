# 📋 DETAILED STORAGE POLICIES SETUP GUIDE

## Go to: Supabase Dashboard → Storage → Policies

You should see the `chatbot-assets` bucket listed. Click **"New Policy"** next to it.

---

## 🔒 POLICY 1: Allow Authenticated Uploads

**Step-by-step:**
1. Click **"New Policy"** next to `chatbot-assets` bucket
2. Choose **"For full customization"** (custom policy option)
3. Fill in these exact details:

```
Policy Name: Allow authenticated uploads
Allowed Operation: INSERT
Target Roles: authenticated
Policy Definition: auth.uid() IS NOT NULL
```

**What this does:** Allows logged-in users to upload logo files to the bucket.

---

## 🌍 POLICY 2: Allow Public Reads

**Step-by-step:**
1. Click **"New Policy"** again next to `chatbot-assets` bucket
2. Choose **"For full customization"** (custom policy option)
3. Fill in these exact details:

```
Policy Name: Allow public reads
Allowed Operation: SELECT
Target Roles: public
Policy Definition: true
```

**What this does:** Allows anyone (including website visitors) to view/download the uploaded logos. This is essential because customer logos need to be visible on their websites when the chatbot is embedded.

---

## ✏️ POLICY 3: Allow Authenticated Updates

**Step-by-step:**
1. Click **"New Policy"** again next to `chatbot-assets` bucket
2. Choose **"For full customization"** (custom policy option)
3. Fill in these exact details:

```
Policy Name: Allow authenticated updates
Allowed Operation: UPDATE
Target Roles: authenticated
Policy Definition: auth.uid() IS NOT NULL
```

**What this does:** Allows logged-in users to replace/update their existing logo files.

---

## 🗑️ POLICY 4: Allow Authenticated Deletes

**Step-by-step:**
1. Click **"New Policy"** again next to `chatbot-assets` bucket
2. Choose **"For full customization"** (custom policy option)
3. Fill in these exact details:

```
Policy Name: Allow authenticated deletes
Allowed Operation: DELETE
Target Roles: authenticated
Policy Definition: auth.uid() IS NOT NULL
```

**What this does:** Allows logged-in users to remove their logo files if needed.

---

## 🎯 VISUAL CHECKLIST

After creating all 4 policies, your `chatbot-assets` bucket should show:

```
chatbot-assets
├── 🔒 Allow authenticated uploads (INSERT, authenticated)
├── 🌍 Allow public reads (SELECT, public)  
├── ✏️ Allow authenticated updates (UPDATE, authenticated)
└── 🗑️ Allow authenticated deletes (DELETE, authenticated)
```

---

## 🚨 IMPORTANT NOTES:

### Policy Definition Explanations:
- **`auth.uid() IS NOT NULL`** = User must be logged in
- **`true`** = Always allow (no restrictions)

### Target Roles:
- **`authenticated`** = Only logged-in users
- **`public`** = Anyone (even not logged in)

### Operations:
- **`INSERT`** = Upload new files
- **`SELECT`** = View/download files
- **`UPDATE`** = Replace existing files
- **`DELETE`** = Remove files

---

## ✅ AFTER CREATING ALL 4 POLICIES:

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Test logo upload:**
   - Go to http://localhost:3001/dashboard
   - Try uploading a logo image
   - Should work without errors!

3. **Verify policies work:**
   - Upload should succeed (INSERT policy)
   - Logo should display (SELECT policy)
   - You can replace logo (UPDATE policy)
   - You can remove logo (DELETE policy)

---

## 🆘 IF YOU GET STUCK:

Look for these UI elements in Supabase:
- **Storage** tab in left sidebar
- **Policies** section under Storage
- **New Policy** button next to your bucket
- **For full customization** option (not the templates)

**The logo upload is critical for your customers - their logos appear on their websites when the chatbot is embedded!**