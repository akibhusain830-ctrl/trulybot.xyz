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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trulybot.xyz'
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

// Enhanced SEO configs optimized for maximum organic traffic
export const seoConfigs = {
  home: {
    title: 'AI Chatbot for Ecommerce - #1 Customer Support Automation Platform',
    description: 'Transform your ecommerce with TrulyBot AI chatbot. Reduce support tickets 70%, increase leads 5X, automate customer service 24/7. Free trial, 5-minute setup. Join 10,000+ businesses.',
    keywords: [
      // Primary high-volume keywords
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
      // Secondary high-intent keywords
      'best AI chatbot for ecommerce',
      'customer support software',
      'automated customer support',
      'ecommerce customer service',
      'AI customer service platform',
      'chatbot customer support',
      'automated help desk',
      'customer service automation software',
      'ecommerce support automation',
      'AI powered customer service',
      // Long-tail high-converting keywords
      'AI chatbot that increases sales',
      'automated customer support for online stores',
      'best customer service chatbot for ecommerce',
      'AI chatbot to reduce support tickets'
    ],
    voiceSearchOptimized: true,
    featuredSnippetTargeting: true,
    userIntent: 'commercial' as const,
    pageType: 'homepage' as const
  },

  about: {
    title: 'About TrulyBot - Advanced AI Chatbot Platform for Customer Support',
    description: 'Discover TrulyBot\'s mission to revolutionize ecommerce customer support with intelligent AI chatbots. Learn about our cutting-edge technology and vision for automated customer service.',
    keywords: [
      'about trulybot',
      'AI chatbot company',
      'customer support automation company',
      'chatbot technology innovation',
      'intelligent AI platform',
      'advanced chatbot technology',
      'AI customer service company',
      'ecommerce automation company',
      'chatbot startup story',
      'AI customer support platform',
      'automated customer service technology',
      'ecommerce AI solutions'
    ],
    userIntent: 'informational' as const,
    featuredSnippetTargeting: true
  },

  contact: {
    title: 'Contact TrulyBot - Get Expert AI Chatbot Support & Demo',
    description: 'Contact TrulyBot for personalized AI chatbot support and product demos. Reach our customer support automation experts for assistance with chatbot implementation.',
    keywords: [
      'contact trulybot',
      'AI chatbot support',
      'customer support automation demo',
      'AI chatbot demo',
      'customer service contact',
      'chatbot sales contact',
      'AI support team',
      'chatbot consultation',
      'expert chatbot help',
      'AI customer service demo',
      'automated support consultation'
    ],
    userIntent: 'transactional' as const
  },

  pricing: {
    title: 'AI Chatbot Pricing - Affordable Plans Starting Free | Customer Support Automation',
    description: 'Transparent AI chatbot pricing with plans for every business size. Free plan available, paid plans start at $29/month. No setup fees, cancel anytime. 5-minute setup.',
    keywords: [
      'AI chatbot pricing',
      'customer support automation pricing',
      'chatbot cost',
      'affordable AI chatbot',
      'chatbot subscription plans',
      'AI customer service pricing',
      'ecommerce chatbot pricing',
      'chatbot monthly cost',
      'best value chatbot platform',
      'cheap AI chatbot',
      'customer support software pricing',
      // Voice search pricing queries
      'how much does an AI chatbot cost',
      'what is the cheapest AI chatbot for small business',
      'AI chatbot pricing comparison',
      'best affordable customer support automation',
      'customer service chatbot cost comparison'
    ],
    voiceSearchOptimized: true,
    featuredSnippetTargeting: true,
    userIntent: 'commercial' as const
  },

  privacy: {
    title: 'Privacy Policy - TrulyBot Data Protection & AI Chatbot Security',
    description: 'TrulyBot privacy policy ensures secure, compliant data handling for your AI chatbot and customer support automation. Learn how we protect customer data with enterprise-grade security.',
    keywords: [
      'trulybot privacy policy',
      'AI chatbot data privacy',
      'customer support automation privacy',
      'chatbot data protection',
      'AI data security',
      'secure chatbot service',
      'GDPR compliant chatbot',
      'data security policy',
      'private AI conversations',
      'customer data protection'
    ],
    userIntent: 'informational' as const
  },

  terms: {
    title: 'Terms of Service - TrulyBot AI Chatbot Legal Terms & Conditions',
    description: 'Learn about TrulyBot terms of service for AI chatbot usage and customer support automation. Clear, fair terms for professional chatbot deployment and comprehensive customer support.',
    keywords: [
      'trulybot terms of service',
      'AI chatbot terms conditions',
      'customer support automation terms',
      'chatbot terms conditions',
      'AI service agreement',
      'chatbot usage terms',
      'SaaS terms of service',
      'AI chatbot legal terms'
    ],
    userIntent: 'informational' as const
  },

  dashboard: {
    title: 'Dashboard - TrulyBot AI Chatbot Management & Customer Support Analytics',
    description: 'Manage your TrulyBot AI chatbot with our intuitive dashboard. Monitor conversations, track leads, analyze customer support performance with real-time insights.',
    keywords: [
      'AI chatbot dashboard',
      'customer support automation dashboard',
      'chatbot management platform',
      'AI chatbot analytics',
      'customer support analytics',
      'chatbot performance metrics',
      'conversation management',
      'lead tracking dashboard',
      'AI insights platform',
      'automated support analytics'
    ],
    noIndex: true, // Private area
    userIntent: 'transactional' as const
  },

  widget: {
    title: 'Chat Widget - TrulyBot AI Customer Support Widget for Your Website',
    description: 'Experience TrulyBot\'s intelligent AI chat widget. Fast responses, seamless customer support automation, and effortless ecommerce integration for your website.',
    keywords: [
      'AI chat widget',
      'customer support widget',
      'automated chat widget',
      'live chat software',
      'website chatbot widget',
      'ecommerce chat widget',
      'instant customer support',
      'smart chat interface',
      'AI customer service widget',
      'automated support widget'
    ],
    userIntent: 'commercial' as const
  },

  features: {
    title: 'AI Chatbot Features - Complete Customer Support Automation Platform',
    description: 'Discover powerful AI chatbot features: 24/7 automated support, advanced lead capture, multi-platform integration, detailed analytics. See why 10,000+ businesses choose TrulyBot.',
    keywords: [
      'AI chatbot features',
      'customer support automation features',
      'ecommerce chatbot capabilities',
      'automated customer service features',
      'AI customer support features',
      'chatbot lead generation features',
      'customer service automation capabilities',
      'advanced chatbot features',
      'intelligent AI responses',
      'chatbot integration features',
      'automated support features',
      'customer engagement features',
      'AI powered support features',
      // Voice search additions
      'what features does AI chatbot have for ecommerce',
      'how does AI chatbot automate customer support',
      'best AI chatbot features for online business',
      'AI chatbot capabilities for customer service'
    ],
    voiceSearchOptimized: true,
    featuredSnippetTargeting: true,
    userIntent: 'informational' as const
  },

  signup: {
    title: 'Start Free Trial - AI Chatbot Setup in 5 Minutes | Customer Support Automation',
    description: 'Create your AI chatbot account and transform customer support today. Free trial, no credit card required. Setup in 5 minutes. Join thousands of successful businesses.',
    keywords: [
      'AI chatbot free trial',
      'customer support automation trial',
      'AI chatbot signup',
      'ecommerce chatbot trial',
      'automated customer service trial',
      'customer support software trial',
      'AI customer service trial',
      'chatbot demo account',
      'free customer support automation',
      'quick chatbot setup',
      'instant AI chatbot registration',
      'customer service chatbot trial'
    ],
    voiceSearchOptimized: true,
    featuredSnippetTargeting: true,
    userIntent: 'transactional' as const
  }
} as const

