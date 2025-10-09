import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = generateSEOMetadata({
  title: 'AI Chatbot for E-Commerce - Boost Sales & Support 24/7',
  description: 'Discover why 10,000+ e-commerce businesses use TrulyBot AI chatbot. Increase sales by 5X, reduce support tickets 70%. Free trial, instant setup.',
  keywords: [
    'AI chatbot for ecommerce',
    'ecommerce chatbot software', 
    'online store chatbot',
    'ecommerce customer service bot',
    'AI shopping assistant',
    'ecommerce automation',
    'online business chatbot',
    'retail AI chatbot',
    'smart ecommerce support',
    'automated sales assistant'
  ],
  canonical: '/ai-chatbot-for-ecommerce'
});

const ecommerceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Best AI Chatbot for E-Commerce Businesses in 2024',
  description: 'Complete guide to choosing the right AI chatbot for your e-commerce business. Compare features, pricing, and benefits.',
  author: {
    '@type': 'Organization',
    name: 'TrulyBot'
  },
  publisher: {
    '@type': 'Organization', 
    name: 'TrulyBot',
    logo: 'https://trulybot.xyz/logo-trulybot.svg'
  },
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString(),
  mainEntityOfPage: 'https://trulybot.xyz/ai-chatbot-for-ecommerce'
};

export default function EcommerceChatbotPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ecommerceJsonLd) }}
      />
      
      <main className="min-h-screen bg-black text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* SEO-optimized header */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              #1 AI Chatbot for E-Commerce Businesses
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Join e-commerce businesses using TrulyBot to automate customer support, 
              capture leads, and increase sales. Get 70% fewer support tickets and 5X more conversions.
            </p>
          </header>

          {/* Benefits section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-cyan-300">
              Why E-Commerce Businesses Choose TrulyBot
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">24/7 Customer Support</h3>
                <p className="text-slate-300">Never miss a customer inquiry. TrulyBot handles support tickets automatically, even when your team is offline.</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">5X More Lead Generation</h3>
                <p className="text-slate-300">Convert website visitors into customers with intelligent product recommendations and personalized assistance.</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">70% Fewer Support Tickets</h3>
                <p className="text-slate-300">Resolve common questions instantly, freeing your team to focus on complex issues and growth.</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">5-Minute Setup</h3>
                <p className="text-slate-300">Get your AI chatbot live on your e-commerce store in minutes, not weeks. No coding required.</p>
              </div>
            </div>
          </section>

          {/* CTA section */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your E-Commerce Support?</h2>
            <p className="text-xl text-slate-300 mb-8">Start your free 7-day trial today. No credit card required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/start-trial"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
              >
                Start Free Trial
              </Link>
              <Link 
                href="/pricing"
                className="border border-slate-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-slate-800 transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}