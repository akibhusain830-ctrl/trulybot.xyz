import { generateAdvancedSEOMetadata, SEOIntelligenceConfig } from './seo-intelligence';
import { generateCompleteSchemaCollection } from './advanced-structured-data';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  // Enhanced SEO features
  voiceSearchOptimized?: boolean;
  featuredSnippetTargeting?: boolean;
  userIntent?: 'informational' | 'commercial' | 'transactional';
  userLocation?: 'india' | 'global';
  pageType?: 'homepage' | 'product' | 'blog' | 'landing' | 'location';
}

export interface Metadata {
  title: string;
  description: string;
  keywords?: string[];
  authors?: Array<{ name: string }>;
  creator?: string;
  publisher?: string;
  robots?: any;
  openGraph?: any;
  twitter?: any;
  alternates?: any;
  other?: Record<string, string>;
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = '/og-trulybot-ai-chatbot.jpg',
  noIndex = false,
  voiceSearchOptimized = false,
  featuredSnippetTargeting = false,
  userIntent = 'commercial',
  userLocation = 'global',
  pageType = 'product'
}: SEOConfig): Metadata {
  // Use advanced SEO intelligence if enhanced features are enabled
  if (voiceSearchOptimized || featuredSnippetTargeting || userIntent !== 'commercial') {
    const intelligenceConfig: SEOIntelligenceConfig = {
      userIntent,
      userLocation,
      pageType,
      voiceSearchOptimized,
      featuredSnippetTargeting
    };
    
    return generateAdvancedSEOMetadata(intelligenceConfig);
  }
  
  // Fallback to standard SEO metadata
  const siteUrl = 'https://trulybot.xyz'
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl
  const fullTitle = title.includes('TrulyBot') ? title : `${title} | TrulyBot`

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
    authors: [{ name: 'TrulyBot Team' }],
    creator: 'TrulyBot',
    publisher: 'TrulyBot',
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'TrulyBot',
      locale: userLocation === 'india' ? 'en_IN' : 'en_US',
      type: 'website',
      images: [`${siteUrl}${ogImage}`]
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

// Enhanced SEO configs with voice search and featured snippet optimization
export const seoConfigs = {
  home: {
    title: 'TrulyBot - #1 AI Chatbot for E-Commerce | 24/7 Customer Support',
    description: 'Transform your e-commerce with TrulyBot AI chatbot. Reduce support tickets 70%, increase leads 5X. Free 7-day trial, 5-minute setup. Join businesses worldwide.',
    keywords: [
      'AI chatbot for ecommerce',
      'automated customer support',
      '24/7 customer service',
      'lead generation chatbot',
      'ecommerce automation',
      'customer support software',
      'AI customer service',
      'chatbot for business',
      'intelligent customer support',
      'automated lead capture',
      'instant AI responses',
      'smart chatbot deployment',
      // Voice search keywords
      'what is the best AI chatbot for ecommerce',
      'how to reduce customer support tickets with AI',
      'which chatbot increases sales the most'
    ],
    voiceSearchOptimized: false,
    featuredSnippetTargeting: false,
    userIntent: 'commercial' as const,
    pageType: 'homepage' as const
  },

  about: {
    title: 'About TrulyBot - Advanced AI Chatbot Platform',
    description: 'Discover TrulyBot\'s mission to revolutionize e-commerce customer support with intelligent AI chatbots. Learn about our cutting-edge technology and vision for the future.',
    keywords: [
      'about trulybot',
      'AI chatbot company',
      'chatbot technology innovation',
      'intelligent AI platform',
      'advanced chatbot technology',
      'AI customer service company',
      'chatbot startup story',
      'ecommerce AI solutions',
      // Voice search additions
      'who founded TrulyBot AI chatbot',
      'what makes TrulyBot different from other chatbots'
    ],
    userIntent: 'informational' as const,
    featuredSnippetTargeting: true
  },

  contact: {
    title: 'Contact TrulyBot - Get Expert Support & Demo',
    description: 'Contact TrulyBot for personalized support and product demos. Reach our AI experts for assistance with chatbot implementation and questions.',
    keywords: [
      'contact trulybot',
      'chatbot support',
      'AI chatbot demo',
      'customer service contact',
      'chatbot sales contact',
      'AI support team',
      'chatbot consultation',
      'expert chatbot help',
      // Voice search
      'how to contact TrulyBot support team',
      'where to get AI chatbot demo'
    ],
    userIntent: 'transactional' as const
  },

  pricing: {
    title: 'AI Chatbot Pricing - Affordable Plans Starting $5/month | TrulyBot',
    description: 'Transparent AI chatbot pricing with plans for every business size. Starting at $5/month with free trial. No setup fees, cancel anytime.',
    keywords: [
      'AI chatbot pricing',
      'chatbot cost',
      'affordable AI chatbot',
      'chatbot subscription plans',
      'AI customer service pricing',
      'chatbot monthly cost',
      'best value chatbot platform',
      // Voice search pricing queries
      'how much does an AI chatbot cost',
      'what is the cheapest AI chatbot for small business',
      'AI chatbot pricing comparison'
    ],
    voiceSearchOptimized: true,
    featuredSnippetTargeting: true,
    userIntent: 'commercial' as const
  },

  privacy: {
    title: 'Privacy Policy - TrulyBot Data Protection & Security',
    description: 'TrulyBot privacy policy ensures secure, compliant data handling for your AI chatbot. Learn how we protect customer data with enterprise-grade security.',
    keywords: [
      'trulybot privacy policy',
      'chatbot data privacy',
      'AI data protection',
      'secure chatbot service',
      'GDPR compliant chatbot',
      'data security policy',
      'private AI conversations'
    ],
    userIntent: 'informational' as const
  },

  terms: {
    title: 'Terms of Service - TrulyBot Legal Terms & Conditions',
    description: 'TrulyBot terms of service for AI chatbot usage. Clear, fair terms for professional chatbot deployment and comprehensive customer support.',
    keywords: [
      'trulybot terms of service',
      'chatbot terms conditions',
      'AI service agreement',
      'chatbot usage terms',
      'SaaS terms of service',
      'AI chatbot legal terms'
    ],
    userIntent: 'informational' as const
  },

  dashboard: {
    title: 'Dashboard - TrulyBot AI Chatbot Management',
    description: 'Manage your TrulyBot AI chatbot with our intuitive dashboard. Monitor conversations, track leads, and analyze performance with real-time insights.',
    keywords: [
      'chatbot dashboard',
      'AI chatbot management',
      'customer support analytics',
      'chatbot performance metrics',
      'conversation management',
      'lead tracking dashboard',
      'AI insights platform'
    ],
    noIndex: true, // Private area
    userIntent: 'transactional' as const
  },

  widget: {
    title: 'Chat Widget - TrulyBot AI Customer Support',
    description: 'Experience TrulyBot\'s intelligent AI chat widget. Fast responses, seamless customer support, and effortless e-commerce integration.',
    keywords: [
      'AI chat widget',
      'customer support widget',
      'live chat software',
      'website chatbot',
      'ecommerce chat widget',
      'instant customer support',
      'smart chat interface'
    ],
    userIntent: 'commercial' as const
  },

  features: {
    title: 'TrulyBot Features - Comprehensive AI Chatbot Capabilities',
    description: 'Discover TrulyBot\'s powerful features: 24/7 support, advanced lead capture, multi-language support, detailed analytics, and seamless integrations. See why businesses choose us.',
    keywords: [
      'chatbot features',
      'AI customer support features',
      'automated lead generation',
      'chatbot capabilities',
      'customer service automation',
      'advanced chatbot features',
      'intelligent AI responses',
      // Voice search additions
      'what features does TrulyBot AI chatbot have',
      'how does AI chatbot generate leads automatically'
    ],
    voiceSearchOptimized: true,
    featuredSnippetTargeting: true,
    userIntent: 'informational' as const
  },

  signup: {
    title: 'Start Free Trial - TrulyBot AI Chatbot Setup in 5 Minutes',
    description: 'Create your TrulyBot account and transform customer support today. Free 7-day trial, no credit card required. Join thousands of successful businesses.',
    keywords: [
      'chatbot free trial',
      'AI chatbot signup',
      'customer support trial',
      'ecommerce chatbot demo',
      'quick chatbot setup',
      'instant registration'
    ]
  }
} as const