'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load chat history from local storage on initial render
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('anemo-chat-history');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Add a default welcome message if no history exists
        setMessages([{ role: 'system', content: "Hello! I'm anemo.ai, your personal support assistant. How can I help you today?" }]);
      }
    }
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      });

      const data = await response.json();
      if (data.data) {
        setMessages(prevMessages => [...prevMessages, data.data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Save chat history to local storage whenever messages or loading state changes
    if (isClient) {
      localStorage.setItem('anemo-chat-history', JSON.stringify(messages));
    }
    // Scroll to the bottom to show the latest message
    scrollToBottom();
  }, [messages, loading, isClient]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans antialiased relative">
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col space-y-4 w-full max-w-4xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`p-4 rounded-xl max-w-lg shadow-lg ${
                  msg.role === 'user' ? 'bg-blue-600 text-white self-end rounded-br-md' : 'bg-slate-700 text-white self-start rounded-bl-md'
                }`}
              >
                <p className="font-medium leading-relaxed">{msg.content}</p>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-xl bg-slate-700 self-start text-white shadow-lg max-w-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <p>AI is typing...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* This spacer ensures the last message is visible above the input box */}
          <div className="h-48" />
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Input Box */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 flex items-center justify-center z-10">
        <div className="w-full max-w-4xl flex space-x-4">
          <input
            type="text"
            className="flex-grow p-4 rounded-full border border-slate-700 bg-slate-700/60 backdrop-blur-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <motion.button
            onClick={sendMessage}
            className="p-4 rounded-full bg-blue-600 text-white font-semibold flex-shrink-0 flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}


