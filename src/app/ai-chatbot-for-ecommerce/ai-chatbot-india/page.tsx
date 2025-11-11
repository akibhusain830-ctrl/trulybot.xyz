import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
  title: 'AI Chatbot for Ecommerce - Best Customer Support Automation Platform',
  description: 'Transform your ecommerce with the #1 AI chatbot platform. Reduce support tickets 70%, increase leads 5X, automate customer service 24/7. Free trial, 5-minute setup. Join 10,000+ businesses.',
  keywords: [
    'AI chatbot for ecommerce',
    'ecommerce chatbot',
    'customer support automation',
    'automated customer service',
    'AI customer support',
    'ecommerce automation',
    'customer service chatbot',
    'automated support',
    'lead generation chatbot',
    'chatbot for business',
    'best AI chatbot for ecommerce',
    'ecommerce customer service',
    'AI customer service platform',
    'automated customer support',
    'customer support software',
    'ecommerce support automation',
    'AI powered customer service',
    'intelligent customer support',
    'customer service automation software',
    'ecommerce AI assistant'
  ],
  canonical: '/ai-chatbot-for-ecommerce',
  userIntent: 'commercial',
  voiceSearchOptimized: true,
  featuredSnippetTargeting: true
});

export default function AIChatbotForEcommercePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900">
      {/* Header */}
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            🤖 #1 AI Chatbot for Ecommerce
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Transform Your Online Store with AI-Powered Customer Support Automation
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm">✅ 70% Fewer Support Tickets</span>
            <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm">� 5X More Leads</span>
            <span className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm">⚡ 5-Minute Setup</span>
            <span className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm">🆓 Free Trial</span>
          </div>
        </div>
      </div>

      {/* Key Benefits for Ecommerce */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Why 10,000+ Ecommerce Businesses Choose TrulyBot
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">🎯 Instant Customer Support</h3>
            <p className="text-gray-300">
              Answer customer questions instantly, 24/7. Handle orders, shipping, returns, and refunds automatically.
            </p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-green-400">💰 Increase Sales & Leads</h3>
            <p className="text-gray-300">
              Convert more visitors into customers. Capture leads, recommend products, and reduce cart abandonment.
            </p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">⚡ Easy Integration</h3>
            <p className="text-gray-300">
              Works with Shopify, WooCommerce, Magento, and all major ecommerce platforms. Setup in 5 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Ecommerce Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Complete Ecommerce Customer Support Automation
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-6 text-green-400">AI That Understands Your Business</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✅</span>
                <div>
                  <strong className="text-white">Order Management</strong>
                  <p className="text-gray-300 text-sm">Track orders, update shipping, process returns automatically</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✅</span>
                <div>
                  <strong className="text-white">Product Recommendations</strong>
                  <p className="text-gray-300 text-sm">Smart AI suggests products based on customer preferences</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✅</span>
                <div>
                  <strong className="text-white">Cart Recovery</strong>
                  <p className="text-gray-300 text-sm">Reduce cart abandonment with proactive messaging</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✅</span>
                <div>
                  <strong className="text-white">Lead Qualification</strong>
                  <p className="text-gray-300 text-sm">Identify and nurture high-value prospects automatically</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
            <h4 className="text-xl font-bold mb-4 text-white">Proven Results</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Support Tickets</span>
                <span className="text-green-400 font-bold">↓ 70%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Response Time</span>
                <span className="text-blue-400 font-bold">Instant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Lead Generation</span>
                <span className="text-purple-400 font-bold">↑ 500%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Customer Satisfaction</span>
                <span className="text-green-400 font-bold">↑ 85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Integrations */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Works with Your Ecommerce Platform
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {['Shopify', 'WooCommerce', 'Magento', 'BigCommerce', 'Wix', 'Squarespace', 'PrestaShop', 'OpenCart'].map((platform) => (
            <div key={platform} className="bg-gray-800/30 p-4 rounded-lg border border-gray-600">
              <span className="text-white font-medium">{platform}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">
          Start Your Free Trial Today
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join 10,000+ ecommerce businesses already using TrulyBot
        </p>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all">
          Start Free Trial - Setup in 5 Minutes
        </button>
      </div>

      {/* Structured Data for Ecommerce */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'TrulyBot AI Chatbot for Ecommerce',
            description: 'AI chatbot platform designed for ecommerce businesses with automated customer support, lead generation, and sales optimization.',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock'
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '1250'
            },
            featureList: [
              'Automated Customer Support',
              'Lead Generation',
              'Order Management',
              'Cart Recovery',
              'Product Recommendations',
              'Multi-platform Integration'
            ]
          })
        }}
      />
    </div>
  );
}