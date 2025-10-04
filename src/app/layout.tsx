// src/app/layout.tsx
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { Analytics } from "@vercel/analytics/next";
import './globals.css';

const siteUrl = 'https://trulybot.xyz';
const siteName = 'TrulyBot';
const title = 'TrulyBot - #1 AI Chatbot for E-Commerce | 24/7 Customer Support & Lead Generation';
const description = "Transform your e-commerce customer support with TrulyBot's AI chatbot. Get 70% fewer tickets, 5X more leads, and 24/7 automated support. Free 7-day trial. Setup in 5 minutes.";
const ogImage = `${siteUrl}/og-image.svg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | TrulyBot - AI Chatbot for E-Commerce'
  },
  description,
  applicationName: siteName,
  authors: [{ name: 'TrulyBot Team', url: siteUrl }],
  creator: 'TrulyBot',
  publisher: 'TrulyBot',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    'TrulyBot', 'AI chatbot', 'ecommerce chatbot', 'customer support bot', 'lead generation chatbot',
    'automated customer service', 'live chat software', 'conversational AI platform', 'business chatbot',
    'website chatbot', '24/7 customer support', 'AI customer service', 'chatbot for business',
    'ecommerce automation', 'customer engagement software', 'sales chatbot', 'support ticket reduction',
    'AI powered support', 'intelligent chatbot', 'customer service automation', 'chat widget',
    'help desk automation', 'customer support software', 'AI assistant for business', 'trulybot chatbot',
    'best AI chatbot', 'ecommerce support software', 'automated lead capture', 'customer support AI'
  ],
  classification: 'Business Software',
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: siteName,
    title: 'TrulyBot - #1 AI Chatbot That Transforms E-Commerce Support',
    description: 'Join 10,000+ businesses using TrulyBot AI chatbot. Reduce support tickets by 70%, capture 5X more leads, and provide 24/7 automated customer service. Start free trial today.',
    images: [
      { 
        url: ogImage, 
        width: 1200, 
        height: 630, 
        alt: 'TrulyBot AI Chatbot for E-Commerce - 24/7 Customer Support & Lead Generation',
        type: 'image/svg+xml'
      },
      {
        url: `${siteUrl}/logo-trulybot.svg`,
        width: 400,
        height: 400,
        alt: 'TrulyBot Logo - AI Chatbot Platform'
      }
    ],
    locale: 'en_US',
    countryName: 'India'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@trulybot',
    creator: '@trulybot', 
    title: 'TrulyBot - AI Chatbot That Converts Visitors Into Customers',
    description: 'See how TrulyBot AI chatbot helped 10,000+ e-commerce businesses reduce support load by 70% and increase leads by 5X. Free 7-day trial.',
    images: [ogImage]
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/logo-trulybot.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.svg'
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
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
            logo: `${siteUrl}/logo-trulybot.svg`
          }) }}
        />
        <Analytics />
      </body>
    </html>
  );
}