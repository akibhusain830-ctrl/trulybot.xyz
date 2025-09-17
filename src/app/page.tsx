'use client'

import { useState, ReactNode } from 'react';
import { motion, Variants, Transition, easeOut } from 'framer-motion';
import Link from 'next/link';

// --- Reusable Component for Floating UI Cards ---
interface FloatingCardProps {
  className?: string;
  children: ReactNode;
  animationProps?: {
    initial?: object;
    animate?: object;
    whileHover?: object;
  };
}

const FloatingCard: React.FC<FloatingCardProps> = ({ className, children, animationProps }) => (
  <motion.div
    {...animationProps}
    className={`bg-gradient-to-b from-slate-900/80 to-[#1c1c1c]/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-slate-800/80 ${className}`}
  >
    {children}
  </motion.div>
);

// --- Icons ---
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);
const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);
const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);
const SmileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

// --- Animation Variants ---
const heroVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } } };

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <main className="min-h-screen font-sans text-white bg-black overflow-x-hidden">
      {/* Hero Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-blue-900/40 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-20 flex justify-between items-center max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-xl font-bold tracking-tight">anemo.ai</Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <button onClick={() => setIsLoggedIn(false)} className="bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors">Sign Out</button>
          ) : (
            <Link href="/sign-in" className="bg-slate-50 text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors">Sign In</Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-16 pb-32 z-10">
        <motion.div variants={heroVariants} initial="hidden" animate="visible" className="text-center">
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
            India’s Smartest AI Chatbot <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap"> for E-Commerce </span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-400 text-lg max-w-xl mx-auto mt-6 mb-10">
            Paste your business info and deploy a smart chatbot on your website in minutes. No code needed. Made for Indian sellers.
          </motion.p>
          <motion.div variants={itemVariants} className="flex justify-center items-center gap-4">
            <a href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"> Try it Free </a>
            <a href="/widget" className="bg-slate-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-700 transition-colors"> View Demo </a>
          </motion.div>
        </motion.div>
      </section>

      <footer className="relative z-10 px-6 py-10 text-center text-sm text-slate-500 border-t border-slate-800">
        <p>Made in India 🇮🇳 · Built for Indian businesses · © {new Date().getFullYear()} anemo.ai</p>
      </footer>
    </main>
  );
}
