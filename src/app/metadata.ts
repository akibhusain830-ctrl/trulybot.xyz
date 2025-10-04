import { Metadata } from 'next';

// Homepage metadata - exported for root layout
export const homepageMetadata: Metadata = {
  title: 'TrulyBot - #1 AI Chatbot for E-Commerce | 24/7 Customer Support & Lead Generation',
  description: "Transform your e-commerce customer support with TrulyBot's AI chatbot. Get 70% fewer tickets, 5X more leads, and 24/7 automated support. Free 7-day trial. Setup in 5 minutes.",
  keywords: [
    'AI chatbot for ecommerce',
    'automated customer support', 
    '24/7 customer service',
    'lead generation chatbot',
    'ecommerce automation',
    'customer support software',
    'AI customer service',
    'chatbot for business',
    'website chatbot',
    'live chat software',
    'conversational AI platform',
    'business chatbot',
    'ecommerce chatbot',
    'customer support bot',
    'automated customer service',
    'customer engagement software',
    'sales chatbot',
    'support ticket reduction',
    'AI powered support',
    'intelligent chatbot',
    'customer service automation',
    'chat widget',
    'help desk automation',
    'AI assistant for business',
    'trulybot chatbot',
    'best AI chatbot',
    'ecommerce support software',
    'automated lead capture',
    'customer support AI'
  ],
  openGraph: {
    title: 'TrulyBot - #1 AI Chatbot That Transforms E-Commerce Support',
    description: 'Join 10,000+ businesses using TrulyBot AI chatbot. Reduce support tickets by 70%, capture 5X more leads, and provide 24/7 automated customer service.',
    url: 'https://trulybot.xyz',
    siteName: 'TrulyBot',
    images: [
      {
        url: 'https://trulybot.xyz/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'TrulyBot AI Chatbot for E-Commerce - 24/7 Customer Support & Lead Generation',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrulyBot - #1 AI Chatbot That Transforms E-Commerce Support',
    description: 'Join 10,000+ businesses using TrulyBot AI chatbot. Reduce support tickets by 70%, capture 5X more leads.',
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