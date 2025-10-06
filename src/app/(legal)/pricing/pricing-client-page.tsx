'use client';

import { PRICING_TIERS } from '@/lib/constants/pricing';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import RazorpayButton from '@/components/RazorpayButton';
import SignInPromptModal from '@/components/SignInPromptModal';
import { useCurrencyDetection } from '@/hooks/useCurrencyDetection';
import { getAllTiersPricing } from '@/lib/utils/geolocation-pricing';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Pricing - TrulyBot',
  description: 'Choose the right plan for your AI-powered customer service needs. Flexible pricing options for businesses of all sizes.',
  openGraph: {
    title: 'Pricing - TrulyBot',
    description: 'Choose the right plan for your AI-powered customer service needs.',
    type: 'website',
  },
};

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
          priceCurrency: 'INR',
          price: tier.yearlyInr,
          billingPeriod: 'P1Y'
        },
        {
          '@type': 'UnitPriceSpecification',
          priceCurrency: 'USD',
          price: tier.monthlyUsd,
          billingPeriod: 'P1M'
        },
        {
          '@type': 'UnitPriceSpecification',
          priceCurrency: 'USD', 
          price: tier.yearlyUsd,
          billingPeriod: 'P1Y'
        }
      ],
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
    }))
  };
}

export default function PricingClientPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const { user } = useAuth();
  
  // Use our robust currency detection system
  const { currency, symbol, isIndia, isLoading: geoLoading, country } = useCurrencyDetection();
  
  // ROBUST GUARD: Never show wrong currency to users
  const safeCurrency = currency; // Keep the detected currency
  const safeSymbol = symbol; // Keep the detected symbol
  
  // Get all tiers with appropriate pricing
  const tiersWithPricing = getAllTiersPricing(safeCurrency, billingPeriod);

  const periodLabel = billingPeriod === 'monthly' ? '/month' : '/year';

  // Show loading until currency is properly detected
  if (geoLoading) {
    return (
      <div className="relative min-h-screen bg-black py-16 xs:py-20 sm:py-24 lg:py-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-white mt-4">Detecting your location for accurate pricing...</p>
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
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 xs:w-64 xs:h-64 lg:w-72 lg:h-72 bg-blue-500/5 rounded-full blur-2xl xs:blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 xs:w-72 xs:h-72 lg:w-96 lg:h-96 bg-indigo-500/5 rounded-full blur-2xl xs:blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 xs:w-96 xs:h-96 lg:w-[600px] lg:h-[600px] bg-purple-500/3 rounded-full blur-2xl xs:blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 xs:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm mb-4 xs:mb-6">
              <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-indigo-400 rounded-full animate-pulse" />
              <span className="text-xs xs:text-sm font-medium text-indigo-300">Simple & Transparent Pricing</span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] xs:leading-tight">
              <span className="block">Choose Your</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mt-1 xs:mt-0">
                Perfect Plan
              </span>
            </h1>
          </div>
          
          <div className="relative mt-8 xs:mt-10 sm:mt-12">
            <p className="mx-auto max-w-3xl text-base xs:text-lg sm:text-xl leading-relaxed text-gray-400 text-center px-4 xs:px-0">
              <span className="block xs:inline">Scale your customer service with AI that understands your business.</span>
              <span className="block xs:inline mt-2 xs:mt-0 xs:ml-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-medium">Start free, upgrade when you need more power.</span>
            </p>

            {/* Currency Detection Status */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                <span>
                  Pricing shown in {safeCurrency}. 
                  {isIndia ? ' 🇮🇳 India region detected.' : ` 🌍 ${country} region detected.`}
                </span>
              </p>
            </div>

            {/* Billing Period Toggle */}
            <div className="mt-8 xs:mt-10 sm:mt-12 flex justify-center px-4">
              <div className="relative bg-gray-800/40 backdrop-blur-xl p-1 xs:p-1.5 rounded-xl xs:rounded-2xl border border-white/10 shadow-2xl w-full max-w-xs xs:max-w-sm">
                <div className="flex gap-0.5 xs:gap-1">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`relative flex-1 px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 rounded-lg xs:rounded-xl text-xs xs:text-sm font-semibold transition-all duration-300 ${
                      billingPeriod === 'monthly' 
                        ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white shadow-xl shadow-blue-500/25' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`relative flex-1 px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 rounded-lg xs:rounded-xl text-xs xs:text-sm font-semibold transition-all duration-300 ${
                      billingPeriod === 'yearly' 
                        ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white shadow-xl shadow-blue-500/25' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="block xs:inline">Yearly</span>
                    <span className="block xs:inline text-[10px] xs:text-xs opacity-80 xs:ml-1">(20% off)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="mt-12 xs:mt-16 sm:mt-20 grid grid-cols-1 gap-6 xs:gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-8 max-w-7xl mx-auto px-2 xs:px-0">
              {tiersWithPricing.map((tierWithPricing, index) => {
                const { pricing, ...tier } = tierWithPricing;
                const isPopular = tier.highlight;
                
                return (
                  <div
                    key={tier.id}
                    className={`relative flex flex-col rounded-2xl xs:rounded-3xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      isPopular
                        ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 shadow-xl shadow-blue-500/10'
                        : 'border-white/10 bg-gray-900/40 hover:border-white/20'
                    } backdrop-blur-xl`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 xs:-top-4 left-1/2 transform -translate-x-1/2">
                        <span className="inline-flex items-center px-3 xs:px-4 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-semibold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-col h-full px-6 xs:px-8 py-6 xs:py-8">
                      <div className="text-center mb-6 xs:mb-8">
                        <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-white mb-2 xs:mb-3">{tier.name}</h3>
                        <p className="text-sm xs:text-base text-gray-400 leading-relaxed px-2">{tier.description}</p>
                      </div>
                      
                      <div className="text-center mb-6 xs:mb-8">
                        <div className="flex items-baseline justify-center gap-1 xs:gap-2">
                          <span className="text-3xl xs:text-4xl sm:text-5xl font-bold text-white">{pricing.symbol}{pricing.amount}</span>
                          <span className="text-base xs:text-lg text-gray-400">{periodLabel}</span>
                        </div>
                        {billingPeriod === 'yearly' && (
                          <p className="text-xs xs:text-sm text-green-400 mt-2">Save 20% vs monthly</p>
                        )}
                      </div>
                      
                      <ul className="space-y-3 xs:space-y-4 mb-6 xs:mb-8 flex-grow">
                        {tier.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <CheckIcon className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm xs:text-base text-gray-300 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-auto">
                        {user ? (
                          <RazorpayButton
                            amount={pricing.amount}
                            currency={pricing.currency}
                            billingPeriod={billingPeriod}
                            label={isPopular ? 'Get Started' : `Choose ${tier.name}`}
                            notes={{ plan: tier.id }}
                            user_id={user.id}
                            plan_id={tier.id}
                            disabled={geoLoading}
                            className={`w-full py-3 xs:py-4 rounded-xl xs:rounded-2xl font-semibold text-sm xs:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                              isPopular
                                ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-700/60 hover:bg-gray-600/60 text-white border border-white/10 hover:border-white/20'
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
                            disabled={geoLoading}
                            className={`w-full py-3 xs:py-4 rounded-xl xs:rounded-2xl font-semibold text-sm xs:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                              isPopular
                                ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-700/60 hover:bg-gray-600/60 text-white border border-white/10 hover:border-white/20'
                            }`}
                          >
                            {geoLoading ? 'Loading...' : (isPopular ? 'Get Started' : `Choose ${tier.name}`)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Info */}
            <div className="mt-12 xs:mt-16 sm:mt-20 text-center">
              <div className="inline-flex items-center gap-2 px-4 xs:px-6 py-2 xs:py-3 rounded-full bg-gray-800/40 border border-white/10 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm xs:text-base text-gray-300">7-day free trial • No credit card required • Cancel anytime</span>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-8 xs:mt-12 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm xs:text-base text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isSignInModalOpen && (
        <SignInPromptModal onClose={() => setIsSignInModalOpen(false)} />
      )}
    </>
  );
}