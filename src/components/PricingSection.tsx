'use client';
import { motion } from 'framer-motion';
import RazorpayButton from '@/components/RazorpayButton';
import { PRICING_TIERS } from '@/lib/constants/pricing';
import { useState } from 'react';
import { useServerSafeCurrency } from '@/hooks/useServerSafeCurrency';
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
  
  // Use our robust currency detection system
  const { currency, symbol, isIndia, country, isLoading: isGeoLoading } = useServerSafeCurrency();
  
  // Get all tiers with appropriate pricing
  const tiersWithPricing = getAllTiersPricing(currency, billingPeriod);

  const pricingFeatures = {
    basic: [
      'Core AI Chatbot',
      '1,000 Conversations / Month',
      'Standard Knowledge Base',
    ],
    pro: [
      'Unlimited Conversations',
      'Limited Chatbot Customization',
      'Automated Lead Capture',
    ],
    ultra: [
      'Full Chatbot Customization',
      'Maximum Knowledge Base',
      'Advanced Automated Lead Capture',
    ],
  } as const;

  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-400 flex-shrink-0">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  const periodLabel = billingPeriod === 'monthly' ? '/month' : '/year';
  const discountBadge = billingPeriod === 'yearly' ? (
    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-600/20 text-green-300 border border-green-500/30">20% off</span>
  ) : null;

  return (
    <section id="pricing" className="relative py-40 bg-black">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 pt-8"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight md:leading-[1.15] bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent pb-2"
          >
            Fair pricing for every stage
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Start free, scale as you grow. No hidden fees, no surprises.
          </motion.p>
          <div className="mt-8 inline-flex items-center gap-4 bg-gray-800/40 border border-white/10 px-2 py-2 rounded-2xl">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${billingPeriod === 'monthly' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:text-white'}`}
            >Monthly</button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${billingPeriod === 'yearly' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:text-white'}`}
            >Yearly <span className="hidden sm:inline">(Save 20%)</span></button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {isGeoLoading ? (
              <span>Detecting your location...</span>
            ) : (
              <span>
                Pricing shown in {currency}. 
                {isIndia ? ' Detected India region.' : ` Detected ${country} region.`}
                {currency === 'INR' && !isIndia && ' (Using INR as fallback)'}
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch pb-12">
          {tiersWithPricing.map((tierWithPricing, index) => {
            const { pricing, ...plan } = tierWithPricing;
            const features = pricingFeatures[plan.id as keyof typeof pricingFeatures] || [];
            const isPopular = plan.id === 'pro';
            const isPremium = plan.id === 'pro' || plan.id === 'ultra';
            const equivalentMonthlyInr = (billingPeriod === 'yearly' && currency === 'INR') ? Math.round((pricing.amount / 12)) : null;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="flex justify-center"
              >
                <div className={`relative w-full max-w-sm flex flex-col ${isPopular ? 'lg:-mt-4 lg:mb-4' : 'my-4'}`}>
                  {isPopular && (
                    <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} className="mb-6 text-center">
                      <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-2xl shadow-blue-500/25">
                        Most Popular
                      </span>
                    </motion.div>
                  )}
                  <div
                    className={[
                      'flex flex-col rounded-3xl px-7 pt-7 pb-6 border h-full transition-all duration-300 group',
                      'bg-[#0B0B10]',
                      isPremium ? 'bg-gradient-to-br from-[#0B0F1A] via-[#0B0B10] to-[#06070A] border-blue-500/40' : 'border-white/5 hover:border-white/10',
                      isPopular ? 'shadow-xl shadow-blue-800/30' : 'shadow-lg',
                      'hover:shadow-blue-500/20 hover:-translate-y-1',
                    ].join(' ')}
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold text-white">{pricing.symbol}{pricing.amount}</span>
                        <span className="text-gray-400 text-xl">{periodLabel}</span>
                        {discountBadge && billingPeriod === 'yearly' && discountBadge}
                      </div>
                      {equivalentMonthlyInr && (
                        <div className="mt-2 text-xs text-gray-500">≈ ₹{equivalentMonthlyInr}/mo effective</div>
                      )}
                    </div>
                    <ul className="space-y-4 mb-6">
                      {features.map((feature, fIndex) => (
                        <motion.li
                          key={fIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: fIndex * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <CheckIcon />
                          <span className="text-gray-300 text-base leading-relaxed">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-white/5">
                      {user && user.id ? (
                        <RazorpayButton
                          amount={pricing.amount}
                          currency={pricing.currency}
                          billingPeriod={billingPeriod}
                          label={isPopular ? 'Get Started' : `Choose ${plan.name}`}
                          notes={{ plan: plan.id }}
                          user_id={user.id}
                          plan_id={plan.id}
                          disabled={loading || isGeoLoading}
                          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isPremium
                              ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:brightness-110 text-white shadow-md'
                              : 'bg-gray-700/60 hover:bg-gray-600/60 text-white border border-white/5 hover:border-white/10'
                          }`}
                          onSuccess={() => { window.location.href = '/dashboard'; }}
                          onFailure={(e) => { 
                            console.log('Payment failed:', e);
                            alert(`Payment failed: ${e?.error?.description || 'Unknown error'}`); 
                          }}
                        />
                      ) : (
                        <button
                          onClick={() => setShowSignInModal(true)}
                          disabled={loading || isGeoLoading}
                          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isPremium
                              ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:brightness-110 text-white shadow-md'
                              : 'bg-gray-700/60 hover:bg-gray-600/60 text-white border border-white/5 hover:border-white/10'
                          }`}
                        >
                          {loading ? 'Loading...' : (isPopular ? 'Get Started' : `Choose ${plan.name}`)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-20 pb-8"
        >
          <p className="text-gray-400 text-lg rounded-2xl py-4 px-8 inline-block">
            We also offer a 7-day free trial of Ultra plan. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}