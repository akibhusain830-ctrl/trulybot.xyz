# 📖 Step-by-Step Guide: Fix WordPress Plugin Blank Screen

## ⚡ Quick Fix (2 Minutes)

### Step 1: Clear Everything
```
1. Browser: Ctrl+F5 (hard refresh)
2. WordPress: Clear cache if you have a caching plugin
3. Browser: Clear cookies/cache (Ctrl+Shift+Delete)
```

### Step 2: Try Again
```
1. Go to WordPress Admin → TrulyBot
2. Enter your User ID (copy from TrulyBot Dashboard → Settings)
3. Click "Connect to TrulyBot"
4. Wait for success message (should appear in 2-3 seconds)
```

### Step 3: Verify
```
1. Go to your WooCommerce store homepage
2. Look at bottom-right corner
3. You should see a chat bubble (TrulyBot)
4. Click it to test the chatbot!
```

✅ **Done!** If you see the chat bubble, it worked!

---

## 🔍 Detailed Debugging (If Step 1 Doesn't Work)

### Step 1: Open Browser Developer Tools
```
Press F12 on your keyboard
(On Mac: Cmd+Option+I)
```

You should see the DevTools window at bottom:
- Click "Console" tab
- This is where errors will appear

### Step 2: Clear Console
```
Right-click in console → Clear console
(Or press Ctrl+L)
```

### Step 3: Try Connecting Again
```
1. Go back to WordPress TrulyBot settings
2. Enter your User ID
3. Click "Connect to TrulyBot"
4. Look at the Console - you should see messages like:

   ✅ AJAX Response received: {...}
   ✅ Connection successful! Reloading...

Or if error:

   ❌ AJAX Error: {...}
   ❌ Connection failed: [error message here]
```

### Step 4: Share the Error
```
Copy any red text from console and send it to support.
Also copy the exact error message shown in the plugin form.
```

---

## 🛠️ Finding Your User ID

**Where is my User ID?**

1. Go to https://trulybot.xyz
2. Sign in to your account
3. Click your avatar (top-right) → "Settings"
4. Look for "User ID" or "Account Info"
5. It looks like: `46b08806-5fd6-4fac-a253-6c43920ec396`
6. Copy this value
7. Paste it in WordPress plugin

---

## 🔑 Getting WooCommerce API Credentials

**Do I need to update my credentials?**

If you're getting "WooCommerce API connection failed" error:

1. Go to WordPress Admin
2. Go to WooCommerce → Settings
3. Click "Advanced" tab
4. Click "REST API"
5. Click "Create an API token" (blue button)
6. Fill in:
   - Description: `TrulyBot Integration`
   - User: (your admin account)
   - Permissions: `Read`
7. Click "Generate API token"
8. Copy the Consumer Key and Consumer Secret
9. Go back to WordPress → TrulyBot
10. These will be used automatically by the plugin

---

## 🧪 Advanced Test

### Test Your Connection

Run this command from the TrulyBot project:

```bash
node debug-wordpress-plugin.js
```

This will:
- ✅ Ask for your User ID
- ✅ Ask for your Store URL
- ✅ Ask for API credentials
- ✅ Test the connection
- ✅ Tell you exactly what's wrong

Output example:
```
1️⃣  Validating User ID format...
   ✅ User ID format is valid

2️⃣  Validating Store URL...
   ✅ Store URL is valid

3️⃣  Validating API credentials format...
   ✅ API credentials format is valid

4️⃣  Testing WooCommerce API connection...
   ✅ WooCommerce API is reachable

5️⃣  Testing TrulyBot backend connection...
   ✅ TrulyBot connection successful!

✨ All tests passed! Your plugin is ready to use.
```

If you see errors, the script will tell you exactly what to fix!

---

## 🆘 Common Problems & Solutions

### Problem 1: "User not found"

**Error Message:** 
```
User not found. Please ensure you are using the correct User ID 
from your TrulyBot dashboard.
```

