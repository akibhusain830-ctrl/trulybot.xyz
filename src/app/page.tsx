'use client'
import Footer from '@/components/Footer';
import { useState } from 'react';
import { motion, easeOut, type MotionProps, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@supabase/supabase-js';
import RazorpayButton from '@/components/RazorpayButton';

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
  user: User | null;
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
          <Link href="/" className="text-xl font-bold tracking-tight mb-2" onClick={onClose}>trulybot.xyz</Link>
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
  { icon: <MessageIcon />, label: "Chats Completed", value: "4.5k+", desc: "this month" },
  { icon: <SmileIcon />, label: "Increased Customer Satisfaction", value: "92%", desc: "CSAT Score" },
  { icon: <ClockIcon />, label: "100+ Hours of Time Saved", value: "100+", desc: "per month" },
  { icon: <ArrowDownIcon />, label: "Reduce Support Costs", value: "Up to 80%", desc: "in the first 3 months" },
];

export default function Page() {
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
          <Link href="/" className="text-xl font-bold tracking-tight">trulybot.xyz</Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          {!loading && (
            user ? (
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
            )
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
        <MobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          user={user}
          signOut={signOut}
        />
      </header>
      
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
              India&apos;s Smartest AI Chatbot <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap"> for E-Commerce </span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-slate-400 text-lg max-w-xl mx-auto mt-6 mb-10">
              Paste your business info and deploy a smart chatbot on your website in minutes. No code needed. Made for Indian sellers.
            </motion.p>
            <motion.div variants={itemVariants} className="flex justify-center items-center gap-4">
              <a href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"> Try it Free </a>
              <a href="/widget-demo" className="bg-slate-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-700 transition-colors"> View Demo </a>
            </motion.div>
          </motion.div>
          <div className="col-span-1 flex flex-col gap-y-24">
            <FloatingCard className="w-56 transform rotate-6 -translate-x-4"
              animationProps={{
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut, delay: 0.7 } },
                whileHover: { scale: 1.05 }
              }}>
              <div className="flex items-center gap-2 text-slate-400 mb-2">{floatingCards[2].icon}<p className="text-xs">{floatingCards[2].label}</p></div>
              <div className="text-3xl font-bold text-white">{floatingCards[2].value}</div>
              <p className="text-xs text-slate-500">{floatingCards[2].desc}</p>
            </FloatingCard>
            <FloatingCard className="w-56 ml-[-2rem] transform -rotate-3"
              animationProps={{
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut, delay: 0.9 } },
                whileHover: { scale: 1.05 }
              }}>
              <div className="flex items-center gap-2 text-slate-400 mb-2">{floatingCards[3].icon}<p className="text-xs">{floatingCards[3].label}</p></div>
              <div className="text-3xl font-bold text-white">{floatingCards[3].value}</div>
              <p className="text-xs text-slate-500">{floatingCards[3].desc}</p>
            </FloatingCard>
          </div>
        </div>

        {/* Mobile floating cards */}
        <div className="lg:hidden flex flex-col items-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
            India&apos;s Smartest AI Chatbot <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap"> for E-Commerce </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-slate-400 text-lg max-w-xl mx-auto mt-6 mb-10">
            Paste your business info and deploy a smart chatbot on your website in minutes. No code needed. Made for Indian sellers.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex justify-center items-center gap-4 mb-6">
            <a href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"> Try it Free </a>
            <a href="/widget-demo" className="bg-slate-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-700 transition-colors"> View Demo </a>
          </motion.div>
          {/* Floating cards in 2x2 grid for mobile */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mx-auto mt-4">
            {floatingCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: easeOut, delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-b from-slate-900/80 to-[#1c1c1c]/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-slate-800/80"
              >
                <div className="flex items-center gap-2 text-slate-400 mb-2">{card.icon}<p className="text-xs">{card.label}</p></div>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <p className="text-xs text-slate-500">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section id="features" className="relative z-10 px-2 sm:px-6 py-20 max-w-6xl mx-auto">
        <motion.h2 variants={scrollAnimationVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.8 }} className="text-4xl font-bold mb-12 text-center tracking-tighter"> A smarter workflow, instantly. </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {[
            { graphic: <PasteGraphic />, title: 'Paste Your Content', desc: 'Simply provide your existing FAQs, policies, or even a link to your website. Our AI will automatically read, understand, and index the knowledge.' },
            { graphic: <TrainGraphic />, title: 'Train Your Bot', desc: 'Our AI instantly converts your content into a conversational brain. It understands user intent and handles complex queries to provide accurate, helpful answers.' },
            { graphic: <EmbedGraphic />, title: 'Embed Anywhere', desc: 'Copy a single line of code to add the chatbot to your site. Customize its look to match your brand and provide your customers with 24/7 support.' },
          ].map((item, i) => (
            <motion.div key={item.title} variants={scrollAnimationVariants} initial="hidden" whileInView="visible" transition={{ delay: i * 0.1 }} viewport={{ once: true, amount: 0.5 }} className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-8 rounded-3xl border border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-900/50 transition-all duration-300 cursor-pointer">
              <div className="mb-6 h-[80px] flex items-center">{item.graphic}</div>
              <h3 className="font-bold mb-2 text-white">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pricing" className="relative z-10 px-2 sm:px-6 py-20 max-w-6xl mx-auto">
        <motion.h2 variants={scrollAnimationVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.8 }} className="text-4xl font-bold mb-12 text-center tracking-tighter"> Fair pricing for every stage. </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Basic', desc: '1000 messages / month', price: '₹99/mo', cta: 'Start Basic', amount: 99 },
            { name: 'Pro', desc: 'Unlimited messages', price: '₹299/mo', cta: 'Go Pro', amount: 299 },
            { name: 'Ultra', desc: 'Custom branding + logo, Unlimited messages', price: '₹499/mo', cta: 'Go Ultra', amount: 499 },
          ].map((plan, i) => (
             <motion.div key={plan.name} variants={scrollAnimationVariants} initial="hidden" whileInView="visible" transition={{ delay: i * 0.1 }} viewport={{ once: true, amount: 0.5 }} className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-8 rounded-3xl border border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-900/50 transition-all duration-300 flex flex-col">
               <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
               <p className="text-slate-400 text-sm mb-6 flex-grow">{plan.desc}</p>
               <div className="text-3xl font-bold mb-6">{plan.price}</div>

               <RazorpayButton
                 amount={plan.amount}
                 currency="INR"
                 label={plan.cta}
                 notes={{ plan: plan.name.toLowerCase() }}
                 className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-colors text-center ${
                   plan.name === 'Basic' ? 'bg-slate-100 text-black hover:bg-slate-200' :
                   plan.name === 'Pro' ? 'bg-green-600 text-white hover:bg-green-700' :
                   'bg-blue-600 text-white hover:bg-blue-700'
                 }`}
                 onSuccess={() => {
                   // Redirect after successful payment
                   window.location.href = '/dashboard';
                 }}
                 onFailure={(e) => {
                   alert(`Payment failed: ${e?.error?.description || e?.message || 'Unknown error'}`);
                 }}
               />
             </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
