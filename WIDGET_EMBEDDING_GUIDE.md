# 🤖 Trulybot Widget Embedding Guide

## 🚨 Recent Fix: "refused to connect" Issue Resolved

**Issue**: Widget showed "www.trulybot.xyz refused to connect" on customer websites.  
**Status**: ✅ **FIXED** - Security headers have been updated to allow proper iframe embedding.

---

## Quick Start

Add this single line to your website to embed the Trulybot widget:

```html
<script 
    src="https://trulybot.xyz/widget.js" 
    data-bot-id="YOUR_BOT_ID"
    async>
</script>
```

**Replace `YOUR_BOT_ID`** with your actual bot ID from your Trulybot dashboard.

## What Was Fixed

### The Problem
The widget was being blocked by security headers that prevented iframe embedding:
- `X-Frame-Options: DENY` was blocking all iframe embedding
- `frame-ancestors 'none'` in CSP was preventing cross-origin embedding
- Security middleware was applying restrictive headers to all routes

### The Solution
1. **Removed restrictive X-Frame-Options** for `/embed` and `/widget` routes
2. **Updated Content Security Policy** to allow `frame-ancestors *` for embeddable routes
3. **Created route-specific security headers** that allow embedding while maintaining security
4. **Fixed origin detection** in widget script to use correct trulybot.xyz domain

### Technical Details
- `/embed` and `/widget` routes now have permissive iframe headers
- All other routes maintain strict security (X-Frame-Options: DENY)
- Widget script correctly detects trulybot.xyz origin for API calls
- Enhanced error logging for easier debugging

## Configuration Options

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-bot-id` | **Required** | Your unique bot ID from Trulybot dashboard |
| `data-position` | `"right"` | Widget position: `"right"` or `"left"` |
| `data-color` | `"#2563eb"` | Button color (hex code) |
| `data-greeting` | `"Chat"` | Button label (screen reader text) |
| `data-z` | `"2147483000"` | Z-index for layering |

### Example with All Options

```html
<script 
    src="https://trulybot.xyz/widget.js" 
    data-bot-id="your_bot_id_here"
    data-position="left"
    data-color="#ff6b35"
    data-greeting="Help"
    data-z="999999"
    async>
</script>
```

## Common Issues & Solutions

### ✅ "refused to connect" Issue (FIXED)

**Previous Error**: "www.trulybot.xyz refused to connect" appeared instead of chat widget.

**Status**: This issue has been resolved! The widget should now embed properly on all websites.

**If you still see this error:**
1. Clear browser cache and reload the page
2. Check if your website has additional CSP restrictions
3. Verify you're using the latest widget code
4. Test with our debug page: `https://trulybot.xyz/test-iframe-fix.html`

### ❌ Widget Not Appearing

**Check Console for Errors:**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for messages starting with `[Trulybot widget]`

**Common Causes:**
- ❌ Invalid or missing `data-bot-id`
- ❌ Script blocked by ad blocker
- ❌ Network connectivity issues
- ❌ JavaScript errors on your website

### ❌ Widget Button Appears But Chat Doesn't Open

**Possible Solutions:**
- The iframe issue has been fixed, but check if your website has custom CSP headers
- Verify iframe loading in browser Developer Tools
- Check browser console for iframe loading errors

### ❌ Configuration Not Loading

If your custom colors/messages aren't appearing:
- Verify your bot ID is correct
- Check your subscription tier (some features require Pro/Ultra)
- Ensure your Trulybot dashboard settings are saved

## Content Security Policy (CSP)

If your website uses CSP headers, add these directives:

```
Content-Security-Policy: 
  script-src 'self' https://trulybot.xyz;
  frame-src https://trulybot.xyz;
  connect-src https://trulybot.xyz;
```

## Testing Your Implementation

### 1. Local Testing
Use our test pages to verify everything works:
- Development: `http://localhost:3000/test-customer-embedding.html`
- Production: `https://trulybot.xyz/test-production-widget.html`

### 2. Production Testing
1. Deploy to your website
2. Open browser Developer Tools
3. Check Console for any errors
4. Test the chat functionality

## Advanced Integration

### Single Page Applications (SPA)

For React, Vue, Angular apps, load the widget after your app initializes:

```javascript
// Wait for your app to be ready, then load widget
function loadTrulybotWidget() {
  const script = document.createElement('script');
  script.src = 'https://trulybot.xyz/widget.js';
  script.setAttribute('data-bot-id', 'your_bot_id');
  script.async = true;
  document.head.appendChild(script);
}

// Call when your app is ready
loadTrulybotWidget();
```

### Multiple Bot IDs

To use different bots on different pages:

```javascript
// Dynamically set bot ID based on page
const botId = window.location.pathname === '/support' ? 'support_bot' : 'sales_bot';

const script = document.createElement('script');
script.src = 'https://trulybot.xyz/widget.js';
script.setAttribute('data-bot-id', botId);
script.async = true;
document.head.appendChild(script);
```

## Troubleshooting Checklist

- [ ] ✅ Bot ID is correct and valid
- [ ] ✅ Script loads from `https://trulybot.xyz/widget.js`
- [ ] ✅ No JavaScript errors in console
- [ ] ✅ No CSP blocking errors
- [ ] ✅ Network requests to trulybot.xyz succeed
- [ ] ✅ Button appears on page
- [ ] ✅ Clicking button opens chat iframe
- [ ] ✅ Chat interface loads properly

## Support

If you're still having issues:

1. **Check Console Logs**: Look for detailed error messages
2. **Test with Demo**: Try `data-bot-id="demo"` to see if basic functionality works
3. **Verify Bot ID**: Double-check your bot ID in the Trulybot dashboard
4. **Contact Support**: Include console logs and your website URL

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Widget script is ~15KB minified
- Loads asynchronously (won't block page load)
- Iframe only loads when chat is opened
- Cached for 1 hour for repeat visitors