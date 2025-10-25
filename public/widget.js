(function () {
  'use strict';
  
  try {
    var d = document;
    var w = window;

    // ===== SCRIPT DETECTION & CONFIGURATION =====
    var script = d.currentScript || 
                 d.querySelector('script[data-bot-id][src*="/widget.js"]') ||
                 d.querySelector('script[data-chatbot-id][src*="/widget.js"]');
    if (!script) {
      script = d.querySelector('script[src*="/widget.js"]') || d.scripts[d.scripts.length - 1];
    }

    function getAttr(name, fallback) {
      return (script && script.getAttribute(name)) || fallback;
    }

    var botId = getAttr('data-bot-id', null) || getAttr('data-chatbot-id', 'demo');
    var position = getAttr('data-position', 'right');
    var color = getAttr('data-color', '#2563eb');
    var greeting = getAttr('data-greeting', 'Chat');
    var zIndex = parseInt(getAttr('data-z', '2147483000'), 10);
    
    // Rate limiting
    var RATE_LIMIT_MS = 3000;
    var lastMessageTime = 0;
    var messageQueue = [];

    // Configuration
    var widgetConfig = {
      accent_color: color,
      chatbot_name: 'Assistant',
      welcome_message: 'Hello! How can I help you today?',
      chatbot_logo_url: '',
      chatbot_theme: 'default',
      custom_css: '',
      tier: 'basic'
    };

    // Compute origin
    var src = script && script.src || '';
    var origin;
    try {
      var u = new URL(src);
      origin = u.origin;
    } catch (e) {
      origin = 'https://trulybot.xyz';
      console.warn('[Trulybot widget] Origin detection failed, using fallback:', origin);
    }

    // ===== STATE & DOM ELEMENTS =====
    var iframeReady = false;
    var frame = null;
    var pendingMessages = [];
    var container = null;
    var btn = null;
    var panel = null;
    var open = false;

    // ===== POSTMESSAGE PROTOCOL =====
    function postToIframe(type, data) {
      if (!frame || !iframeReady) {
        pendingMessages.push({ type: type, data: data });
        return false;
      }
      try {
        frame.contentWindow.postMessage({
          type: type,
          data: data,
          source: 'trulybot-widget'
        }, origin);
        return true;
      } catch (err) {
        console.error('[Trulybot widget] postMessage failed:', err);
        return false;
      }
    }

    w.addEventListener('message', function(e) {
      try {
        // Validate origin
        if (origin && !e.origin.includes(origin.replace(/^https?:\/\//, ''))) {
          return;
        }

        if (!e.data || e.data.source !== 'trulybot-iframe') {
          return;
        }

        switch(e.data.type) {
          case 'iframe-ready':
            iframeReady = true;
            console.log('[Trulybot widget] iframe ready, sending config');
            postToIframe('set-config', widgetConfig);
            while (pendingMessages.length > 0) {
              var pending = pendingMessages.shift();
              postToIframe(pending.type, pending.data);
            }
            break;
          
          case 'message':
            if (e.data.data) {
              displayMessage(e.data.data);
            }
            break;

          case 'error':
            showError(e.data.data || 'An error occurred');
            break;
        }
      } catch (err) {
        console.error('[Trulybot widget] Message handler error:', err);
      }
    });

    // ===== RATE LIMITING =====
    function canSendMessage() {
      var now = Date.now();
      if (now - lastMessageTime < RATE_LIMIT_MS) {
        return false;
      }
      lastMessageTime = now;
      return true;
    }

    function processMessageQueue() {
      if (messageQueue.length === 0) return;
      if (!canSendMessage()) {
        setTimeout(processMessageQueue, RATE_LIMIT_MS);
        return;
      }
      var msg = messageQueue.shift();
      postToIframe('send-message', msg);
      if (messageQueue.length > 0) {
        setTimeout(processMessageQueue, RATE_LIMIT_MS);
      }
    }

    // ===== UI DISPLAY FUNCTIONS =====
    var messageHistory = [];

    function displayMessage(message) {
      messageHistory.push(message);
      // Message displayed in iframe - just track it
      console.log('[Trulybot widget] Message received:', message.role);
    }

    function showError(text) {
      var errorEl = d.createElement('div');
      errorEl.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; ' +
        'color: white; padding: 16px 20px; border-radius: 8px; font-size: 14px; z-index: ' + (zIndex + 100) + '; ' +
        'max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
      errorEl.textContent = '⚠️ ' + text;
      d.body.appendChild(errorEl);
      setTimeout(function() {
        try { d.body.removeChild(errorEl); } catch (e) {}
      }, 5000);
    }

    // ===== LOAD CONFIGURATION =====
    function loadWidgetConfig() {
      if (!botId || botId === 'demo') {
        console.log('[Trulybot widget] Demo mode - no config loading');
        applyCustomStyling();
        return;
      }

      var configUrl = origin + '/api/widget/config/' + encodeURIComponent(botId);
      console.log('[Trulybot widget] Loading config from:', configUrl);
      
      fetch(configUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      })
        .then(function(response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function(config) {
          console.log('[Trulybot widget] Config loaded');
          widgetConfig = Object.assign(widgetConfig, config);
          applyCustomStyling();
          postToIframe('set-config', widgetConfig);
        })
        .catch(function(error) {
          console.warn('[Trulybot widget] Config load failed:', error);
          showError('Configuration load failed. Using defaults.');
          applyCustomStyling();
        });
    }

    function applyCustomStyling() {
      if (!btn) return;
      
      btn.style.backgroundColor = widgetConfig.accent_color;
      btn.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25), 0 0 0 0 ' + widgetConfig.accent_color + '40';
      
      if (widgetConfig.custom_css && widgetConfig.tier === 'ultra') {
        var style = d.createElement('style');
        style.id = 'trulybot-custom';
        style.textContent = widgetConfig.custom_css;
        d.head.appendChild(style);
      }

      if (widgetConfig.chatbot_theme === 'minimal' && widgetConfig.tier === 'ultra') {
        btn.style.boxShadow = 'none';
        btn.style.border = '2px solid ' + widgetConfig.accent_color;
      }
    }

    // ===== CREATE UI =====
    function createUI() {
      // Container
      container = d.createElement('div');
      container.id = 'trulybot-widget-container';
      container.style.cssText = 'position: fixed; z-index: ' + zIndex + '; bottom: 20px; ' +
        (position === 'left' ? 'left: 20px;' : 'right: 20px;') +
        'pointer-events: none; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
      d.body.appendChild(container);

      // Button
      btn = d.createElement('button');
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Open Trulybot chat');
      btn.id = 'trulybot-launcher';
      btn.style.cssText = 'position: relative; width: 56px; height: 56px; border-radius: 50%; ' +
        'background: ' + color + '; border: none; cursor: pointer; display: flex; align-items: center; ' +
        'justify-content: center; color: #fff; font-size: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.25); ' +
        'transition: all 0.2s ease; pointer-events: auto; user-select: none; ' +
        '-webkit-user-select: none; -moz-user-select: none; outline: none;';
      
      btn.innerHTML = '<span aria-hidden="true">💬</span>';
      
      btn.onmouseenter = function() {
        btn.style.transform = 'scale(1.1)';
        btn.style.boxShadow = '0 6px 25px rgba(0,0,0,0.35)';
      };
      
      btn.onmouseleave = function() {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
      };

      btn.addEventListener('click', function() {
        open ? closePanel() : openPanel();
      });

      // Panel
      panel = d.createElement('div');
      panel.id = 'trulybot-panel';
      panel.style.cssText = 'position: absolute; bottom: 72px; ' + 
        (position === 'left' ? 'left: 0;' : 'right: 0;') +
        'width: 400px; max-width: calc(100vw - 40px); height: 600px; max-height: calc(100vh - 120px); ' +
        'border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3); ' +
        'transform-origin: ' + (position === 'left' ? 'left' : 'right') + ' bottom; ' +
        'transform: scale(0.95) translateY(10px); opacity: 0; pointer-events: none; ' +
        'transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(255,255,255,0.1);';

      // iframe
      frame = d.createElement('iframe');
      frame.src = origin + '/embed?botId=' + encodeURIComponent(botId);
      frame.title = 'Trulybot Chat';
      frame.allow = 'clipboard-read; clipboard-write;';
      frame.style.cssText = 'width: 100%; height: 100%; border: none; display: block;';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      panel.appendChild(frame);

      container.appendChild(panel);
      container.appendChild(btn);

      // Handle window resize
      adaptForViewport();
      w.addEventListener('resize', adaptForViewport);
    }

    function adaptForViewport() {
      if (!panel) return;
      
      var vw = Math.max(d.documentElement.clientWidth || 0, w.innerWidth || 0);
      var vh = Math.max(d.documentElement.clientHeight || 0, w.innerHeight || 0);
      
      if (vw < 700) {
        // Mobile: full screen
        panel.style.position = 'fixed';
        panel.style.width = '100vw';
        panel.style.height = '100vh';
        panel.style.maxWidth = '100vw';
        panel.style.maxHeight = '100vh';
        panel.style.bottom = '0';
        panel.style.left = '50%';
        panel.style.right = 'auto';
        panel.style.transform = 'translateX(-50%) scale(0.98) translateY(10px)';
        panel.style.borderRadius = '0';
      } else {
        // Desktop: floating panel
        panel.style.position = 'absolute';
        panel.style.width = '400px';
        panel.style.height = '600px';
        panel.style.maxWidth = 'calc(100vw - 24px)';
        panel.style.maxHeight = 'calc(100vh - 120px)';
        panel.style.bottom = '74px';
        panel.style.left = (position === 'left') ? '0' : 'auto';
        panel.style.right = (position === 'left') ? 'auto' : '0';
        panel.style.borderRadius = '16px';
      }
    }

    function openPanel() {
      if (open || !panel) return;
      open = true;
      panel.style.pointerEvents = 'auto';
      panel.style.opacity = '1';
      panel.style.transform = 'scale(1) translateY(0)';
      console.log('[Trulybot widget] Panel opened');
    }

    function closePanel() {
      if (!open || !panel) return;
      open = false;
      panel.style.pointerEvents = 'none';
      panel.style.opacity = '0';
      panel.style.transform = 'scale(0.95) translateY(10px)';
      console.log('[Trulybot widget] Panel closed');
    }

    // Close on ESC
    w.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && open) {
        closePanel();
      }
    });

    // ===== INITIALIZE =====
    function init() {
      console.log('[Trulybot widget] Initializing with botId:', botId);
      createUI();
      loadWidgetConfig();
      console.log('[Trulybot widget] Initialization complete');
    }

    if (d.readyState === 'loading') {
      d.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

  } catch (err) {
    console.error('[Trulybot widget] Fatal error:', err);
    // Fail silently
  }
})();
