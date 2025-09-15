'use client'

export default function HomePage() {
  return (
    <main className="bg-[#0f0f0f] text-white min-h-screen font-sans">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
        <div className="text-xl font-bold tracking-tight">anemo.ai</div>
        <nav className="space-x-6 text-sm text-slate-300">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#about" className="hover:text-white">About</a>
          <a href="/dashboard" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">Sign In</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center px-6 py-20 bg-gradient-to-b from-[#121212] to-[#0f0f0f]">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          India’s Smartest AI Chatbot for E-Commerce
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-6">
          Paste your business info — FAQs, pricing, policies — and deploy a smart chatbot on your website in minutes. No coding. No documents. Made for Indian sellers.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/dashboard" className="bg-blue-600 px-6 py-3 rounded text-white font-semibold hover:bg-blue-700">
            Try it Free
          </a>
          <a href="/widget?user=demo" className="border border-slate-600 px-6 py-3 rounded text-white font-semibold hover:border-white">
            View Demo
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-[#1a1a1a] p-6 rounded border border-slate-700">
            <h3 className="font-bold mb-2">✍️ Paste Your Content</h3>
            <p className="text-slate-400 text-sm">Add your FAQs, pricing, policies, or onboarding info manually.</p>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded border border-slate-700">
            <h3 className="font-bold mb-2">🤖 Train Your Bot</h3>
            <p className="text-slate-400 text-sm">We instantly convert your content into a smart, searchable assistant.</p>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded border border-slate-700">
            <h3 className="font-bold mb-2">🔗 Embed Anywhere</h3>
            <p className="text-slate-400 text-sm">Copy one line of code to add your chatbot to any website.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 bg-[#121212] border-t border-slate-800">
        <h2 className="text-2xl font-semibold mb-6 text-center">Pricing Plans</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-[#1a1a1a] p-6 rounded border border-slate-700 text-center">
            <h3 className="text-lg font-bold mb-2">Free</h3>
            <p className="text-slate-400 text-sm mb-4">3 content blocks · 100 messages/month</p>
            <div className="text-2xl font-bold mb-4">₹0</div>
            <a href="/dashboard" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 text-sm font-semibold">
              Start Free
            </a>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded border border-slate-700 text-center">
            <h3 className="text-lg font-bold mb-2">Pro</h3>
            <p className="text-slate-400 text-sm mb-4">Unlimited content · Branding · Analytics</p>
            <div className="text-2xl font-bold mb-4">₹499/mo</div>
            <a href="/dashboard" className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 text-sm font-semibold">
              Upgrade
            </a>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded border border-slate-700 text-center">
            <h3 className="text-lg font-bold mb-2">Agency</h3>
            <p className="text-slate-400 text-sm mb-4">Multi-org · Team access · Priority support</p>
            <div className="text-2xl font-bold mb-4">Custom</div>
            <a href="#contact" className="border border-slate-600 px-4 py-2 rounded text-white hover:border-white text-sm font-semibold">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 text-center text-sm text-slate-500 border-t border-slate-800">
        <p>Made in India 🇮🇳 · Built for Indian businesses · © {new Date().getFullYear()} anemo.ai</p>
        <div className="mt-2 space-x-4">
          <a href="#about" className="hover:text-white">About</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="/dashboard" className="hover:text-white">Sign In</a>
        </div>
      </footer>
    </main>
  )
}

