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

export const dynamic = 'force-dynamic';

// Helper function to build structured data for pricing
function buildPricingJsonLd(currency: 'USD' | 'INR') {
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
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        priceCurrency: currency,
        price: currency === 'INR' ? tier.monthlyInr : tier.monthlyUsd,
        billingPeriod: 'P1M'
      },
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
    }))
  };
}

export default function PricingClientPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Use server-safe currency detection to prevent hydration issues
  const { currency, symbol, isIndia, country, isLoading } = useServerSafeCurrency();
  
  // Track when component is mounted to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Get all tiers with appropriate pricing
  const tiersWithPricing = getAllTiersPricing(currency, billingPeriod);
  const periodLabel = billingPeriod === 'monthly' ? '/month' : '/year';

  // Show loading state until mounted to prevent hydration issues
  if (!isMounted || isLoading) {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPricingJsonLd(currency === 'INR' ? 'INR' : 'USD')) }}
      />
      <div className="relative min-h-screen bg-black py-12 overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          {/* Header Section - Moved Higher */}
          <div className="mx-auto max-w-4xl text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-300">Simple & Transparent Pricing</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight mb-4">
              <span className="block">Choose Your</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-300 mb-4">
              <span>Scale your customer service with AI that understands your business. </span>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-medium">Start free, upgrade when you need more power.</span>
            </p>

            {/* Currency Detection Status */}
            <div className="mb-6">
              <p className="text-sm text-gray-400">
                {isLoading ? (
                  <span>Detecting your location...</span>
                ) : (
                  <span>
                    Pricing shown in {currency}. 
                    {isIndia ? ' Detected India region.' : ` Detected ${country} region.`}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-12">
            <div className="relative bg-gray-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex gap-1">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    billingPeriod === 'monthly' 
                      ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    billingPeriod === 'yearly' 
                      ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  Yearly <span className="text-xs opacity-80 ml-1">(20% off)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {tiersWithPricing.map((tierWithPricing, index) => {
                const { pricing, ...tier } = tierWithPricing;
                const isPopular = tier.highlight;
                
                return (
                  <div key={tier.id} className="relative">
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div
                      className={`relative flex flex-col h-full rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                        isPopular
                          ? 'border-blue-500/50 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 shadow-xl shadow-blue-500/20 scale-105'
                          : 'border-gray-700/30 bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 hover:border-gray-600/40'
                      }`}
                    >
                      <div className="flex flex-col h-full p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-white mb-3">{tier.name}</h3>
                          <p className="text-gray-400 leading-relaxed">{tier.description}</p>
                        </div>
                        
                        {/* Price */}
                        <div className="text-center mb-8">
                          <div className="flex items-baseline justify-center gap-2">
                            <span className="text-5xl font-bold text-white">{pricing.symbol}{pricing.amount}</span>
                            <span className="text-xl text-gray-400">{periodLabel}</span>
                          </div>
                          {billingPeriod === 'yearly' && (
                            <p className="text-sm text-green-400 mt-2">Save 20% vs monthly</p>
                          )}
                        </div>
                        
                        {/* Features */}
                        <ul className="space-y-4 mb-8 flex-grow">
                          {tier.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-3">
                              <CheckIcon className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {/* CTA Button */}
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
                              disabled={isLoading}
                              className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isPopular
                                  ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                  : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white border border-gray-600/50 hover:border-gray-500/50 transform hover:scale-105'
                              }`}
                              onSuccess={() => { 
                                console.log('Payment successful');
                                setPurchasedPlan(tier.name);
                                setShowSuccessModal(true);
                              }}
                              onFailure={(e) => { 
                                console.log('Payment failed:', e);
                                const errorMsg = e?.error?.description || e?.description || 'Payment failed. Please try again.';
                                alert(`Payment failed: ${errorMsg}`); 
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => setIsSignInModalOpen(true)}
                              disabled={isLoading}
                              className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isPopular
                                  ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                  : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white border border-gray-600/50 hover:border-gray-500/50 transform hover:scale-105'
                              }`}
                            >
                              {isLoading ? 'Loading...' : (isPopular ? 'Get Started' : `Choose ${tier.name}`)}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900/80 border border-gray-700/30 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">7-day free trial • No credit card required • Cancel anytime</span>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {isSignInModalOpen && (
        <SignInPromptModal onClose={() => setIsSignInModalOpen(false)} />
      )}

      {/* Payment Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-slate-700 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
            <p className="text-slate-300 mb-6">
              Congratulations! You&apos;ve successfully subscribed to the{' '}
              <span className="font-semibold text-blue-400">{purchasedPlan}</span> plan.
            </p>
            <p className="text-sm text-slate-400 mb-6">
              You now have immediate access to all {purchasedPlan} plan features in your dashboard.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  window.location.href = `/dashboard?payment=success&plan=${purchasedPlan}`;
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-6 rounded-lg transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}