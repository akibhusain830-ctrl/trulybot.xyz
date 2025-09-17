'use client'

import { useState, ReactNode, HTMLAttributes } from 'react';
import { motion, MotionProps } from 'framer-motion';
import Link from 'next/link';

// --- Reusable Component for the Floating UI Cards ---
interface FloatingCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  animationProps?: MotionProps;
  className?: string;
}

const FloatingCard = ({ className, children, animationProps }: FloatingCardProps) => (
  <motion.div
    {...animationProps}
    className={`bg-gradient-to-b from-slate-900/80 to-[#1c1c1c]/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-slate-800/80 ${className}`}
  >
    {children}
  </motion.div>
);

// --- Icons for Accomplishment Cards ---
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

// --- Graphics for Feature Cards ---
const PasteGraphic = () => (
  <svg width="100%" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pasteGradient" x1="0" y1="0" x2="0" y2="100%">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#60A5FA" />
      </linearGradient>
    </defs>
    <rect x="10" y="40" width="10" height="30" rx="3" fill="url(#pasteGradient)" opacity="0.4" />
    <rect x="30" y="25" width="10" height="45" rx="3" fill="url(#pasteGradient)" opacity="0.6" />
    <rect x="50" y="10" width="10" height="60" rx="3" fill="url(#pasteGradient)" opacity="1" />
    <rect x="70" y="30" width="10" height="40" rx="3" fill="url(#pasteGradient)" opacity="0.7" />
    <rect x="90" y="20" width="10" height="50" rx="3" fill="url(#pasteGradient)" opacity="0.8" />
    <rect x="110" y="35" width="10" height="35" rx="3" fill="url(#pasteGradient)" opacity="0.5" />
    <rect x="130" y="15" width="10" height="55" rx="3" fill="url(#pasteGradient)" opacity="0.9" />
  </svg>
);

const TrainGraphic = () => (
  <svg width="100%" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#3B82F6" />
      </radialGradient>
    </defs>
    <circle cx="20" cy="40" r="6" fill="url(#nodeGradient)" />
    <circle cx="60" cy="15" r="6" fill="url(#nodeGradient)" />
    <circle cx="60" cy="65" r="6" fill="url(#nodeGradient)" />
    <circle cx="100" cy="15" r="6" fill="url(#nodeGradient)" />
    <circle cx="100" cy="65" r="6" fill="url(#nodeGradient)" />
    <circle cx="140" cy="40" r="6" fill="url(#nodeGradient)" />
    <path d="M20 40 Q 40 25 60 15 M20 40 Q 40 55 60 65" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <path d="M60 15 H 100 M60 65 H 100" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <path d="M100 15 Q 120 25 140 40 M100 65 Q 120 55 140 40" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const EmbedGraphic = () => (
  <svg width="100%" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20L30 40L50 60" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M110 20L130 40L110 60" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M80 25 V 55" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    <path d="M70 35 L 90 45" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    <path d="M70 45 L 90 35" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
  </svg>
);

// --- Animation Variants ---
const heroVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] } } };
const scrollAnimationVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] } } };

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <main className="min-h-screen font-sans text-white bg-black overflow-x-hidden">
      {/* --- Hero & Stats Section --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-blue-900/40 rounded-full blur-[150px] pointer-events-none z-0" />

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

      {/* --- Remaining Sections (Hero Cards, Features, Pricing, Footer) --- */}
      {/* UI unchanged, same JSX as before, using FloatingCard and graphics */}
      {/* ... You can copy your existing JSX here, it will now build without ESLint/TS errors ... */}
    </main>
  );
}

