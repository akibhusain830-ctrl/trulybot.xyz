import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';
import PricingClientPage from '../(legal)/pricing/pricing-client-page';

export const metadata: Metadata = generateSEOMetadata({
  title: 'AI Chatbot Pricing India - TrulyBot Plans in INR | Starting ₹99/month',
  description: 'AI chatbot pricing for Indian businesses. Plans starting at ₹99/month. Made for Indian e-commerce with local payment support, Hindi language, and India-specific features.',
  keywords: [
    'AI chatbot pricing India',
    'chatbot cost India',
    'AI chatbot India price',
    'chatbot plans India',
    'affordable AI chatbot India',
    'Indian chatbot pricing',
    'chatbot subscription India',
    'AI chatbot cost Indian rupees',
    'best chatbot India price',
    'cheap AI chatbot India'
  ],
  canonical: '/pricing-india'
});

const indiaSpecificJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'TrulyBot AI Chatbot for India',
  description: 'AI chatbot platform designed for Indian businesses with Hindi support, local payments, and India-specific features',
  brand: {
    '@type': 'Brand',
    name: 'TrulyBot'
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Basic Plan India',
      price: '99',
      priceCurrency: 'INR',
      description: 'Perfect for small Indian businesses starting with AI automation',
      availability: 'https://schema.org/InStock',
      areaServed: {
        '@type': 'Country',
        name: 'India'
      }
    },
    {
      '@type': 'Offer',
      name: 'Pro Plan India',
      price: '399',
      priceCurrency: 'INR',
      description: 'Advanced features for growing Indian e-commerce businesses',
      availability: 'https://schema.org/InStock',
      areaServed: {
        '@type': 'Country',
        name: 'India'
      }
    },
    {
      '@type': 'Offer',
      name: 'Ultra Plan India',
      price: '599',
      priceCurrency: 'INR',
      description: 'Enterprise-grade AI chatbot for large Indian businesses',
      availability: 'https://schema.org/InStock',
      areaServed: {
        '@type': 'Country',
        name: 'India'
      }
    }
  ],
  areaServed: {
    '@type': 'Country',
    name: 'India'
  }
};

export default function PricingIndiaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(indiaSpecificJsonLd) }}
      />
      
      {/* India-specific hero section */}
      <div className="bg-gradient-to-b from-orange-900/20 to-black py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-4xl">🇮🇳</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              AI Chatbot for Indian Businesses
            </h1>
          </div>
          <p className="text-xl text-slate-300 mb-8">
            Built for India with Hindi support, local payments, and features designed for Indian e-commerce
          </p>
          <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-orange-300 mb-4">
              🎉 Special India Launch Pricing
            </h2>
            <p className="text-slate-300">
              Get started with AI automation at prices designed for Indian businesses. 
              Support for UPI, Net Banking, and all major Indian payment methods.
            </p>
          </div>
        </div>
      </div>
      
      <PricingClientPage />
      
      {/* India-specific features section */}
      <div className="bg-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-orange-300">
            Made for Indian Businesses
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-300">
                🗣️ Hindi Language Support
              </h3>
              <p className="text-slate-300">
                Fully supports Hindi conversations with Indian customers. Perfect for businesses serving Hindi-speaking markets.
              </p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-300">
                💳 Indian Payment Integration
              </h3>
              <p className="text-slate-300">
                Seamless integration with UPI, Paytm, Razorpay, and all major Indian payment gateways.
              </p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-300">
                🕐 India Time Zone
              </h3>
              <p className="text-slate-300">
                All analytics and reports optimized for Indian Standard Time (IST) with local business hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
