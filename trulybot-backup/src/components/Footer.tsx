import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-slate-800">
      <div className="container mx-auto px-6 py-10 text-center text-slate-400">
        <h2 className="text-xl font-bold text-white tracking-tight">trulybot.xyz</h2>
        <div className="mt-6 flex justify-center items-center flex-wrap gap-x-6 gap-y-3">
          <Link href="/about" className="text-sm hover:text-white transition-colors">About</Link>
          <Link href="/pricing" className="text-sm hover:text-white transition-colors">Pricing</Link>
          <Link href="/contact" className="text-sm hover:text-white transition-colors">Contact</Link>
          <Link href="/privacy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-sm hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/refund-policy" className="text-sm hover:text-white transition-colors">Refund Policy</Link>
        </div>
        <p className="mt-8 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} TrulyBot. All rights reserved.
        </p>
      </div>
    </footer>
  );
}