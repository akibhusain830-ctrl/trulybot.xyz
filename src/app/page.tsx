'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';

// --- Reusable Component for the Floating UI Cards ---
const FloatingCard = ({ className, children, animationProps }) => (
  <motion.div
    {...animationProps}
    className={`bg-gradient-to-b from-slate-900/80 to-[#1c1c1c]/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-slate-800/80 ${className}`}
  >
    {children}
  </motion.div>
);

// --- Icons for Accomplishment Cards ---
const ClockIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> );
const ArrowDownIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg> );
const MessageIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );
const SmileIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg> );

// --- Graphics for Feature Cards ---
const PasteGraphic = () => ( <svg width="100%" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pasteGradient" x1="0" y1="0" x2="0" y2="100%"><stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#60A5FA" /></linearGradient></defs><rect x="10" y="40" width="10" height="30" rx="3" fill="url(#pasteGradient)" opacity="0.4"/><rect x="30" y="25" width="10" height="45" rx="3" fill="url(#pasteGradient)" opacity="0.6"/><rect x="50" y="10" width="10" height="60" rx="3" fill="url(#pasteGradient)" opacity="1"/><rect x="70" y="30" width="10" height="40" rx="3" fill="url(#pasteGradient)" opacity="0.7"/><rect x="90" y="20" width="10" height="50" rx="3" fill="url(#pasteGradient)" opacity="0.8"/><rect x="110" y="35" width="10" height="35" rx="3" fill="url(#pasteGradient)" opacity="0.5"/><rect x="130" y="15" width="10" height="55" rx="3" fill="url(#pasteGradient)" opacity="0.9"/></svg> );
const TrainGraphic = () => ( <svg width="100%" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stopColor="#60A5FA" /><stop offset="100%" stopColor="#3B82F6" /></radialGradient></defs><circle cx="20" cy="40" r="6" fill="url(#nodeGradient)"/><circle cx="60" cy="15" r="6" fill="url(#nodeGradient)"/><circle cx="60" cy="65" r="6" fill="url(#nodeGradient)"/><circle cx="100" cy="15" r="6" fill="url(#nodeGradient)"/><circle cx="100" cy="65" r="6" fill="url(#nodeGradient)"/><circle cx="140" cy="40" r="6" fill="url(#nodeGradient)"/><path d="M20 40 Q 40 25 60 15 M20 40 Q 40 55 60 65" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/><path d="M60 15 H 100 M60 65 H 100" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/><path d="M100 15 Q 120 25 140 40 M100 65 Q 120 55 140 40" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/></svg> );
const EmbedGraphic = () => ( <svg width="100%" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 20L30 40L50 60" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M110 20L130 40L110 60" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M80 25 V 55" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/><path d="M70 35 L 90 45" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/><path d="M70 45 L 90 35" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/></svg> );

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const heroVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
  const scrollAnimationVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  return (
    <main className="min-h-screen font-sans text-white bg-black overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-blue-900/40 rounded-full blur-[150px] pointer-events-none z-0" />

      <header className="relative z-20 flex justify-between items-center max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-12">
          <a href="/" className="text-xl font-bold tracking-tight">anemo.ai</a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
              <button onClick={() => setIsLoggedIn(false)} className="bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors">Sign Out</button>
            ) : (
              <a href="/sign-in" className="bg-slate-50 text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors">Sign In</a>
            )}
        </div>
      </header>
      
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-16 pb-32 z-10">
        <div className="hidden lg:grid grid-cols-6 gap-8 items-center">
            
            <div className="col-span-1 flex flex-col gap-y-24">
                {/* CHANGED: Card Content Updated */}
                <FloatingCard
                  className="w-56 transform -rotate-6 translate-x-4"
                  animationProps={{ initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.6 } }, whileHover: { scale: 1.05 }, }} >
                   <div className="flex items-center gap-2 text-slate-400 mb-2"> <MessageIcon /> <p className="text-xs">Chats Completed</p> </div>
                   <div className="text-3xl font-bold text-white">4.5k+</div>
                   <p className="text-xs text-slate-500">this month</p>
                </FloatingCard>
                <FloatingCard
                  className="w-56 ml-10 transform rotate-3"
                  animationProps={{ initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.8 } }, whileHover: { scale: 1.05 }, }} >
                   <div className="flex items-center gap-2 text-slate-400 mb-2"> <SmileIcon /> <p className="text-xs">Customer Satisfaction</p> </div>
                   <div className="text-3xl font-bold text-white">92%</div>
                   <p className="text-xs text-slate-500">Increased Rate</p>
                </FloatingCard>
            </div>
            
            <motion.div variants={heroVariants} initial="hidden" animate="visible" className="col-span-4 text-center">
              <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
                India’s Smartest AI Chatbot
                <br />
                {/* CHANGED: Added whitespace-nowrap to prevent breaking */}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                  for E-Commerce
                </span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-slate-400 text-lg max-w-xl mx-auto mt-6 mb-10"> Paste your business info and deploy a smart chatbot on your website in minutes. No code needed. Made for Indian sellers. </motion.p>
              <motion.div variants={itemVariants} className="flex justify-center items-center gap-4">
                <a href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"> Try it Free </a>
                <a href="/widget?user=demo" className="bg-slate-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-700 transition-colors"> View Demo </a>
              </motion.div>
            </motion.div>

            <div className="col-span-1 flex flex-col gap-y-24">
                {/* CHANGED: Card Content Updated */}
                <FloatingCard
                  className="w-56 transform rotate-6 -translate-x-4"
                  animationProps={{ initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.7 } }, whileHover: { scale: 1.05 } }} >
                  <div className="flex items-center gap-2 text-slate-400 mb-2"> <ClockIcon /> <p className="text-xs">100+ Hours of Time Saved</p> </div>
                  <div className="text-3xl font-bold text-white">100+</div>
                   <p className="text-xs text-slate-500">per month</p>
                </FloatingCard>
                 <FloatingCard
                  className="w-56 ml-[-2rem] transform -rotate-3"
                  animationProps={{ initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.9 } }, whileHover: { scale: 1.05 } }} >
                   <div className="flex items-center gap-2 text-slate-400 mb-2"> <ArrowDownIcon /> <p className="text-xs">Reduce Support Costs</p> </div>
                   <div className="text-3xl font-bold text-white">Up to 80%</div>
                   <p className="text-xs text-slate-500">in the first 3 months</p>
                </FloatingCard>
            </div>
        </div>
        
        <div className="lg:hidden text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
              India’s Smartest AI Chatbot
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                for E-Commerce
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-slate-400 text-lg max-w-xl mx-auto mt-6 mb-10"> Paste your business info and deploy a smart chatbot on your website in minutes. No code needed. Made for Indian sellers. </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex justify-center items-center gap-4">
                <a href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"> Try it Free </a>
                <a href="/widget?user=demo" className="bg-slate-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-700 transition-colors"> View Demo </a>
            </motion.div>
        </div>
      </section>
      
      <section id="features" className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
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

      <section id="pricing" className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <motion.h2 variants={scrollAnimationVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.8 }} className="text-4xl font-bold mb-12 text-center tracking-tighter"> Fair pricing for every stage. </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Basic', desc: '1000 messages / month', price: '₹99/mo', cta: 'Start Basic' },
            { name: 'Pro', desc: 'Unlimited messages', price: '₹299/mo', cta: 'Go Pro' },
            { name: 'Ultra', desc: 'Custom branding + logo, Unlimited messages', price: '₹499/mo', cta: 'Go Ultra' },
          ].map((plan, i) => (
             <motion.div key={plan.name} variants={scrollAnimationVariants} initial="hidden" whileInView="visible" transition={{ delay: i * 0.1 }} viewport={{ once: true, amount: 0.5 }} className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-8 rounded-3xl border border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-900/50 transition-all duration-300 flex flex-col">
              <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-6 flex-grow">{plan.desc}</p>
              <div className="text-3xl font-bold mb-6">{plan.price}</div>
              <a href={'/dashboard'} className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  plan.name === 'Basic' ? 'bg-slate-100 text-black hover:bg-slate-200' :
                  plan.name === 'Pro' ? 'bg-green-600 text-white hover:bg-green-700' :
                  'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 px-6 py-10 text-center text-sm text-slate-500 border-t border-slate-800">
        <p>Made in India 🇮🇳 · Built for Indian businesses · © {new Date().getFullYear()} anemo.ai</p>
      </footer>
    </main>
  );
}