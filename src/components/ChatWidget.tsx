'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { BRAND } from '@/lib/branding';
import Image from 'next/image';

type Role = 'bot' | 'user';

type Source = {
  title: string;
  docId: string;
  url?: string;
  snippet: string;
};

type Message = {
  id: string;
  role: Role;
  text: string;
  at: number;
  error?: boolean;
  sources?: Source[];
  usedDocs?: boolean;
  fallback?: boolean;
  buttons?: Array<{ text: string; url: string; type: 'primary' | 'secondary' }>;
};

const INTRO_KEY = 'trulybot_v4_seen_intro';

// Default neutral suggestions that work for any business
const SUGGESTIONS = [
  'What can you help me with?',
  'Tell me about your services',
  'How can I get started?'
];

// Demo-specific conversion-focused suggestions
const DEMO_SUGGESTIONS = [
  'Show me your pricing plans',
  'How do I start my free trial?',
  'What features do you offer?',
  'How quickly can I get started?'
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export interface WidgetConfig {
  tier: 'basic' | 'pro' | 'ultra';
  chatbot_name: string;
  welcome_message: string;
  accent_color: string;
  chatbot_logo_url?: string;
  chatbot_theme?: string;
  custom_css?: string;
}

export default function ChatWidget({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [botId, setBotId] = useState<string>('demo');
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
    tier: 'basic',
    chatbot_name: 'Assistant',
    welcome_message: 'Hello! How can I help you today?',
    accent_color: '#2563EB'
  });

  // Storage keys
  const CHAT_HISTORY_KEY = 'trulybot_chat_history';
  const MAX_SAVED_MESSAGES = 50; // Limit to prevent localStorage overflow
  
  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // Ref for the textarea
  const isMounted = useRef(true);
  
  // Save chat history to localStorage
  const saveChatHistory = useCallback((chatMessages: Message[]) => {
    try {
      // Don't save if there are no messages to save
      if (!chatMessages || chatMessages.length === 0) return;
      
      // Save regardless of message count to ensure consistency
      // Limit the number of saved messages to prevent localStorage overflow
      const messagesToSave = chatMessages.slice(-MAX_SAVED_MESSAGES);
      
      // Use botId as part of the key to ensure each bot has its own history
      const storageKey = `${CHAT_HISTORY_KEY}_${botId}`;
      localStorage.setItem(storageKey, JSON.stringify(messagesToSave));
      console.log('Chat history saved', { count: messagesToSave.length, botId, key: storageKey });
      logger.info('Chat history saved', { count: messagesToSave.length, botId });
    } catch (e) {
      console.error('Failed to save chat history', e);
      logger.error('Failed to save chat history', { error: e });
    }
  }, [CHAT_HISTORY_KEY, botId]);
  
  // Load chat history from localStorage
  const loadChatHistory = useCallback(() => {
    try {
      // Use botId as part of the key to ensure each bot has its own history
      const storageKey = `${CHAT_HISTORY_KEY}_${botId}`;
      const savedHistory = localStorage.getItem(storageKey);
      
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as Message[];
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          console.log('Chat history loaded successfully', { count: parsedHistory.length, botId, key: storageKey });
          logger.info('Chat history loaded', { count: parsedHistory.length, botId });
          return parsedHistory;
        } else {
          console.log('Chat history was empty or invalid', { savedHistory });
        }
      } else {
        // Try the old key as fallback (for backward compatibility)
        const oldSavedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
        if (oldSavedHistory) {
          try {
            const parsedHistory = JSON.parse(oldSavedHistory) as Message[];
            if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
              console.log('Chat history loaded from legacy key', { count: parsedHistory.length });
              // Migrate it to the new key
              localStorage.setItem(storageKey, oldSavedHistory);
              localStorage.removeItem(CHAT_HISTORY_KEY);
              return parsedHistory;
            }
          } catch (err) {
            console.error('Failed to parse legacy chat history', err);
          }
        }
        console.log('No saved chat history found', { botId, key: storageKey });
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
      logger.error('Failed to load chat history', { error: e, botId });
    }
    return null;
  }, [CHAT_HISTORY_KEY, botId]);

  useEffect(() => {
    isMounted.current = true;
    
    // Mobile keyboard handling
    const handleViewportChange = () => {
      if (window.innerWidth <= 700) {
        // On mobile, adjust for keyboard
        const viewHeight = window.visualViewport?.height || window.innerHeight;
        document.documentElement.style.setProperty('--vh', `${viewHeight * 0.01}px`);
      }
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }
    window.addEventListener('resize', handleViewportChange);
    handleViewportChange(); // Initial call
    
    return () => {
      isMounted.current = false;
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    const scriptTag = document.querySelector('script[data-bot-id]');
    const idFromScript = scriptTag?.getAttribute('data-bot-id');
    if (idFromScript) {
      setBotId(idFromScript);
    }
    
    // Set appropriate suggestions based on bot type
    setSuggestions(botId === 'demo' ? DEMO_SUGGESTIONS : SUGGESTIONS);
  }, [botId]);

  // Load widget configuration when botId changes
  useEffect(() => {
    if (botId && botId !== 'demo') {
      fetch(`/api/widget/config/${encodeURIComponent(botId)}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to load config');
        })
        .then((config: WidgetConfig) => {
          setWidgetConfig(config);
        })
        .catch(error => {
          console.warn('Failed to load widget config:', error);
          // Continue with default config
        });
    }
  }, [botId]);

  // Apply custom styling when configuration changes
  useEffect(() => {
    if (widgetConfig && botId && botId !== 'demo') {
      const styleId = `widget-style-${botId}`;
      let existingStyle = document.getElementById(styleId);
      
      if (!existingStyle) {
        existingStyle = document.createElement('style');
        existingStyle.id = styleId;
        document.head.appendChild(existingStyle);
      }

      let customCSS = '';

      // Apply accent color
      if (widgetConfig.accent_color && widgetConfig.accent_color !== '#00D4FF') {
        customCSS += `
          .anemo-card .anemo-card-header { background: ${widgetConfig.accent_color} !important; }
          .anemo-msg.bot .anemo-bubble { background: ${widgetConfig.accent_color} !important; }
          .send-btn { background: ${widgetConfig.accent_color} !important; }
          .send-btn:hover { background: ${widgetConfig.accent_color}dd !important; }
        `;
      }

      // Apply theme-based styling
      if (widgetConfig.chatbot_theme === 'dark') {
        customCSS += `
          .anemo-card { background: #1a1a1a !important; color: #ffffff !important; }
          .anemo-card-body { background: #1a1a1a !important; }
          .anemo-input-container { background: #2d2d2d !important; }
          .anemo-textarea { background: #2d2d2d !important; color: #ffffff !important; }
          .anemo-msg.user .anemo-bubble { background: #333333 !important; color: #ffffff !important; }
        `;
      } else if (widgetConfig.chatbot_theme === 'minimal') {
        customCSS += `
          .anemo-card { box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important; border: 1px solid #e0e0e0 !important; }
          .anemo-card-header { background: #f8f9fa !important; color: #333333 !important; }
          .anemo-msg.bot .anemo-bubble { background: #f1f3f4 !important; color: #333333 !important; }
        `;
      }

      // Apply custom CSS if provided (Ultra tier only)
      if (widgetConfig.tier === 'ultra' && widgetConfig.custom_css) {
        customCSS += widgetConfig.custom_css;
      }

      existingStyle.textContent = customCSS;
    }

    return () => {
      // Cleanup on unmount
      if (botId && botId !== 'demo') {
        const styleId = `widget-style-${botId}`;
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
        }
      }
    };
  }, [widgetConfig, botId]);

  useEffect(() => {
    // This useEffect should run when botId and widgetConfig are ready
    console.log('Loading chat history on mount');
    
    // Only proceed if botId is set and widgetConfig is loaded
    if (!botId) return;
    
    // Check for saved chat history
    const savedHistory = loadChatHistory();
    
    if (savedHistory && savedHistory.length > 0) {
      // Use the saved chat history
      setMessages(savedHistory);
      setSuggestions(null); // Don't show suggestions when restoring chat
      console.log('Successfully restored chat history', { messageCount: savedHistory.length });
      logger.info('Restored chat history', { messageCount: savedHistory.length });
    } else {
      console.log('No valid chat history found, showing welcome message');
      // No saved history, show welcome message
      const seen = botId === 'demo' ? false : localStorage.getItem(INTRO_KEY);
      if (!seen) {
        // Special welcome message for demo bot
        const demoWelcome = botId === 'demo' 
          ? "👋 Hi! I'm TrulyBot's AI Assistant - this is exactly what YOUR customers will experience on your website!\n\nI can show you our pricing plans, help you start a free trial, or demonstrate features like lead capture and instant support.\n\nTry me out - your customers will get this same professional, instant experience 24/7! ⚡"
          : widgetConfig.welcome_message;
          
        // Add demo buttons to welcome message for demo mode
        const demoButtons = botId === 'demo' ? [
          { text: 'Start Free Trial', url: '/start-trial', type: 'primary' as const },
          { text: 'Go to Dashboard', url: '/dashboard', type: 'secondary' as const }
        ] : undefined;
        
        setMessages([{
          id: uid(),
          role: 'bot',
          text: demoWelcome,
          at: Date.now(),
          buttons: demoButtons
        }]);
        
        // Only set localStorage for non-demo bots
        if (botId !== 'demo') {
          localStorage.setItem(INTRO_KEY, '1');
        }
      }
    }
  }, [botId, widgetConfig.welcome_message, loadChatHistory]); // Include necessary dependencies

  // Save messages when they change
  useEffect(() => {
    // Always save messages, even if there's just one welcome message
    saveChatHistory(messages);
    console.log('Messages saved to localStorage:', messages.length);
  }, [messages, saveChatHistory]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // --- Global Keydown Listener for "Type-to-Focus" ---
  useEffect(() => {
    function isTextInputElement(el: Element | null) {
      if (!el || !(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return true;
      return el.isContentEditable;
    }

    function handleGlobalKey(e: KeyboardEvent) {
      const activeEl = document.activeElement;
      if (isTextInputElement(activeEl)) return; // Don't interfere if user is already typing somewhere
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Shift') return; // Ignore shortcuts
      textareaRef.current?.focus();
    }

    window.addEventListener('keydown', handleGlobalKey);
    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
    };
  }, []);

  const handleSubmit = async (prompt: string) => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setInput('');
    setSuggestions(null);

    const userMessage: Message = { id: uid(), role: 'user', text: prompt, at: Date.now() };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);

    // --- Start of changes ---

    // Add a placeholder for the bot's response
    const botMessageId = uid();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: 'bot',
      text: '', // Start with empty text,
      at: Date.now(),
      sources: [],
    };
    setMessages(prev => [...prev, botMessagePlaceholder]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId,
          messages: currentMessages.map(m => ({ role: m.role, content: m.text })),
          stream: true // IMPORTANT: We need to tell the backend we want a stream
        })
      });

      if (!res.ok || !res.body) {
        const errorPayload = await res.json().catch(() => ({ error: 'Server error with no body' }));
        throw new Error(errorPayload.error || 'Server error');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = ''; // Collect the entire response first
      let metadata: any = null;

      // Read all chunks first
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
      }

      // Now process the complete response
      logger.info('Complete response received:', { fullResponse });
      console.log('RAW RESPONSE:', fullResponse);
      console.log('CONTAINS __BUTTONS__:', fullResponse.includes('__BUTTONS__'));

      const buttonMarker = '__BUTTONS__';
      const buttonLegacyMarker = '___BUTTONS___';
      const buttonStart = fullResponse.indexOf(buttonMarker);
      const buttonLegacyStart = fullResponse.indexOf(buttonLegacyMarker);

      let finalText = fullResponse;
      let parsedButtons = null;
      
      // Look for button data in the complete response
      if (buttonStart !== -1) {
        finalText = fullResponse.substring(0, buttonStart).trim();
        const buttonData = fullResponse.substring(buttonStart + buttonMarker.length);
        
        console.log('BUTTON PARSING:', { finalText, buttonData });
        logger.info('Processing button data:', { finalText, buttonData });
        
        try {
          // Parse the button data from JSON string
          parsedButtons = JSON.parse(buttonData.trim());
          metadata = { buttons: parsedButtons };
          console.log('PARSED BUTTONS SUCCESS:', parsedButtons);
          logger.info('Successfully parsed buttons:', { buttons: parsedButtons });
        } catch (e) {
          console.error('BUTTON PARSE ERROR:', e, buttonData);
          logger.error('Failed to parse buttons:', { error: e, buttonData });
          // If parsing fails, just use the text without the button data
        }
      } else if (buttonLegacyStart !== -1) {
        finalText = fullResponse.substring(0, buttonLegacyStart).trim();
        const buttonData = fullResponse.substring(buttonLegacyStart + buttonLegacyMarker.length);
        
        console.log('LEGACY BUTTON PARSING:', { finalText, buttonData });
        logger.info('Processing legacy button data:', { finalText, buttonData });
        
        try {
          // Parse the button data from JSON string for legacy format
          parsedButtons = JSON.parse(buttonData.trim());
          metadata = { buttons: parsedButtons };
          console.log('PARSED LEGACY BUTTONS SUCCESS:', parsedButtons);
          logger.info('Successfully parsed legacy buttons:', { buttons: parsedButtons });
        } catch (e) {
          console.error('LEGACY BUTTON PARSE ERROR:', e, buttonData);
          logger.error('Failed to parse legacy buttons:', { error: e, buttonData });
        }
      } else {
        console.log('NO BUTTONS FOUND IN RESPONSE');
      }
      
      // Check the parsed buttons structure before including it in metadata
      if (parsedButtons) {
        console.log('BUTTON STRUCTURE CHECK:');
        console.log('- Type:', typeof parsedButtons);
        console.log('- Is Array:', Array.isArray(parsedButtons));
        console.log('- Length:', Array.isArray(parsedButtons) ? parsedButtons.length : 'N/A');
        console.log('- Sample Item:', Array.isArray(parsedButtons) && parsedButtons.length > 0 ? parsedButtons[0] : 'None');
      }

      // Update the message with the final text and metadata
      if (isMounted.current) {
        setMessages(prev => prev.map(m =>
          m.id === botMessageId
            ? {
                ...m,
                text: finalText.trim() || '(No reply text returned)',
                sources: metadata?.sources,
                usedDocs: metadata?.usedDocs,
                fallback: metadata?.meta?.fallback,
                // Ensure buttons are properly structured
                buttons: Array.isArray(metadata?.buttons) ? metadata.buttons : undefined,
              }
            : m
        ));
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      logger.error('[widget:callApi:error]', { msg, error: err });
      if (isMounted.current) {
        // Update the placeholder with an error message
        setMessages(prev => prev.map(m =>
          m.id === botMessageId
            ? { ...m, text: msg, error: true }
            : m
        ));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(suggestion);
  };
  
  // Update textarea height as user types (autoresize)
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize the textarea
    const target = e.target;
    target.style.height = 'auto'; // Reset height to calculate scroll height
    target.style.height = target.scrollHeight + 'px';
  };

  // On Shift+Enter, add a new line instead of submitting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid adding new line
      if (input.trim()) {
        handleSubmit(input);
      }
    }
  };

  return (
    <div className="anemo-card-widget">
              <div className="anemo-card-header">
        <div className="anemo-bot-avatar">
          {widgetConfig.chatbot_logo_url ? (
            <Image 
              src={widgetConfig.chatbot_logo_url} 
              alt={`${widgetConfig.chatbot_name} - Lightning-Fast AI Chatbot Assistant`}
              width={24}
              height={24}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => {
                // Fallback to default SVG if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.removeAttribute('style');
              }}
            />
          ) : null}
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 64 64" 
            fill="none"
            aria-label="Chatbot logo"
            style={widgetConfig.chatbot_logo_url ? { display: 'none' } : {}}
          >
            <polygon 
              fill={widgetConfig.accent_color || "#00D4FF"}
              points="40,1 17,37 31,37 24,63 50,27 36,27"
            />
          </svg>
        </div>
        <div className="anemo-bot-titlebox">
          <div className="anemo-bot-title">{widgetConfig.chatbot_name}</div>
          <div className="anemo-bot-desc">{botId === 'demo' ? 'Demo' : 'AI'}</div>
        </div>
        <div className="anemo-card-header-actions">
          {/* Clear history button - always show it */}
          <button 
            className="anemo-clear-history-btn" 
            onClick={() => {
              console.log('Clearing chat history');
              // Clear the saved chat history using bot-specific key
              const storageKey = `${CHAT_HISTORY_KEY}_${botId}`;
              localStorage.removeItem(storageKey);
              
              // Also clear the legacy key for good measure
              localStorage.removeItem(CHAT_HISTORY_KEY);
              
              // Reset to welcome message
              const demoWelcome = botId === 'demo' 
                ? "👋 Hi! I'm TrulyBot's AI Assistant - this is exactly what YOUR customers will experience on your website!\n\nI can show you our pricing plans, help you start a free trial, or demonstrate features like lead capture and instant support.\n\nTry me out - your customers will get this same professional, instant experience 24/7! ⚡"
                : widgetConfig.welcome_message;
              
              const demoButtons = botId === 'demo' ? [
                { text: 'Start Free Trial', url: '/start-trial', type: 'primary' as const },
                { text: 'Go to Dashboard', url: '/dashboard', type: 'secondary' as const }
              ] : undefined;
              
              setMessages([{
                id: uid(),
                role: 'bot',
                text: demoWelcome,
                at: Date.now(),
                buttons: demoButtons
              }]);
              
              // Reset suggestions
              setSuggestions(botId === 'demo' ? DEMO_SUGGESTIONS : SUGGESTIONS);
              
              // Provide visual feedback
              alert('Chat history cleared!');
            }}
            aria-label="Delete all conversation history"
            title="Delete all conversation history"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
          {onClose && (
            <button className="anemo-card-header-close" onClick={onClose} aria-label="Close chat">×</button>
          )}
        </div>
      </div>
      <div className="anemo-card-body">
        <div className="anemo-messages" ref={listRef}>
          {messages.map(m => (
            <div key={m.id} className={`anemo-msg ${m.role}`}>
              <div className={`anemo-bubble ${m.role} ${m.error ? 'error' : ''}`}>
                <div className="bubble-text">{m.text}</div>
                {m.sources && m.sources.length > 0 && (
                  <div className="anemo-sources">
                    <div className="sources-label">Answer sourced from your documents:</div>
                    <div className="sources-chips">
                      {m.sources.map(s => (
                        <div key={s.docId} className="source-chip" title={s.snippet}>
                          <span className="source-dot" />
                          {s.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {m.usedDocs === false && m.fallback && !m.error && botId !== 'demo' && (
                  <div className="anemo-fallback-note">
                    No direct document match. Provided a general answer.
                  </div>
                )}
                {/* Check if text contains a button marker (for debugging only) */}
                {m.text && (m.text.includes('__BUTTONS__') || m.text.includes('___BUTTONS___')) ? (
                  <div className="anemo-error-note">
                    Error: Button data is showing as text. Please contact support.
                  </div>
                ) : null}
                
                {/* Proper button rendering */}
                {m.buttons && Array.isArray(m.buttons) && m.buttons.length > 0 && (
                  <div className="anemo-buttons">
                    {m.buttons.map((button, btnIndex) => {
                      // Handle null or undefined button
                      if (!button) return null;
                      
                      // For string buttons (legacy format)
                      if (typeof button === 'string') {
                        try {
                          button = JSON.parse(button);
                        } catch (e) {
                          return null;
                        }
                      }
                      
                      // Ensure button is properly structured
                      if (typeof button !== 'object') return null;
                      
                      const buttonText = typeof button.text === 'string' ? button.text : 'Click here';
                      const buttonUrl = typeof button.url === 'string' ? button.url : '#';
                      const buttonType = typeof button.type === 'string' ? button.type : 'secondary';
                      
                      return (
                        <a
                          key={btnIndex}
                          href={buttonUrl}
                          target={buttonUrl.startsWith('http') ? '_blank' : '_self'}
                          rel={buttonUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className={`anemo-button ${buttonType}`}
                        >
                          {buttonText}
                        </a>
                      );
                    })}
                  </div>
                )}
                <div className="bubble-time">
                  {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="anemo-msg bot">
              <div className="anemo-bubble bot typing">
                <div className="typing-dots"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}
        </div>
        {suggestions && !messages.find(m => m.role === 'user') && (
          <div className="anemo-suggestions">
            {suggestions.map(s => (
              <button key={s} className="suggestion-btn" onClick={() => handleSuggestionClick(s)} disabled={isLoading}>
                {s}
              </button>
            ))}
          </div>
        )}
        <form className="anemo-composer" onSubmit={handleFormSubmit}>
          <div className="composer-inner">
            <textarea
              ref={textareaRef}
              className="anemo-textarea"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              disabled={isLoading}
              aria-label="Chat message input"
            />
            <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
        <div className="anemo-poweredby">
          Powered by <a href={BRAND.url} target="_blank" rel="noopener noreferrer">{BRAND.url.replace(/^https?:\/\//, '')}</a>
        </div>
      </div>
      <style jsx global>{`
        /* All of your original CSS is preserved here */
        .anemo-card-widget { height: 100%; width: 100%; display: flex; flex-direction: column; background: #23272f; }
        .anemo-card-header { background: #23272f; display: flex; align-items: center; padding: 18px 18px 10px 18px; border-radius: 16px 16px 0 0; position: relative; min-height: 54px; border-bottom: 1px solid #282c34; }
        .anemo-bot-avatar { width: 38px; height: 38px; background: #2563eb1a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-right: 10px; }
        .anemo-bot-titlebox { flex: 1; display: flex; align-items: center; gap: 7px; }
        .anemo-bot-title { color: #fff; font-weight: 700; font-size: 1.16rem; letter-spacing: 0.01em; }
        .anemo-bot-desc { color: #fff; background: #2563eb; font-size: 0.81rem; font-weight: 600; padding: 2px 9px; border-radius: 8px; margin-left: 5px; letter-spacing: 0.01em; }
        .anemo-card-header-actions { display: flex; align-items: center; gap: 2px; /* Reduced spacing between buttons */ }
        .anemo-clear-history-btn { background: transparent; border: none; color: #a5aebf; cursor: pointer; line-height: 1; padding: 0; border-radius: 50%; width: 30px; height: 30px; transition: background 0.16s; display: flex; align-items: center; justify-content: center; }
        .anemo-clear-history-btn:hover { background: #292f35; color: #fff; }
        .anemo-card-header-close { background: transparent; border: none; color: #a5aebf; font-size: 1.6rem; cursor: pointer; line-height: 1; padding: 0; border-radius: 50%; width: 30px; height: 30px; transition: background 0.16s; }
        .anemo-card-header-close:hover { background: #292f35; color: #fff; }
        .anemo-card-body { display: flex; flex-direction: column; flex: 1; min-height: 0; background: #23272f; position: relative; }
        .anemo-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding: 22px 14px 14px 14px; background: #23272f; scroll-behavior: smooth; overscroll-behavior: contain; scrollbar-width: none; -ms-overflow-style: none; }
        .anemo-messages::-webkit-scrollbar { display: none; }
        .anemo-msg { display: flex; width: 100%; }
        .anemo-msg.user { justify-content: flex-end; }
        .anemo-msg.bot { justify-content: flex-start; }
        .anemo-bubble { max-width: 76%; border-radius: 16px; background: #282c34; color: #fff; font-size: 1rem; box-shadow: 0 1px 4px #0002; position: relative; overflow-wrap: break-word; word-break: break-word; padding: 14px 18px; animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .anemo-bubble.user { background: #2563eb; color: #fff; border-bottom-right-radius: 6px; }
        .anemo-bubble.bot { background: #282c34; color: #fff; border-bottom-left-radius: 6px; }
        .anemo-bubble.error { background: #6e1b1b; color: #fff; }
        .bubble-text { font-size: 1.06rem; line-height: 1.65; white-space: pre-wrap; margin-bottom: 4px; }
        .bubble-time { font-size: 0.8rem; opacity: 0.6; text-align: right; margin-top: 2px; }
        .typing-dots { display: flex; gap: 4px; align-items: center; height: 12px; }
        .typing-dots span { width: 6px; height: 6px; border-radius: 50%; background: #7d8590; animation: bounce 1.2s infinite; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        .anemo-suggestions { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 16px 10px 16px; justify-content: center; background: #23272f; border-top: 1px solid #282c34; }
        .suggestion-btn { background: #282c34; color: #a5aebf; border: 1px solid #23272f; border-radius: 15px; padding: 8px 16px; font-size: 0.9em; cursor: pointer; transition: all 0.2s; }
        .suggestion-btn:hover { background: #2563eb; color: #fff; border-color: #2563eb; }
        .anemo-composer { background: #23272f; border-top: 1px solid #282c34; position: relative; z-index: 10; }
        @media (max-width: 700px) {
          .anemo-composer {
            position: sticky;
            bottom: 0;
            background: #23272f;
            padding-bottom: max(env(safe-area-inset-bottom), 8px);
          }
          .anemo-chatbox {
            height: calc(var(--vh, 1vh) * 100) !important;
            max-height: calc(var(--vh, 1vh) * 100) !important;
          }
        }
        .composer-inner { display: flex; align-items: flex-end; gap: 12px; background: #282c34; border-radius: 24px; border: 1px solid #23272f; padding: 8px 8px 8px 20px; margin: 10px 8px 8px 8px; transition: border-color 0.2s; }
        .composer-inner:focus-within { border-color: #23272f; }
        .composer-inner textarea { flex: 1; background: transparent; border: none; color: #fff; font-size: 1rem; font-family: inherit; padding: 8px 0; min-height: 24px; max-height: 100px; resize: none; outline: none; }
        @media (max-width: 700px) {
          .composer-inner textarea {
            font-size: 16px; /* Prevents zoom on iOS */
            max-height: 80px;
          }
        }
        .composer-inner textarea::placeholder { color: #a5aebf; }
        .send-btn { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #2563eb; color: white; border: none; cursor: pointer; flex-shrink: 0; transition: all 0.2s; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .send-btn:not(:disabled):hover { background: #1744ad; transform: scale(1.05); }
        @media (min-width: 1024px) {
          /* Desktop: Larger container only, keep text/buttons original size */
          .anemo-messages { padding: 26px 18px 18px 18px; }
          .composer-inner { margin: 12px 10px 10px 10px; }
          .anemo-card-header { padding: 20px 20px 12px 20px; }
        }
        .anemo-poweredby { font-size: 0.93rem; color: #a5aebf; text-align: center; padding: 14px 0 7px 0; background: #23272f; letter-spacing: 0.02em; }
        .anemo-poweredby a { color: #2563eb; text-decoration: none; font-weight: 600; }
        .anemo-sources { margin-top: 10px; background: #23272f; border: 1px solid #2f353d; border-radius: 10px; padding: 8px 10px 10px 10px; }
        .anemo-sources .sources-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: #8b95a4; margin-bottom: 6px; font-weight: 600; }
        .anemo-sources .sources-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .anemo-sources .source-chip { background: #282c34; border: 1px solid #2563eb55; color: #d4d9e1; font-size: 0.68rem; padding: 4px 9px 4px 7px; border-radius: 14px; display: inline-flex; align-items: center; gap: 6px; cursor: help; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: background 0.18s, border-color 0.18s; }
        .anemo-sources .source-chip:hover { background: #2563eb22; border-color: #2563ebaa; }
        .anemo-sources .source-dot { width: 6px; height: 6px; border-radius: 50%; background: #2563eb; box-shadow: 0 0 0 2px #2563eb22; flex-shrink: 0; }
        .anemo-fallback-note { margin-top: 8px; font-size: 0.7rem; color: #9aa3b1; background: #23272f; padding: 6px 8px; border-radius: 8px; border: 1px solid #2d333b; }
        .anemo-buttons { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
        .anemo-button { display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; }
        .anemo-button.primary { background: #2563eb; color: #fff; border: 1px solid #2563eb; }
        .anemo-button.primary:hover { background: #1d4ed8; border-color: #1d4ed8; transform: translateY(-1px); }
        .anemo-button.secondary { background: #374151; color: #d1d5db; border: 1px solid #4b5563; }
        .anemo-button.secondary:hover { background: #4b5563; color: #fff; }
      `}</style>
    </div>
  );
}