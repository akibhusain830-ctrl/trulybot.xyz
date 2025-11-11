"use client"

import { motion } from 'framer-motion';
import { CheckCircle2, Zap, BarChart3, MessageSquare } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: "Connect Your Store",
    description: "Install Trulybot via WordPress plugin or Shopify app in just one click. No coding required.",
    icon: Zap,
  },
  {
    number: 2,
    title: "Auto-Deployment",
    description: "Trulybot automatically deploys a live chatbot widget to your website. Customers access it via a beautiful popup.",
    icon: BarChart3,
  },
  {
    number: 3,
    title: "Auto-Learning Phase",
    description: "Trulybot automatically learns everything from your store — products, policies, FAQs, and inventory.",
    icon: MessageSquare,
  },
  {
    number: 4,
    title: "Start Answering",
    description: "Your AI chatbot instantly answers customer questions 24/7 with perfect accuracy and brand voice.",
    icon: CheckCircle2,
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-[72px] sm:py-24 bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-cyan-600/20 to-transparent rounded-full blur-[120px] -z-10" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
              <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Simple Setup Process
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          >
            How Trulybot Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-white/70"
          >
            Get your AI support assistant running in 4 simple steps. Chatbot deploys automatically to your store.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Glassmorphic card */}
                <div className="relative h-full p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-xl" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Step number with gradient background */}
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 mb-4">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>

                    {/* Step number circle */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {step.number}
                      </span>
                      <span className="text-sm text-white/50">of {steps.length}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-2 text-white">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/70 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Bottom accent line animation */}
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-8 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300" />
                  </div>
                </div>

                {/* Connecting line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 w-6 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-white/70 mb-6">
            Ready to automate your customer support?
          </p>
          <button className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300">
            Start Free
          </button>
        </motion.div>
      </div>
    </section>
  );
};
