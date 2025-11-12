/**
 * Enhanced schema markup for professional SEO and Google Sitelinks
 * Implementing Breadcrumb, Navigation, and enhanced Organization schemas
 */

// Navigation schema for Google Sitelinks optimization
export const navigationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SiteNavigationElement',
  name: 'Main Navigation',
  url: 'https://trulybot.xyz',
  hasPart: [
    {
      '@type': 'SiteNavigationElement',
      name: 'Home',
      description: 'TrulyBot AI Chatbot Platform Homepage',
      url: 'https://trulybot.xyz'
    },
    {
      '@type': 'SiteNavigationElement', 
      name: 'Pricing',
      description: 'TrulyBot AI Chatbot Pricing Plans and Features',
      url: 'https://trulybot.xyz/pricing'
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Dashboard',
      description: 'TrulyBot AI Chatbot Management Dashboard',
      url: 'https://trulybot.xyz/dashboard'
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Start Free Trial',
      description: 'Start Your Free 7-Day TrulyBot AI Chatbot Trial',
      url: 'https://trulybot.xyz/start-trial'
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Features',
      description: 'TrulyBot AI Chatbot Features and Capabilities',
      url: 'https://trulybot.xyz/features'
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Contact Us',
      description: 'Contact TrulyBot Support and Sales Team',
      url: 'https://trulybot.xyz/contact'
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Blog',
      description: 'TrulyBot AI Chatbot Blog and Resources',
      url: 'https://trulybot.xyz/blog'
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'FAQ',
      description: 'Frequently Asked Questions about TrulyBot',
      url: 'https://trulybot.xyz/faq'
    }
  ]
};

// Breadcrumb schema for homepage
export const homeBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://trulybot.xyz'
    }
  ]
};

// Breadcrumb schema generator for other pages
export function generateBreadcrumbSchema(pageName: string, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://trulybot.xyz'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageName,
        item: pageUrl
      }
    ]
  };
}

// Enhanced Product schema for TrulyBot
export const enhancedProductSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': 'https://trulybot.xyz/#product',
  name: 'TrulyBot AI Chatbot',
  alternateName: 'TrulyBot',
  description: 'Lightning-fast AI chatbot platform for e-commerce businesses. Reduce support tickets by 70%, increase leads by 5X with automated customer support.',
  url: 'https://trulybot.xyz',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  downloadUrl: 'https://trulybot.xyz/start-trial',
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString(),
  author: {
    '@type': 'Organization',
    name: 'TrulyBot',
    url: 'https://trulybot.xyz'
  },
  publisher: {
    '@type': 'Organization',
    name: 'TrulyBot',
    url: 'https://trulybot.xyz',
    logo: {
      '@type': 'ImageObject',
      url: 'https://trulybot.xyz/logo-trulybot.svg'
    }
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Basic Plan',
      description: 'Perfect for small businesses starting with AI chatbots',
      price: '499',
      priceCurrency: 'INR',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
      url: 'https://trulybot.xyz/pricing',
      seller: {
        '@type': 'Organization',
        name: 'TrulyBot'
      }
    },
    {
      '@type': 'Offer',
      name: 'Pro Plan',
      description: 'Advanced AI chatbot features for growing businesses',
      price: '1499',
      priceCurrency: 'INR',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
      url: 'https://trulybot.xyz/pricing',
      seller: {
        '@type': 'Organization',
        name: 'TrulyBot'
      }
    },
    {
      '@type': 'Offer',
      name: 'Enterprise Plan',
      description: 'Complete AI chatbot solution for enterprise businesses',
      price: '2999',
      priceCurrency: 'INR',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
      url: 'https://trulybot.xyz/pricing',
      seller: {
        '@type': 'Organization',
        name: 'TrulyBot'
      }
    }
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1247',
    bestRating: '5',
    worstRating: '1'
  },
  review: [
    {
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'Priya Sharma'
      },
      datePublished: '2024-10-01',
      reviewBody: 'TrulyBot transformed our customer support. We reduced tickets by 75% and our customers love the instant responses!',
      name: 'Excellent AI Chatbot Solution',
      reviewRating: {
        '@type': 'Rating',
        bestRating: '5',
        ratingValue: '5',
        worstRating: '1'
      }
    },
    {
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'Rajesh Kumar'
      },
      datePublished: '2024-09-15',
      reviewBody: 'Setup was incredibly easy - just 5 minutes! Our sales increased by 400% with TrulyBot lead generation.',
      name: 'Amazing Results in Just Days',
      reviewRating: {
        '@type': 'Rating',
        bestRating: '5',
        ratingValue: '5',
        worstRating: '1'
      }
    }
  ],
  featureList: [
    '24/7 Automated Customer Support',
    'Lead Generation & Qualification',
    '70% Support Ticket Reduction', 
    '5X Lead Increase',
    '5-Minute Setup',
    'No Coding Required',
    'Multi-language Support',
    'Real-time Analytics',
    'Custom Branding',
    'API Integration'
  ]
};

// Website schema for homepage
export const enhancedWebsiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://trulybot.xyz/#website',
  name: 'TrulyBot - AI Chatbot for E-Commerce',
  alternateName: 'TrulyBot AI Platform',
  url: 'https://trulybot.xyz',
  description: 'Lightning-fast AI chatbot platform for e-commerce businesses. Automate customer support, generate leads, and boost sales with intelligent AI.',
  publisher: {
    '@type': 'Organization',
    '@id': 'https://trulybot.xyz/#organization'
  },
  potentialAction: [
    {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://trulybot.xyz/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  ],
  mainEntity: {
    '@type': 'Organization',
    '@id': 'https://trulybot.xyz/#organization'
  }
};