'use client';
import { motion } from 'framer-motion';
import RazorpayButton from '@/components/RazorpayButton';
import { PRICING_TIERS } from '@/lib/constants/pricing';
import { useState } from 'react';
import { getAllTiersPricing } from '@/lib/utils/geolocation-pricing';

interface PricingSectionProps {
  user: any;
  loading: boolean;
  setShowSignInModal: (show: boolean) => void;
}

export default function PricingSection({
  user,
  loading,
  setShowSignInModal,
}: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  // Use simplified INR-only pricing
  const { currency, symbol, isIndia } = { currency: 'INR' as const, symbol: '₹' as const, isIndia: true };
  
  // Get all tiers with INR pricing
  const tiersWithPricing = getAllTiersPricing('INR', billingPeriod);

  const pricingFeatures = {
    free: [
      '100 Conversations / Month',
      'Basic Knowledge Base (500 words)',
      '1 Knowledge Upload',
      'Basic AI Chatbot',
      'Website Embedding',
    ],
    basic: [
      '1,000 Conversations / Month',
      'Standard Knowledge Base (2,000 words)',
      '4 Knowledge Uploads',
      'Basic AI Chatbot',
      'Website Embedding',
    ],
    pro: [
      'Unlimited Conversations',
      'Expanded Knowledge Base (15,000 words)',
      '10 Knowledge Uploads',
      'Basic Chatbot Customization',
      'Automated Lead Capture',
      'Priority Support',
    ],
    ultra: [
      'Everything in Pro',
      'Maximum Knowledge Base (50,000 words)', 
      '25 Knowledge Uploads',
      'Full Brand Customization',
      'Advanced Lead Capture',
      'Priority Support Queue',
    ],
  } as const;

  const CheckIcon = () => (
    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
  );

  const periodLabel = billingPeriod === 'monthly' ? '/month' : '/year';
  const discountBadge = billingPeriod === 'yearly' ? (
    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-600/20 text-green-300 border border-green-500/30">20% off</span>
  ) : null;

  return (
    <section id="pricing" className="relative py-20 lg:py-32 bg-black overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-purple-950/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
          >
            Choose Your Perfect Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Transform your customer support with AI-powered chatbots. Start free, then scale with transparent pricing.
          </motion.p>
          
          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-1 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 px-1 py-1 rounded-2xl shadow-lg"
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                billingPeriod === 'monthly' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                billingPeriod === 'yearly' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                20% OFF
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {tiersWithPricing.map((tierWithPricing, index) => {
            const { pricing, ...plan } = tierWithPricing;
            const features = pricingFeatures[plan.id as keyof typeof pricingFeatures] || [];
            const isPopular = plan.id === 'pro';
            const isFree = plan.id === 'free';
            const isEnterprise = plan.id === 'ultra';
            const equivalentMonthlyInr = (billingPeriod === 'yearly' && currency === 'INR') ? Math.round((pricing.amount / 12)) : null;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative ${isPopular ? 'lg:scale-105' : ''}`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md border border-blue-400/20">
                      Most Popular
                    </div>
                  </motion.div>
                )}

                {/* Card */}
                <div
                  className={`relative h-full rounded-2xl border transition-all duration-300 group hover:scale-[1.02] ${
                    isPopular
                      ? 'bg-gradient-to-br from-blue-950/50 via-gray-900/90 to-purple-950/50 border-blue-500/50 shadow-xl shadow-blue-500/20'
                      : isFree
                      ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-600/30 hover:border-gray-500/50'
                      : isEnterprise
                      ? 'bg-gradient-to-br from-purple-950/50 via-gray-900/90 to-indigo-950/50 border-purple-500/40 hover:border-purple-400/60'
                      : 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-600/40 hover:border-blue-400/60'
                  } backdrop-blur-sm hover:shadow-2xl`}
                >
                  <div className="p-6 lg:p-8 h-full flex flex-col">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <h3 className={`text-2xl font-bold mb-2 ${
                        isPopular ? 'text-white' : 
                        isFree ? 'text-green-400' : 
                        isEnterprise ? 'text-purple-300' : 'text-white'
                      }`}>
                        {plan.name}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {plan.description || 'Perfect for your needs'}
                      </p>
                    </div>
                    
                    {/* Pricing */}
                    <div className="text-center mb-8">
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        {isFree ? (
                          <span className="text-4xl lg:text-5xl font-bold text-green-400">FREE</span>
                        ) : (
                          <>
                            <span className="text-2xl font-semibold text-gray-400">{pricing.symbol}</span>
                            <span className="text-4xl lg:text-5xl font-bold text-white">{pricing.amount}</span>
                            <span className="text-gray-400 text-lg">{periodLabel}</span>
                          </>
                        )}
                      </div>
                      {!isFree && billingPeriod === 'yearly' && (
                        <div className="text-xs text-green-400 font-medium">
                          Save 20% annually
                        </div>
                      )}
                      {equivalentMonthlyInr && (
                        <div className="text-xs text-gray-500">
                          Effective: ₹{equivalentMonthlyInr}/month
                        </div>
                      )}
                    </div>
                    
                    {/* Features */}
                    <div className="flex-1 mb-8">
                      <ul className="space-y-3">
                        {features.map((feature, fIndex) => (
                          <motion.li
                            key={fIndex}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: fIndex * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <CheckIcon />
                            <span className="text-gray-300 text-sm leading-relaxed flex-1">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="mt-auto">
                      {user && user.id ? (
                        <RazorpayButton
                          amount={pricing.amount}
                          currency={pricing.currency}
                          billingPeriod={billingPeriod}
                          label={
                            isFree ? 'Start Free' :
                            isPopular ? 'Get Started' : 
                            `Choose ${plan.name}`
                          }
                          notes={{ plan: plan.id }}
                          user_id={user.id}
                          plan_id={plan.id}
                          disabled={loading}
                          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isFree
                              ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-500/25'
                              : isPopular
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25'
                              : isEnterprise
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25'
                              : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white border border-gray-500/30'
                          } transform hover:scale-[1.02] active:scale-[0.98]`}
                          onSuccess={() => { window.location.href = '/dashboard'; }}
                          onFailure={(e) => { 
                            console.log('Payment failed:', e);
                            alert(`Payment failed: ${e?.error?.description || 'Unknown error'}`); 
                          }}
                        />
                      ) : (
                        <button
                          onClick={() => setShowSignInModal(true)}
                          disabled={loading}
                          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isFree
                              ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-500/25'
                              : isPopular
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25'
                              : isEnterprise
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25'
                              : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white border border-gray-500/30'
                          } transform hover:scale-[1.02] active:scale-[0.98]`}
                        >
                          {loading ? 'Loading...' : 
                           isFree ? 'Start Free' :
                           isPopular ? 'Get Started' : 
                           `Choose ${plan.name}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-900/40 border border-gray-700/30 backdrop-blur-sm">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300 text-sm font-medium">Setup in 5 minutes</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-900/40 border border-gray-700/30 backdrop-blur-sm">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-gray-300 text-sm font-medium">24/7 AI support</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-900/40 border border-gray-700/30 backdrop-blur-sm">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-gray-300 text-sm font-medium">Cancel anytime</span>
            </div>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-gray-400 text-sm mt-8 max-w-2xl mx-auto"
          >
            Join thousands of businesses already using TrulyBot to automate customer support and increase sales. 
            Start with our Ultra plan free trial - no commitment required.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}