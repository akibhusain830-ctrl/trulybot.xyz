(function () {
  try {
    var d = document;
    var w = window;

    // Discover the <script> tag (customers paste this)
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
    var position = getAttr('data-position', 'right'); // 'right' or 'left'
    var color = getAttr('data-color', '#2563eb');      // launcher color (will be overridden by user settings)
    var greeting = getAttr('data-greeting', 'Chat');   // launcher label (visually hidden on desktop)
    var zIndex = parseInt(getAttr('data-z', '2147483000'), 10); // keep above most UI
    
    // Configuration will be loaded from API
    var widgetConfig = {
      accent_color: color,
      chatbot_name: 'Assistant',
      welcome_message: 'Hello! How can I help you today?',
      chatbot_logo_url: '',
      chatbot_theme: 'default',
      custom_css: '',
      tier: 'basic'
    };

    // Compute origin from script src (e.g., https://trulybot.xyz)
    var src = script && script.src || '';
    var origin;
    try {
      var u = new URL(src);
      origin = u.origin;
    } catch (e) {
      // Fallback to production domain if script src detection fails
      origin = 'https://trulybot.xyz';
      console.warn('[Trulybot widget] Could not detect origin from script src, using fallback:', origin);
    }

    // Load user configuration
    function loadWidgetConfig() {
      if (botId && botId !== 'demo') {
        var configUrl = origin + '/api/widget/config/' + encodeURIComponent(botId);
        
        console.log('[Trulybot widget] Loading config from:', configUrl);
        
        fetch(configUrl)
          .then(function(response) {
            if (!response.ok) {
              throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }
            return response.json();
          })
          .then(function(config) {
            console.log('[Trulybot widget] Config loaded successfully:', config);
            // Update widget configuration
            widgetConfig = Object.assign(widgetConfig, config);
            
            // Apply custom styling
            applyCustomStyling();
            
            // Update iframe URL with config
            if (frame && frame.src) {
              var configParam = '&config=' + encodeURIComponent(JSON.stringify(widgetConfig));
              if (frame.src.indexOf('&config=') === -1) {
                frame.src += configParam;
              }
            }
          })
          .catch(function(error) {
            console.warn('[Trulybot widget] Config load failed:', error);
            // Continue with default config
            applyCustomStyling();
          });
      } else {
        console.log('[Trulybot widget] Using demo mode - no config loading needed');
        // Demo mode - use defaults
        applyCustomStyling();
      }
    }

    // Apply custom styling based on configuration
    function applyCustomStyling() {
      // Update launcher button color
      if (widgetConfig.accent_color) {
        btn.style.backgroundColor = widgetConfig.accent_color;
      }
      
      // Apply custom CSS if available (Ultra plan)
      if (widgetConfig.custom_css && widgetConfig.tier === 'ultra') {
        var style = d.createElement('style');
        style.textContent = '/* Trulybot Custom CSS */\n' + widgetConfig.custom_css;
        d.head.appendChild(style);
      }
      
      // Apply theme-specific styling
      if (widgetConfig.chatbot_theme && widgetConfig.tier === 'ultra') {
        applyThemeStyling(widgetConfig.chatbot_theme);
      }
    }

    // Apply theme-specific styling
    function applyThemeStyling(theme) {
      switch (theme) {
        case 'minimal':
          btn.style.boxShadow = 'none';
          btn.style.border = '1px solid ' + widgetConfig.accent_color;
          break;
        case 'corporate':
          btn.style.borderRadius = '4px';
          break;
        case 'friendly':
          btn.style.borderRadius = '50%';
          btn.style.transform = 'scale(1.1)';
          break;
        case 'modern':
          btn.style.background = 'linear-gradient(135deg, ' + widgetConfig.accent_color + ', ' + widgetConfig.accent_color + 'cc)';
          btn.style.backdropFilter = 'blur(10px)';
          break;
        default:
          // Default theme - no additional styling
          break;
      }
    }

    // Build iframe URL that hosts your ChatWidget
    var iframeUrl = origin + '/embed?botId=' + encodeURIComponent(botId);

    // Create container
    var container = d.createElement('div');
    container.id = 'trulybot-widget-container';
    container.style.position = 'fixed';
    container.style.zIndex = String(zIndex);
    container.style.bottom = '20px';
    if (position === 'left') container.style.left = '20px';
    else container.style.right = '20px';
    container.style.pointerEvents = 'none'; // let children manage events
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    d.body.appendChild(container);

    // Create launcher button
    var btn = d.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Open Trulybot chat');
    btn.id = 'trulybot-launcher';
    btn.style.all = 'unset';
    btn.style.position = 'relative';
    btn.style.width = '56px';
    btn.style.height = '56px';
    btn.style.borderRadius = '50%';
    btn.style.background = color;
    btn.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
    btn.style.cursor = 'pointer';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.color = '#fff';
    btn.style.fontSize = '24px';
    btn.style.transition = 'all 0.2s ease';
    btn.style.pointerEvents = 'auto'; // clickable
    btn.style.border = 'none';
    btn.style.outline = 'none';
    // Prevent text selection
    btn.style.userSelect = 'none';
    btn.style.webkitUserSelect = 'none';
    btn.style.mozUserSelect = 'none';
    btn.style.msUserSelect = 'none';
    btn.onmouseenter = function () { 
      btn.style.transform = 'scale(1.1)'; 
      btn.style.boxShadow = '0 6px 25px rgba(0,0,0,0.35)';
    };
    btn.onmouseleave = function () { 
      btn.style.transform = 'scale(1)'; 
      btn.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
    };
    btn.innerHTML = '<span aria-hidden="true" style="line-height: 1;">💬</span><span style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">' + greeting + '</span>';

    // Create panel wrapper (holds iframe)
    var panel = d.createElement('div');
    panel.id = 'trulybot-panel';
    panel.style.position = 'absolute';
    panel.style.bottom = '72px'; // Adjusted for new button size
    if (position === 'left') panel.style.left = '0';
    else panel.style.right = '0';
    panel.style.width = '400px';
    panel.style.maxWidth = 'calc(100vw - 40px)'; // Account for container margins
    panel.style.height = '600px';
    panel.style.maxHeight = 'calc(100vh - 120px)';
    panel.style.borderRadius = '12px';
    panel.style.overflow = 'hidden';
    panel.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
    panel.style.transformOrigin = position === 'left' ? 'left bottom' : 'right bottom';
    panel.style.transform = 'scale(0.95) translateY(10px)';
    panel.style.opacity = '0';
    panel.style.pointerEvents = 'none';
    panel.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    panel.style.border = '1px solid rgba(255,255,255,0.1)';

    // Create iframe
    var frame = d.createElement('iframe');
    frame.src = iframeUrl;
    frame.title = 'Trulybot chat';
    frame.allow = 'clipboard-read; clipboard-write;';
    frame.style.width = '100%';
    frame.style.height = '100%';
    frame.style.border = '0';
    frame.style.display = 'block';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    panel.appendChild(frame);

    // Append in the correct order
    container.appendChild(panel);
    container.appendChild(btn);

    // Load user configuration and apply styling
    loadWidgetConfig();

    var open = false;
    function openPanel() {
      if (open) return;
      open = true;
      panel.style.pointerEvents = 'auto';
      panel.style.opacity = '1';
      panel.style.transform = 'scale(1) translateY(0)';
    }
    function closePanel() {
      if (!open) return;
      open = false;
      panel.style.pointerEvents = 'none';
      panel.style.opacity = '0';
      panel.style.transform = 'scale(0.95) translateY(10px)';
    }
    function togglePanel() {
      open ? closePanel() : openPanel();
    }

    btn.addEventListener('click', togglePanel);

    // Close on ESC when panel is open
    w.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) {
        closePanel();
      }
    });

    // Basic mobile handling (make panel full-screen)
    function adaptForViewport() {
      var vw = Math.max(d.documentElement.clientWidth || 0, w.innerWidth || 0);
      var vh = Math.max(d.documentElement.clientHeight || 0, w.innerHeight || 0);
      if (vw < 700) {
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
    adaptForViewport();
    w.addEventListener('resize', adaptForViewport);

  } catch (err) {
    console.error('[Trulybot widget] init error:', err);
    // Try to show a visible error for debugging
    if (typeof document !== 'undefined') {
      var errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:red;color:white;padding:10px;font-size:12px;z-index:999999;max-width:200px;';
      errorDiv.textContent = 'Trulybot widget error: ' + err.message;
      document.body.appendChild(errorDiv);
      setTimeout(function() {
        try { document.body.removeChild(errorDiv); } catch(e) {}
      }, 5000);
    }
  }

  // Log successful initialization
  console.log('[Trulybot widget] Successfully initialized with botId:', botId, 'origin:', origin);
})();