'use client';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoImage from '../src/assets/icons/logo.svg';

interface NavbarProps {
  user?: any;
  loading?: boolean;
  signOut?: () => void;
}

export const Navbar = ({ user, loading, signOut }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
  const handleGetForFree = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/sign-in';
    }
  };

  return (
    <div className="bg-black">
      <div className="px-4">
    <div className="container bg-black">
      <div className="py-4 flex items-center justify-between">

      <div className="relative">
        <div className='absolute w-full top-2 bottom-0 bg-[linear-gradient(to_right,#F7AABE,#B57CEC,#E472D1)] blur-md '></div>

      <LogoImage className="h-12 w-12 relative mt-1"/>
      </div>
      <button
        className='border border-white border-opacity-30 h-10 w-10 inline-flex justify-center items-center rounded-lg sm:hidden'
        aria-label='Open menu'
        aria-expanded={menuOpen}
        aria-controls='mobile-menu'
        onClick={() => setMenuOpen(v => !v)}
      >
        <Menu className="text-white w-6 h-6" />
      </button>
      <nav className='text-white gap-6 items-center hidden sm:flex'>

        <a href="#features" className='text-opacity-60 text-white hover:text-opacity-100 transition scroll-smooth' >Features</a>
        <a href="#pricing" className='text-opacity-60 text-white hover:text-opacity-100 transition scroll-smooth'>Pricing</a>
        <a href="#faqs" className='text-opacity-60 text-white hover:text-opacity-100 transition scroll-smooth'>FAQs</a>
        <a href="/dashboard" className='text-opacity-60 text-white hover:text-opacity-100 transition'>Dashboard</a>
        {user ? (
          <button
            onClick={signOut}
            className='text-opacity-60 text-white hover:text-opacity-100 transition'
          >
            Sign Out
          </button>
        ) : (
          <a href="/sign-in" className='text-opacity-60 text-white hover:text-opacity-100 transition'>Sign In</a>
        )}
        <button 
          onClick={handleGetForFree}
          className='bg-white py-2 px-4 rounded-lg text-black hover:bg-gray-100 transition'
        >
          Get for free
        </button>
      </nav>

      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id='mobile-menu'
            className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
            onClick={() => setMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='absolute right-4 left-4 top-[max(64px,env(safe-area-inset-top))] rounded-xl border border-white/10 bg-black p-4 space-y-3 shadow-xl'
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <a href="#features" className='block px-3 py-2 rounded-lg text-white text-opacity-80 hover:text-opacity-100 transition'>Features</a>
              <a href="#pricing" className='block px-3 py-2 rounded-lg text-white text-opacity-80 hover:text-opacity-100 transition'>Pricing</a>
              <a href="#faqs" className='block px-3 py-2 rounded-lg text-white text-opacity-80 hover:text-opacity-100 transition'>FAQs</a>
              <a href="/dashboard" className='block px-3 py-2 rounded-lg text-white text-opacity-80 hover:text-opacity-100 transition'>Dashboard</a>
              {user ? (
                <button onClick={() => { setMenuOpen(false); signOut && signOut(); }} className='w-full px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition'>Sign Out</button>
              ) : (
                <button onClick={() => { setMenuOpen(false); handleGetForFree(); }} className='w-full px-3 py-2 rounded-lg bg-white text-black hover:bg-slate-200 transition'>Get for free</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>




    </div>
    </div>
    </div>
  )
};
