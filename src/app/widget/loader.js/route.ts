
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const widgetScript = `
(function() {
  'use strict';
  
  // Configuration and state
  const WIDGET_CONFIG = {
    retryAttempts: 3,
    retryDelay: 1000,
    timeoutMs: 10000,
    fallbackColor: '#2563EB',
    fallbackName: 'Assistant',
    fallbackMessage: 'Hello! How can I help you today?',
    zIndex: 999999
  };
  
  let widgetState = {
    loaded: false,
    chatOpen: false,
    config: null,
    bubble: null,
    iframe: null,
    closeBtn: null
  };

  // Utility functions
  function log(message, type = 'info') {
    const prefix = '[TrulyBot]';
    if (type === 'error') {
      console.error(prefix, message);
    } else if (type === 'warn') {
      console.warn(prefix, message);
    } else {
      console.log(prefix, message);
    }
  }

  function getScriptConfig() {
    try {
      // Try multiple methods to get the script element
      const script = document.currentScript || 
                    document.querySelector('script[data-chatbot-id]') ||
                    document.querySelector('script[src*="trulybot"]');
      
      if (!script) {
        throw new Error('TrulyBot script element not found');
      }

      const chatbotId = script.getAttribute('data-chatbot-id');
      const apiUrl = script.getAttribute('data-api-url') || 
                    script.getAttribute('data-api-base-url') || 
                    '${process.env.NEXT_PUBLIC_APP_URL || 'https://trulybot.xyz'}';

      if (!chatbotId) {
        throw new Error('data-chatbot-id attribute is required');
      }

      // Clean and validate URLs
      const cleanApiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
      
      return { chatbotId, apiUrl: cleanApiUrl };
    } catch (error) {
      log(\`Configuration error: \${error.message}\`, 'error');
      return null;
    }
  }

  async function fetchWithRetry(url, options = {}, attempts = WIDGET_CONFIG.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), WIDGET_CONFIG.timeoutMs);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        }
        
        return await response.json();
      } catch (error) {
        log(\`Fetch attempt \${i + 1} failed: \${error.message}\`, 'warn');
        
        if (i === attempts - 1) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, WIDGET_CONFIG.retryDelay * Math.pow(2, i)));
      }
    }
  }

  async function loadConfiguration(chatbotId, apiUrl) {
    try {
      log('Loading chatbot configuration...');
      
      const config = await fetchWithRetry(\`\${apiUrl}/api/widget/config/\${chatbotId}\`);
      
      if (config.error) {
        throw new Error(config.error);
      }
      
      // Validate and set defaults
      widgetState.config = {
        chatbot_name: config.chatbot_name || WIDGET_CONFIG.fallbackName,
        welcome_message: config.welcome_message || WIDGET_CONFIG.fallbackMessage,
        accent_color: config.accent_color || WIDGET_CONFIG.fallbackColor,
        chatbot_logo_url: config.chatbot_logo_url || null,
        chatbot_theme: config.chatbot_theme || 'light',
        custom_css: config.custom_css || null,
        subscription_tier: config.subscription_tier || 'basic',
        apiUrl,
        chatbotId
      };
      
      log('Configuration loaded successfully');
      return true;
    } catch (error) {
      log(\`Failed to load configuration: \${error.message}\`, 'error');
      
      // Use fallback configuration
      widgetState.config = {
        chatbot_name: WIDGET_CONFIG.fallbackName,
        welcome_message: WIDGET_CONFIG.fallbackMessage,
        accent_color: WIDGET_CONFIG.fallbackColor,
        chatbot_logo_url: null,
        chatbot_theme: 'light',
        custom_css: null,
        subscription_tier: 'basic',
        apiUrl,
        chatbotId
      };
      
      log('Using fallback configuration');
      return false;
    }
  }

  function createBubble() {
    if (widgetState.bubble) {
      return; // Already created
    }

    try {
      const bubble = document.createElement('button');
      bubble.id = 'trulybot-chat-bubble';
      bubble.setAttribute('aria-label', 'Open chat');
      bubble.setAttribute('role', 'button');
      bubble.setAttribute('tabindex', '0');
      
      // Set bubble content (logo or emoji)
      if (widgetState.config.chatbot_logo_url) {
        bubble.innerHTML = \`<img src="\${widgetState.config.chatbot_logo_url}" alt="Chat" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'; this.parentNode.innerHTML='💬';">\`;
      } else {
        bubble.innerHTML = '💬';
      }
      
      bubble.style.cssText = \`
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 60px !important;
        height: 60px !important;
        border-radius: 50% !important;
        border: none !important;
        background: \${widgetState.config.accent_color} !important;
        color: white !important;
        font-size: 24px !important;
        cursor: pointer !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        z-index: \${WIDGET_CONFIG.zIndex} !important;
        transition: all 0.2s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        outline: none !important;
        user-select: none !important;
      \`;
      
      // Event handlers
      bubble.addEventListener('mouseenter', () => {
        bubble.style.transform = 'scale(1.1)';
        bubble.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
      });
      
      bubble.addEventListener('mouseleave', () => {
        bubble.style.transform = 'scale(1)';
        bubble.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      });
      
      bubble.addEventListener('click', toggleChat);
      bubble.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleChat();
        }
      });
      
      document.body.appendChild(bubble);
      widgetState.bubble = bubble;
      
      log('Chat bubble created successfully');
    } catch (error) {
      log(\`Failed to create bubble: \${error.message}\`, 'error');
    }
  }

  function toggleChat() {
    if (widgetState.chatOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    if (widgetState.chatOpen || !widgetState.config) {
      return;
    }

    try {
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'trulybot-chat-iframe';
      iframe.setAttribute('title', \`Chat with \${widgetState.config.chatbot_name}\`);
      iframe.setAttribute('allowfullscreen', 'true');
      
      const widgetUrl = new URL(\`\${widgetState.config.apiUrl}/widget\`);
      widgetUrl.searchParams.set('id', widgetState.config.chatbotId);
      widgetUrl.searchParams.set('name', widgetState.config.chatbot_name);
      widgetUrl.searchParams.set('message', widgetState.config.welcome_message);
      widgetUrl.searchParams.set('color', widgetState.config.accent_color);
      widgetUrl.searchParams.set('theme', widgetState.config.chatbot_theme);
      
      iframe.src = widgetUrl.toString();
      // Check if desktop (min-width: 1024px) for significantly larger chat window
      const isDesktop = window.innerWidth >= 1024;
      const width = isDesktop ? 'min(520px, calc(100vw - 40px))' : 'min(400px, calc(100vw - 40px))';
      const height = isDesktop ? 'min(780px, calc(100vh - 100px))' : 'min(600px, calc(100vh - 140px))';
      const maxWidth = isDesktop ? '520px' : '400px';
      const maxHeight = isDesktop ? '780px' : '600px';
      
      iframe.style.cssText = \`
        position: fixed !important;
        bottom: 90px !important;
        right: 20px !important;
        width: \${width} !important;
        height: \${height} !important;
        max-width: \${maxWidth} !important;
        max-height: \${maxHeight} !important;
        border: none !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
        z-index: \${WIDGET_CONFIG.zIndex + 1} !important;
        background: white !important;
        opacity: 0 !important;
        transform: translateY(20px) scale(0.95) !important;
        transition: all 0.3s ease !important;
      \`;
      
      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.id = 'trulybot-close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Close chat');
      closeBtn.setAttribute('role', 'button');
      closeBtn.setAttribute('tabindex', '0');
      
      // Position close button based on screen size
      const closeBtnBottom = isDesktop ? '850px' : '670px'; // 780px + 70px for desktop, 600px + 70px for mobile
      
      closeBtn.style.cssText = \`
        position: fixed !important;
        bottom: \${closeBtnBottom} !important;
        right: 30px !important;
        width: 32px !important;
        height: 32px !important;
        border: none !important;
        background: rgba(0,0,0,0.7) !important;
        color: white !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        z-index: \${WIDGET_CONFIG.zIndex + 2} !important;
        font-size: 20px !important;
        line-height: 1 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s ease !important;
        outline: none !important;
      \`;
      
      closeBtn.addEventListener('click', closeChat);
      closeBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          closeChat();
        }
      });
      
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(0,0,0,0.9)';
        closeBtn.style.transform = 'scale(1.1)';
      });
      
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(0,0,0,0.7)';
        closeBtn.style.transform = 'scale(1)';
      });
      
      document.body.appendChild(iframe);
      document.body.appendChild(closeBtn);
      
      // Animate in
      requestAnimationFrame(() => {
        iframe.style.opacity = '1';
        iframe.style.transform = 'translateY(0) scale(1)';
      });
      
      widgetState.iframe = iframe;
      widgetState.closeBtn = closeBtn;
      widgetState.chatOpen = true;
      
      // Update bubble appearance
      if (widgetState.bubble) {
        widgetState.bubble.style.transform = 'scale(0.9)';
        widgetState.bubble.style.opacity = '0.7';
      }
      
      log('Chat opened successfully');
    } catch (error) {
      log(\`Failed to open chat: \${error.message}\`, 'error');
    }
  }

  function closeChat() {
    if (!widgetState.chatOpen) {
      return;
    }

    try {
      if (widgetState.iframe) {
        widgetState.iframe.style.opacity = '0';
        widgetState.iframe.style.transform = 'translateY(20px) scale(0.95)';
        
        setTimeout(() => {
          if (widgetState.iframe && widgetState.iframe.parentNode) {
            widgetState.iframe.parentNode.removeChild(widgetState.iframe);
          }
          widgetState.iframe = null;
        }, 300);
      }
      
      if (widgetState.closeBtn && widgetState.closeBtn.parentNode) {
        widgetState.closeBtn.parentNode.removeChild(widgetState.closeBtn);
        widgetState.closeBtn = null;
      }
      
      // Reset bubble appearance
      if (widgetState.bubble) {
        widgetState.bubble.style.transform = 'scale(1)';
        widgetState.bubble.style.opacity = '1';
      }
      
      widgetState.chatOpen = false;
      log('Chat closed successfully');
    } catch (error) {
      log(\`Failed to close chat: \${error.message}\`, 'error');
    }
  }

  // Handle ESC key to close chat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && widgetState.chatOpen) {
      closeChat();
    }
  });

  // Handle click outside to close (optional)
  document.addEventListener('click', (e) => {
    if (widgetState.chatOpen && 
        !widgetState.iframe?.contains(e.target) && 
        !widgetState.closeBtn?.contains(e.target) && 
        !widgetState.bubble?.contains(e.target)) {
      // Optional: uncomment to close on outside click
      // closeChat();
    }
  });

  // Main initialization function
  async function initializeWidget() {
    try {
      log('Initializing TrulyBot widget...');
      
      const scriptConfig = getScriptConfig();
      if (!scriptConfig) {
        throw new Error('Failed to get script configuration');
      }

      const { chatbotId, apiUrl } = scriptConfig;
      log(\`Chatbot ID: \${chatbotId}\`);
      log(\`API URL: \${apiUrl}\`);

      // Load configuration
      await loadConfiguration(chatbotId, apiUrl);
      
      // Create and show bubble
      createBubble();
      
      widgetState.loaded = true;
      log('Widget initialized successfully');
      
      // Dispatch custom event for integration hooks
      window.dispatchEvent(new CustomEvent('trulybot:loaded', {
        detail: { chatbotId, config: widgetState.config }
      }));
      
    } catch (error) {
      log(\`Widget initialization failed: \${error.message}\`, 'error');
      
      // Dispatch error event
      window.dispatchEvent(new CustomEvent('trulybot:error', {
        detail: { error: error.message }
      }));
    }
  }

  // Cleanup function for SPA navigation
  function cleanup() {
    try {
      closeChat();
      if (widgetState.bubble && widgetState.bubble.parentNode) {
        widgetState.bubble.parentNode.removeChild(widgetState.bubble);
      }
      widgetState = {
        loaded: false,
        chatOpen: false,
        config: null,
        bubble: null,
        iframe: null,
        closeBtn: null
      };
      log('Widget cleaned up');
    } catch (error) {
      log(\`Cleanup failed: \${error.message}\`, 'error');
    }
  }

  // Expose cleanup function globally
  window.TrulyBot = {
    cleanup,
    openChat,
    closeChat,
    toggleChat,
    getConfig: () => widgetState.config,
    isLoaded: () => widgetState.loaded,
    isChatOpen: () => widgetState.chatOpen
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    // Delay slightly to ensure script attributes are available
    setTimeout(initializeWidget, 100);
  }

  // Handle page navigation for SPAs
  let currentUrl = window.location.href;
  new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      log('Page navigation detected');
      // Re-initialize if needed
      if (!document.getElementById('trulybot-chat-bubble')) {
        initializeWidget();
      }
    }
  }).observe(document, { subtree: true, childList: true });

})();`;

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
