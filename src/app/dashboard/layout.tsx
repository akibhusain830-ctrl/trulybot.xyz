'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BRAND } from '@/lib/branding';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion'; // <-- Added motion imports

// --- Icons ---
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
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

// --- Modern Subscription Modal ---
const SubscriptionModal = ({ user, subscriptionStatus }: { user: any, subscriptionStatus: string | null }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-700 rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl flex flex-col items-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
        <LockIcon />
      </div>
      <h2 className="text-2xl font-bold mt-6">Access Restricted</h2>
      <p className="text-slate-400 mt-2">
        Your subscription status is <span className="font-bold text-white">{subscriptionStatus ?? "unknown"}</span>.<br />
        Please upgrade to access all dashboard features.
      </p>
      <div className="mt-6 mb-2">
        <Link href="/pricing" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
          View Plans
        </Link>
      </div>
      <div className="text-xs text-slate-500 mt-2">
        User ID: <span className="font-mono">{user?.id ?? "none"}</span>
      </div>
    </div>
  </div>
);

// --- Sign In Required Modal ---
const SignInModal = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-700 rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl flex flex-col items-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
        <LockIcon />
      </div>
      <h2 className="text-2xl font-bold mt-6">Sign in Required</h2>
      <p className="text-slate-400 mt-2">
        Please sign in to access your dashboard and settings.
      </p>
      <div className="mt-6 mb-2">
        <Link href="/sign-in" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, subscriptionStatus, loading, refreshSubscriptionStatus } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      setCheckingSubscription(true);
      refreshSubscriptionStatus().finally(() => setCheckingSubscription(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user?.id]);

  const shouldLock = !!user && !loading && !checkingSubscription && subscriptionStatus !== 'active';
  const shouldSignIn = !user && !loading && !checkingSubscription;

  const navItems = [
    { name: 'Dashboard', icon: <HomeIcon />, href: '/dashboard' },
    { name: 'Leads', icon: <LeadsIcon />, href: '/dashboard/leads' },
    { name: 'Settings', icon: <SettingsIcon />, href: '/dashboard/settings' },
  ];

  const brandHost = (() => {
    try { return new URL(BRAND.url).hostname; } catch { return 'trulybot.xyz'; }
  })();

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center px-6 border-b border-slate-800 flex-shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight">{brandHost}</Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
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
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center"><UserIcon /></div>
           <div>
              <p className="text-sm font-semibold truncate" title={user?.email || 'User'}>{user?.email || 'User'}</p>
              <button onClick={signOut} className="text-xs text-slate-400 hover:underline">Sign Out</button>
           </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen w-full bg-black text-white flex font-sans overflow-hidden">
      {/* --- Desktop Sidebar --- */}
      <aside className="w-64 flex-shrink-0 bg-[#111] border-r border-slate-800 flex-col hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* --- Mobile Sidebar & Overlay (REVISED STRUCTURE) --- */}
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

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* --- Mobile Header --- */}
        <header className="lg:hidden h-20 flex items-center justify-between px-4 sm:px-6 border-b border-slate-800 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-white">
            <MenuIcon />
            <span className="sr-only">Open menu</span>
          </button>
          <Link href="/" className="text-xl font-bold tracking-tight">{brandHost}</Link>
          <div className="w-8"></div> {/* Spacer to balance the header */}
        </header>
        <div className="flex-1 relative overflow-y-auto">
            {(loading || checkingSubscription) ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                <main>{children}</main>
                {shouldSignIn && <SignInModal />}
                {shouldLock && <SubscriptionModal user={user} subscriptionStatus={subscriptionStatus} />}
              </>
            )}
        </div>
      </div>
    </div>
  );
}
