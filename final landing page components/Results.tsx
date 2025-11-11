"use client"

import { motion } from 'framer-motion';
import { DollarSign, Zap, Brain, Globe, MapPin, TrendingDown } from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: "Start FREE - ₹0 to ₹2,999/month",
    description: "No credit card. No hidden fees. Cancel anytime.",
  },
  {
    icon: Zap,
    title: "Setup in <5 minutes",
    description: "Not days. Not hours. Minutes.",
  },
  {
    icon: Brain,
    title: "Auto-learns your products",
    description: "No manual training. No coding.",
  },
  {
    icon: Globe,
    title: "Works on WordPress + Shopify",
    description: "Both platforms, one tool.",
  },
  {
    icon: MapPin,
    title: "Made for Indian stores",
    description: "INR pricing. India support. India timezone.",
  },
  {
    icon: TrendingDown,
    title: "Real Results",
    description: "65% fewer tickets. 80% faster responses. 24/7 support.",
  },
];

export const Results = () => {
  return (
    <section id="why-trulybot" className="relative py-[72px] sm:py-24 bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-gradient-to-br from-purple-600/15 to-transparent rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-20 w-[400px] h-[400px] bg-gradient-to-tl from-cyan-600/15 to-transparent rounded-full blur-[120px] -z-10" />

      <div className="container relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Why Store Owners Love Trulybot
          </h2>
          <p className="text-xl text-white/70">
            Simple. Powerful. Built for you.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative h-full p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 overflow-hidden hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-xl" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start gap-4">
                      {/* Icon container */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-500/60 transition-colors">
                        <Icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                      </div>

                      {/* Text content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/80 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {benefit.title}
                          </h3>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-8 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 overflow-hidden group">
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-xl" />
            </div>

            <div className="relative z-10 text-center">
              <p className="text-lg font-semibold text-white mb-2">
                BOTTOM LINE
              </p>
              <p className="text-white/90 text-lg">
                Better than hiring support. Cheaper than hiring.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-block px-6 py-3 rounded-xl backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-cyan-500/40 transition-all">
            <p className="text-sm text-white/70">
              Trusted by <span className="font-semibold text-cyan-400">200+ Indian e-commerce stores</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};