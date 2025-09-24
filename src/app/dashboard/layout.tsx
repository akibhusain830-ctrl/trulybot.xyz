'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BRAND } from '@/lib/branding';
import { useAuth } from '@/context/AuthContext';

// --- Icons ---
const HomeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> );
const LeadsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> );
const SettingsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.82l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.82l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> );
const MenuIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg> );
const LockIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> );


const SubscriptionModal = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                <LockIcon />
            </div>
            <h2 className="text-2xl font-bold mt-6">Upgrade to Unlock</h2>
            <p className="text-slate-400 mt-2">
                Subscribe to a plan or start a free trial to access all dashboard features.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/pricing" className="w-full bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
                    View Plans
                </Link>
                <Link href="/trial" className="w-full bg-slate-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-600 transition-colors">
                    Start Free Trial
                </Link>
            </div>
        </div>
    </div>
);


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, subscriptionStatus, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isSubscribed = subscriptionStatus === 'active';

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
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <Link href="/" className="text-xl font-bold tracking-tight">{brandHost}</Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
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
      <div className="p-4 border-t border-slate-800">
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
    <div className="min-h-screen w-full bg-black text-white flex font-sans">
      {/* --- Desktop Sidebar --- */}
      <aside className="w-64 flex-shrink-0 bg-[#111] border-r border-slate-800 flex-col hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* --- Mobile Sidebar --- */}
      <div className={`fixed inset-y-0 left-0 z-40 lg:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <aside className="w-64 h-full bg-[#111] border-r border-slate-800 flex flex-col">
          <SidebarContent />
        </aside>
      </div>
      
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
        
        <main className={`flex-1 overflow-y-auto transition-filter duration-300 ${!isSubscribed && !loading ? 'blur-md' : ''}`}>
          {children}
        </main>

        {!isSubscribed && !loading && <SubscriptionModal />}
      </div>
    </div>
  );
}
