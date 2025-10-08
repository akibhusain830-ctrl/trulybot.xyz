'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BRAND } from '@/lib/branding';

export default function SubscriptionRequiredPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 512 512" 
                fill="none"
                className="flex-shrink-0"
              >
                <defs>
                  <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <polygon 
                  fill="url(#lightningGradient)"
                  points="320,32 136,296 248,296 192,480 400,216 288,216"
                />
              </svg>
              {BRAND.name}
            </Link>
            
            {user && (
              <div className="text-sm text-gray-400">
                Signed in as {user.email}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Lock Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100/10 mb-8">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            Subscription Required
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            To access the TrulyBot dashboard and start building your AI chatbot, you need an active subscription or trial.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <div className="h-8 w-8 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Chatbot</h3>
              <p className="text-gray-400">Build and customize your AI-powered customer support chatbot</p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <div className="h-8 w-8 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Lead Capture</h3>
              <p className="text-gray-400">Automatically capture and manage customer leads</p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <div className="h-8 w-8 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
              <p className="text-gray-400">Track performance and optimize your chatbot</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/start-trial"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Start Free 7-Day Trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-600 text-base font-medium rounded-lg text-white hover:bg-gray-800 transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Already have a subscription? Try refreshing the page.
          </p>
        </div>
      </main>
    </div>
  );
}
