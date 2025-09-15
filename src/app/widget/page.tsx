'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WidgetPage() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'system', content: "Hi, I’m Anemo. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const sendMessage = async () => {
    if (!input.trim()) return
    const newMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, newMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      })
      const data = await res.json()
      if (data.data) setMessages((prev) => [...prev, data.data])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-black text-white font-sans overflow-hidden">
      {/* Radial Glow */}
      <div className="absolute top-1/3 left-1/2 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-3xl opacity-40 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

      {/* Top Branding */}
      <div className="absolute top-4 left-6 z-10 text-white text-lg font-semibold tracking-tight bg-[#0f0f0f]/80 backdrop-blur-md px-4 py-2 rounded shadow">
        anemo.ai
      </div>

      {/* Chat Window */}
      <section className="px-6 pt-10 pb-32 max-w-3xl mx-auto flex flex-col gap-4 z-10 relative">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`max-w-lg p-4 rounded-xl shadow-lg backdrop-blur-md ${
                msg.role === 'user'
                  ? 'bg-blue-600/80 text-white self-end rounded-br-md'
                  : 'bg-slate-700/70 text-white self-start rounded-bl-md'
              }`}
            >
              <p className="leading-relaxed">{msg.content}</p>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 rounded-xl bg-slate-700/70 text-white shadow-lg max-w-lg self-start"
            >
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <p>Anemo is typing...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </section>

      {/* Floating Input */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-10">
        <div className="max-w-3xl mx-auto flex gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-grow p-4 rounded-full bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <motion.button
            onClick={sendMessage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Send
          </motion.button>
        </div>
      </div>
    </main>
  )
}
