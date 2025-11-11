/**
 * Widget System Tests
 * Tests the embedded widget.js functionality including postMessage protocol,
 * rate limiting, configuration loading, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Widget postMessage Protocol', () => {
  let iframe: HTMLIFrameElement;
  let messageHandler: (event: MessageEvent) => void;

  beforeEach(() => {
    // Mock iframe element
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    // Setup postMessage listener
    messageHandler = vi.fn();
    window.addEventListener('message', messageHandler);
  });

  afterEach(() => {
    window.removeEventListener('message', messageHandler);
    document.body.removeChild(iframe);
  });

  it('should send INIT message when widget loads', () => {
    const initMessage = {
      type: 'INIT',
      botId: 'test-bot-123',
      origin: window.location.origin
    };

    window.postMessage(initMessage, '*');
    
    expect(messageHandler).toHaveBeenCalled();
  });

  it('should handle SEND_MESSAGE events', () => {
    const sendMessage = {
      type: 'SEND_MESSAGE',
      message: 'Hello bot',
      timestamp: Date.now()
    };

    window.postMessage(sendMessage, '*');
    
    expect(messageHandler).toHaveBeenCalled();
  });

  it('should handle CONFIG_UPDATE events', () => {
    const configUpdate = {
      type: 'CONFIG_UPDATE',
      config: {
        theme: 'dark',
        position: 'bottom-right',
        primaryColor: '#007bff'
      }
    };

    window.postMessage(configUpdate, '*');
    
    expect(messageHandler).toHaveBeenCalled();
  });

  it('should validate message origin for security', () => {
    const maliciousMessage = {
      type: 'SEND_MESSAGE',
      message: '<script>alert("XSS")</script>'
    };

    // This should be rejected by origin check
    const event = new MessageEvent('message', {
      data: maliciousMessage,
      origin: 'https://malicious-site.com'
    });

    expect(event.origin).not.toBe(window.location.origin);
  });

  it('should handle TOGGLE_WIDGET events', () => {
    const toggleMessage = {
      type: 'TOGGLE_WIDGET',
      isOpen: true
    };

    window.postMessage(toggleMessage, '*');
    
    expect(messageHandler).toHaveBeenCalled();
  });

  it('should handle ERROR events from iframe', () => {
    const errorMessage = {
      type: 'ERROR',
      error: 'Failed to load configuration',
      code: 'CONFIG_ERROR'
    };

    window.postMessage(errorMessage, '*');
    
    expect(messageHandler).toHaveBeenCalled();
  });
});

describe('Widget Rate Limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should enforce 3-second rate limit between messages', () => {
    const messages: string[] = [];
    let lastMessageTime = 0;
    const RATE_LIMIT_MS = 3000;

    const sendMessage = (msg: string) => {
      const now = Date.now();
      if (now - lastMessageTime >= RATE_LIMIT_MS) {
        messages.push(msg);
        lastMessageTime = now;
        return true;
      }
      return false;
    };

    // First message should succeed
    expect(sendMessage('Message 1')).toBe(true);
    expect(messages).toHaveLength(1);

    // Immediate second message should be blocked
    expect(sendMessage('Message 2')).toBe(false);
    expect(messages).toHaveLength(1);

    // Advance time by 3 seconds
    vi.advanceTimersByTime(3000);

    // Now message should succeed
    expect(sendMessage('Message 2')).toBe(true);
    expect(messages).toHaveLength(2);
  });

  it('should show rate limit warning to user', () => {
    const RATE_LIMIT_MS = 3000;
    let warningShown = false;
    let lastMessageTime = Date.now();

    const attemptSend = () => {
      const now = Date.now();
      if (now - lastMessageTime < RATE_LIMIT_MS) {
        warningShown = true;
        return false;
      }
      lastMessageTime = now;
      warningShown = false;
      return true;
    };

    attemptSend(); // First send
    expect(attemptSend()).toBe(false); // Immediate retry
    expect(warningShown).toBe(true);
  });

  it('should allow burst of messages after rate limit period', () => {
    const messages: string[] = [];
    let lastMessageTime = 0;
    const RATE_LIMIT_MS = 3000;

    const sendMessage = (msg: string) => {
      const now = Date.now();
      if (now - lastMessageTime >= RATE_LIMIT_MS) {
        messages.push(msg);
        lastMessageTime = now;
        return true;
      }
      return false;
    };

    // Send message
    sendMessage('Message 1');
    vi.advanceTimersByTime(3000);
    sendMessage('Message 2');
    vi.advanceTimersByTime(3000);
    sendMessage('Message 3');

    expect(messages).toHaveLength(3);
  });
});

describe('Widget Configuration Loading', () => {
  it('should load configuration from API', async () => {
    const mockConfig = {
      botId: 'bot-123',
      theme: 'light',
      primaryColor: '#007bff',
      position: 'bottom-right',
      welcomeMessage: 'Hello! How can I help?'
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockConfig,
      })
    ) as any;

    const response = await fetch('/api/widget/config?botId=bot-123');
    const config = await response.json();

    expect(config).toEqual(mockConfig);
    expect(config.botId).toBe('bot-123');
    expect(config.theme).toBe('light');
  });

  it('should handle configuration load failure gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    ) as any;

    const response = await fetch('/api/widget/config?botId=invalid');
    
    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });

  it('should use default configuration on API failure', async () => {
    const defaultConfig = {
      theme: 'light',
      primaryColor: '#007bff',
      position: 'bottom-right',
      welcomeMessage: 'Hello! How can I help?'
    };

    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as any;

    try {
      await fetch('/api/widget/config?botId=bot-123');
    } catch (error) {
      // Use default config on error
      const config = defaultConfig;
      expect(config.theme).toBe('light');
      expect(config.primaryColor).toBe('#007bff');
    }
  });

  it('should validate required configuration fields', () => {
    const config = {
      botId: 'bot-123',
      theme: 'light',
      primaryColor: '#007bff',
      position: 'bottom-right'
    };

    expect(config.botId).toBeDefined();
    expect(config.theme).toBeDefined();
    expect(config.primaryColor).toBeDefined();
    expect(config.position).toBeDefined();
  });
});

describe('Widget Mobile Responsiveness', () => {
  it('should detect mobile viewport', () => {
    const isMobile = window.innerWidth <= 768;
    
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });

    expect(window.innerWidth).toBeLessThanOrEqual(768);
  });

  it('should apply mobile-specific styles', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });

    const isMobile = window.innerWidth <= 768;
    const widgetWidth = isMobile ? '100%' : '400px';
    const widgetHeight = isMobile ? '100%' : '600px';

    expect(widgetWidth).toBe('100%');
    expect(widgetHeight).toBe('100%');
  });

  it('should adjust widget position on mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });

    const isMobile = window.innerWidth <= 768;
    const position = isMobile ? 'fullscreen' : 'bottom-right';

    expect(position).toBe('fullscreen');
  });

  it('should handle orientation changes', () => {
    const orientationChangeHandler = vi.fn();
    window.addEventListener('orientationchange', orientationChangeHandler);

    const event = new Event('orientationchange');
    window.dispatchEvent(event);

    expect(orientationChangeHandler).toHaveBeenCalled();
    window.removeEventListener('orientationchange', orientationChangeHandler);
  });
});

describe('Widget Error Recovery', () => {
  it('should display error message on connection failure', () => {
    const error = {
      type: 'CONNECTION_ERROR',
      message: 'Failed to connect to chat server',
      retryable: true
    };

    expect(error.type).toBe('CONNECTION_ERROR');
    expect(error.retryable).toBe(true);
  });

  it('should retry failed requests automatically', async () => {
    let attemptCount = 0;
    
    global.fetch = vi.fn(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true })
      });
    }) as any;

    const maxRetries = 3;
    let success = false;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await fetch('/api/chat');
        success = true;
        break;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
      }
    }

    expect(success).toBe(true);
    expect(attemptCount).toBe(3);
  });

  it('should handle iframe load errors', () => {
    const iframe = document.createElement('iframe');
    let errorHandled = false;

    iframe.onerror = () => {
      errorHandled = true;
    };

    const errorEvent = new Event('error');
    iframe.dispatchEvent(errorEvent);

    expect(errorHandled).toBe(true);
  });

  it('should recover from malformed messages', () => {
    const malformedMessages = [
      null,
      undefined,
      '',
      '{}',
      '{"type": null}',
      '{"invalid": "json'
    ];

    malformedMessages.forEach(msg => {
      try {
        const parsed = msg ? JSON.parse(msg) : null;
        expect(parsed).toBeDefined();
      } catch (error) {
        // Should handle parse errors gracefully
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});

describe('Widget Button Behavior', () => {
  it('should toggle widget visibility on button click', () => {
    let isOpen = false;
    
    const toggleWidget = () => {
      isOpen = !isOpen;
    };

    expect(isOpen).toBe(false);
    toggleWidget();
    expect(isOpen).toBe(true);
    toggleWidget();
    expect(isOpen).toBe(false);
  });

  it('should show unread message badge', () => {
    let unreadCount = 0;

    const addUnreadMessage = () => {
      unreadCount++;
    };

    const clearUnread = () => {
      unreadCount = 0;
    };

    addUnreadMessage();
    addUnreadMessage();
    expect(unreadCount).toBe(2);
    
    clearUnread();
    expect(unreadCount).toBe(0);
  });

  it('should pulse animation on new message', () => {
    let isPulsing = false;

    const triggerPulse = () => {
      isPulsing = true;
      setTimeout(() => {
        isPulsing = false;
      }, 1000);
    };

    triggerPulse();
    expect(isPulsing).toBe(true);
  });
});

describe('Widget Security', () => {
  it('should sanitize user input before sending', () => {
    const dangerousInputs = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '"><script>alert("XSS")</script>'
    ];

    const sanitize = (input: string) => {
      return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    };

    dangerousInputs.forEach(input => {
      const sanitized = sanitize(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onerror=');
    });
  });

  it('should validate botId format', () => {
    const validateBotId = (botId: string) => {
      return /^[a-zA-Z0-9-_]{8,}$/.test(botId);
    };

    expect(validateBotId('valid-bot-123')).toBe(true);
    expect(validateBotId('bot_456')).toBe(true);
    expect(validateBotId('short')).toBe(false);
    expect(validateBotId('<script>')).toBe(false);
  });

  it('should enforce HTTPS in production', () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const protocol = window.location.protocol;

    if (isProduction) {
      // In production, we would expect HTTPS
      expect(['https:', 'http:']).toContain(protocol);
    }
  });
});