// ============================================================================
// ADVANCED SEO UTILITIES - Sitemap, Robots.txt, Schema.org
// ============================================================================

/**
 * Generate dynamic sitemap.xml content for all pages
 * @returns XML string for sitemap
 */
export function generateSitemap(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trulybot.xyz';
  const pages = Object.keys(seoConfigs);
  const currentDate = new Date().toISOString();
  
  const urlEntries = pages.map(page => {
    const path = page === 'home' ? '' : `/${page}`;
    // Determine priority and change frequency based on page type
    const priority = page === 'home' ? '1.0' : page === 'pricing' || page === 'signup' ? '0.9' : '0.8';
    const changefreq = page === 'home' ? 'daily' : page === 'dashboard' ? 'hourly' : 'weekly';
    
    return `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Generate dynamic robots.txt content
 * @returns robots.txt string
 */
export function generateRobotsTxt(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trulybot.xyz';
  
  return `# TrulyBot AI Chatbot Platform - Robots.txt
# Allow all crawlers

User-agent: *
Allow: /

# Crawl-delay for politeness
Crawl-delay: 1

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /dashboard/settings/billing

# Allow important pages
Allow: /
Allow: /pricing
Allow: /features
Allow: /about
Allow: /contact
Allow: /signup

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml

# Special rules for AI crawlers (GPTBot, Google-Extended)
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

# Block aggressive crawlers
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10`;
}

/**
 * Generate comprehensive Schema.org structured data for a page
 * @param pageKey - Page identifier from seoConfigs
 * @returns Schema.org JSON-LD object
 */
export function generateSchemaMarkup(pageKey: keyof typeof seoConfigs): any {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trulybot.xyz';
  const config = seoConfigs[pageKey];
  
  // Base Organization schema (appears on all pages)
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TrulyBot',
    description: 'AI-powered chatbot platform for ecommerce customer support automation',
    url: siteUrl,
    logo: `${siteUrl}/logo-trulybot.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@trulybot.xyz',
      contactType: 'Customer Support',
      availableLanguage: ['English', 'Hindi']
    },
    sameAs: [
      'https://twitter.com/trulybot',
      'https://linkedin.com/company/trulybot',
      'https://github.com/trulybot'
    ]
  };
  
  // Page-specific schemas
  const pageSchemas: Record<string, any> = {
    home: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TrulyBot AI Chatbot',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free trial available'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '500',
        bestRating: '5'
      }
    },
    pricing: {
      '@context': 'https://schema.org',
      '@type': 'PriceSpecification',
      priceCurrency: 'USD',
      price: '5',
      billingIncrement: 'month',
      description: 'AI Chatbot subscription plans'
    },
    features: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'TrulyBot AI Chatbot Features',
      description: config.description,
      brand: {
        '@type': 'Brand',
        name: 'TrulyBot'
      }
    },
    about: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      mainEntity: organization
    }
  };
  
  // Return array with organization + page-specific schema
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      ...(pageSchemas[pageKey] ? [pageSchemas[pageKey]] : [])
    ]
  };
}

