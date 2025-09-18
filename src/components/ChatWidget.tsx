'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

type Role = 'bot' | 'user';
type Message = { id: string; role: Role; text: string; at: number; error?: boolean };

const STORAGE_KEY = 'anemo_v4_conv';
const INTRO_KEY = 'anemo_v4_seen_intro';
const SUGGESTIONS = [
  'How do I embed Anemo on my site?',
  'What plans do you offer?',
  'Can you answer product FAQs?'
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(SUGGESTIONS);
  const [isMobile, setIsMobile] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      const adjustHeight = () => {
        textareaRef.current!.style.height = 'auto';
        textareaRef.current!.style.height = `${textareaRef.current!.scrollHeight}px`;
      };
      textareaRef.current.addEventListener('input', adjustHeight);
      return () => textareaRef.current?.removeEventListener('input', adjustHeight);
    }
  }, []);

  const push = useCallback((role: Role, text: string, opts?: { error?: boolean }) => {
    setMessages((m) => [...m, { id: uid(), role, text, at: Date.now(), error: opts?.error }]);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (messages.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-80)));
      }
    } catch {}
  }, [messages]);

  useEffect(() => {
    const seen = localStorage.getItem(INTRO_KEY);
    if (!seen && messages.length === 0) {
      push('bot', "Hi — I'm Anemo, your support assistant. 🌬️\nAsk about setup, pricing, or embedding.");
      localStorage.setItem(INTRO_KEY, '1');
    }
  }, [messages.length, push]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: messages.length > 0 ? 'smooth' : 'auto'
      });
    }
  }, [messages, typing]);

  useEffect(() => {
    textareaRef.current?.focus();
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        document.activeElement !== textareaRef.current &&
        !['INPUT', 'TEXTAREA'].includes(target?.tagName) &&
        e.key.length === 1
      ) {
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, []);

  const callApi = useCallback(
    async (prompt: string) => {
      setLoading(true);
      setTyping(true);
      const messageHistory = [
        ...messages,
        { role: 'user', text: prompt, id: 'temp', at: Date.now() },
      ].slice(-8);

      try {
        const res = await fetchWithTimeout(
          '/api/chat',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messageHistory }),
          },
          12000
        );
        if (!res) throw new Error('No response');
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.error) {
          const msg = json?.error || `Server error ${res.status}`;
          push('bot', msg, { error: true });
          return;
        }
        const reply = json?.reply?.toString().trim();
        if (!reply) {
          push('bot', 'Assistant returned no content', { error: true });
          return;
        }
        push('bot', reply);
      } catch (err) {
        const isAbort = (err as Error)?.name === 'AbortError';
        const msg = isAbort ? 'Request timed out. Try again.' : (err as Error)?.message || 'Network error';
        push('bot', msg, { error: true });
      } finally {
        setLoading(false);
        setTyping(false);
        textareaRef.current?.focus();
      }
    },
    [messages, push]
  );

  const submit = useCallback(
    (raw?: string) => {
      const prompt = (raw ?? input).trim();
      if (!prompt) return;
      push('user', prompt);
      setInput('');
      if (suggestions) setSuggestions(null);
      callApi(prompt);
    },
    [input, suggestions, callApi, push]
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!loading) submit();
      }
    },
    [loading, submit]
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(INTRO_KEY);
    setTimeout(() => {
      push('bot', "Hi — I'm Anemo, your support assistant. 🌬️\nAsk about setup, pricing, or embedding.");
      localStorage.setItem(INTRO_KEY, '1');
      setSuggestions(SUGGESTIONS);
    }, 100);
  }, [push]);

  return (
    <>
      <div className="anemo-chat-widget">
        <div className="anemo-header">
          <div className="anemo-brand">
            <span className="anemo-logo">🌀</span>
            <span className="anemo-title">Anemo</span>
            <span className="anemo-badge">AI</span>
          </div>
          <button className="anemo-clear-btn" onClick={clearConversation} title="Clear conversation">
            <svg width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>

        <main className="anemo-messages" ref={listRef}>
          {messages.map((m) => (
            <div key={m.id} className={`anemo-msg ${m.role}`}>
              <div className={`anemo-bubble ${m.role} ${m.error ? 'error' : ''}`}>
                <div className="bubble-text">{m.text}</div>
                <div className="bubble-time">
                  {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="anemo-msg bot">
              <div className="anemo-bubble bot typing">
                <div className="typing-dots"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}
        </main>

        {suggestions && !messages.find(m => m.role === 'user') && (
          <div className="anemo-suggestions">
            {suggestions.map((s) => (
              <button key={s} className="suggestion-btn" onClick={() => submit(s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>
        )}

        <form className="anemo-composer" onSubmit={(e) => { e.preventDefault(); if (!loading) submit(); }}>
          <div className="composer-inner">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message Anemo..."
              rows={1}
              disabled={loading}
            />
            <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; }
        
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segui UI', Roboto, sans-serif;
          background: #0f1117;
          color: #e6edf3;
          overflow: hidden;
        }

        .anemo-chat-widget {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          width: 100%;
          background: #1a1d23;
          position: relative;
        }

        /* DESKTOP STYLES */
        @media (min-width: 769px) {
          .anemo-chat-widget {
            max-width: 480px;
            height: 90dvh;
            max-height: 700px;
            min-height: 420px;
            border-radius: 18px;
            box-shadow: 0 4px 32px 0 #0007;
            border: 1.5px solid #23272f;
            margin: auto;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        /* MOBILE STYLES - FULL LAYOUT */
        @media (max-width: 768px) {
          html, body { 
            overflow: hidden;
          }
          
          .anemo-chat-widget {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100dvh;
            border-radius: 0;
            border: none;
            box-shadow: none;
            margin: 0;
            transform: none;
          }
        }

        .anemo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px 12px 22px;
          border-bottom: 1px solid #23272f;
          background: #1a1d23;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .anemo-header {
            padding: max(12px, env(safe-area-inset-top)) 16px 12px 16px;
          }
        }

        .anemo-brand {
          display: flex;
          align-items: center;
          gap: 0.6em;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .anemo-logo { font-size: 1.5em; }
        .anemo-title { letter-spacing: 0.03em; }
        .anemo-badge {
          background: #2563eb;
          color: #fff;
          font-size: 0.8em;
          border-radius: 7px;
          padding: 0 0.4em;
          margin-left: 0.3em;
          font-weight: 700;
        }

        .anemo-clear-btn {
          background: none;
          border: none;
          color: #7d8590;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.15s;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .anemo-clear-btn:hover {
          background: #21232a;
          color: #2563eb;
        }

        .anemo-messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px 12px 16px 12px;
          background: #1a1d23;
          scroll-behavior: smooth;
          overscroll-behavior: contain;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .anemo-messages::-webkit-scrollbar { display: none; }

        @media (max-width: 768px) {
          .anemo-messages {
            padding: 16px 12px 120px 12px;
            gap: 16px;
          }
        }

        .anemo-msg {
          display: flex;
          width: 100%;
        }

        .anemo-msg.user { justify-content: flex-end; }
        .anemo-msg.bot { justify-content: flex-start; }

        .anemo-bubble {
          max-width: 78%;
          border-radius: 18px;
          background: #22242a;
          color: #e6edf3;
          font-size: 1rem;
          box-shadow: 0 1px 4px #0002;
          position: relative;
          overflow-wrap: break-word;
          word-break: break-word;
          padding: 12px 16px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .anemo-bubble.user {
          background: #2563eb;
          color: #fff;
          border-bottom-right-radius: 6px;
        }

        .anemo-bubble.bot {
          background: #22242a;
          color: #e6edf3;
          border-bottom-left-radius: 6px;
        }

        .anemo-bubble.error {
          background: #6e1b1b;
          color: #fff;
        }

        @media (max-width: 768px) {
          .anemo-bubble {
            max-width: 85%;
            font-size: 1.05rem;
            padding: 14px 16px;
          }
        }

        .bubble-text {
          font-size: 1.04rem;
          line-height: 1.65;
          white-space: pre-wrap;
          margin-bottom: 4px;
        }

        .bubble-time {
          font-size: 0.8rem;
          opacity: 0.6;
          text-align: right;
          margin-top: 2px;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
          align-items: center;
          height: 12px;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #7d8590;
          animation: bounce 1.2s infinite;
        }

        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }

        .anemo-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px 16px 10px 16px;
          justify-content: center;
          background: #1a1d23;
          border-top: 1px solid #23272f;
        }

        .suggestion-btn {
          background: #23263e;
          color: #7d8590;
          border: 1px solid #23272f;
          border-radius: 15px;
          padding: 8px 16px;
          font-size: 0.9em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-btn:hover {
          background: #2563eb;
          color: #fff;
          border-color: #2563eb;
        }

        .anemo-composer {
          background: #1a1d23;
          border-top: 1px solid #23272f;
          position: relative;
          z-index: 10;
          flex-shrink: 0;
        }

        @media (min-width: 769px) {
          .anemo-composer {
            padding: 0 16px 20px 16px;
          }
        }

        @media (max-width: 768px) {
          .anemo-composer {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 16px 16px calc(max(320px, 40vh) + env(safe-area-inset-bottom)) 16px;
            background: #1a1d23;
            border-top: 1px solid #23272f;
          }
        }

        .composer-inner {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          background: #181a21;
          border-radius: 24px;
          border: 1px solid #23272f;
          padding: 8px 8px 8px 20px;
          transition: border-color 0.2s;
        }

        .composer-inner:focus-within {
          border-color: #2563eb;
        }

        .composer-inner textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: #e6edf3;
          font-size: 1rem;
          font-family: inherit;
          padding: 8px 0;
          min-height: 24px;
          max-height: 100px;
          resize: none;
          outline: none;
        }

        .composer-inner textarea::placeholder {
          color: #7d8590;
        }

        .send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #2563eb;
          color: white;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn:not(:disabled):hover {
          background: #1744ad;
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
}
