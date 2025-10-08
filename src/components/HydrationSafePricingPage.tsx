'use client';

import { PRICING_TIERS } from '@/lib/constants/pricing';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import RazorpayButton from '@/components/RazorpayButton';
import SignInPromptModal from '@/components/SignInPromptModal';
import { useServerSafeCurrency } from '@/hooks/useServerSafeCurrency';
import { getAllTiersPricing } from '@/lib/utils/geolocation-pricing';

// Prevent hydration issues by using dynamic imports for client-only components
import dynamic from 'next/dynamic';

const DynamicRazorpayButton = dynamic(() => import('@/components/RazorpayButton'), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-center">
      Loading...
    </div>
  )
});

// Helper function to build structured data for pricing
function buildPricingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'TrulyBot AI Customer Service',
    description: 'AI-powered customer service chatbot platform',
    brand: {
      '@type': 'Brand',
      name: 'TrulyBot'
    },
    offers: PRICING_TIERS.map((tier, index) => ({
      '@type': 'Offer',
      name: `${tier.name} Plan`,
      description: tier.description,
      position: index + 1,
      itemOffered: {
        '@type': 'SoftwareApplication',
        name: `TrulyBot ${tier.name} Plan`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        description: tier.description,
      },
      priceSpecification: [
        {
          '@type': 'UnitPriceSpecification',
          priceCurrency: 'INR',
          price: tier.monthlyInr,
          billingPeriod: 'P1M'
        },
        {
          '@type': 'UnitPriceSpecification',
          priceCurrency: 'USD',
          price: tier.monthlyUsd,
          billingPeriod: 'P1M'
        }
      ],
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
    }))
  };
}

export default function HydrationSafePricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  
  // Use server-safe currency detection to prevent hydration issues
  const { currency, symbol, isIndia, country } = useServerSafeCurrency();
  
  // Track when component is mounted to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Get all tiers with appropriate pricing
  const tiersWithPricing = getAllTiersPricing(currency, billingPeriod);
  const periodLabel = billingPeriod === 'monthly' ? '/month' : '/year';

  // Show loading state until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="relative min-h-screen bg-black py-16 xs:py-20 sm:py-24 lg:py-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Loading pricing information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPricingJsonLd()) }}
      />
      <div className="relative min-h-screen bg-black py-16 xs:py-20 sm:py-24 lg:py-32 overflow-hidden touch-manipulation">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              <span className="text-blue-400">⚡</span> Choose Your Plan
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Start with our free trial and scale as you grow. All plans include our lightning-fast AI technology.
            </p>
            
            {/* Currency and Location Info */}
            <div className="inline-flex items-center bg-gray-800 rounded-full px-4 py-2 text-sm text-gray-300 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Showing prices in {currency} for {country}
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 bg-green-500 text-xs px-2 py-1 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {tiersWithPricing.map((tier, index) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 ${
                  tier.highlight
                    ? 'bg-gradient-to-br from-blue-900 to-purple-900 border border-blue-500 shadow-2xl transform scale-105'
                    : 'bg-gray-900 border border-gray-700'
                } transition-all duration-300 hover:shadow-xl hover:scale-102`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400 mb-6">{tier.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl md:text-5xl font-extrabold text-white">
                      {tier.pricing.formatted}
                    </span>
                    <span className="text-gray-400 ml-2">{periodLabel}</span>
                  </div>

                  {billingPeriod === 'yearly' && (
                    <div className="text-green-400 text-sm font-medium mb-4">
                      Save 20% with yearly billing
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="mt-auto">
                  {user ? (
                    <DynamicRazorpayButton
                      amount={tier.pricing.amount}
                      currency={currency}
                      billingPeriod={billingPeriod}
                      label={tier.highlight ? 'Get Started' : `Choose ${tier.name}`}
                      notes={{ plan: tier.id }}
                      user_id={user.id}
                      plan_id={tier.id}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                        tier.highlight
                          ? 'bg-white text-blue-900 hover:bg-gray-100'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      onSuccess={() => { window.location.href = '/dashboard'; }}
                      onFailure={(e) => { 
                        console.log('Payment failed:', e);
                        alert(`Payment failed: ${e?.error?.description || 'Unknown error'}`); 
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setIsSignInModalOpen(true)}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                        tier.highlight
                          ? 'bg-white text-blue-900 hover:bg-gray-100'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {tier.name === 'Free' ? 'Start Free Trial' : 'Get Started'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-white mb-8">All Plans Include</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="text-blue-400 text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-400">Instant AI responses under 200ms</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="text-green-400 text-3xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
                <p className="text-gray-400">SOC 2 compliant with end-to-end encryption</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="text-purple-400 text-3xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h3>
                <p className="text-gray-400">Real-time insights and performance metrics</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Can I change plans anytime?</h3>
                <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
                <p className="text-gray-400">Yes, all plans come with a 7-day free trial. No credit card required to start.</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-400">We accept all major credit cards, PayPal, and local payment methods including UPI for Indian customers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Modal */}
        {isSignInModalOpen && (
          <SignInPromptModal
            onClose={() => setIsSignInModalOpen(false)}
          />
        )}
      </div>
    </>
  );
}
