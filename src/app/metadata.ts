import { Metadata } from 'next';

// Homepage metadata - exported for root layout
export const homepageMetadata: Metadata = {
  title: 'AI Chatbot for Ecommerce - #1 Customer Support Automation Platform',
  description: "Transform your ecommerce with TrulyBot AI chatbot. Reduce support tickets 70%, increase leads 5X, automate customer service 24/7. Free trial, 5-minute setup. Join 10,000+ businesses.",
  keywords: [
    // Primary high-volume keywords for maximum organic traffic
    'AI chatbot for ecommerce',
    'customer support automation', 
    'ecommerce chatbot',
    'automated customer service',
    'lead generation chatbot',
    'AI customer support',
    'chatbot for business',
    'customer service chatbot',
    'ecommerce automation',
    'automated support',
    'best AI chatbot for ecommerce',
    'customer support software',
    'automated customer support',
    'ecommerce customer service',
    'AI customer service platform',
    'chatbot customer support',
    'automated help desk',
    'customer service automation software',
    'ecommerce support automation',
    'AI powered customer service'
  ],
  openGraph: {
    title: 'AI Chatbot for Ecommerce - #1 Customer Support Automation Platform',
    description: 'Transform your ecommerce with TrulyBot AI chatbot. Reduce support tickets 70%, increase leads 5X, automate customer service 24/7. Join 10,000+ businesses worldwide.',
    url: 'https://trulybot.xyz',
    siteName: 'TrulyBot - AI Chatbot Platform',
    images: [
      {
        url: 'https://trulybot.xyz/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'TrulyBot AI Chatbot for Ecommerce - Customer Support Automation Platform',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chatbot for Ecommerce - #1 Customer Support Automation',
    description: 'Transform your ecommerce with TrulyBot AI chatbot. Reduce support tickets 70%, increase leads 5X. Free trial available.',
    images: ['https://trulybot.xyz/og-image.svg'],
  },
  alternates: {
    canonical: 'https://trulybot.xyz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};