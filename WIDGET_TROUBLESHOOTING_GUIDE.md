# 🔧 TrulyBot Widget Not Showing - Troubleshooting Guide

## 🚨 Quick Fix - Try These First:

### 1. **Check Your Script URL**
Your current script:
```html
<script async src="https://www.trulybot.xyz/widget/loader.js"
data-chatbot-id="46b08806-5fd6-4fac-a253-6c43920ec396"
data-api-url="https://www.trulybot.xyz">
</script>
```

**Try this instead:**
```html
<script async src="https://trulybot.xyz/widget/loader.js"
data-chatbot-id="46b08806-5fd6-4fac-a253-6c43920ec396"
data-api-url="https://trulybot.xyz">
</script>
```

**Key changes:**
- Removed `www.` from both URLs
- Your domain might not have SSL certificate for `www` subdomain

### 2. **Test Widget Manually**

**Copy and paste this into your browser console on quicktools.free.nf:**

```javascript
// Quick widget test
const testScript = document.createElement('script');
testScript.async = true;
testScript.src = 'https://trulybot.xyz/widget/loader.js';
testScript.setAttribute('data-chatbot-id', '46b08806-5fd6-4fac-a253-6c43920ec396');
testScript.setAttribute('data-api-url', 'https://trulybot.xyz');
document.head.appendChild(testScript);
console.log('Test widget script added - check for chat bubble in 5 seconds');
```

### 3. **Check Network Access**

**Test if the widget script is accessible:**
```javascript
fetch('https://trulybot.xyz/widget/loader.js')
  .then(response => response.text())
  .then(data => console.log('✅ Widget script accessible:', data.length, 'characters'))
  .catch(error => console.error('❌ Widget script failed:', error));
```

### 4. **Test Widget Config API**

**Check if your chatbot config loads:**
```javascript
fetch('https://trulybot.xyz/api/widget/config/46b08806-5fd6-4fac-a253-6c43920ec396')
  .then(response => response.json())
  .then(data => console.log('✅ Widget config:', data))
  .catch(error => console.error('❌ Widget config failed:', error));
```

## 🔍 Common Issues & Solutions:

### **Issue 1: SSL/HTTPS Problems**
- Your site: `http://quicktools.free.nf` (HTTP)
- Widget: `https://trulybot.xyz` (HTTPS)
- **Solution**: Use HTTP version if available or ensure HTTPS

### **Issue 2: Content Security Policy (CSP)**
- Your hosting might block external scripts
- **Solution**: Add this to your site's CSP:
```
script-src 'self' 'unsafe-inline' https://trulybot.xyz;
frame-src 'self' https://trulybot.xyz;
connect-src 'self' https://trulybot.xyz;
```

### **Issue 3: WordPress Plugin Conflicts**
- Other plugins might interfere
- **Solution**: Try adding script to header instead of footer

### **Issue 4: Ad Blockers**
- Ad blockers might block chat widgets
- **Solution**: Test in incognito mode

### **Issue 5: Z-Index Conflicts**
- Other elements might be covering the widget
- **Solution**: Use browser dev tools to check z-index

## 🛠️ Advanced Debugging:

### **Method 1: Browser Developer Tools**
1. Open your site: http://quicktools.free.nf
2. Press F12 to open developer tools
3. Go to **Console** tab
4. Paste and run the diagnostic script from above
5. Look for error messages

### **Method 2: Network Tab**
1. Go to **Network** tab in dev tools
2. Reload your page
3. Look for requests to `trulybot.xyz`
4. Check if they succeed (status 200) or fail

### **Method 3: Elements Tab**
1. Go to **Elements** tab
2. Search for "trulybot" (Ctrl+F)
3. Check if widget elements exist in DOM

## 🚀 Alternative Embedding Methods:

### **Method 1: Direct Integration (Fallback)**
```html
<!-- Add this to your site's footer -->
<div id="trulybot-widget"></div>
<script>
(function() {
  const bubble = document.createElement('button');
  bubble.innerHTML = '💬';
  bubble.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: #2563EB;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
  `;
  
  bubble.onclick = () => {
    window.open('https://trulybot.xyz/widget?id=46b08806-5fd6-4fac-a253-6c43920ec396', '_blank', 'width=400,height=600');
  };
  
  document.body.appendChild(bubble);
})();
</script>
```

### **Method 2: Iframe Embed**
```html
<!-- Add this where you want the chat to appear -->
<iframe 
  src="https://trulybot.xyz/widget?id=46b08806-5fd6-4fac-a253-6c43920ec396"
  width="400" 
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
</iframe>
```

## 📞 Need Help?

1. **Run the diagnostic script** in browser console
2. **Check browser console** for error messages  
3. **Try the alternative methods** above
4. **Test in different browsers** (Chrome, Firefox, Safari)
5. **Test without ad blockers** (incognito mode)

**The most likely issue is the `www.` in your script URL - try removing it first!**