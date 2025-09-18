'use client'

import { useState, useEffect } from 'react';
import { motion, easeOut, type MotionProps, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
  user,
  signOut
}: {
  open: boolean;
  onClose: () => void;
  user: any;
  signOut?: () => void;
}) => (
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
          {user ? (
            <button 
              className="bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors" 
              onClick={() => {
                if (signOut) signOut();
                onClose();
              }}
            >
              Sign Out
            </button>
          ) : (
            <Link href="/sign-in" className="bg-slate-50 text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors" onClick={onClose}>Sign In</Link>
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

export default function Page() {
  // CHANGED: Replaced isLoggedIn state with useAuth hook
  const { user, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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
          
          {/* CHANGED: Updated authentication buttons to use useAuth */}
          {loading ? (
            <button disabled className="hidden md:inline bg-slate-800/50 text-white/50 px-5 py-2.5 rounded-full text-sm font-semibold">
              Loading...
            </button>
          ) : user ? (
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
        {/* CHANGED: Updated MobileMenu to use user instead of isLoggedIn */}
        <MobileMenu 
          open={menuOpen} 
          onClose={() => setMenuOpen(false)} 
          user={user} 
          signOut={signOut}
        />
      </header>
      
      {/* Rest of your component remains UNCHANGED */}
      <section className="relative w-full max-w-7xl mx-auto px-2 sm:px-6 pt-16 pb-32 z-10">
        {/* Desktop floating cards */}
        <div className="hidden lg:grid grid-cols-6 gap-8 items-center">
          <div className="col-span-1 flex flex-col gap-y-24">
            <FloatingCard className="w-56 transform -rotate-6 translate-x-4"
              animationProps={{
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut, delay: 0.6 } },
                whileHover: { scale: 1.05 },
              }}>
              <div className="flex items-center gap-2 text-slate-400 mb-2">{floatingCards[0].icon}<p className="text-xs">{floatingCards[0].label}</p></div>
              <div className="text-3xl font-bold text-white">{floatingCards[0].value}</div>
              <p className="text-xs text-slate-500">{floatingCards[0].desc}</p>
            </FloatingCard>
            <FloatingCard className="w-56 ml-10 transform rotate-3"
              animationProps={{
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut, delay: 0.8 } },
                whileHover: { scale: 1.05 },
              }}>
              <div className="flex items-center gap-2 text-slate-400 mb-2">{floatingCards[1].icon}<p className="text-xs">{floatingCards[1].label}</p></div>
              <div className="text-3xl font-bold text-white">{floatingCards[1].value}</div>
              <p className="text-xs text-slate-500">{floatingCards[1].desc}</p>
            </FloatingCard>
          </div>
          <motion.div variants={heroVariants} initial="hidden" animate="visible" className="col-span-4 text-center">
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
              India's Smartest AI Chatbot <br />
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
          <div className="col-span-1 flex flex-col gap-y-24">
            <FloatingCard className="w-56 ml-10 transform rotate-6"
              animationProps={{
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut, delay: 1 } },
                whileHover: { scale: 1.05 },
              }}>
              <div className="flex items-center gap-2 text-slate-400 mb-2">{floatingCards[2].icon}<p className="text-xs">{floatingCards[2].label}</p></div>
              <div className="text-3xl font-bold text-white">{floatingCards[2].value}</div>
              <p className="text-xs text-slate-500">{floatingCards[2].desc}</p>
            </FloatingCard>
            <FloatingCard className="w-56 transform -rotate-3"
              animationProps={{
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut, delay: 1.2 } },
                whileHover: { scale: 1.05 },
              }}>
              <div className="flex items-center gap-2 text-slate-400 mb-2">{floatingCards[3].icon}<p className="text-xs">{floatingCards[3].label}</p></div>
              <div className="text-3xl font-bold text-white">{floatingCards[3].value}</div>
              <p className="text-xs text-slate-500">{floatingCards[3].desc}</p>
            </FloatingCard>
          </div>
        </div>
        
        {/* Mobile version of hero section */}
        <div className="lg:hidden flex flex-col">
          <motion.div variants={heroVariants} initial="hidden" animate="visible" className="text-center">
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-bold tracking-tighter leading-tight">
              India's Smartest AI Chatbot <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap"> for E-Commerce </span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-slate-400 text-lg max-w-xl mx-auto mt-6 mb-10">
              Paste your business info and deploy a smart chatbot on your website in minutes. No code needed. Made for Indian sellers.
            </motion.p>
            <motion.div variants={itemVariants} className="flex justify-center items-center gap-4 mb-16">
              <a href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"> Try it Free </a>
              <a href="/widget" className="bg-slate-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-700 transition-colors"> View Demo </a>
            </motion.div>
          </motion.div>
          
          {/* Mobile floating cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
            {floatingCards.map((card, index) => (
              <FloatingCard key={index} className="w-full"
                animationProps={{
                  initial: { opacity: 0, y: 30 },
                  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut, delay: 0.2 + index * 0.1 } },
                  whileHover: { scale: 1.02 },
                }}>
                <div className="flex items-center gap-2 text-slate-400 mb-2">{card.icon}<p className="text-xs">{card.label}</p></div>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <p className="text-xs text-slate-500">{card.desc}</p>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section id="features" className="relative w-full max-w-7xl mx-auto px-6 py-24 md:py-32 z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scrollAnimationVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">How it Works</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Just three simple steps to deploy a custom AI chatbot that handles customer service, generates product recommendations, and increases sales.</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scrollAnimationVariants}
            className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-8 rounded-3xl border border-slate-800 flex flex-col"
          >
            <div className="p-4 bg-blue-900/20 rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-blue-400">1</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">Paste Your Content</h3>
            <p className="text-slate-400 mb-6">Import your product details, FAQs, shipping policies, and business info with a simple paste.</p>
            <div className="mt-auto">
              <PasteGraphic />
            </div>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scrollAnimationVariants}
            className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-8 rounded-3xl border border-slate-800 flex flex-col"
          >
            <div className="p-4 bg-blue-900/20 rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-blue-400">2</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">Train Your Bot</h3>
            <p className="text-slate-400 mb-6">Our AI automatically trains on your data to create a chatbot that understands your unique business.</p>
            <div className="mt-auto">
              <TrainGraphic />
            </div>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scrollAnimationVariants}
            className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-8 rounded-3xl border border-slate-800 flex flex-col"
          >
            <div className="p-4 bg-blue-900/20 rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-blue-400">3</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">Embed on Your Site</h3>
            <p className="text-slate-400 mb-6">Add one line of code to your website, or use our integrations with Shopify, WooCommerce & more.</p>
            <div className="mt-auto">
              <EmbedGraphic />
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Pricing section */}
      <section id="pricing" className="relative w-full max-w-7xl mx-auto px-6 py-24 md:py-32 z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scrollAnimationVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Start with our free plan and upgrade as your business grows. All plans include our core AI features.</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scrollAnimationVariants}
            className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-8 rounded-3xl border border-slate-800"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-1">₹0<span className="text-sm font-normal text-slate-400">/month</span></div>
              <p className="text-slate-400 text-sm">For new businesses</p>
            </div>
            <div className="border-t border-slate-800 my-6 pt-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>500 messages per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Basic customization</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Anemo.ai branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Email support</span>
                </li>
              </ul>
            </div>
            <a href="/dashboard" className="block text-center w-full py-2.5 px-4 rounded-full font-medium bg-slate-800 hover:bg-slate-700 transition-colors">Get Started</a>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scrollAnimationVariants}
            className="bg-gradient-to-b from-blue-900/50 to-blue-950/50 p-8 rounded-3xl border border-blue-800/30 relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
              Most Popular
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-1">₹999<span className="text-sm font-normal text-slate-400">/month</span></div>
              <p className="text-slate-400 text-sm">For growing businesses</p>
            </div>
            <div className="border-t border-blue-800/30 my-6 pt-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>5,000 messages per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Advanced customization</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Remove branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Chat history & analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
            <a href="/dashboard" className="block text-center w-full py-2.5 px-4 rounded-full font-medium bg-blue-600 hover:bg-blue-700 transition-colors">Get Started</a>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scrollAnimationVariants}
            className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-8 rounded-3xl border border-slate-800"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-1">Custom<span className="text-sm font-normal text-slate-400"></span></div>
              <p className="text-slate-400 text-sm">For large businesses</p>
            </div>
            <div className="border-t border-slate-800 my-6 pt-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Unlimited messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Full customization</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Dedicated support</span>
                </li>
              </ul>
            </div>
            <a href="/contact" className="block text-center w-full py-2.5 px-4 rounded-full font-medium bg-slate-800 hover:bg-slate-700 transition-colors">Contact Sales</a>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative w-full max-w-7xl mx-auto px-6 py-12 border-t border-slate-800 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">anemo.ai</h3>
            <p className="text-sm text-slate-500 max-w-xs">AI-powered chatbots for Indian e-commerce businesses that increase sales and reduce support costs.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/widget" className="hover:text-white transition-colors">Demo</a></li>
              <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="/cookies" className="hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500">
          <p>© 2023 Anemo AI Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
