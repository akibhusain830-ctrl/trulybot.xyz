import React from 'react';
import Link from 'next/link';

// This is the shared layout for all informational and legal pages.
// It provides a consistent header and footer, ensuring a professional look and feel.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <header className="border-b border-slate-800 sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            trulybot.xyz
          </Link>
          <div>
            <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12 flex-grow">
        {/* The content of each individual page (About, Privacy, etc.) will be rendered here */}
        {children}
      </main>

      <footer className="border-t border-slate-800 mt-12">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} TrulyBot. All rights reserved.</p>
          <div className="mt-4 flex justify-center items-center flex-wrap gap-x-6 gap-y-2">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

