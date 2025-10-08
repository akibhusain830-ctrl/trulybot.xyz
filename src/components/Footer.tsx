import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-slate-800" role="contentinfo">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold text-white tracking-tight mb-4">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 512 512" 
                fill="none"
                className="inline-block mr-1 -mt-1"
              >
                <defs>
                  <linearGradient id="footerLightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <polygon 
                  fill="url(#footerLightningGradient)"
                  points="320,8 136,296 248,296 192,504 400,216 288,216"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <polygon 
                  fill="#ffffff"
                  opacity="0.3"
                  points="310,20 146,290 240,290 200,480 380,220 280,220"
                />
              </svg>
              TrulyBot
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Lightning-fast AI chatbot platform for e-commerce businesses. Reduce support tickets by 70% with thunderbolt-speed automation.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <nav className="space-y-2">
              <Link href="/pricing" className="block text-sm text-slate-400 hover:text-white transition-colors" title="TrulyBot AI Chatbot Pricing Plans">Pricing</Link>
              <Link href="/ai-chatbot-for-ecommerce" className="block text-sm text-slate-400 hover:text-white transition-colors" title="AI Chatbot for E-commerce">Features</Link>
              <Link href="/start-trial" className="block text-sm text-slate-400 hover:text-white transition-colors" title="Start Free Trial - Lightning-Fast Setup">Free Trial</Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <nav className="space-y-2">
              <Link href="/about" className="block text-sm text-slate-400 hover:text-white transition-colors" title="About TrulyBot AI Chatbot Company">About</Link>
              <Link href="/contact" className="block text-sm text-slate-400 hover:text-white transition-colors" title="Contact TrulyBot Support Team">Contact</Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <nav className="space-y-2">
              <Link href="/privacy" className="block text-sm text-slate-400 hover:text-white transition-colors" title="TrulyBot Privacy Policy">Privacy Policy</Link>
              <Link href="/terms" className="block text-sm text-slate-400 hover:text-white transition-colors" title="TrulyBot Terms of Service">Terms of Service</Link>
              <Link href="/refund-policy" className="block text-sm text-slate-400 hover:text-white transition-colors" title="TrulyBot Refund Policy">Refund Policy</Link>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} TrulyBot Pvt. Ltd. All rights reserved. 
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 512 512" 
                fill="none"
                className="inline-block mx-1"
              >
                <defs>
                  <linearGradient id="footerSmallLightning1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <polygon 
                  fill="url(#footerSmallLightning1)"
                  points="320,8 136,296 248,296 192,504 400,216 288,216"
                />
              </svg>
              Lightning-fast AI chatbot platform.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-slate-500">Made in India with 
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 512 512" 
                  fill="none"
                  className="inline-block mx-1"
                >
                  <defs>
                    <linearGradient id="footerSmallLightning2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                      <stop offset="50%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  <polygon 
                    fill="url(#footerSmallLightning2)"
                    points="320,8 136,296 248,296 192,504 400,216 288,216"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
