/**
 * Optimized Dashboard Layout with Instant Navigation
 * Eliminates repeated permission checks and loading screens
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BRAND } from '@/lib/branding';
import { useAuth } from '@/context/EnhancedAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardRouteGuard } from '@/components/SmartRouteGuard';

// Icons (same as before)
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const LeadsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.82l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.82l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);

interface OptimizedDashboardLayoutProps {
  children: React.ReactNode;
}

export default function OptimizedDashboardLayout({ children }: OptimizedDashboardLayoutProps) {
  const pathname = usePathname();
  const { user, signOut, subscriptionStatus, trialInfo } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: <HomeIcon />, href: '/dashboard' },
    { name: 'Leads', icon: <LeadsIcon />, href: '/dashboard/leads' },
    { name: 'Settings', icon: <SettingsIcon />, href: '/dashboard/settings' },
  ];

  const brandHost = (() => {
    try { return new URL(BRAND.url).hostname; } catch { return 'trulybot.xyz'; }
  })();

  // Subscription status indicator
  const getStatusIndicator = () => {
    if (subscriptionStatus === 'active') {
      return <div className="w-2 h-2 bg-green-400 rounded-full" title="Active Subscription" />;
    }
    if (subscriptionStatus === 'trialing') {
      const daysRemaining = trialInfo?.daysRemaining || 0;
      return (
        <div className="flex items-center gap-1" title={`Trial: ${daysRemaining} days left`}>
          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
          <span className="text-xs text-yellow-400 hidden sm:inline">{daysRemaining}d</span>
        </div>
      );
    }
    return <div className="w-2 h-2 bg-red-400 rounded-full" title="No Active Subscription" />;
  };

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center px-6 border-b border-slate-800 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 512 512" 
            fill="none"
            className="flex-shrink-0"
          >
            <defs>
              <linearGradient id="lightningGradientDashboard" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <polygon 
              fill="url(#lightningGradientDashboard)"
              points="320,32 136,296 248,296 192,480 400,216 288,216"
            />
          </svg>
          {brandHost}
        </Link>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" role="navigation" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-inner shadow-blue-400/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800 flex-shrink-0">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <UserIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate" title={user.email || 'User'}>
                  {user.email || 'User'}
                </p>
                {getStatusIndicator()}
              </div>
              <button 
                onClick={signOut} 
                className="text-xs text-slate-400 hover:underline hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <DashboardRouteGuard>
      <div className="h-screen w-full bg-black text-white flex font-sans overflow-hidden">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-md z-50">
          Skip to main content
        </a>
        
        {/* Desktop Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-[#111] border-r border-slate-800 flex-col hidden lg:flex">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <aside 
          className={`fixed top-0 left-0 h-full w-64 bg-[#111] border-r border-slate-800 flex flex-col z-50 lg:hidden transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-hidden={!sidebarOpen}
        >
          <SidebarContent />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden h-20 flex items-center justify-between px-4 sm:px-6 border-b border-slate-800 flex-shrink-0">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 -ml-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </button>
            <Link href="/" className="text-xl font-bold tracking-tight">
              {brandHost}
            </Link>
            <div className="flex items-center gap-2">
              {getStatusIndicator()}
            </div>
          </header>
          
          {/* Scrollable Content */}
          <div className="flex-1 relative overflow-y-auto focus:outline-none" role="presentation" id="dashboard-scroll-container">
            <main id="main-content" className="min-h-full p-4 sm:p-6 lg:p-8" role="main" aria-label="Dashboard main content">
              {children}
            </main>
          </div>
        </div>
      </div>
    </DashboardRouteGuard>
  );
}