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

// Predefined SEO configs for major pages
export const seoConfigs = {
  home: {
    title: '#1 AI Chatbot for E-Commerce | 24/7 Customer Support',
    description: 'Transform your e-commerce with TrulyBot AI chatbot. Reduce support tickets 70%, increase leads 5X. Free 7-day trial, 5-minute setup. Join 10,000+ businesses.',
    keywords: [
      'AI chatbot for ecommerce',
      'automated customer support',
      '24/7 customer service',
      'lead generation chatbot',
      'ecommerce automation',
      'customer support software',
      'AI customer service',
      'chatbot for business'
    ]
  },
  
  pricing: {
    title: 'TrulyBot Pricing - AI Chatbot Plans Starting at $5/month',
    description: 'Choose the perfect AI chatbot plan for your business. Basic $5, Pro $15, Ultra $30. Free 7-day trial, no setup fees. Scale customer support effortlessly.',
    keywords: [
      'chatbot pricing',
      'AI chatbot cost',
      'customer support software pricing',
      'affordable chatbot solution',
      'ecommerce chatbot plans'
    ]
  },

  features: {
    title: 'TrulyBot Features - Advanced AI Chatbot Capabilities',
    description: 'Discover TrulyBot\'s powerful features: 24/7 support, lead capture, multi-language, analytics, integrations. See why 10,000+ businesses choose us.',
    keywords: [
      'chatbot features',
      'AI customer support features',
      'automated lead generation',
      'chatbot capabilities',
      'customer service automation'
    ]
  },

  signup: {
    title: 'Start Free Trial - TrulyBot AI Chatbot Setup in 5 Minutes',
    description: 'Create your TrulyBot account and transform customer support today. Free 7-day trial, no credit card required. Join thousands of successful businesses.',
    keywords: [
      'chatbot free trial',
      'AI chatbot signup',
      'customer support trial',
      'ecommerce chatbot demo'
    ]
  },

  dashboard: {
    title: 'Dashboard - Manage Your AI Chatbot Performance',
    description: 'Monitor chatbot conversations, leads, analytics and settings. Optimize your AI customer support performance with detailed insights.',
    keywords: [
      'chatbot dashboard',
      'AI chatbot analytics',
      'customer support metrics',
      'chatbot management'
    ],
    noIndex: true // Private area
  }
} as const