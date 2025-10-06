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
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const detectCurrency = async () => {
      try {
        // Method 1: Client-side timezone detection (fastest, most reliable)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Check for Indian timezones
        if (timezone === 'Asia/Kolkata' || timezone === 'Asia/Calcutta') {
          setCurrency('INR');
          setGeoLoading(false);
          return;
        }



        // Method 2: Fallback to server-side geolocation API
        const res = await fetch('/api/geolocation');
        if (res.ok) {
          const data = await res.json();
          const detectedCurrency = data.currency || (data.country === 'IN' ? 'INR' : 'USD');
          setCurrency(detectedCurrency);
        } else {
          throw new Error('Server geolocation failed');
        }
      } catch (e: any) {
        // Method 3: Final fallback - check Accept-Language header patterns
        const language = navigator.language || navigator.languages?.[0] || '';
        if (language.includes('hi') || language.includes('IN')) {
          setCurrency('INR');
        } else {
          setCurrency('USD'); // Default to USD for international users
        }
        setGeoError('Using fallback detection');
      } finally {
        setGeoLoading(false);
      }
    };

    detectCurrency();
  }, [mounted]);

  function planPrice(tier: typeof PRICING_TIERS[number]) {
    if (billingPeriod === 'monthly') return currency === 'INR' ? tier.monthlyInr : tier.monthlyUsd;
    const yearly = currency === 'INR' ? tier.yearlyInr : tier.yearlyUsd;
    return currency === 'INR' ? Math.round(yearly) : Number(yearly.toFixed(2));
  }



  const symbol = currency === 'INR' ? '₹' : '$';
  const periodLabel = billingPeriod === 'monthly' ? '/month' : '/year';

  // Prevent hydration mismatch by showing loading until mounted
  if (!mounted) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-400">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPricingJsonLd()) }}
      />
      <div className="relative min-h-screen bg-black py-16 xs:py-20 sm:py-24 lg:py-32 overflow-hidden touch-manipulation">
        {/* Animated Background Elements - Responsive */}
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
            <p id="pricing-intro" className="mx-auto max-w-3xl text-base xs:text-lg sm:text-xl leading-relaxed text-gray-400 text-center px-4 xs:px-0">
              <span className="block xs:inline">Scale your customer service with AI that understands your business.</span>
              <span className="block xs:inline mt-2 xs:mt-0 xs:ml-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-medium">Start free, upgrade when you need more power.</span>
            </p>

            {/* Billing Period Toggle - Mobile Optimized */}
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
                    <span className="block xs:inline xs:ml-2 mt-0.5 xs:mt-0 text-[10px] xs:text-xs px-1.5 xs:px-2.5 py-0.5 xs:py-1 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Currency Display - Mobile Optimized */}
            <div className="mt-6 xs:mt-8 text-center px-4">
              {geoLoading ? (
                <div className="inline-flex items-center gap-2 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full bg-gray-800/40 backdrop-blur-sm border border-white/10">
                  <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-xs xs:text-sm text-gray-400">Detecting your region...</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 xs:gap-3 px-3 xs:px-5 py-1.5 xs:py-2.5 rounded-full bg-gray-800/40 backdrop-blur-sm border border-white/10 max-w-full">
                  <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                  <span className="text-xs xs:text-sm text-gray-300 truncate">
                    <span className="hidden xs:inline">Pricing in </span>
                    <span className="font-semibold text-white">{currency}</span>
                    <span className="hidden sm:inline"> • {currency === 'INR' ? 'India detected' : 'International pricing'}</span>
                    <span className="xs:hidden sm:hidden"> {currency === 'INR' ? 'IN' : 'INTL'}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Pricing Cards - Mobile Optimized */}
            <div className="isolate mx-auto mt-12 xs:mt-16 sm:mt-20 lg:mt-24 px-4 xs:px-6 sm:px-0">
              {/* Mobile: Stack cards vertically, Tablet+: 3-column grid */}
              <div className="grid grid-cols-1 gap-6 xs:gap-8 max-w-sm mx-auto sm:max-w-none sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-8">
                {PRICING_TIERS.map((tier, index) => {
                  const isPremium = tier.highlight;
                  return (
                    <div
                      key={tier.id}
                      className={`group relative flex flex-col justify-between rounded-2xl xs:rounded-3xl p-6 xs:p-8 xl:p-10 backdrop-blur-xl transition-all duration-500 ${
                        // Mobile: No hover scaling for better touch performance, Tablet+: hover scaling
                        'sm:hover:scale-105 active:scale-95 sm:active:scale-100 '
                      }${
                        isPremium
                          ? 'bg-gradient-to-br from-blue-900/20 via-indigo-900/15 to-blue-900/20 border border-blue-500/30 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500/20'
                          : 'bg-gray-800/30 border border-white/10 shadow-xl shadow-black/20 hover:border-white/20 hover:shadow-2xl hover:shadow-black/30'
                      } ${
                        // Mobile responsive transform for premium cards
                        isPremium ? 'sm:scale-105' : 'scale-100'
                      }`}
                      style={{ 
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                    {/* Glow effect for premium */}
                    {isPremium && (
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl opacity-20 blur group-hover:opacity-30 transition-opacity duration-500" />
                    )}
                    
                    {isPremium && (
                      <div className="absolute -top-4 xs:-top-5 sm:-top-6 left-0 right-0 mx-auto w-32 xs:w-36 sm:w-40 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 text-xs xs:text-sm font-bold text-white text-center shadow-xl shadow-blue-500/25 border border-blue-400/30">
                        <span className="xs:hidden">⭐ Popular</span>
                        <span className="hidden xs:inline">⭐ Most Popular</span>
                      </div>
                    )}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-x-4 mb-4 xs:mb-6">
                        <div>
                          <h3 className={`text-xl xs:text-2xl font-bold leading-tight xs:leading-8 ${
                            isPremium 
                              ? 'bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent' 
                              : 'text-white'
                          }`}>
                            {tier.name}
                          </h3>
                          <div className={`mt-1.5 xs:mt-2 h-0.5 xs:h-1 w-8 xs:w-12 rounded-full ${
                            isPremium ? 'bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500' : 'bg-gray-600'
                          }`} />
                        </div>
                      </div>
                      
                      <p className="text-sm xs:text-base leading-relaxed text-gray-300 mb-6 xs:mb-8">{tier.description}</p>
                      
                      <div className="mb-6 xs:mb-8">
                        <div className="flex items-baseline gap-x-1 xs:gap-x-2">
                          <span className={`text-3xl xs:text-4xl sm:text-5xl font-bold tracking-tight ${
                            isPremium 
                              ? 'bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent' 
                              : 'text-white'
                          }`}>
                            {symbol}{planPrice(tier)}
                          </span>
                          <span className="text-sm xs:text-base lg:text-lg font-medium text-gray-400">{periodLabel}</span>
                        </div>
                        {billingPeriod === 'yearly' && (
                          <p className="mt-1.5 xs:mt-2 text-xs xs:text-sm bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-medium">
                            Save {symbol}{currency === 'INR' 
                              ? Math.round((tier.monthlyInr * 12) - tier.yearlyInr)
                              : Math.round((tier.monthlyUsd * 12) - tier.yearlyUsd)
                            } per year
                          </p>
                        )}
                      </div>
                      
                      <ul role="list" className="space-y-3 xs:space-y-4 text-sm xs:text-base leading-6">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex gap-x-2 xs:gap-x-3 items-start">
                            <div className={`flex-shrink-0 w-4 h-4 xs:w-5 xs:h-5 rounded-full flex items-center justify-center mt-0.5 ${
                              isPremium 
                                ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600' 
                                : 'bg-gray-600'
                            }`}>
                              <CheckIcon className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-white" aria-hidden="true" />
                            </div>
                            <span className="text-gray-200 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-6 xs:pt-8 mt-6 xs:mt-8 border-t border-white/5 relative z-10">
                      {user && user.id ? (
                        <RazorpayButton
                          amount={currency === 'INR' ? (billingPeriod === 'yearly' ? tier.yearlyInr : tier.monthlyInr) : (billingPeriod === 'yearly' ? tier.yearlyUsd : tier.monthlyUsd)}
                          currency={currency}
                          billingPeriod={billingPeriod}
                          label={isPremium ? "Start Pro Trial" : "Get Started"}
                          notes={{
                            plan_name: tier.name,
                            plan_id: tier.id,
                            billing_period: billingPeriod
                          }}
                          user_id={user.id}
                          plan_id={tier.id}
                          onSuccess={() => { window.location.href = '/dashboard'; }}
                          onFailure={(e) => { 
                            console.log('Payment failed:', e);
                            alert(`Payment failed: ${e?.error?.description || 'Unknown error'}`); 
                          }}
                          className={`group relative w-full rounded-2xl px-6 py-4 text-center text-base font-bold transition-all duration-300 overflow-hidden ${
                            isPremium 
                              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105' 
                              : 'bg-slate-700/50 hover:bg-slate-600/60 text-white border border-slate-600/50 hover:border-slate-500/50 shadow-lg hover:shadow-xl hover:scale-105'
                          }`}
                        />
                      ) : (
                        <button
                          onClick={() => setIsSignInModalOpen(true)}
                          aria-describedby={tier.id}
                          className={`group relative w-full rounded-2xl px-6 py-4 text-center text-base font-bold transition-all duration-300 overflow-hidden ${
                            isPremium 
                              ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-400 hover:via-cyan-400 hover:to-blue-500 text-white shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105' 
                              : 'bg-gray-700/50 hover:bg-gray-600/60 text-white border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl hover:scale-105'
                          }`}
                        >
                          <span className="relative z-10">
                            {isPremium ? "Start Pro Trial" : "Get Started"}
                          </span>
                          {isPremium && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          )}
                        </button>
                      )}
                      
                      {/* Additional CTA text */}
                      <p className="mt-4 text-center text-sm text-gray-400">
                        {isPremium ? "Most popular choice" : "Start free, upgrade anytime"}
                      </p>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
            
            {/* Trust Indicators - Enhanced Design */}
            <div className="mt-12 xs:mt-16 sm:mt-20 text-center px-4">
              {/* Improved floating trust bar */}
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-center gap-4 xs:gap-8 lg:gap-12 px-6 xs:px-8 lg:px-12 py-6 xs:py-8 rounded-2xl bg-gradient-to-r from-gray-900/60 via-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 max-w-5xl mx-auto hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-3 text-white justify-center xs:justify-start group">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex-shrink-0 shadow-lg shadow-green-400/30 group-hover:shadow-green-400/50 transition-shadow duration-300" />
                  <span className="text-sm xs:text-base font-semibold tracking-wide">Setup in 5 minutes</span>
                </div>
                <div className="hidden xs:block w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent flex-shrink-0" />
                <div className="flex items-center gap-3 text-white justify-center xs:justify-start group">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex-shrink-0 shadow-lg shadow-blue-400/30 group-hover:shadow-blue-400/50 transition-shadow duration-300" />
                  <span className="text-sm xs:text-base font-semibold tracking-wide">Cancel anytime</span>
                </div>
                <div className="hidden xs:block w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent flex-shrink-0" />
                <div className="flex items-center gap-3 text-white justify-center xs:justify-start group">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex-shrink-0 shadow-lg shadow-purple-400/30 group-hover:shadow-purple-400/50 transition-shadow duration-300" />
                  <span className="text-sm xs:text-base font-semibold tracking-wide">24/7 support</span>
                </div>
              </div>
              
              <p className="mt-6 xs:mt-8 text-gray-400 text-xs xs:text-sm max-w-2xl mx-auto leading-relaxed px-2 xs:px-0">
                <span className="block xs:inline">Join thousands of businesses already using TrulyBot to transform their customer experience.</span>
                <span className="block xs:inline mt-1 xs:mt-0 xs:ml-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-medium"> No setup fees, no hidden costs.</span>
              </p>
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
    </>
  );
}