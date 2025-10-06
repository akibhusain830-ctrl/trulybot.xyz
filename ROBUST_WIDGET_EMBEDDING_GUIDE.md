# TrulyBot Widget Embedding Guide - Robust Version

## Overview
This guide provides robust embedding instructions for the TrulyBot widget with enhanced error handling, fallback configurations, and cross-browser compatibility.

## Quick Start

### 1. Basic Embedding (Recommended)

Replace `YOUR_CHATBOT_ID` with your actual chatbot ID:

```html
<!-- TrulyBot Widget - Robust Version -->
<script>
  (function() {
    // Configuration
    const TRULYBOT_CONFIG = {
      chatbotId: 'YOUR_CHATBOT_ID',
      apiUrl: 'https://trulybot.xyz',
      maxRetries: 3,
      loadTimeout: 10000
    };
    
    // Cleanup any existing instance
    if (window.TrulyBot && window.TrulyBot.cleanup) {
      window.TrulyBot.cleanup();
    }
    
    // Remove existing elements
    ['trulybot-chat-bubble', 'trulybot-chat-iframe', 'trulybot-close-btn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    
    // Load widget with error handling
    function loadTrulyBot() {
      const script = document.createElement('script');
      script.src = TRULYBOT_CONFIG.apiUrl + '/widget/loader.js';
      script.setAttribute('data-chatbot-id', TRULYBOT_CONFIG.chatbotId);
      script.setAttribute('data-api-url', TRULYBOT_CONFIG.apiUrl);
      script.async = true;
      script.defer = true;
      
      script.onload = function() {
        console.log('TrulyBot widget loaded successfully');
      };
      
      script.onerror = function() {
        console.error('TrulyBot: Failed to load widget script');
        // Optional: Show fallback contact method
        showFallbackContact();
      };
      
      document.head.appendChild(script);
    }
    
    // Fallback contact method
    function showFallbackContact() {
      // You can customize this fallback
      console.log('TrulyBot: Using fallback contact method');
      // Example: show a simple contact form or email link
    }
    
    // Load when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadTrulyBot);
    } else {
      loadTrulyBot();
    }
    
    // Handle page navigation (for SPAs)
    let currentUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        if (!document.getElementById('trulybot-chat-bubble')) {
          loadTrulyBot();
        }
      }
    }, 1000);
    
  })();
</script>
```

### 2. WordPress Integration

For WordPress sites, add this to your theme's `footer.php` or use a plugin like "Insert Headers and Footers":

```html
<!-- Add before closing </body> tag -->
<script>
(function() {
  const script = document.createElement('script');
  script.src = 'https://trulybot.xyz/widget/loader.js';
  script.setAttribute('data-chatbot-id', 'YOUR_CHATBOT_ID');
  script.setAttribute('data-api-url', 'https://trulybot.xyz');
  script.async = true;
  document.head.appendChild(script);
})();
</script>
```

**Important for WordPress:** Make sure your chatbot ID is correct and the script is placed in the footer, not the header.

### 3. React/Next.js Integration

```jsx
// components/TrulyBotWidget.jsx
import { useEffect } from 'react';

export default function TrulyBotWidget({ chatbotId }) {
  useEffect(() => {
    // Cleanup function
    const cleanup = () => {
      if (window.TrulyBot && window.TrulyBot.cleanup) {
        window.TrulyBot.cleanup();
      }
    };

    // Load widget script
    const loadWidget = () => {
      const script = document.createElement('script');
      script.src = 'https://trulybot.xyz/widget/loader.js';
      script.setAttribute('data-chatbot-id', chatbotId);
      script.setAttribute('data-api-url', 'https://trulybot.xyz');
      script.async = true;
      
      script.onload = () => {
        console.log('TrulyBot widget loaded');
      };
      
      script.onerror = () => {
        console.error('Failed to load TrulyBot widget');
      };
      
      document.head.appendChild(script);
      return script;
    };

    cleanup(); // Clean up first
    const script = loadWidget();

    // Cleanup on unmount
    return () => {
      cleanup();
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [chatbotId]);

  return null; // This component doesn't render anything
}
```

### 4. Shopify Integration

Add to your theme's `theme.liquid` file before the closing `</body>` tag:

```html
<script>
(function() {
  if (typeof window.trulyBotLoaded !== 'undefined') return; // Prevent double loading
  window.trulyBotLoaded = true;
  
  const script = document.createElement('script');
  script.src = 'https://trulybot.xyz/widget/loader.js';
  script.setAttribute('data-chatbot-id', 'YOUR_CHATBOT_ID');
  script.setAttribute('data-api-url', 'https://trulybot.xyz');
  script.async = true;
  document.head.appendChild(script);
})();
</script>
```

## Advanced Configuration

### Custom Styling

You can override the widget appearance with CSS:

```css
/* Custom widget styling */
#trulybot-chat-bubble {
  bottom: 30px !important;
  right: 30px !important;
  width: 70px !important;
  height: 70px !important;
  background: #your-brand-color !important;
}

#trulybot-chat-iframe {
  bottom: 110px !important;
  right: 30px !important;
  border-radius: 20px !important;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
}
```

### Widget API

The widget exposes a global API for programmatic control:

```javascript
// Check if widget is loaded
if (window.TrulyBot && window.TrulyBot.isLoaded()) {
  // Open chat programmatically
  window.TrulyBot.openChat();
  
  // Close chat
  window.TrulyBot.closeChat();
  
  // Toggle chat
  window.TrulyBot.toggleChat();
  
  // Get configuration
  const config = window.TrulyBot.getConfig();
  console.log(config);
}

// Listen for widget events
window.addEventListener('trulybot:loaded', (event) => {
  console.log('Widget loaded:', event.detail);
});

window.addEventListener('trulybot:error', (event) => {
  console.error('Widget error:', event.detail.error);
});
```

## Troubleshooting

### Common Issues

1. **Widget not appearing**
   - Check that the chatbot ID is correct
   - Verify the script is loading (check browser console)
   - Ensure no ad blockers are blocking the script
   - Check for JavaScript errors in console

2. **CORS errors**
   - The widget includes proper CORS headers
   - If issues persist, contact support

3. **Multiple widgets loading**
   - Use the cleanup code provided in examples
   - Ensure the script is only loaded once per page

4. **Widget loading slowly**
   - The widget includes retry logic and fallbacks
   - Check your internet connection
   - Verify TrulyBot service status

### Debug Mode

Enable debug logging:

```javascript
// Add before loading the widget
window.TRULYBOT_DEBUG = true;
```

### Browser Compatibility

The widget supports:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari 12+, Chrome Mobile 60+)

## Security Features

The widget includes several security features:
- Content Security Policy compliance
- XSS protection
- Secure iframe sandboxing
- Input validation
- Rate limiting protection

## Performance

The widget is optimized for performance:
- Lazy loading
- Minimal initial footprint (~15KB compressed)
- Efficient caching
- Asynchronous loading
- No external dependencies

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your chatbot ID and configuration
3. Test with the debug mode enabled
4. Contact TrulyBot support with details

## Updates

The widget auto-updates with new features and security patches. No action required on your part for updates.

---

**Need help?** Contact TrulyBot support or check our documentation at https://trulybot.xyz/docs