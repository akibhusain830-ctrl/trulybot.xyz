(function () {
  try {
    var d = document;
    var w = window;

    // Discover the <script> tag (customers paste this)
    var script = d.currentScript || d.querySelector('script[data-bot-id][src*="/widget.js"]');
    if (!script) {
      script = d.querySelector('script[src*="/widget.js"]') || d.scripts[d.scripts.length - 1];
    }

    function getAttr(name, fallback) {
      return (script && script.getAttribute(name)) || fallback;
    }

    var botId = getAttr('data-bot-id', 'demo');
    var position = getAttr('data-position', 'right'); // 'right' or 'left'
    var color = getAttr('data-color', '#2563eb');      // launcher color
    var greeting = getAttr('data-greeting', 'Chat');   // launcher label (visually hidden on desktop)
    var zIndex = parseInt(getAttr('data-z', '2147483000'), 10); // keep above most UI

    // Compute origin from script src (e.g., https://trulybot.xyz)
    var src = script && script.src || '';
    var origin;
    try {
      var u = new URL(src);
      origin = u.origin;
    } catch (e) {
      origin = (location.protocol + '//' + location.host);
    }

    // Build iframe URL that hosts your ChatWidget
    var iframeUrl = origin + '/embed?botId=' + encodeURIComponent(botId);

    // Create container
    var container = d.createElement('div');
    container.id = 'trulybot-widget-container';
    container.style.position = 'fixed';
    container.style.zIndex = String(zIndex);
    container.style.bottom = '24px';
    if (position === 'left') container.style.left = '24px';
    else container.style.right = '24px';
    container.style.pointerEvents = 'none'; // let children manage events
    d.body.appendChild(container);

    // Create launcher button
    var btn = d.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Open Trulybot chat');
    btn.id = 'trulybot-launcher';
    btn.style.all = 'unset';
    btn.style.position = 'relative';
    btn.style.width = '60px';
    btn.style.height = '60px';
    btn.style.borderRadius = '50%';
    btn.style.background = color;
    btn.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
    btn.style.cursor = 'pointer';
    btn.style.display = 'grid';
    btn.style.placeItems = 'center';
    btn.style.color = '#fff';
    btn.style.fontSize = '26px';
    btn.style.transition = 'transform 120ms ease';
    btn.style.pointerEvents = 'auto'; // clickable
    btn.onmouseenter = function () { btn.style.transform = 'scale(1.06)'; };
    btn.onmouseleave = function () { btn.style.transform = 'scale(1)'; };
    btn.innerHTML = '<span aria-hidden="true">🌀</span><span style="position:absolute;left:-9999px">' + greeting + '</span>';

    // Create panel wrapper (holds iframe)
    var panel = d.createElement('div');
    panel.id = 'trulybot-panel';
    panel.style.position = 'absolute';
    panel.style.bottom = '74px';
    if (position === 'left') panel.style.left = '0';
    else panel.style.right = '0';
    panel.style.width = '400px';
    panel.style.maxWidth = 'calc(100vw - 24px)';
    panel.style.height = '600px';
    panel.style.maxHeight = 'calc(100vh - 120px)';
    panel.style.borderRadius = '16px';
    panel.style.overflow = 'hidden';
    panel.style.boxShadow = '0 20px 60px rgba(0,0,0,0.45)';
    panel.style.transformOrigin = position === 'left' ? 'left bottom' : 'right bottom';
    panel.style.transform = 'scale(0.98) translateY(10px)';
    panel.style.opacity = '0';
    panel.style.pointerEvents = 'none';
    panel.style.transition = 'transform 160ms ease, opacity 160ms ease';

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
      panel.style.transform = 'scale(0.98) translateY(10px)';
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
  }
})();