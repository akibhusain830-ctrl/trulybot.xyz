import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Customer Support Automation India - AI Chatbot for Indian Business',
  description: 'Automate customer support for Indian businesses with TrulyBot AI. Hindi support, Razorpay integration, GST compliance. Reduce support tickets by 70%. Free trial for Indian companies.',
  keywords: [
    'customer support automation India',
    'automated customer service India',
    'AI customer support India',
    'customer service automation India',
    'support ticket automation India',
    'helpdesk automation India',
    'customer care automation India',
    'AI support agent India',
    'automated support India',
    'customer service chatbot India',
    'support automation for Indian business',
    'Hindi customer support automation',
    'Indian customer service software',
    'automated help desk India',
    'customer support AI India'
  ],
  canonical: '/customer-support-automation-india',
  userLocation: 'india',
  userIntent: 'commercial',
  voiceSearchOptimized: true,
  featuredSnippetTargeting: true
});

export default function CustomerSupportAutomationIndiaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
      {/* Header */}
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-400 bg-clip-text text-transparent">
            Customer Support Automation for India
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            भारतीय व्यवसायों के लिए स्वचालित ग्राहक सहायता - 70% कम टिकट, 24/7 सेवा
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm">🎯 70% Fewer Tickets</span>
            <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm">⚡ Instant Responses</span>
            <span className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm">🇮🇳 Made for India</span>
            <span className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm">🗣️ Hindi Support</span>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">
            Customer Support Challenges in India
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
              <div className="text-4xl mb-4">😓</div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Overwhelmed Support Teams</h3>
              <p className="text-gray-300 text-sm">Indian businesses struggle with high support ticket volumes</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-xl">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-lg font-semibold text-orange-400 mb-2">Language Barriers</h3>
              <p className="text-gray-300 text-sm">Customers prefer Hindi/regional language support</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">High Support Costs</h3>
              <p className="text-gray-300 text-sm">24/7 human support is expensive for Indian businesses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Solution */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            TrulyBot Solution for Indian Businesses
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-green-400">Automated Support That Understands India</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✅</span>
                  <div>
                    <strong className="text-white">Hindi & English Support</strong>
                    <p className="text-gray-300 text-sm">Customers can chat in Hindi or English naturally</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✅</span>
                  <div>
                    <strong className="text-white">Indian Business Logic</strong>
                    <p className="text-gray-300 text-sm">Understands COD, EMI, festival sales patterns</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✅</span>
                  <div>
                    <strong className="text-white">Razorpay Integration</strong>
                    <p className="text-gray-300 text-sm">Seamless payment queries and refund processing</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✅</span>
                  <div>
                    <strong className="text-white">Festival & Sale Support</strong>
                    <p className="text-gray-300 text-sm">Handles Diwali, Dussehra, and other Indian sale periods</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
              <h4 className="text-xl font-bold mb-4 text-white">Automation Results</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Support Tickets</span>
                  <span className="text-green-400 font-bold">↓ 70%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Response Time</span>
                  <span className="text-blue-400 font-bold">&lt; 1 second</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Support Cost</span>
                  <span className="text-green-400 font-bold">↓ 80%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Customer Satisfaction</span>
                  <span className="text-purple-400 font-bold">↑ 85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indian Market Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Built for Indian Market Needs
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
            <div className="text-3xl mb-4">🕘</div>
            <h3 className="text-lg font-semibold mb-2 text-white">24/7 Support</h3>
            <p className="text-gray-300 text-sm">Covers all Indian time zones</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
            <div className="text-3xl mb-4">💳</div>
            <h3 className="text-lg font-semibold mb-2 text-white">Payment Support</h3>
            <p className="text-gray-300 text-sm">UPI, Cards, Wallets, COD</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
            <div className="text-3xl mb-4">🎊</div>
            <h3 className="text-lg font-semibold mb-2 text-white">Festival Ready</h3>
            <p className="text-gray-300 text-sm">Handles high festival traffic</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2 text-white">GST Compliance</h3>
            <p className="text-gray-300 text-sm">Proper Indian business reporting</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">
          Transform Your Indian Business Support Today
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join Indian businesses saving 70% on support costs
        </p>
        <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all">
          Start Free Trial - निःशुल्क शुरू करें
        </button>
      </div>
    </div>
  );
}