/**
 * Generate FAQ schema for knowledge base pages
 * @param faqs - Array of {question, answer} objects
 * @returns FAQ Schema.org JSON-LD
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 * @param breadcrumbs - Array of {name, url} objects
 * @returns Breadcrumb Schema.org JSON-LD
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): any {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trulybot.xyz';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.url}`
    }))
  };
}

/**
 * Calculate SEO score for a page
 * @param config - SEO configuration
 * @returns Score object with details
 */
export function calculateSEOScore(config: SEOConfig): {
  score: number;
  details: Array<{ category: string; score: number; feedback: string }>;
} {
  const details: Array<{ category: string; score: number; feedback: string }> = [];
  let totalScore = 0;
  
  // Title optimization (20 points)
  let titleScore = 0;
  if (config.title.length >= 30 && config.title.length <= 60) titleScore += 10;
  if (config.title.includes('AI') || config.title.includes('Chatbot')) titleScore += 5;
  if (config.title.includes('|') || config.title.includes('-')) titleScore += 5;
  details.push({
    category: 'Title',
    score: titleScore,
    feedback: titleScore >= 15 ? 'Excellent title optimization' : 'Title could be improved'
  });
  totalScore += titleScore;
  
  // Description optimization (20 points)
  let descScore = 0;
  if (config.description.length >= 120 && config.description.length <= 160) descScore += 10;
  if (config.description.match(/\d+%|\d+X/)) descScore += 5; // Contains metrics
  if (config.description.toLowerCase().includes('free') || config.description.toLowerCase().includes('trial')) descScore += 5;
  details.push({
    category: 'Description',
    score: descScore,
    feedback: descScore >= 15 ? 'Great meta description' : 'Description needs optimization'
  });
  totalScore += descScore;
  
  // Keywords optimization (15 points)
  let keywordScore = 0;
  if (config.keywords && config.keywords.length >= 5) keywordScore += 10;
  if (config.keywords && config.keywords.length >= 10) keywordScore += 5;
  details.push({
    category: 'Keywords',
    score: keywordScore,
    feedback: keywordScore >= 10 ? 'Good keyword coverage' : 'Add more keywords'
  });
  totalScore += keywordScore;
  
  // Advanced features (25 points)
  let advancedScore = 0;
  if (config.voiceSearchOptimized) advancedScore += 10;
  if (config.featuredSnippetTargeting) advancedScore += 10;
  if (config.userIntent && config.userIntent !== 'commercial') advancedScore += 5;
  details.push({
    category: 'Advanced SEO',
    score: advancedScore,
    feedback: advancedScore >= 15 ? 'Excellent advanced optimization' : 'Enable more advanced features'
  });
  totalScore += advancedScore;
  
  // Technical SEO (20 points)
  let technicalScore = 0;
  if (config.canonical) technicalScore += 10;
  if (!config.noIndex) technicalScore += 10;
  details.push({
    category: 'Technical SEO',
    score: technicalScore,
    feedback: technicalScore === 20 ? 'Perfect technical setup' : 'Check canonical and indexing'
  });
  totalScore += technicalScore;
  
  return {
    score: totalScore,
    details
  };
}