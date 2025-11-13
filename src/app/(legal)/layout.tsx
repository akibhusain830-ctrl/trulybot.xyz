import React from 'react';
import Link from 'next/link';
import { ProfessionalFooter } from '@/components/ProfessionalNavigation';

// This is the shared layout for all informational and legal pages.
// It provides a consistent header and footer, ensuring a professional look and feel.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <header className="border-b border-slate-800 sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 512 512" 
              fill="none"
              className="flex-shrink-0"
            >
              <defs>
                <linearGradient id="lightningGradientLegal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              <polygon 
                fill="url(#lightningGradientLegal)"
                points="320,32 136,296 248,296 192,480 400,216 288,216"
              />
            </svg>
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

      <ProfessionalFooter />
    </div>
  );
}

