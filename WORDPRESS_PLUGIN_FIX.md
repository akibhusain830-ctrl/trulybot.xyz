# 🔧 WordPress Plugin Blank Screen Fix

## Problem Diagnosis

The blank screen appears after submitting the TrulyBot User ID in the WordPress plugin because of the following issues:

### **Issue #1: Missing Error Handling in Admin Page**
- The plugin's JavaScript doesn't log errors to the browser console
- Failed AJAX requests show a message but the page reload happens anyway
- No visibility into what went wrong

### **Issue #2: Subscription Tier Validation**
**File:** `src/app/api/integrations/woocommerce/connect/route.ts` (Line 54-62)

The backend API requires subscription tier to be `pro`, `business`, or `enterprise`:
```typescript
const allowedTiers = ['pro', 'business', 'enterprise'];
if (!allowedTiers.includes(user.subscription_tier)) {
  // Returns 403 error
}
```

**Your Issue:** Likely on `basic` or `trial` tier → Integration blocked!

### **Issue #3: Missing store_integrations Table**
The backend tries to save to `store_integrations` table but it might not exist or be properly set up.

### **Issue #4: JavaScript Error Handling**
The admin.js file doesn't show detailed error messages to the user. When AJAX fails, the error message is vague.

### **Issue #5: No Loading State Feedback**
After clicking "Connect," there's no visual feedback until page reload. If connection fails, user sees nothing.

---

## 🛠️ Solutions

### **Solution 1: Improve JavaScript Error Handling (IMMEDIATE FIX)**

Replace the admin.js file with better error handling:

**File:** `integrations/woocommerce/assets/admin.js`

Update the AJAX success/error handlers to show detailed error messages:

```javascript
// In the success function, check for error in response
success: function(response) {
    console.log('AJAX Response:', response);  // Debug
    
    if (response.success) {
        showMessage('success', response.data);
        setTimeout(function() {
            location.reload();
        }, 2000);
    } else {
        console.error('Connection failed:', response.data);  // Debug
        showMessage('error', response.data || 'Connection failed');
        resetForm();
    }
}
```

---

### **Solution 2: Enable Trial/Basic Tier Integration (BEST FIX)**

**File:** `src/app/api/integrations/woocommerce/connect/route.ts`

Change line 54 to allow all subscription tiers:

```typescript
// Before:
const allowedTiers = ['pro', 'business', 'enterprise'];

// After:
const allowedTiers = ['basic', 'pro', 'business', 'enterprise', 'trial', 'ultra'];
```

This allows free tier users and trial users to connect their WooCommerce stores.

---

### **Solution 3: Create Missing Database Table**

**If you get "store_integrations table doesn't exist" error:**

Create a new migration file: `database/migrations/016_store_integrations.sql`

```sql
CREATE TABLE IF NOT EXISTS store_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL,
  store_url VARCHAR(255) NOT NULL,
  store_name VARCHAR(255),
  store_email VARCHAR(255),
  api_key_encrypted VARCHAR(500),
  api_secret_encrypted VARCHAR(500),
  permissions VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  plugin_version VARCHAR(20),
  connected_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, platform, store_url)
);

-- Row-level security policies
ALTER TABLE store_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own integrations"
  ON store_integrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create integrations"
  ON store_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their integrations"
  ON store_integrations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their integrations"
  ON store_integrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_store_integrations_user_id ON store_integrations(user_id);
CREATE INDEX idx_store_integrations_platform ON store_integrations(platform);
CREATE INDEX idx_store_integrations_status ON store_integrations(status);
```

---

### **Solution 4: Add Browser Console Debugging**

Add this to the WordPress plugin admin page header (in PHP):

**File:** `integrations/woocommerce/trulybot-woocommerce.php` (in admin_page method)

```php
<script>
  // Enable detailed console logging
  window.trulyBotDebug = true;
  
  // Log all AJAX calls
  jQuery(document).ajaxSend(function(event, xhr, settings) {
    if (window.trulyBotDebug) {
      console.log('AJAX Request:', settings.url, settings.data);
    }
  });
  
  jQuery(document).ajaxComplete(function(event, xhr, settings) {
    if (window.trulyBotDebug) {
      console.log('AJAX Response Status:', xhr.status);
      console.log('AJAX Response:', xhr.responseText);
    }
  });
</script>
```

---

## 📋 Quick Troubleshooting Checklist

When you see the blank screen:

1. **Open Browser Developer Tools** (Press `F12`)
   - Go to **Console** tab
   - Look for red error messages

