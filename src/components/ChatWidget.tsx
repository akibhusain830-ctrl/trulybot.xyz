'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';

type Role = 'bot' | 'user';
type Message = { id: string; role: Role; text: string; at: number; error?: boolean };

const STORAGE_KEY = 'anemo_conv_ui_final_v3';
const INTRO_KEY = 'anemo_seen_intro_ui_final_v3';
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
  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Dynamically adjust textarea height
    if (textareaRef.current) {
      const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      };
      textareaRef.current.addEventListener('input', adjustHeight);
      window.addEventListener('resize', adjustHeight);
      return () => {
        textareaRef.current?.removeEventListener('input', adjustHeight);
        window.removeEventListener('resize', adjustHeight);
      };
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
      push('bot', "Hi — I'm Anemo, your support assistant. Ask about setup, pricing, or embedding.");
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
        !['INPUT', 'TEXTAREA'].includes(target.tagName) &&
        e.key.length === 1
      ) {
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyPress);
    };
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
      } catch (err: unknown) {
        const isAbort = (err as Error)?.name === 'AbortError';
        const msg = isAbort
          ? 'Request timed out. Try again.'
          : (err as Error)?.message || 'Network error';
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
      push(
        'bot',
        "Hi — I'm Anemo, your support assistant. Ask about setup, pricing, or embedding."
      );
      localStorage.setItem(INTRO_KEY, '1');
      setSuggestions(SUGGESTIONS);
    }, 100);
  }, [push]);

  return (
    <div className="anemo-chat-root">
      {!isMobile && (
        <div className="sidebar">
          <button className="sidebar-item active">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          </button>
        </div>
      )}
      <div className="main-container">
        <div className="card">
          <header className="head">
            <div>
              <div className="brand">Anemo</div>
              <div className="sub">Smart assistant</div>
            </div>
            <button
              className="mini ghost"
              onClick={clearConversation}
              title="Clear conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </header>
          <div
            className="body"
            ref={listRef}
          >
            {messages.map((m) => (
              <div key={m.id} className={`row ${m.role}`}>
                <div className={`bubble ${m.role} ${m.error ? 'err' : ''}`}>
                  <div className="text">{m.text}</div>
                  <div className="meta">{new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="row bot">
                <div className="bubble bot typing">
                  <div className="dots"><span /><span /><span /></div>
                </div>
              </div>
            )}
          </div>
          {suggestions && !messages.find(m => m.role === 'user') && (
            <div className="sugs">
              {suggestions.map((s) => (
                <button key={s} className="chip" onClick={() => submit(s)} disabled={loading}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <form 
            className="composer" 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (!loading) submit(); 
            }}
          >
            <div className="composer-inner">
              <textarea 
                ref={textareaRef} 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={handleKey} 
                placeholder="Ask anything..." 
                rows={1} 
                disabled={loading} 
              />
              <button 
                type="submit" 
                className="send" 
                disabled={loading || !input.trim()} 
                title="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }

        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background: #111;
        }

        .anemo-chat-root {
          --bg-color: #000;
          --card-bg: #111;
          --border-color: #30363d;
          --text-primary: #e6edf3;
          --text-secondary: #7d8590;
          --accent-color: #2563eb;
          --bot-bubble-bg: #1c1c1c;
          --user-bubble-bg: #2563eb;
          --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

          display: flex;
          height: 100dvh;
          width: 100vw;
          color: var(--text-primary);
          font-family: var(--font-family);
          background: var(--bg-color);
        }
        .sidebar {
          width: 60px;
          height: 100dvh;
          background: #0a0a0a;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 20px;
          flex-shrink: 0;
        }
        .sidebar-item {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          margin-bottom: 8px;
          cursor: pointer;
        }
        .sidebar-item.active {
          background: rgba(255,255,255,0.1);
          color: var(--text-primary);
        }
        .main-container {
          flex: 1;
          display: flex;
          justify-content: center;
          height: 100dvh;
          width: 100vw;
          overflow: hidden;
        }
        .card {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          width: 100vw;
          max-width: 800px;
          background: var(--card-bg);
          overflow: hidden;
          margin: 0;
        }
        .head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .brand {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .sub {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100vw;
        }
        .body::-webkit-scrollbar { width: 6px; height: 6px; }
        .body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 6px;
        }
        .row {
          display: flex;
          padding: 0;
          animation: fadeIn 0.3s ease-out forwards;
          margin-bottom: 4px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .row.user { justify-content: flex-end; }
        .row.bot { justify-content: flex-start; }
        .bubble {
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 100vw;
          width: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          word-break: break-word;
        }
        .row.user .bubble {
          background: var(--user-bubble-bg);
          color: white;
          border-bottom-right-radius: 4px;
          margin-right: 0;
        }
        .row.bot .bubble {
          background: var(--bot-bubble-bg);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
          margin-left: 0;
        }
        .bubble .text {
          font-size: 1rem;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        .bubble .meta {
          font-size: 0.75rem;
          opacity: 0.7;
          align-self: flex-end;
        }
        .bubble.typing { padding: 12px; }
        .bubble.typing .dots {
          display: flex;
          gap: 4px;
          align-items: center;
          height: 12px;
        }
        .bubble.typing .dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-secondary);
          animation: bounce 1.2s infinite;
        }
        .bubble.typing .dots span:nth-child(2) { animation-delay: 0.2s; }
        .bubble.typing .dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .sugs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 8px 16px 8px;
          justify-content: center;
        }
        .chip {
          background: var(--bot-bubble-bg);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chip:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--text-secondary);
          color: var(--text-primary);
        }
        .composer {
          width: 100vw;
          padding: 12px 0 24px 0;
          border-top: 1px solid var(--border-color);
          background: var(--card-bg);
          position: relative;
          z-index: 2;
        }
        .composer-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bot-bubble-bg);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 6px 6px 6px 16px;
          transition: border-color 0.2s;
        }
        .composer-inner:focus-within { border-color: var(--accent-color); }
        .composer textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          font-family: inherit;
          padding: 8px 0;
          min-height: 24px;
          max-height: 120px;
          resize: none;
          outline: none;
        }
        .composer .send {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color);
          color: white;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .composer .send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .composer .send:not(:disabled):hover { transform: scale(1.05); }
        button.ghost {
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        button.ghost:hover {
          background: rgba(255,255,255,0.1);
          color: var(--text-primary);
        }

        /* DESKTOP: always add extra safe bottom padding */
        @media (min-width: 769px) {
          .composer {
            padding-bottom: max(24px, env(safe-area-inset-bottom, 0));
          }
        }

        /* MOBILE: zero gap, full edge, sticky composer */
        @media (max-width: 768px) {
          .anemo-chat-root, .main-container, .card, .body, .row, .composer {
            width: 100vw !important;
            min-width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            left: 0 !important;
            right: 0 !important;
          }
          .anemo-chat-root, .main-container, .card {
            height: 100dvh !important;
            min-height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
          }
          .sidebar { display: none !important; }
          .body {
            padding: 0 !important;
            gap: 12px !important;
            width: 100vw;
          }
          .row {
            padding: 0 !important;
            margin: 0 !important;
          }
          .bubble {
            max-width: 100vw !important;
            width: 100vw !important;
            border-radius: 18px !important;
            margin: 0 !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .row.user .bubble, .row.bot .bubble {
            margin: 0 !important;
          }
          .sugs {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          .composer {
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 1000 !important;
            width: 100vw !important;
            padding-left: env(safe-area-inset-left,0);
            padding-right: env(safe-area-inset-right,0);
            padding-bottom: max(16px, env(safe-area-inset-bottom,0));
            border-radius: 0 !important;
            background: var(--card-bg) !important;
            border-top: 1px solid var(--border-color);
          }
          .head {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
