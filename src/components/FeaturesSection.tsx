'use client';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  const features = [
    {
      icon: (
        // Brain / AI chip hybrid icon
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="8" height="8" rx="2" />
          <path d="M10 2v4M14 2v4M10 18v4M14 18v4M2 10h4M2 14h4M18 10h4M18 14h4" />
          <path d="M12 12h.01" />
        </svg>
      ),
      title: "Create Your AI Expert",
      description: "Upload your FAQs, help docs, or product info. Instantly launch a trained AI chatbot that provides trustworthy, accurate answers for your customers—just like a seasoned support agent.",
      gradient: "from-blue-500/10 to-blue-600/5",
      border: "border-blue-500/20"
    },
    {
      icon: (
        <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 0-2 2v2l-3-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8z"/>
        </svg>
      ),
      title: "Engage Every Visitor",
      description: "Add the bot to your website with a single line of code. Every visitor gets instant, 24/7 support via a seamless, branded chat popup—boosting trust and satisfaction.",
      gradient: "from-purple-500/10 to-purple-600/5",
      border: "border-purple-500/20"
    },
    {
      icon: (
        // Upward trend / growth line over bars
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M7 15l4-4 3 3 5-7" />
          <circle cx="7" cy="15" r="1" />
          <circle cx="11" cy="11" r="1" />
          <circle cx="14" cy="14" r="1" />
          <circle cx="19" cy="7" r="1" />
        </svg>
      ),
      title: "Manage & Grow",
      description: "Your dashboard lets you customize the bot's look, track conversations, and manage all the valuable leads your AI captures—giving you full control as you scale.",
      gradient: "from-emerald-500/10 to-emerald-600/5",
      border: "border-emerald-500/20"
    }
  ];

  return (
    <section id="features" className="relative mt-36 py-24 bg-black">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/2 to-emerald-500/3" />
      
      {/* Floating Orbs - Very Subtle */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          >
            Your 24/7 AI Support Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Supercharged with smart features designed for modern e-commerce businesses
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className={`relative bg-gradient-to-br ${feature.gradient} backdrop-blur-sm rounded-3xl p-8 border ${feature.border} transition-all duration-300 group-hover:scale-105 h-full flex flex-col`}>
                
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed flex-grow">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
