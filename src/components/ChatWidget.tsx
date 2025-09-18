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
  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      const adjustHeight = () => {
        textareaRef.current!.style.height = 'auto';
        textareaRef.current!.style.height = `${textareaRef.current!.scrollHeight}px`;
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
        !['INPUT', 'TEXTAREA'].includes(target.tagName) &&
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
        "Hi — I'm Anemo, your support assistant. 🌬️\nAsk about setup, pricing, or embedding."
      );
      localStorage.setItem(INTRO_KEY, '1');
      setSuggestions(SUGGESTIONS);
    }, 100);
  }, [push]);

  return (
    <div className="anemo-v4-root">
      <div className="anemo-v4-chat-container">
        <header className="anemo-v4-header">
          <div className="anemo-v4-brand">
            <span className="anemo-logo">🌀</span>
            <span className="anemo-title">Anemo</span>
            <span className="anemo-badge">AI</span>
          </div>
          <div className="anemo-v4-header-actions">
            <button className="anemo-v4-clear-btn" onClick={clearConversation} title="Clear conversation">
              <svg width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </header>
        <main className="anemo-v4-messages" ref={listRef}>
          {messages.map((m) => (
            <div key={m.id} className={`anemo-v4-msg-row ${m.role}`}>
              <div className={`anemo-v4-bubble ${m.role} ${m.error ? 'err' : ''}`}>
                <div className="bubble-inner">
                  <div className="bubble-text">{m.text}</div>
                  <div className="bubble-meta">{new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="anemo-v4-msg-row bot">
              <div className="anemo-v4-bubble bot typing">
                <div className="bubble-inner">
                  <div className="bubble-dots"><span /><span /><span /></div>
                </div>
              </div>
            </div>
          )}
        </main>
        {suggestions && !messages.find(m => m.role === 'user') && (
          <div className="anemo-v4-suggestions">
            {suggestions.map((s) => (
              <button key={s} className="anemo-v4-suggestion" onClick={() => submit(s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>
        )}
        <form 
          className="anemo-v4-composer" 
          onSubmit={e => { e.preventDefault(); if (!loading) submit(); }}
        >
          <div className="anemo-v4-composer-inner">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message Anemo..."
              rows={1}
              disabled={loading}
              aria-label="Chat input"
            />
            <button
              type="submit"
              className="anemo-v4-send"
              disabled={loading || !input.trim()}
              title="Send message"
              aria-label="Send"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`
        :root {
          --anemo-accent: #2563eb;
          --anemo-bg: #0f1117;
          --anemo-surface: #1a1d23;
          --anemo-bubble-user: var(--anemo-accent);
          --anemo-bubble-bot: #22242a;
          --anemo-border: #23272f;
          --anemo-gray: #7d8590;
          --anemo-text: #e6edf3;
          --anemo-radius: 18px;
        }
        html, body {
          background: var(--anemo-bg);
          color: var(--anemo-text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        .anemo-v4-root {
          min-height: 100dvh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--anemo-bg);
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }
        .anemo-v4-chat-container {
          background: var(--anemo-surface);
          border-radius: 18px;
          box-shadow: 0 4px 32px 0 #0007;
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 480px;
          height: 90dvh;
          min-height: 420px;
          max-height: 700px;
          overflow: hidden;
          border: 1.5px solid var(--anemo-border);
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .anemo-v4-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px 12px 22px;
          border-bottom: 1px solid var(--anemo-border);
          background: var(--anemo-surface);
          z-index: 1;
        }
        .anemo-v4-brand {
          display: flex;
          align-items: center;
          gap: 0.6em;
          font-weight: 600;
          font-size: 1.2rem;
        }
        .anemo-logo {
          font-size: 1.5em;
        }
        .anemo-title {
          letter-spacing: 0.03em;
        }
        .anemo-badge {
          background: var(--anemo-accent);
          color: #fff;
          font-size: 0.8em;
          border-radius: 7px;
          padding: 0 0.4em;
          margin-left: 0.3em;
          font-weight: 700;
        }
        .anemo-v4-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .anemo-v4-clear-btn {
          background: none;
          border: none;
          color: var(--anemo-gray);
          cursor: pointer;
          border-radius: 50%;
          transition: background 0.15s;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .anemo-v4-clear-btn:hover {
          background: #21232a;
          color: var(--anemo-accent);
        }
        .anemo-v4-messages {
          flex: 1 1 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 22px 12px 16px 12px;
          background: var(--anemo-surface);
          scroll-behavior: smooth;
        }
        .anemo-v4-msg-row {
          display: flex;
          width: 100%;
        }
        .anemo-v4-msg-row.user { justify-content: flex-end; }
        .anemo-v4-msg-row.bot { justify-content: flex-start; }
        .anemo-v4-bubble {
          max-width: 78%;
          border-radius: var(--anemo-radius);
          padding: 0;
          background: var(--anemo-bubble-bot);
          color: var(--anemo-text);
          font-size: 1rem;
          margin-bottom: 2px;
          box-shadow: 0 1px 4px #0002;
          position: relative;
          overflow-wrap: break-word;
          word-break: break-word;
          transition: background 0.2s;
        }
        .anemo-v4-bubble.user {
          background: var(--anemo-bubble-user);
          color: #fff;
          border-bottom-right-radius: 6px;
          margin-left: auto;
        }
        .anemo-v4-bubble.bot {
          background: var(--anemo-bubble-bot);
          color: var(--anemo-text);
          border-bottom-left-radius: 6px;
          margin-right: auto;
        }
        .anemo-v4-bubble.err {
          background: #6e1b1b;
          color: #fff;
        }
        .bubble-inner {
          padding: 13px 16px 9px 16px;
          display: flex;
          flex-direction: column;
        }
        .bubble-text {
          font-size: 1.04rem;
          line-height: 1.65;
          white-space: pre-wrap;
        }
        .bubble-meta {
          font-size: 0.81rem;
          opacity: 0.62;
          align-self: flex-end;
          margin-top: 2px;
        }
        .bubble-dots {
          display: flex;
          gap: 4px;
          align-items: center;
          height: 14px;
        }
        .bubble-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--anemo-gray);
          display: inline-block;
          animation: anemo-bounce 1s infinite;
        }
        .bubble-dots span:nth-child(2) { animation-delay: 0.18s; }
        .bubble-dots span:nth-child(3) { animation-delay: 0.36s; }
        @keyframes anemo-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-7px); }
        }
        .anemo-v4-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          padding: 8px 16px 10px 16px;
          justify-content: center;
          background: var(--anemo-surface);
          border-top: 1px solid var(--anemo-border);
        }
        .anemo-v4-suggestion {
          background: #23263e;
          color: var(--anemo-gray);
          border: 0;
          border-radius: 15px;
          padding: 7px 15px;
          font-size: 0.97em;
          cursor: pointer;
          transition: background 0.13s, color 0.13s;
        }
        .anemo-v4-suggestion:hover, .anemo-v4-suggestion:focus {
          background: var(--anemo-accent);
          color: #fff;
        }
        .anemo-v4-composer {
          padding: 0 16px 20px 16px;
          background: var(--anemo-surface);
          border-top: 1.5px solid var(--anemo-border);
          position: relative;
          z-index: 2;
        }
        .anemo-v4-composer-inner {
          display: flex;
          align-items: flex-end;
          gap: 11px;
          background: #181a21;
          border-radius: 19px;
          border: 1.5px solid var(--anemo-border);
          padding: 7px 9px 7px 20px;
          transition: border-color 0.21s;
        }
        .anemo-v4-composer-inner:focus-within {
          border-color: var(--anemo-accent);
        }
        .anemo-v4-composer textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--anemo-text);
          font-size: 1.09rem;
          font-family: inherit;
          padding: 7px 0;
          min-height: 28px;
          max-height: 110px;
          resize: none;
          outline: none;
        }
        .anemo-v4-send {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--anemo-accent);
          color: white;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.13s, transform 0.15s;
        }
        .anemo-v4-send:disabled {
          opacity: 0.53;
          cursor: not-allowed;
        }
        .anemo-v4-send:not(:disabled):hover {
          background: #1744ad;
          transform: scale(1.07);
        }

        /* MOBILE: FORCE EDGE-TO-EDGE */
        @media (max-width: 800px) {
          .anemo-v4-root,
          .anemo-v4-chat-container,
          .anemo-v4-messages,
          .anemo-v4-header,
          .anemo-v4-composer {
            border-radius: 0 !important;
            box-shadow: none !important;
            width: 100vw !important;
            min-width: 100vw !important;
            max-width: 100vw !important;
            left: 0 !important;
            right: 0 !important;
            margin: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .anemo-v4-header {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .anemo-v4-messages {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .anemo-v4-composer {
            left: 0 !important;
            right: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            position: fixed !important;
            bottom: 0 !important;
            width: 100vw !important;
            z-index: 10000 !important;
            background: var(--anemo-surface) !important;
            border-top: 1.5px solid var(--anemo-border);
          }
          .anemo-v4-composer-inner {
            margin-left: 0 !important;
            margin-right: 0 !important;
            border-radius: 0 0 0 0 !important;
          }
          .anemo-v4-bubble {
            max-width: 96vw !important;
          }
        }
      `}</style>
    </div>
  );
}
