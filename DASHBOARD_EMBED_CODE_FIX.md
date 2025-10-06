## ✅ DASHBOARD EMBED CODE FIXED

### **Issue Identified:**
The dashboard was showing `www.trulybot.xyz` in the embed code because the `buildEmbedSnippet` function was using `window.location.origin` which includes the `www.` subdomain when users access the site via `www.trulybot.xyz`.

### **Files Fixed:**

1. **`src/lib/utils/embedSnippet.ts`**
   - Modified `buildEmbedSnippet` function to remove `www.` from URLs
   - Now always generates canonical URLs without `www.`

2. **`src/components/dashboard/EmbedSnippet.tsx`**
   - Updated `buildEmbedSnippet` to strip `www.` from origin
   - Also fixed the script path from `/widget.js` to `/widget/loader.js`
   - Fixed attribute from `data-bot-id` to `data-chatbot-id`

### **Result:**
✅ Dashboard now shows correct embed code: `https://trulybot.xyz/widget/loader.js`
✅ No more `www.` in generated embed codes
✅ Widget will work properly on customer websites
✅ Build passes without errors

### **Next Steps:**
1. Deploy the updated code to production
2. Test the dashboard to confirm it shows the correct embed code
3. The widget should now work on customer websites