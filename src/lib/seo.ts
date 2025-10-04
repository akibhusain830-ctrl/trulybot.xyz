import { Metadata } from 'next'

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  noIndex?: boolean
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = '/og-trulybot-ai-chatbot.jpg',
  noIndex = false
}: SEOConfig): Metadata {
  const siteUrl = 'https://trulybot.xyz'
  const fullTitle = `${title} | TrulyBot - AI Chatbot for E-Commerce`
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl

  return {
    title: fullTitle,
    description,
    keywords: [
      ...keywords,
      'TrulyBot',
      'AI chatbot',
      'ecommerce chatbot',
      'customer support automation',
      'lead generation'
    ],
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'TrulyBot',
      images: [
        {
          url: `${siteUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${siteUrl}${ogImage}`]
    },
    alternates: {
      canonical: canonicalUrl
    },
    robots: noIndex ? 'noindex,nofollow' : 'index,follow'
  }
}

// World-class SEO configs for maximum search visibility
export const seoConfigs = {
  home: {
    title: 'TrulyBot - #1 AI Chatbot for E-Commerce | 24/7 Customer Support',
    description: 'Transform your e-commerce with TrulyBot AI chatbot. Reduce support tickets 70%, increase leads 5X. Free 7-day trial, 5-minute setup. Join 10,000+ businesses.',
    keywords: [
      'AI chatbot for ecommerce',
      'automated customer support',
      '24/7 customer service',
      'lead generation chatbot',
      'ecommerce automation',
      'customer support software',
      'AI customer service',
      'chatbot for business',
      'thunderbolt fast chatbot',
      'lightning speed customer support',
      'instant AI responses',
      'rapid chatbot deployment'
    ]
  },

  about: {
    title: 'About TrulyBot - Lightning-Fast AI Chatbot Innovation',
    description: 'Discover TrulyBot\'s mission to revolutionize e-commerce customer support with lightning-fast AI chatbots. Learn about our thunderbolt-speed technology and vision.',
    keywords: [
      'about trulybot',
      'AI chatbot company',
      'chatbot technology innovation',
      'lightning fast AI',
      'thunderbolt chatbot speed',
      'AI customer service company',
      'chatbot startup story',
      'ecommerce AI solutions'
    ]
  },

  contact: {
    title: 'Contact TrulyBot - Get Lightning-Fast Support',
    description: 'Contact TrulyBot for thunderbolt-speed support and demos. Reach our AI experts for instant assistance with chatbot implementation and questions.',
    keywords: [
      'contact trulybot',
      'chatbot support',
      'AI chatbot demo',
      'customer service contact',
      'chatbot sales contact',
      'AI support team',
      'instant chatbot help',
      'lightning fast support'
    ]
  },

  privacy: {
    title: 'Privacy Policy - TrulyBot Data Protection',
    description: 'TrulyBot privacy policy ensures lightning-fast, secure data handling for your AI chatbot. Learn how we protect customer data with thunderbolt security.',
    keywords: [
      'trulybot privacy policy',
      'chatbot data privacy',
      'AI data protection',
      'secure chatbot service',
      'GDPR compliant chatbot',
      'data security policy',
      'private AI conversations'
    ]
  },

  terms: {
    title: 'Terms of Service - TrulyBot Legal Terms',
    description: 'TrulyBot terms of service for AI chatbot usage. Clear, fair terms for lightning-fast chatbot deployment and thunderbolt-speed customer support.',
    keywords: [
      'trulybot terms of service',
      'chatbot terms conditions',
      'AI service agreement',
      'chatbot usage terms',
      'SaaS terms of service',
      'AI chatbot legal terms'
    ]
  },

  dashboard: {
    title: 'Dashboard - TrulyBot AI Chatbot Management',
    description: 'Manage your TrulyBot AI chatbot with lightning-fast dashboard. Monitor conversations, leads, analytics with thunderbolt-speed insights.',
    keywords: [
      'chatbot dashboard',
      'AI chatbot management',
      'customer support analytics',
      'chatbot performance metrics',
      'conversation management',
      'lead tracking dashboard',
      'AI insights platform'
    ],
    noIndex: true // Private area
  },

  widget: {
    title: 'Chat Widget - TrulyBot AI Customer Support',
    description: 'Experience TrulyBot\'s lightning-fast AI chat widget. Thunderbolt-speed responses, instant customer support, seamless e-commerce integration.',
    keywords: [
      'AI chat widget',
      'customer support widget',
      'live chat software',
      'website chatbot',
      'ecommerce chat widget',
      'instant customer support',
      'lightning fast chat'
    ]
  },
  
  pricing: {
    title: 'TrulyBot Pricing - Lightning-Fast AI Chatbot Plans Starting at $5/month',
    description: 'Choose the perfect AI chatbot plan for your business. Basic $5, Pro $15, Ultra $30. Free 7-day trial, no setup fees. Scale customer support effortlessly.',
    keywords: [
      'chatbot pricing',
      'AI chatbot cost',
      'customer support software pricing',
      'affordable chatbot solution',
      'ecommerce chatbot plans',
      'thunderbolt speed pricing',
      'instant AI chatbot plans'
    ]
  },

  features: {
    title: 'TrulyBot Features - Lightning-Fast AI Chatbot Capabilities',
    description: 'Discover TrulyBot\'s powerful features: 24/7 support, lead capture, multi-language, analytics, integrations. See why 10,000+ businesses choose us.',
    keywords: [
      'chatbot features',
      'AI customer support features',
      'automated lead generation',
      'chatbot capabilities',
      'customer service automation',
      'thunderbolt fast features',
      'lightning AI responses'
    ]
  },

  signup: {
    title: 'Start Free Trial - TrulyBot AI Chatbot Setup in 5 Minutes',
    description: 'Create your TrulyBot account and transform customer support today. Free 7-day trial, no credit card required. Join thousands of successful businesses.',
    keywords: [
      'chatbot free trial',
      'AI chatbot signup',
      'customer support trial',
      'ecommerce chatbot demo',
      'instant chatbot setup',
      'lightning fast registration'
    ]
  }
} as const