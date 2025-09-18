'use client'

import { useState } from 'react';
import { motion, easeOut, type MotionProps, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// --- Only addition: import useAuth from your context ---
import { useAuth } from '@/context/AuthContext';

// --- Hamburger Icon ---
const HamburgerIcon = ({ open }: { open: boolean }) => (
  <div className="w-8 h-8 flex flex-col justify-center items-center relative z-50">
    <span className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${open ? "rotate-45 translate-y-1.5" : ""}`}></span>
    <span className={`block h-0.5 w-6 bg-white my-1 transition-all duration-300 ${open ? "opacity-0" : ""}`}></span>
    <span className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${open ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
  </div>
);

// --- Mobile Menu Overlay ---
const MobileMenu = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { user, signOut, loading } = useAuth();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-lg flex flex-col items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: easeOut }}
            className="bg-gradient-to-b from-slate-900/90 to-[#1c1c1c]/90 rounded-3xl shadow-2xl border border-slate-800/80 p-8 flex flex-col gap-6 w-11/12 max-w-sm text-center"
            onClick={e => e.stopPropagation()}
          >
            <Link href="/" className="text-xl font-bold tracking-tight mb-2" onClick={onClose}>anemo.ai</Link>
            <Link href="/dashboard" className="text-lg hover:text-blue-400 transition-colors" onClick={onClose}>Dashboard</Link>
            <a href="#features" className="text-lg hover:text-blue-400 transition-colors" onClick={onClose}>Features</a>
            <a href="#pricing" className="text-lg hover:text-blue-400 transition-colors" onClick={onClose}>Pricing</a>
            {loading ? null : user ? (
              <button
                className="bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors"
                onClick={() => { signOut(); onClose(); }}
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="bg-slate-50 text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors"
                onClick={onClose}
              >
                Sign In
              </Link>
            )}
          </motion.div>
          <button
            className="absolute top-6 right-6 z-50 text-3xl text-white"
            aria-label="Close menu"
            onClick={onClose}
          >×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Reusable Component for the Floating UI Cards ---
const FloatingCard = ({
  className,
  children,
  animationProps
}: {
  className?: string;
  children: React.ReactNode;
  animationProps?: MotionProps;
}) => (
  <motion.div
    {...animationProps}
    className={`bg-gradient-to-b from-slate-900/80 to-[#1c1c1c]/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-slate-800/80 ${className}`}
  >
    {children}
  </motion.div>
);

// --- Icons for Accomplishment Cards ---
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
);
const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const SmileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
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
    <rect x="10" y="40" width="10" height="30" rx="3" fill="url(#pasteGradient)" opacity="0.4"/>
    <rect x="30" y="25" width="10" height="45" rx="3" fill="url(#pasteGradient)" opacity="0.6"/>
    <rect x="50" y="10" width="10" height="60" rx="3" fill="url(#pasteGradient)" opacity="1"/>
    <rect x="70" y="30" width="10" height="40" rx="3" fill="url(#pasteGradient)" opacity="0.7"/>
    <rect x="90" y="20" width="10" height="50" rx="3" fill="url(#pasteGradient)" opacity="0.8"/>
    <rect x="110" y="35" width="10" height="35" rx="3" fill="url(#pasteGradient)" opacity="0.5"/>
    <rect x="130" y="15" width="10" height="55" rx="3" fill="url(#pasteGradient)" opacity="0.9"/>
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
    <circle cx="20" cy="40" r="6" fill="url(#nodeGradient)"/>
    <circle cx="60" cy="15" r="6" fill="url(#nodeGradient)"/>
    <circle cx="60" cy="65" r="6" fill="url(#nodeGradient)"/>
    <circle cx="100" cy="15" r="6" fill="url(#nodeGradient)"/>
    <circle cx="100" cy="65" r="6" fill="url(#nodeGradient)"/>
    <circle cx="140" cy="40" r="6" fill="url(#nodeGradient)"/>
    <path d="M20 40 Q 40 25 60 15 M20 40 Q 40 55 60 65" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    <path d="M60 15 H 100 M60 65 H 100" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    <path d="M100 15 Q 120 25 140 40 M100 65 Q 120 55 140 40" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
  </svg>
);
const EmbedGraphic = () => (
  <svg width="100%" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20L30 40L50 60" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M110 20L130 40L110 60" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M80 25 V 55" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    <path d="M70 35 L 90 45" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    <path d="M70 45 L 90 35" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
  </svg>
);

const floatingCards = [
  {
    icon: <MessageIcon />,
    label: "Chats Completed",
    value: "4.5k+",
    desc: "this month",
  },
  {
    icon: <SmileIcon />,
    label: "Increased Customer Satisfaction",
    value: "92%",
    desc: "CSAT Score",
  },
  {
    icon: <ClockIcon />,
    label: "100+ Hours of Time Saved",
    value: "100+",
    desc: "per month",
  },
  {
    icon: <ArrowDownIcon />,
    label: "Reduce Support Costs",
    value: "Up to 80%",
    desc: "in the first 3 months",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const heroVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } } };
  const scrollAnimationVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } } };

  return (
    <main className="min-h-screen font-sans text-white bg-black overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-blue-900/40 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Mobile Hamburger and Menu */}
      <header className="relative z-20 flex justify-between items-center max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-xl font-bold tracking-tight">anemo.ai</Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          {loading ? null : user ? (
            <button
              onClick={signOut}
              className="hidden md:inline bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="hidden md:inline bg-slate-50 text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Sign In
            </Link>
          )}
          {/* Hamburger on mobile */}
          <button
            className="md:hidden flex items-center justify-center"
            aria-label="Open menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </header>
      
      {/* --- The rest of your original layout remains 100% unchanged --- */}
      {/* ... all your section/JSX code here ... */}
    </main>
  );
}
