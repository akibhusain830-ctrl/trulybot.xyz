'use client';
import Link from 'next/link';
import { motion, cubicBezier } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

interface HeroProps {
  user?: any;
}

export default function Hero({ user }: HeroProps) {
  const { loading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.2
      } 
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8,
        ease: cubicBezier(0.25, 0.46, 0.45, 0.94)
      } 
    }
  };

  return (
    <section 
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center text-center overflow-hidden bg-black"
      style={{ 
        minHeight: 'max(80vh, calc(100vh - 80px))',
        backgroundColor: '#000000',
        paddingTop: 'max(40px, env(safe-area-inset-top))',
        paddingBottom: 'max(40px, env(safe-area-inset-bottom))'
      }}
      role="banner"
      suppressHydrationWarning
    >
      {/* Animated Gradient Mesh Background - Only render on client */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Gradient Orbs */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
              x: [0, -30, 0],
              y: [0, 50, 0]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, -40, 0],
              y: [0, -30, 0]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          {/* Radial Spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60" />
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center relative z-20">
        {!isClient ? (
          // Server-side render: Simple static content
          <div className="flex flex-col items-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-md shadow-lg shadow-cyan-500/10">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 shadow-lg shadow-cyan-400/50"></span>
              <span className="text-cyan-300 text-sm font-medium">AI-Powered Customer Support</span>
            </div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight max-w-5xl">
              <span className="inline-block bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Your Lightning-Fast AI Support and{' '}
              </span>
              <span className="inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Lead Generation Agent
              </span>
            </h1>
            
            <p className="text-slate-300 text-base xs:text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto font-light leading-relaxed px-4">
              Deploy a thunderbolt-speed AI agent that instantly answers customer questions, reduces support team load by 70%, and captures qualified leads—all without coding. Lightning-fast setup in minutes.
            </p>
          </div>
        ) : (
          // Client-side render: Full animated content
          <motion.div 
            variants={heroVariants} 
            initial="hidden" 
            animate="visible"
            className="flex flex-col items-center space-y-4"
          >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-md shadow-lg shadow-cyan-500/10"
          >
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse shadow-lg shadow-cyan-400/50"></span>
            <span className="text-cyan-300 text-sm font-medium">AI-Powered Customer Support</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-5xl"
          >
            {/* Enhanced Lightning Bolt */}
            <motion.svg 
              width="72" 
              height="72" 
              viewBox="0 0 512 512" 
              fill="none"
              className="inline-block mr-3 -mt-2"
              animate={{ 
                filter: [
                  'drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))',
                  'drop-shadow(0 0 30px rgba(6, 182, 212, 0.8))',
                  'drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))'
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <defs>
                <linearGradient id="heroLightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#06B6D4', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#8B5CF6', stopOpacity: 1}} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <polygon 
                fill="url(#heroLightningGradient)"
                points="320,8 136,296 248,296 192,504 400,216 288,216"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
              <polygon 
                fill="#ffffff"
                opacity="0.4"
                points="310,20 146,290 240,290 200,480 380,220 280,220"
              />
            </motion.svg>
            <span className="inline-block bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              Turn Customer Questions Into{' '}
            </span>
            <span className="inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shine drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              Revenue Growth
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-slate-300 text-base xs:text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto font-light leading-relaxed px-4"
          >
            AI chatbot that answers instantly, cuts support tickets by 70%, and captures qualified leads around the clock. Zero coding required. Setup in 5 minutes.
          </motion.p>

          {/* Stats - Enhanced with Cards */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4 xs:gap-6 mt-4 px-4 w-full max-w-3xl"
          >
            {/* 24/7 Support Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="group relative flex-1 min-w-[140px] backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 via-cyan-600/5 to-transparent rounded-2xl p-6 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/0 to-cyan-600/0 group-hover:from-cyan-400/10 group-hover:to-cyan-600/5 transition-all duration-300" />
              
              <div className="relative text-center">
                <div className="mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="text-2xl xs:text-3xl font-bold bg-gradient-to-r from-cyan-300 to-cyan-400 bg-clip-text text-transparent mb-1">
                  24/7
                </div>
                <div className="text-xs xs:text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  Support Availability
                </div>
              </div>

              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-cyan-500/20 via-transparent to-cyan-500/20 bg-[length:200%_100%] animate-shimmer" />
            </motion.div>

            {/* 70% Ticket Reduction Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="group relative flex-1 min-w-[140px] backdrop-blur-xl bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/10 group-hover:to-blue-600/5 transition-all duration-300" />
              
              <div className="relative text-center">
                <div className="mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div className="text-2xl xs:text-3xl font-bold bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent mb-1">
                  70%
                </div>
                <div className="text-xs xs:text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  Ticket Reduction
                </div>
              </div>

              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20 bg-[length:200%_100%] animate-shimmer" />
            </motion.div>

            {/* 5min Setup Time Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="group relative flex-1 min-w-[140px] backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/0 to-purple-600/0 group-hover:from-purple-400/10 group-hover:to-purple-600/5 transition-all duration-300" />
              
              <div className="relative text-center">
                <div className="mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="text-2xl xs:text-3xl font-bold bg-gradient-to-r from-purple-300 to-purple-400 bg-clip-text text-transparent mb-1">
                  5min
                </div>
                <div className="text-xs xs:text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  Setup Time
                </div>
              </div>

              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500/20 via-transparent to-purple-500/20 bg-[length:200%_100%] animate-shimmer" />
            </motion.div>
          </motion.div>

          {/* CTA Button - Single Primary CTA */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-center items-center mt-8 px-4 w-full"
          >
            {/* Primary CTA */}
            <Link 
              href={authLoading ? "#" : (user ? "/start-trial" : "/sign-up")}
              className={`group relative bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 active:scale-95 min-h-[56px] flex items-center justify-center overflow-hidden ${authLoading ? 'cursor-wait opacity-75' : ''}`}
              aria-label="Start 7-Day Free Trial"
              onClick={authLoading ? (e) => e.preventDefault() : undefined}
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
                {authLoading ? 'Loading...' : 'Start 7-Day Free Trial'}
                {!authLoading && (
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </span>
            </Link>
          </motion.div>

          {/* Trial Indicator with Urgency */}
          <motion.div
            variants={itemVariants}
            className="mt-6 text-center max-w-md mx-auto px-4"
          >
            <p className="text-slate-400 text-sm mb-2">
              We offer a 7-day free trial of Enterprise plan • No credit card required
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                12 people signed up today
              </span>
            </div>
          </motion.div>

          {/* Trust Signals - Logo Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-12 w-full"
          >
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-4">Trusted by businesses worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-300">
              {/* Placeholder for company logos - you can replace with actual logos */}
              <div className="text-slate-400 font-semibold text-sm px-6 py-2 border border-slate-700/50 rounded-lg">E-commerce</div>
              <div className="text-slate-400 font-semibold text-sm px-6 py-2 border border-slate-700/50 rounded-lg">SaaS</div>
              <div className="text-slate-400 font-semibold text-sm px-6 py-2 border border-slate-700/50 rounded-lg">Retail</div>
              <div className="text-slate-400 font-semibold text-sm px-6 py-2 border border-slate-700/50 rounded-lg">Tech</div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </div>

      {/* Scroll Indicator - Only on client */}
      {isClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-slate-400/60 hover:text-cyan-400 transition-colors cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}