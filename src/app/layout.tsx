// src/app/layout.tsx
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { Analytics } from "@vercel/analytics/next";
import { WebVitals } from '@/components/WebVitals';
import './globals.css';
import './chat-widget-styles.css';

const siteUrl = 'https://trulybot.xyz';
const siteName = 'TrulyBot - AI Chatbot Platform';
const title = 'AI Chatbot for Ecommerce - #1 Customer Support Automation Platform';
const description = "Transform your ecommerce with TrulyBot AI chatbot. Reduce support tickets 70%, increase leads 5X, automate customer service 24/7. Free trial, 5-minute setup. Join 10,000+ businesses worldwide.";
const ogImage = `${siteUrl}/og-image.svg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | TrulyBot - AI Chatbot Platform'
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
    // Primary high-traffic keywords for maximum organic discovery
    'AI chatbot for ecommerce', 'customer support automation', 'ecommerce chatbot', 'automated customer service', 'lead generation chatbot',
    'AI customer support', 'chatbot for business', 'customer service chatbot', 'ecommerce automation', 'automated support',
    'best AI chatbot for ecommerce', 'customer support software', 'automated customer support', 'ecommerce customer service', 'AI customer service platform',
    'chatbot customer support', 'automated help desk', 'customer service automation software', 'ecommerce support automation', 'AI powered customer service',
    'intelligent chatbot', 'customer service automation', 'chat widget', 'help desk automation', 'AI assistant for business',
    'trulybot chatbot', 'best AI chatbot', 'ecommerce support software', 'automated lead capture', 'customer support AI'
  ],
  classification: 'Business Software',
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: siteName,
    title: 'AI Chatbot for Ecommerce - #1 Customer Support Automation Platform',
    description: 'Transform your ecommerce with TrulyBot AI chatbot. Reduce support tickets 70%, increase leads 5X, automate customer service 24/7. Free trial, 5-minute setup. Join 10,000+ businesses.',
    images: [
      { 
        url: ogImage, 
        width: 1200, 
        height: 630, 
        alt: 'TrulyBot AI Chatbot for E-Commerce - Lightning-Fast 24/7 Customer Support & Lead Generation',
        type: 'image/svg+xml'
      },
      {
        url: `${siteUrl}/logo-trulybot.svg`,
        width: 400,
        height: 400,
        alt: 'TrulyBot Logo - Lightning-Fast AI Chatbot Platform with Thunderbolt Speed'
      }
    ],
    locale: 'en_US',
    countryName: 'India'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@trulybot',
    creator: '@trulybot', 
    title: 'TrulyBot - Lightning-Fast AI Chatbot That Converts Visitors Into Customers',
    description: 'See how TrulyBot AI chatbot helps e-commerce businesses reduce support load by 70% and increase leads by 5X. Free 7-day trial.',
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
    canonical: siteUrl,
    languages: {
      'en-US': `${siteUrl}`,
      'en-GB': `${siteUrl}/en-gb`,
      'en-IN': `${siteUrl}/en-in`,
      'x-default': siteUrl
    }
  },
  manifest: '/manifest.json',
  other: {
    'humans': '/humans.txt'
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': `${siteUrl}/#organization`,
            name: siteName,
            alternateName: 'TrulyBot AI Chatbot Platform',
            url: siteUrl,
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/logo-trulybot.svg`,
              width: 400,
              height: 400,
              caption: '⚡ TrulyBot Logo - AI Chatbot Platform for Ecommerce'
            },
            description: 'Advanced AI chatbot platform for ecommerce businesses. Reduce support tickets by 70%, increase leads by 5X with automated customer service.',
            foundingDate: '2024',
            founder: {
              '@type': 'Person',
              name: 'TrulyBot Team'
            },
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'MG Path, Christian Basti',
              addressLocality: 'Guwahati',
              addressRegion: 'Assam',
              postalCode: '781005',
              addressCountry: 'IN'
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+91-9101361482',
              contactType: 'customer service',
              email: 'infotrulybot@gmail.com',
              availableLanguage: ['English'],
              areaServed: 'Worldwide'
            },
            sameAs: [
              'https://twitter.com/trulybot',
              'https://linkedin.com/company/trulybot'
            ],
            serviceArea: {
              '@type': 'Place',
              name: 'Worldwide'
            },
            knowsAbout: [
              'AI Chatbots for Ecommerce',
              'Customer Support Automation',
              'Ecommerce Solutions',
              'Lead Generation Automation',
              'Conversational AI',
              'Automated Customer Service',
              'Business Process Automation'
            ],
            priceRange: '$0-$299',
            currenciesAccepted: ['USD', 'EUR', 'GBP', 'INR'],
            paymentAccepted: ['Credit Card', 'PayPal', 'Stripe', 'Razorpay']
          }) }}
        />
        <WebVitals />
        <Analytics />
      </body>
    </html>
  );
}