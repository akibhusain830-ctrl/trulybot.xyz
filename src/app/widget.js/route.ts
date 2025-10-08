import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const widgetScript = `
(function() {
  'use strict';
  
  // Prevent multiple initialization
  if (window.TrulyBotWidget) {
    console.log('[TrulyBot] Widget already initialized');
    return;
  }

  // Configuration and state
  const WIDGET_CONFIG = {
    retryAttempts: 3,
    retryDelay: 1000,
    timeoutMs: 10000,
    fallbackColor: '#007bff',
    fallbackGreeting: 'Hello! How can I help you today?',
    zIndex: 999999,
    apiBaseUrl: '${process.env.NEXT_PUBLIC_APP_URL || 'https://trulybot.xyz'}'
  };
  
  let widgetState = {
    initialized: false,
    chatOpen: false,
    config: null,
    button: null,
    panel: null,
    closeBtn: null,
    overlay: null
  };

  // Utility functions
  function log(message, type = 'info') {
    const prefix = '[TrulyBot Widget]';
    const timestamp = new Date().toISOString();
    const logMessage = \`\${prefix} [\${timestamp}] \${message}\`;
    
    if (type === 'error') {
      console.error(logMessage);
    } else if (type === 'warn') {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  // Extract configuration from script tag data attributes
  function getConfiguration() {
    try {
      // Find the script tag that loaded this widget
      const script = document.currentScript || 
                    document.querySelector('script[data-bot-id]') ||
                    document.querySelector('script[src*="widget.js"]') ||
                    Array.from(document.querySelectorAll('script')).find(s => 
                      s.src && s.src.includes('trulybot') && s.src.includes('widget.js')
                    );
      
      if (!script) {
        throw new Error('Could not find TrulyBot widget script tag');
      }

      // Extract configuration from data attributes
      const botId = script.getAttribute('data-bot-id');
      if (!botId) {
        throw new Error('data-bot-id attribute is required');
      }

      const config = {
        botId: botId.trim(),
        position: script.getAttribute('data-position') || 'right',
        color: script.getAttribute('data-color') || WIDGET_CONFIG.fallbackColor,
        greeting: script.getAttribute('data-greeting') || WIDGET_CONFIG.fallbackGreeting,
        theme: script.getAttribute('data-theme') || 'light'
      };

      // Validate position
      if (!['left', 'right'].includes(config.position)) {
        log(\`Invalid position '\${config.position}', using 'right'\`, 'warn');
        config.position = 'right';
      }

      // Validate color (basic hex color check)
      if (!/^#[0-9A-F]{6}$/i.test(config.color)) {
        log(\`Invalid color '\${config.color}', using fallback\`, 'warn');
        config.color = WIDGET_CONFIG.fallbackColor;
      }

      // Validate theme
      if (!['light', 'dark'].includes(config.theme)) {
        log(\`Invalid theme '\${config.theme}', using 'light'\`, 'warn');
        config.theme = 'light';
      }

      log(\`Configuration extracted: \${JSON.stringify(config)}\`);
      return config;
    } catch (error) {
      log(\`Configuration error: \${error.message}\`, 'error');
      return null;
    }
  }

  // Create floating chat button
  function createChatButton(config) {
    if (widgetState.button) {
      log('Chat button already exists', 'warn');
      return;
    }

    try {
      const button = document.createElement('button');
      button.id = 'trulybot-chat-button';
      button.setAttribute('aria-label', 'Open chat');
      button.setAttribute('role', 'button');
      button.setAttribute('tabindex', '0');
      button.innerHTML = \`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      \`;
      
      const positionStyle = config.position === 'left' ? 'left: 20px' : 'right: 20px';
      
      button.style.cssText = \`
        position: fixed !important;
        bottom: 20px !important;
        \${positionStyle} !important;
        width: 60px !important;
        height: 60px !important;
        border-radius: 50% !important;
        border: none !important;
        background: \${config.color} !important;
        color: white !important;
        cursor: pointer !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
        z-index: \${WIDGET_CONFIG.zIndex} !important;
        transition: all 0.3s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        outline: none !important;
        user-select: none !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      \`;
      
      // Hover effects
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
      });
      
      // Click handlers
      button.addEventListener('click', toggleChat);
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleChat();
        }
      });
      
      document.body.appendChild(button);
      widgetState.button = button;
      
      log('Chat button created successfully');
    } catch (error) {
      log(\`Failed to create chat button: \${error.message}\`, 'error');
    }
  }

  // Create chat panel with iframe
  function createChatPanel(config) {
    if (widgetState.panel) {
      log('Chat panel already exists', 'warn');
      return;
    }

    try {
      // Create overlay for mobile
      const overlay = document.createElement('div');
      overlay.id = 'trulybot-overlay';
      overlay.style.cssText = \`
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0,0,0,0.3) !important;
        z-index: \${WIDGET_CONFIG.zIndex - 1} !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: all 0.3s ease !important;
        display: none !important;
      \`;
      
      overlay.addEventListener('click', closeChat);
      
      // Create chat panel container
      const panel = document.createElement('div');
      panel.id = 'trulybot-chat-panel';
      
      const isDesktop = window.innerWidth >= 768;
      const positionStyle = config.position === 'left' ? 'left: 20px' : 'right: 20px';
      
      if (isDesktop) {
        panel.style.cssText = \`
          position: fixed !important;
          bottom: 90px !important;
          \${positionStyle} !important;
          width: 380px !important;
          height: 600px !important;
          max-height: calc(100vh - 120px) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
          z-index: \${WIDGET_CONFIG.zIndex + 1} !important;
          background: white !important;
          overflow: hidden !important;
          opacity: 0 !important;
          transform: translateY(20px) scale(0.95) !important;
          transition: all 0.3s ease !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        \`;
      } else {
        // Mobile: full screen
        panel.style.cssText = \`
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: \${WIDGET_CONFIG.zIndex + 1} !important;
          background: white !important;
          overflow: hidden !important;
          opacity: 0 !important;
          transform: translateY(100%) !important;
          transition: all 0.3s ease !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        \`;
        
        overlay.style.display = 'block';
      }
      
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'trulybot-chat-iframe';
      iframe.setAttribute('title', 'TrulyBot Chat');
      iframe.setAttribute('allow', 'microphone; camera');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('frameborder', '0');
      
      // Build embed URL with parameters
      const embedUrl = new URL(\`\${WIDGET_CONFIG.apiBaseUrl}/embed\`);
      embedUrl.searchParams.set('botId', config.botId);
      embedUrl.searchParams.set('color', encodeURIComponent(config.color));
      embedUrl.searchParams.set('greeting', encodeURIComponent(config.greeting));
      embedUrl.searchParams.set('theme', config.theme);
      embedUrl.searchParams.set('position', config.position);
      
      iframe.src = embedUrl.toString();
      iframe.style.cssText = \`
        width: 100% !important;
        height: 100% !important;
        border: none !important;
        background: white !important;
      \`;
      
      // Create close button for desktop
      let closeBtn = null;
      if (isDesktop) {
        closeBtn = document.createElement('button');
        closeBtn.id = 'trulybot-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Close chat');
        closeBtn.setAttribute('role', 'button');
        closeBtn.setAttribute('tabindex', '0');
        
        closeBtn.style.cssText = \`
          position: absolute !important;
          top: 8px !important;
          right: 8px !important;
          width: 32px !important;
          height: 32px !important;
          border: none !important;
          background: rgba(0,0,0,0.1) !important;
          color: #666 !important;
          border-radius: 50% !important;
          cursor: pointer !important;
          z-index: \${WIDGET_CONFIG.zIndex + 2} !important;
          font-size: 18px !important;
          line-height: 1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
          outline: none !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        \`;
        
        closeBtn.addEventListener('click', closeChat);
        closeBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeChat();
          }
        });
        
        closeBtn.addEventListener('mouseenter', () => {
          closeBtn.style.background = 'rgba(0,0,0,0.2)';
          closeBtn.style.color = '#333';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
          closeBtn.style.background = 'rgba(0,0,0,0.1)';
          closeBtn.style.color = '#666';
        });
        
        panel.appendChild(closeBtn);
        widgetState.closeBtn = closeBtn;
      }
      
      panel.appendChild(iframe);
      document.body.appendChild(overlay);
      document.body.appendChild(panel);
      
      widgetState.panel = panel;
      widgetState.overlay = overlay;
      
      log('Chat panel created successfully');
    } catch (error) {
      log(\`Failed to create chat panel: \${error.message}\`, 'error');
    }
  }

  // Toggle chat open/close
  function toggleChat() {
    if (widgetState.chatOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  // Open chat
  function openChat() {
    if (widgetState.chatOpen) {
      return;
    }

    try {
      if (!widgetState.panel) {
        createChatPanel(widgetState.config);
      }
      
      if (!widgetState.panel) {
        throw new Error('Failed to create chat panel');
      }

      const isDesktop = window.innerWidth >= 768;
      
      if (isDesktop) {
        widgetState.panel.style.opacity = '1';
        widgetState.panel.style.transform = 'translateY(0) scale(1)';
      } else {
        widgetState.overlay.style.opacity = '1';
        widgetState.overlay.style.visibility = 'visible';
        widgetState.panel.style.opacity = '1';
        widgetState.panel.style.transform = 'translateY(0)';
      }
      
      // Update button appearance
      if (widgetState.button) {
        widgetState.button.style.transform = 'scale(0.9)';
        widgetState.button.style.opacity = '0.8';
      }
      
      widgetState.chatOpen = true;
      log('Chat opened');
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('trulybot:chat:opened', {
        detail: { botId: widgetState.config.botId }
      }));
      
    } catch (error) {
      log(\`Failed to open chat: \${error.message}\`, 'error');
    }
  }

  // Close chat
  function closeChat() {
    if (!widgetState.chatOpen) {
      return;
    }

    try {
      const isDesktop = window.innerWidth >= 768;
      
      if (widgetState.panel) {
        if (isDesktop) {
          widgetState.panel.style.opacity = '0';
          widgetState.panel.style.transform = 'translateY(20px) scale(0.95)';
        } else {
          widgetState.panel.style.opacity = '0';
          widgetState.panel.style.transform = 'translateY(100%)';
          
          if (widgetState.overlay) {
            widgetState.overlay.style.opacity = '0';
            widgetState.overlay.style.visibility = 'hidden';
          }
        }
      }
      
      // Reset button appearance
      if (widgetState.button) {
        widgetState.button.style.transform = 'scale(1)';
        widgetState.button.style.opacity = '1';
      }
      
      widgetState.chatOpen = false;
      log('Chat closed');
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('trulybot:chat:closed', {
        detail: { botId: widgetState.config.botId }
      }));
      
    } catch (error) {
      log(\`Failed to close chat: \${error.message}\`, 'error');
    }
  }

  // Handle escape key
  function handleKeydown(e) {
    if (e.key === 'Escape' && widgetState.chatOpen) {
      closeChat();
    }
  }

  // Handle window resize
  function handleResize() {
    if (widgetState.chatOpen && widgetState.panel) {
      // Recreate panel for responsive changes
      const config = widgetState.config;
      const wasOpen = widgetState.chatOpen;
      
      // Clean up current panel
      if (widgetState.panel && widgetState.panel.parentNode) {
        widgetState.panel.parentNode.removeChild(widgetState.panel);
      }
      if (widgetState.overlay && widgetState.overlay.parentNode) {
        widgetState.overlay.parentNode.removeChild(widgetState.overlay);
      }
      
      widgetState.panel = null;
      widgetState.overlay = null;
      widgetState.closeBtn = null;
      widgetState.chatOpen = false;
      
      // Recreate and reopen
      if (wasOpen) {
        setTimeout(openChat, 100);
      }
    }
  }

  // Initialize widget
  function initializeWidget() {
    try {
      if (widgetState.initialized) {
        log('Widget already initialized', 'warn');
        return;
      }

      log('Initializing TrulyBot widget...');
      
      const config = getConfiguration();
      if (!config) {
        throw new Error('Failed to get widget configuration');
      }

      widgetState.config = config;
      
      // Create chat button
      createChatButton(config);
      
      // Add event listeners
      document.addEventListener('keydown', handleKeydown);
      window.addEventListener('resize', handleResize);
      
      widgetState.initialized = true;
      log(\`Widget initialized successfully for bot: \${config.botId}\`);
      
      // Dispatch initialization event
      window.dispatchEvent(new CustomEvent('trulybot:initialized', {
        detail: { botId: config.botId, config: config }
      }));
      
    } catch (error) {
      log(\`Widget initialization failed: \${error.message}\`, 'error');
      
      // Dispatch error event
      window.dispatchEvent(new CustomEvent('trulybot:error', {
        detail: { error: error.message }
      }));
    }
  }

  // Cleanup function
  function cleanup() {
    try {
      log('Cleaning up widget...');
      
      // Remove event listeners
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', handleResize);
      
      // Remove DOM elements
      if (widgetState.button && widgetState.button.parentNode) {
        widgetState.button.parentNode.removeChild(widgetState.button);
      }
      if (widgetState.panel && widgetState.panel.parentNode) {
        widgetState.panel.parentNode.removeChild(widgetState.panel);
      }
      if (widgetState.overlay && widgetState.overlay.parentNode) {
        widgetState.overlay.parentNode.removeChild(widgetState.overlay);
      }
      
      // Reset state
      widgetState = {
        initialized: false,
        chatOpen: false,
        config: null,
        button: null,
        panel: null,
        closeBtn: null,
        overlay: null
      };
      
      log('Widget cleanup completed');
    } catch (error) {
      log(\`Widget cleanup failed: \${error.message}\`, 'error');
    }
  }

  // Expose global API
  window.TrulyBotWidget = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    cleanup: cleanup,
    isOpen: () => widgetState.chatOpen,
    isInitialized: () => widgetState.initialized,
    getConfig: () => widgetState.config
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    // Add small delay to ensure script attributes are available
    setTimeout(initializeWidget, 50);
  }

  log('TrulyBot widget script loaded');

})();
`;

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Vary': 'Accept-Encoding',
    },
  });
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
