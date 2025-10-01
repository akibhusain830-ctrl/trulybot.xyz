// src/app/layout.tsx
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const siteUrl = 'https://trulybot.xyz';
const siteName = 'TrulyBot';
const title = 'TrulyBot – AI Chatbot for E‑Commerce';
const description = "India's smartest AI chatbot for e‑commerce businesses. Provide instant 24/7 support, reduce tickets, and capture more leads.";
const ogImage = `${siteUrl}/og-image.png`; // Ensure this asset exists or add it later.

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: siteName,
  keywords: [
    'AI chatbot', 'ecommerce support', 'conversational AI', 'lead generation', 'customer support automation', 'TrulyBot'
  ],
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: siteName,
    title,
    description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: title }]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@trulybot',
    creator: '@trulybot',
    title,
    description,
    images: [ogImage]
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: siteUrl
  },
  category: 'technology'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-black text-white min-h-screen">
        {/* Skip link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-md">Skip to main content</a>
        <AuthProvider>
          <div id="main-content">{children}</div>
        </AuthProvider>
        {/* Razorpay script removed; will be lazy-loaded only on checkout/start-trial */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteName,
            url: siteUrl,
            logo: `${siteUrl}/og-image.png`
          }) }}
        />
      </body>
    </html>
  );
}