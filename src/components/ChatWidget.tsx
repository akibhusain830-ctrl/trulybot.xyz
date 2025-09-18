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

  const push = useCallback((role: Role, text: string, opts?: { error?: boolean }) => {
    setMessages((m) => [...m, { id: uid(), role, text, at: Date.now(), error: opts?.error }]);
  }, []);

  useEffect(() => { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const parsed = JSON.parse(raw) as Message[]; if (Array.isArray(parsed) && parsed.length) setMessages(parsed); } } catch {} }, []);
  useEffect(() => { try { if (messages.length) { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-80))); } } catch {} }, [messages]);

  useEffect(() => {
    const seen = localStorage.getItem(INTRO_KEY);
    if (!seen && messages.length === 0) {
      push('bot', "Hi — I'm Anemo, your support assistant. Ask about setup, pricing, or embedding.");
      localStorage.setItem(INTRO_KEY, '1');
    }
  }, [messages.length, push]);

  useEffect(() => { requestAnimationFrame(() => { if (listRef.current) { listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); } }); }, [messages, typing]);

  useEffect(() => {
    textareaRef.current?.focus();
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if ( document.activeElement !== textareaRef.current && !['INPUT', 'TEXTAREA'].includes(target.tagName) && e.key.length === 1 ) {
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => { window.removeEventListener('keydown', handleGlobalKeyPress); };
  }, []);

  // Mobile keyboard fix: scroll into view when keyboard shown
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 700 && textareaRef.current) {
        textareaRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const callApi = useCallback(async (prompt: string) => {
    setLoading(true);
    setTyping(true);
    const messageHistory = [...messages, { role: 'user', text: prompt, id: 'temp', at: Date.now() }].slice(-8);

    try {
      const res = await fetchWithTimeout('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: messageHistory }) }, 12000);
      if (!res) throw new Error('No response');
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.error) { const msg = json?.error || `Server error ${res.status}`; push('bot', msg, { error: true }); return; }
      const reply = json?.reply?.toString().trim();
      if (!reply) { push('bot', 'Assistant returned no content', { error: true }); return; }
      push('bot', reply);
    } catch (err: unknown) {
      const isAbort = (err as Error)?.name === 'AbortError';
      const msg = isAbort ? 'Request timed out. Try again.' : (err as Error)?.message || 'Network error';
      push('bot', msg, { error: true });
    } finally {
      setLoading(false);
      setTyping(false);
      textareaRef.current?.focus();
    }
  }, [messages, push]);

  const submit = useCallback((raw?: string) => { const prompt = (raw ?? input).trim(); if (!prompt) return; push('user', prompt); setInput(''); if (suggestions) setSuggestions(null); callApi(prompt); }, [input, suggestions, callApi, push]);
  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!loading) submit(); } }, [loading, submit]);
  const clearConversation = useCallback(() => { setMessages([]); localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(INTRO_KEY); setTimeout(() => { push('bot', "Hi — I'm Anemo, your support assistant. Ask about setup, pricing, or embedding."); localStorage.setItem(INTRO_KEY, '1'); setSuggestions(SUGGESTIONS); }, 100); }, [push]);

  return (
    <div className="anemo-chat-root">
      <div className="card">
        <header className="head">
          <div>
            <div className="brand">Anemo</div>
            <div className="sub">Smart assistant</div>
          </div>
          <button className="mini ghost" onClick={clearConversation} title="Clear conversation">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </header>
        <div className="body" ref={listRef}>
          {messages.map((m) => (
            <div key={m.id} className={`row ${m.role}`}>
              <div className={`bubble ${m.role} ${m.error ? 'err' : ''}`}>
                <div className="text">{m.text}</div>
                <div className="meta">{new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
          {typing && ( <div className="row bot"><div className="bubble bot typing"><div className="dots"><span /><span /><span /></div></div></div> )}
        </div>
        {suggestions && !messages.find(m => m.role === 'user') && (
          <div className="sugs">
            {suggestions.map((s) => ( <button key={s} className="chip" onClick={() => submit(s)} disabled={loading}>{s}</button> ))}
          </div>
        )}
        <form className="composer" onSubmit={(e) => { e.preventDefault(); if (!loading) submit(); }}>
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Ask anything..." rows={1} disabled={loading} />
          <button type="submit" className="send" disabled={loading || !input.trim()} title="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    <style>{`
      .anemo-chat-root {
        --bg-color: #000; --card-bg: #111; --border-color: #30363d; --text-primary: #e6edf3;
        --text-secondary: #7d8590; --accent-color: #2563eb; --bot-bubble-bg: #1c1c1c;
        --user-bubble-bg: #2563eb; --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; --border-radius: 24px;
      }
      .anemo-chat-root {
        display: flex; font-family: var(--font-family); color: var(--text-primary); height: 100vh; background-color: var(--card-bg);
        margin: 0; padding: 0; width: 100vw; min-height: 100vh; box-sizing: border-box;
      }
      .card {
        width: 100%; height: 100%; max-height: 100%; background: var(--card-bg);
        border: none; border-radius: 0; box-shadow: none;
        display: flex; flex-direction: column; overflow: hidden;
      }
      .head { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
      .brand { font-size: 1.1rem; font-weight: 600; }
      .sub { font-size: 0.8rem; color: var(--text-secondary); }
      .body { flex-grow: 1; overflow-y: auto; padding: 24px 0 24px 0; display: flex; flex-direction: column; gap: 16px; scrollbar-width: thin; scrollbar-color: rgba(125,125,125,0.2) transparent; }
      .body::-webkit-scrollbar { width: 8px; height: 0; }
      .body::-webkit-scrollbar-thumb { background-color: rgba(125, 125, 125, 0.2); border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
      .body::-webkit-scrollbar-track { background: transparent; }
      .body::-webkit-scrollbar-thumb:hover { background-color: rgba(125, 125, 125, 0.4); }
      .row { display: flex; animation: slideIn 0.3s ease-out forwards; }
      @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .row.user { justify-content: flex-end; }
      .row.bot { justify-content: flex-start; }
      .bubble { padding: 12px 18px; border-radius: 20px; max-width: 80%; display: flex; flex-direction: column; gap: 8px; }
      .bubble.bot { background: var(--bot-bubble-bg); border-bottom-left-radius: 6px; }
      .bubble.user { background: var(--user-bubble-bg); color: white; border-bottom-right-radius: 6px; }
      .bubble .text { font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; }
      .bubble .meta { font-size: 0.75rem; color: var(--text-secondary); text-align: right; }
      .bubble.user .meta { color: rgba(255,255,255,0.6); }
      .bubble.typing .dots { display: flex; gap: 4px; align-items: center; }
      .bubble.typing .dots span { width: 8px; height: 8px; border-radius: 50%; background-color: var(--text-secondary); animation: bounce 1.2s infinite; }
      .bubble.typing .dots span:nth-child(2) { animation-delay: 0.2s; }
      .bubble.typing .dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes bounce { 0%, 80%, 100% { transform: scale(0.5); opacity: 0.5; } 40% { transform: scale(1.0); opacity: 1; } }
      .sugs { display: flex; gap: 8px; padding: 0 24px 12px; overflow-x: auto; flex-shrink: 0; }
      .chip { flex-shrink: 0; background: var(--bot-bubble-bg); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; cursor: pointer; transition: background-color 0.2s, border-color 0.2s; }
      .chip:hover { background: #30363d; border-color: #444; color: var(--text-primary); }
      .composer { display: flex; align-items: center; gap: 12px; padding: 16px 0 16px 0; border-top: 1px solid var(--border-color); flex-shrink: 0; background: var(--card-bg); }
      .composer textarea { flex-grow: 1; background: var(--bot-bubble-bg); border: 1px solid var(--border-color); border-radius: 20px; padding: 10px 16px; outline: none; resize: none; color: var(--text-primary); font-size: 0.95rem; font-family: inherit; line-height: 1.5; transition: border-color 0.2s, box-shadow 0.2s; min-height: 36px; max-height: 120px; }
      .composer textarea:focus { border-color: var(--accent-color); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3); }
      .composer .send { background: var(--accent-color); color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; transition: transform 0.2s, opacity 0.2s; border: none; cursor: pointer; }
      .composer .send:disabled { opacity: 0.5; cursor: not-allowed; transform: scale(0.9); }
      button.ghost { color: var(--text-secondary); padding: 6px; border-radius: 50%; transition: background-color 0.2s; background: none; border: none; cursor: pointer; }
      button.ghost:hover { background: rgba(255,255,255,0.1); }
      /* Only vertical scrollbar for .body */
      .body { overflow-y: auto; overflow-x: hidden; }
      /* Composer box half height */
      .composer textarea { min-height: 24px; max-height: 48px; }
      @media (max-width: 600px) {
        .anemo-chat-root { padding: 0 !important; width: 100vw !important; min-height: 100vh !important; }
        .card { border-radius: 0 !important; box-shadow: none !important; }
        .body { padding: 12px 0 12px 0 !important; }
        .composer { padding: 10px 0 10px 0 !important; }
        .sugs { padding: 0 8px 8px !important; }
        .composer textarea { min-height: 20px; max-height: 40px; }
      }
    `}</style>
    </div>
  );
}
