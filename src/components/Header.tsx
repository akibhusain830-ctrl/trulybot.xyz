'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User | null;
  loading: boolean;
  signOut: () => void;
}

const HamburgerIcon = ({ open }: { open: boolean }) => (
  <div className="w-8 h-8 flex flex-col justify-center items-center relative z-50">
    <span className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${open ? "rotate-45 translate-y-1.5" : ""}`}></span>
    <span className={`block h-0.5 w-6 bg-white my-1 transition-all duration-300 ${open ? "opacity-0" : ""}`}></span>
    <span className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${open ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
  </div>
);

const MobileMenu = ({ open, onClose, user, signOut }: HeaderProps & { open: boolean; onClose: () => void }) => (
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
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-b from-slate-900/90 to-[#1c1c1c]/90 rounded-3xl shadow-2xl border border-slate-800/80 p-8 flex flex-col gap-6 w-11/12 max-w-sm text-center"
          onClick={e => e.stopPropagation()}
        >
          <Link href="/" className="text-xl font-bold tracking-tight mb-2" onClick={onClose}>trulybot.xyz</Link>
          <Link href="/dashboard" className="text-lg hover:text-blue-400 transition-colors" onClick={onClose}>Dashboard</Link>
          <a href="#features" className="text-lg hover:text-blue-400 transition-colors" onClick={onClose}>Features</a>
          <Link href="/pricing" className="text-lg hover:text-blue-400 transition-colors" onClick={onClose}>Pricing</Link>
          {user ? (
            <button
              className="bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors"
              onClick={() => {
                signOut();
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

export default function Header({ user, loading, signOut }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="relative z-20 flex justify-between items-center max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-xl font-bold tracking-tight">trulybot.xyz</Link>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
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
          <button
            className="md:hidden flex items-center justify-center"
            aria-label="Open menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} user={user} loading={loading} signOut={signOut} />
    </>
  );
}