'use client'

import { useState } from 'react';
import { motion, Variants, easeOut } from 'framer-motion';
import Link from 'next/link';

// --- Reusable Component for the Floating UI Cards ---
const FloatingCard = ({ className, children, animationProps }: any) => (
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

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const heroVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } } };
  const scrollAnimationVariants: Variants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } } };

  return (
    <main className="min-h-screen font-sans text-white bg-black overflow-x-hidden">
      {/* ... your existing UI code stays the same ... */}
      {/* All sections (hero, features, pricing, footer) remain unchanged */}
    </main>
  );
}