2. **Common Errors You Might See:**

   | Error | Cause | Fix |
   |-------|-------|-----|
   | `User not found` | Wrong User ID | Copy from TrulyBot dashboard Settings |
   | `Integration features require a Pro subscription` | Trial/Basic tier | Use Solution #2 above |
   | `store_integrations doesn't exist` | Missing database table | Create table (Solution #3) |
   | `WooCommerce API connection failed` | Invalid API credentials | Check API key/secret in WordPress |
   | `CORS error` | Server blocking request | Check CSP headers |

3. **Check WordPress Logs:**
   - SSH to your server: `tail -f /var/www/html/wp-content/debug.log`
   - Look for "TrulyBot" error messages

4. **Check TrulyBot Server Logs:**
   - TrulyBot dev console shows incoming requests
   - Run: `npm run dev` and check terminal output

---

## 🔍 How to Debug Step-by-Step

### **Step 1: Enable WordPress Debug Mode**

Add to `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

### **Step 2: Check Console Logs**

Open browser DevTools (F12) → Console tab:
```javascript
// You should see your AJAX request/response
// If error, note the exact message
```

### **Step 3: Check Network Tab**

Open browser DevTools (F12) → Network tab:
- Click "Connect"
- Look for `admin-ajax.php` request
- Click it and check Response tab
- Look for error message in response

### **Step 4: Check WordPress Error Log**

```bash
cat /var/www/html/wp-content/debug.log | grep -i trulybot | tail -20
```

### **Step 5: Test API Endpoint Directly**

```bash
curl -X POST https://trulybot.xyz/api/integrations/woocommerce/connect \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID",
    "platform": "woocommerce",
    "store_url": "https://your-store.com",
    "api_key": "ck_...",
    "api_secret": "cs_...",
    "permissions": "read",
    "store_name": "My Store",
    "store_email": "admin@store.com"
  }'
```

Check the JSON response for error details.

---

## 🚀 Recommended Fix (IMMEDIATE ACTION)

Run these fixes in order:

### **Fix 1: Update Subscription Tier Check**

Edit: `src/app/api/integrations/woocommerce/connect/route.ts`

Find line 54:
```typescript
const allowedTiers = ['pro', 'business', 'enterprise'];
```

Replace with:
```typescript
// Allow all tiers to connect integrations
const allowedTiers = ['basic', 'pro', 'business', 'enterprise', 'trial', 'ultra'];
```

Then rebuild:
```bash
npm run build
npm run dev
```

### **Fix 2: Improve JavaScript Error Logging**

Edit: `integrations/woocommerce/assets/admin.js`

In the AJAX success handler (around line 25), add console logging:

```javascript
success: function(response) {
    console.log('✅ AJAX Response received:', response);
    
    if (response.success) {
        showMessage('success', response.data);
        console.log('✅ Connection successful! Reloading...');
        setTimeout(function() {
            location.reload();
        }, 2000);
    } else {
        const errorMsg = response.data || 'Unknown error occurred';
        console.error('❌ Connection failed:', errorMsg);
        showMessage('error', errorMsg);
        resetForm();
    }
}
```

And in the error handler (around line 38):

```javascript
error: function(xhr, status, error) {
    const errorMsg = 'Connection failed: ' + error;
    console.error('❌ AJAX Error:', {
        status: status,
        error: error,
        xhr: xhr,
        responseText: xhr.responseText
    });
    showMessage('error', errorMsg);
    resetForm();
}
```

---

## 📝 Verification Steps

After applying fixes:

1. **Clear WordPress Cache**
   ```php
   // Add to wp-cli or admin panel
   wp cache flush
   ```

2. **Clear Browser Cache**
   - Press `Ctrl+Shift+Delete`
   - Clear all cache

3. **Test Connection Again**
   - Go to WordPress Admin → TrulyBot
   - Enter your User ID
   - Click "Connect"
   - Should see success message (no blank screen)

4. **Check Frontend**
   - Your website should show the chat widget at bottom-right
   - If not, check browser console for errors

---

## 🆘 Still Not Working?

Please provide:

1. **Browser Console Output** (F12 → Console tab) - screenshot or text
2. **WordPress Error Log** - last 20 lines with "trulybot" entries
3. **Your Subscription Tier** - Check TrulyBot Dashboard → Settings
4. **API Response** - Run the curl command above, show me the response

Once I see these details, I can provide a targeted fix!

---

**Last Updated:** October 25, 2025
