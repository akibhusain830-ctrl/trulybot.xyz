'use client';
import { motion } from 'framer-motion';
import RazorpayButton from '@/components/RazorpayButton';
import { PRICING_TIERS } from '@/lib/constants/pricing';

interface PricingSectionProps {
  user: any;
  loading: boolean;
  currency: 'INR' | 'USD';
  isGeoLoading: boolean;
  setShowSignInModal: (show: boolean) => void;
}

export default function PricingSection({
  user,
  loading,
  currency,
  isGeoLoading,
  setShowSignInModal,
}: PricingSectionProps) {
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
  };

  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-400 flex-shrink-0">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  return (
    <section
      id="pricing"
      className="relative py-40 bg-black"
    >
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24 pt-8"
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
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start pb-12">
          {PRICING_TIERS.map((plan, index) => {
            const price = currency === 'INR' ? plan.monthlyInr : plan.monthlyUsd;
            // THE FIX IS ON THIS LINE:
            const symbol = currency === 'INR' ? '₹' : '$';
            const features = pricingFeatures[plan.id as keyof typeof pricingFeatures] || [];
            const isPopular = plan.id === 'pro';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="flex justify-center"
              >
                <div
                  className={`relative w-full max-w-sm flex flex-col ${
                    isPopular ? 'lg:-mt-4 lg:mb-4' : 'my-4'
                  }`}
                >
                  {isPopular && (
                    <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} className="mb-6 text-center">
                      <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-2xl shadow-blue-500/25">
                        Most Popular
                      </span>
                    </motion.div>
                  )}
                  <div
                    className={`flex flex-col flex-grow bg-gradient-to-b from-gray-900/60 to-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-500 hover:scale-105 h-full ${
                      isPopular
                        ? 'border-blue-500/50 shadow-2xl shadow-blue-500/30'
                        : 'border-white/5 hover:border-white/10 shadow-xl'
                    }`}
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold text-white">{symbol}{price}</span>
                        <span className="text-gray-400 text-xl">/month</span>
                      </div>
                    </div>
                    <div className="mb-8 flex-grow min-h-[180px] flex items-center">
                      <ul className="space-y-4 w-full">
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
                    </div>
                    <div className="mt-auto">
                      {user ? (
                        <RazorpayButton
                          amount={price}
                          currency={currency}
                          label={isPopular ? 'Get Started' : `Choose ${plan.name}`}
                          notes={{ plan: plan.id }}
                          user_id={user.id}
                          plan_id={plan.id}
                          disabled={loading || isGeoLoading}
                          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                            isPopular
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gray-700/50 hover:bg-gray-600/50 text-white border border-white/5 hover:border-white/10'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          onSuccess={() => {
                            window.location.href = '/dashboard';
                          }}
                          onFailure={(e) => {
                            alert(`Payment failed: ${e?.error?.description || 'Unknown error'}`);
                          }}
                        />
                      ) : (
                        <button
                          onClick={() => setShowSignInModal(true)}
                          disabled={loading || isGeoLoading}
                          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                            isPopular
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gray-700/50 hover:bg-gray-600/50 text-white border border-white/5 hover:border-white/10'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isPopular ? 'Get Started' : `Choose ${plan.name}`}
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
          <p className="text-gray-400 text-lg bg-black/30 rounded-2xl py-4 px-8 inline-block backdrop-blur-sm border border-white/5">
            We also offer a 7-day free trial of Ultra plan. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}