**Solution:**
1. Go to TrulyBot Dashboard
2. Click Settings
3. Find your User ID
4. Make sure you copied the ENTIRE ID (it's long!)
5. Paste into WordPress plugin
6. Try again

**Still not working?**
- Make sure you're signed into the SAME account in both places
- Clear browser cookies (Ctrl+Shift+Delete)
- Sign out and sign back in

---

### Problem 2: "Integration features require..."

**Error Message:**
```
Integration features require a Pro subscription or higher. 
Please upgrade your plan.
```

**Solution:**
This has been FIXED! All tiers can now use integrations.

1. Clear browser cache (Ctrl+F5)
2. Wait 1-2 minutes for server changes to sync
3. Try connecting again

**Still getting this error?**
- Make sure you're using the latest plugin
- Refresh WordPress admin page completely
- Check that your subscription is active (not trial expired)

---

### Problem 3: Blank Page After Clicking Connect

**What's happening:**
The page is reloading but not showing the success message.

**Solutions:**
1. **Check browser console (F12):**
   - Look for error messages
   - Copy the error
   - Share with support

2. **Clear all cache:**
   - Browser cache (Ctrl+Shift+Delete)
   - WordPress cache (if using cache plugin)
   - Hard refresh (Ctrl+F5)
   - Try again

3. **Run debug script:**
   ```bash
   node debug-wordpress-plugin.js
   ```
   - This will pinpoint the exact issue

---

### Problem 4: "WooCommerce API connection failed"

**Error Message:**
```
WooCommerce API connection failed: [some error]
```

**Solution:**
Your API credentials might be wrong or insufficient.

1. Generate NEW API credentials:
   - WordPress Admin → WooCommerce → Settings
   - Advanced → REST API
   - Create new token with "Read" permission

2. The WordPress plugin will use these automatically

3. Try connecting again

---

### Problem 5: Chat widget doesn't appear on store

**Solution:**
1. Check if connection was successful (no blank screen)
2. Go to WordPress → TrulyBot → Settings
3. Make sure "Enable chatbot widget on frontend" is checked
4. Save settings
5. Clear browser cache
6. Visit your store homepage
7. Look at bottom-right corner for chat bubble

**Widget still not showing?**
- Open browser console (F12)
- Look for errors
- Check that the store URL is correct
- Verify the User ID matches

---

## ✅ Verification Steps

### After Successfully Connecting:

**Step 1: Check WordPress Plugin**
```
✅ No error message shown
✅ "TrulyBot Settings" section visible (not connection form)
✅ Your User ID displayed
✅ "Widget Status" checkbox visible
```

**Step 2: Check Your Store**
```
✅ Go to your WooCommerce store
✅ Bottom-right corner shows chat bubble
✅ Chat bubble has TrulyBot logo or icon
✅ Can click it to open chat
```

**Step 3: Test Chat**
```
✅ Click the chat bubble
✅ Chat window opens
✅ Type a message
✅ Bot responds
```

**Step 4: Check Settings**
```
✅ Go to WordPress → TrulyBot
✅ Can see "Widget Position" option
✅ Can toggle widget on/off
✅ Can click "Test Connection" button
```

---

## 📞 Need Help?

### Collect This Information:

1. **Browser Console Output** (F12 → Console)
   - Look for any red text
   - Copy it exactly

2. **Error Message from Plugin**
   - What exact message appears?

3. **Your Details**
   - What's your subscription tier?
   - What WordPress version?
   - What WooCommerce version?

4. **Debug Script Output**
   ```bash
   node debug-wordpress-plugin.js
   ```
   - Run this and share the output

### Where to Send:

- Create issue on GitHub
- Email support@trulybot.xyz
- Message support in TrulyBot Dashboard

Include all the information above and we'll fix it quickly!

---

## 🚀 After Fix: Next Steps

Once the plugin is working:

1. **Configure Chat Behavior**
   - WordPress → TrulyBot → Settings
   - Customize widget position, colors, etc.

2. **Add Knowledge Base**
   - TrulyBot Dashboard → Knowledge Base
   - Add your products, FAQs, policies
   - Bot learns to answer questions

3. **Monitor Performance**
   - TrulyBot Dashboard → Analytics
   - See chat volume, customer satisfaction
   - Optimize responses based on feedback

4. **Enable Order Tracking**
   - Done automatically with WooCommerce API
   - Customers can track orders via chat

5. **Get Leads**
   - Bot captures customer information
   - TrulyBot Dashboard → Leads
   - Download as CSV or integrate with CRM

---

## 📚 Learn More

- **TrulyBot Docs:** https://docs.trulybot.xyz
- **WooCommerce Guide:** https://trulybot.xyz/integrations/woocommerce
- **Knowledge Base:** https://trulybot.xyz/help
- **Community Forum:** https://community.trulybot.xyz

---

**Last Updated:** October 25, 2025  
**Version:** 1.0.0
