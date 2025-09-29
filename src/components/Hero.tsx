'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeroProps {
  user?: any;
}

export default function Hero({ user }: HeroProps) {
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
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  };

  return (
    <section 
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center text-center overflow-hidden bg-black min-h-[80vh]"
      style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#000000' }}
      role="banner"
    >
      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center relative z-20">
        <motion.div 
          variants={heroVariants} 
          initial="hidden" 
          animate="visible"
          className="flex flex-col items-center space-y-8"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-cyan-300 text-sm font-medium">AI-Powered Customer Support</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight max-w-5xl"
          >
            Your 24/7 AI Support and{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shine">
              Lead Generation Agent
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-slate-300 text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto font-light leading-relaxed"
          >
            Deploy an AI agent that instantly answers customer questions, reduces support team load, and captures qualified leads—all without coding. Setup in minutes.
          </motion.p>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-8 mt-4 text-slate-400"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-300">24/7</div>
              <div className="text-sm">Support Availability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-300">70%</div>
              <div className="text-sm">Ticket Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-300">5min</div>
              <div className="text-sm">Setup Time</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Link 
              href={user ? "/start-trial" : "/sign-up"}
              className="group relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Start 7-Day Free Trial"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start 7-Day Free Trial 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <Link 
              href="/widget-demo"
              className="group border border-slate-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm hover:bg-slate-900/50 hover:border-slate-400 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="See Live Demo"
            >
              <span className="flex items-center justify-center gap-2">
                See Live Demo
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </Link>
          </motion.div>

          {/* Trial Indicator */}
          <motion.div
            variants={itemVariants}
            className="mt-12 text-slate-400 text-sm"
          >
            Start a 7-day free trial • No card required
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
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
    </section>
  );
}