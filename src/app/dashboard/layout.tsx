'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BRAND } from '@/lib/branding';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
const HomeIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const LeadsIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IntegrationsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
const SettingsIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.82l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.82l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const UserIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const MenuIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const LockIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

// Generic Accessible Modal
interface BaseModalProps { children: React.ReactNode; onClose?: () => void; labelledBy: string; }
const BaseModal = ({ children, onClose, labelledBy }: BaseModalProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose?.(); }
      if (e.key === 'Tab') {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes || nodes.length === 0) return;
        const list = Array.from(nodes).filter(n => !n.hasAttribute('disabled'));
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      prev?.focus();
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto" aria-modal="true" role="dialog" aria-labelledby={labelledBy}>
      <div ref={dialogRef} className="bg-slate-900/90 backdrop-blur-xl border border-blue-700 rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        {children}
      </div>
    </div>
  );
};

const SubscriptionModal = ({ subscriptionStatus, onClose }: { subscriptionStatus: string | null, onClose: () => void }) => (
  <BaseModal labelledBy="sub-modal-title" onClose={onClose}>
    <div className="mx-auto w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 mb-4"><LockIcon /></div>
    <h2 id="sub-modal-title" className="text-2xl font-bold">Start Your Free Trial</h2>
    <p className="text-slate-400 mt-3">
      {subscriptionStatus === 'none' ? (
        <>Welcome! Get started with a 7-day free trial to access all dashboard features.</>
      ) : (
        <>Your subscription status is <span className="font-bold text-white">{subscriptionStatus ?? 'unknown'}</span>.<br />
        Please upgrade to access all dashboard features.</>
      )}
    </p>
    <div className="mt-6 flex gap-3">
      {subscriptionStatus === 'none' ? (
        <Link href="/start-trial" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-colors">🚀 Start Free Trial</Link>
      ) : (
        <Link href="/pricing" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-colors">View Plans</Link>
      )}
      <button onClick={onClose} className="px-5 py-2.5 rounded-full bg-slate-700/70 hover:bg-slate-600 text-sm font-medium">Close</button>
    </div>
  </BaseModal>
);

const SignInModal = ({ onClose }: { onClose: () => void }) => (
  <BaseModal labelledBy="signin-modal-title" onClose={onClose}>
    <div className="mx-auto w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 mb-4"><LockIcon /></div>
    <h2 id="signin-modal-title" className="text-2xl font-bold">Sign In Required</h2>
    <p className="text-slate-400 mt-3">Please sign in to access your dashboard and settings.</p>
    <div className="mt-6 flex gap-3">
      <Link href="/sign-in" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-colors">Sign In</Link>
      <button onClick={onClose} className="px-5 py-2.5 rounded-full bg-slate-700/70 hover:bg-slate-600 text-sm font-medium">Close</button>
    </div>
  </BaseModal>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, subscriptionStatus, subscriptionLoading, loading, refreshSubscriptionStatus } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Modal visibility states MUST be declared before any conditional return to avoid hook order variation.
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  // Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    // This effect ensures that the subscription status is up-to-date
    // whenever the user navigates within the dashboard.
    if (user && !loading) {
      refreshSubscriptionStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user]);

  // --- THIS IS THE FIX ---
  // The logic now correctly checks for 'active' OR 'trialing' status.
  const isAllowed = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  const navItems = [
    { name: 'Dashboard', icon: <HomeIcon />, href: '/dashboard' },
    { name: 'Leads', icon: <LeadsIcon />, href: '/dashboard/leads' },
    { name: 'Integrations', icon: <IntegrationsIcon />, href: '/dashboard/integrations' },
    { name: 'Settings', icon: <SettingsIcon />, href: '/dashboard/settings' },
  ];

  const brandHost = (() => {
    try { return new URL(BRAND.url).hostname; } catch { return 'trulybot.xyz'; }
  })();

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
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center"><UserIcon /></div>
            <div>
                <p className="text-sm font-semibold truncate" title={user.email || 'User'}>{user.email || 'User'}</p>
                <button onClick={signOut} className="text-xs text-slate-400 hover:underline">Sign Out</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
  
  // Display a full-screen loader while the initial auth check is happening from AuthContext.
  // Lock body scroll when any modal is open (must be declared before any early return to keep hook order stable)
  useEffect(() => {
    const anyModal = showSignIn || showSubscription;
    const original = document.documentElement.style.overflow;
    if (anyModal) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = original || '';
    }
    return () => {
      document.documentElement.style.overflow = original || '';
    };
  }, [showSignIn, showSubscription]);
  
  useEffect(() => {
    if (loading || subscriptionLoading) return;
    
    // Auth not present -> sign in modal
    if (!user) {
      setShowSignIn(true);
      setShowSubscription(false);
      return;
    }
    
    // Clear sign in modal if user is present
    setShowSignIn(false);
    
    // Only show subscription modal if user is confirmed NOT to have access
    // Allow 'active', 'trialing', and 'trial' status to access dashboard
    if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing' || subscriptionStatus === 'trial') {
      setShowSubscription(false);
    } else if (subscriptionStatus === 'expired' || subscriptionStatus === 'none') {
      // Only show modal for explicitly non-access statuses
      setShowSubscription(true);
    }
    // For any other status (including null/undefined), don't show modal until resolved
  }, [user, loading, subscriptionLoading, subscriptionStatus]);

  // Prevent hydration mismatch by showing loading until mounted, but with shorter loading states
  if (!mounted || (loading && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4" aria-busy="true" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <SignInModal onClose={() => {
      setShowSignIn(false);
      router.push('/');
    }} />;
  }

  // If we have a user, render the full dashboard layout with access control.
  return (
    <div className="h-screen w-full bg-black text-white flex font-sans overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-md z-50">Skip to main content</a>
      {/* --- Desktop Sidebar --- */}
      <aside className="w-64 flex-shrink-0 bg-[#111] border-r border-slate-800 flex-col hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* --- Mobile Sidebar & Overlay --- */}
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

      <aside 
          className={`fixed top-0 left-0 h-full w-64 bg-[#111] border-r border-slate-800 flex flex-col z-50 lg:hidden transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          aria-hidden={!sidebarOpen}
      >
          <SidebarContent />
      </aside>

  <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* --- Mobile Header --- */}
        <header className="lg:hidden h-20 flex items-center justify-between px-4 sm:px-6 border-b border-slate-800 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-white">
            <MenuIcon />
            <span className="sr-only">Open menu</span>
          </button>
          <Link href="/" className="text-xl font-bold tracking-tight">{brandHost}</Link>
          <div className="w-8"></div>
        </header>
        
        <div className="flex-1 relative overflow-y-auto focus:outline-none" role="presentation" id="dashboard-scroll-container">
          <main id="main-content" className="min-h-full p-4 sm:p-6 lg:p-8" role="main" aria-label="Dashboard main content">{children}</main>
        </div>
      </div>
      {showSubscription && user && !subscriptionLoading && !['active', 'trialing', 'trial'].includes(subscriptionStatus) && (
        <SubscriptionModal subscriptionStatus={subscriptionStatus} onClose={() => setShowSubscription(false)} />
      )}
    </div>
  );
}
