'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setIsVisible(true);
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    // Reload page to apply currency detection
    window.location.reload();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: isMobile ? 100 : 0, x: isMobile ? 0 : 100 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: isMobile ? 100 : 0, x: isMobile ? 0 : 100 }}
        className={`fixed z-50 ${
          isMobile 
            ? 'bottom-0 left-0 right-0 p-4' 
            : 'top-4 right-4 w-96'
        }`}
      >
        <div className={`bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl ${
          isMobile ? 'pb-8' : ''
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <h3 className="text-lg font-semibold text-white">Cookie Preferences</h3>
            </div>
            <button
              onClick={handleDecline}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            We use cookies to detect your location and show pricing in your local currency. 
            This helps us provide the best experience for Indian users with INR pricing.
          </p>
          
          <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
            <p className="text-gray-400 text-xs">
              <strong className="text-gray-300">If you decline:</strong> The site works normally but defaults to INR (₹) pricing for everyone. 
              <strong className="text-gray-300">If you accept:</strong> You'll see pricing in your local currency automatically.
            </p>
          </div>
          
          <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <button
              onClick={handleAccept}
              className="flex-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Accept (Show Local Currency)
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 bg-gray-700/60 hover:bg-gray-600/60 text-white font-semibold py-3 px-4 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300"
            >
              Decline (Use INR Default)
            </button>
          </div>
          
          {isMobile && (
            <div className="mt-4 text-center">
              <span className="text-xs text-gray-500">
                Swipe down to dismiss
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}