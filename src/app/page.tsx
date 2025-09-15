'use client'

import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <main className="relative min-h-screen font-sans text-white overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-black">
      {/* Radial Glow */}
      <div className="absolute top-1/3 left-1/2 w-[700px] h-[700px] bg-blue-600/30 rounded-full blur-3xl opacity-40 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-slate-800 backdrop-blur-md bg-[#0f0f0f]/80 sticky top-0 z-10">
        <div className="text-xl font-bold tracking-tight">anemo.ai</div>
        <nav className="space-x-6 text-sm text-slate-300">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="/about" className="hover:text-white transition">About</a>
          <a href="/sign-in" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 transition">Sign In</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative text-center px-6 py-24 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-400 to-white bg-clip-text text-transparent tracking-tight leading-snug mb-6"
        >
          India’s Smartest AI Chatbot for E-Commerce
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg max-w-2xl mx-auto mb-8"
        >
          Paste your business info — FAQs, pricing, policies — and deploy a smart chatbot on your website in minutes. No code needed. Made for Indian sellers.
        </motion.p>
        <div className="flex justify-center gap-4">
          <motion.a
            href="/dashboard"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600/80 backdrop-blur-md px-6 py-3 rounded-lg text-white font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg"
          >
            Try it Free
          </motion.a>
          <motion.a
            href="/widget?user=demo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-slate-600/60 backdrop-blur-md px-6 py-3 rounded-lg text-white font-semibold hover:border-white transition-all duration-200 shadow-lg"
          >
            View Demo
          </motion.a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 max-w-4xl mx-auto z-10 relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-2xl font-semibold mb-6 text-center"
        >
          How It Works
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            { title: '✍️ Paste Your Content', desc: 'Add your FAQs, pricing, policies, or onboarding info manually.' },
            { title: '🤖 Train Your Bot', desc: 'We instantly convert your content into a smart, searchable assistant.' },
            { title: '🔗 Embed Anywhere', desc: 'Copy one line of code to add your chatbot to any website.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-[#1a1a1a]/60 backdrop-blur-lg border border-slate-700 p-6 rounded-xl shadow-xl hover:shadow-2xl transition"
            >
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 bg-[#121212]/80 border-t border-slate-800 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-2xl font-semibold mb-6 text-center"
        >
          Pricing Plans
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { name: 'Free', desc: '3 content blocks · 100 messages/month', price: '₹0', cta: 'Start Free' },
            { name: 'Pro', desc: 'Unlimited content · Branding · Analytics', price: '₹499/mo', cta: 'Upgrade' },
            { name: 'Agency', desc: 'Multi-org · Team access · Priority support', price: 'Custom', cta: 'Contact Us' },
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-[#1a1a1a]/60 backdrop-blur-lg border border-slate-700 p-6 rounded-xl text-center shadow-xl hover:shadow-2xl transition"
            >
              <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{plan.desc}</p>
              <div className="text-2xl font-bold mb-4">{plan.price}</div>
              <a
                href={plan.name === 'Agency' ? '#contact' : '/dashboard'}
                className={`px-4 py-2 rounded text-sm font-semibold ${
                  plan.name === 'Agency'
                    ? 'border border-slate-600 text-white hover:border-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 text-center text-sm text-slate-500 border-t border-slate-800 relative z-10">
        <p>Made in India 🇮🇳 · Built for Indian businesses · © {new Date().getFullYear()} anemo.ai</p>
        <div className="mt-2 space-x-4">
          <a href="/about" className="hover:text-white transition">About</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="/sign-in" className="hover:text-white transition">Sign In</a>
        </div>
      </footer>
    </main>
  )
}

