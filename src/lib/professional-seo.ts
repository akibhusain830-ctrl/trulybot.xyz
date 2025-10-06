// Professional SEO Sitelinks and Page-Specific Optimizations
// Enhanced SEO to compete with industry leaders like Haptik

import { generateAdvancedSEOMetadata, SEOIntelligenceConfig } from './seo-intelligence';

interface ProfessionalPageConfig {
  title: string;
  description: string;
  keywords: string[];
  voiceSearchOptimized?: boolean;
  featuredSnippetTargeting?: boolean;
  userIntent: 'informational' | 'commercial' | 'transactional';
  pageType: 'homepage' | 'product' | 'blog' | 'landing' | 'location';
  structuredData?: any;
}

// Professional sitelinks configuration for Google search results
const PROFESSIONAL_SITELINKS = {
  primary: [
    {
      name: 'Start Free Trial',
      description: 'Get started with TrulyBot AI chatbot. 7-day free trial, no credit card required.',
      url: '/start-trial',
      priority: 1
    },
    {
      name: 'Pricing Plans',
      description: 'Transparent pricing starting at ₹99/month. Choose the perfect plan for your business.',
      url: '/pricing',
      priority: 2
    },
    {
      name: 'Features',
      description: 'Powerful AI features for e-commerce customer support and automation.',
      url: '/features',
      priority: 3
    },
    {
      name: 'Dashboard',
      description: 'Advanced analytics and AI management dashboard for your chatbot.',
      url: '/dashboard',
      priority: 4
    }
  ],
  secondary: [
    {
      name: 'Contact Us',
      description: 'Get in touch with our team for personalized AI chatbot solutions.',
      url: '/contact',
      priority: 5
    },
    {
      name: 'AI Features',
      description: 'Explore all AI-powered features for e-commerce customer support.',
      url: '/features',
      priority: 6
    },
    {
      name: 'Customer Support',
      description: '24/7 support for your AI chatbot implementation and optimization.',
      url: '/contact',
      priority: 7
    },
    {
      name: 'Get Started',
      description: 'Start your AI transformation journey with TrulyBot today.',
      url: '/start-trial',
      priority: 8
    }
  ]
};

// Enhanced page-specific SEO configurations
const PROFESSIONAL_PAGE_SEO: Record<string, ProfessionalPageConfig> = {
  'start-trial': {
    title: 'Start Free Trial - TrulyBot AI Chatbot | Setup in 5 Minutes',
    description: 'Start your TrulyBot free trial today. Transform customer support in 5 minutes. No credit card required, cancel anytime. Join 10,000+ successful businesses.',
    keywords: [
      'AI chatbot free trial',
      'start chatbot trial',
      'free customer support automation',
      'AI chatbot signup',
      'automated customer service trial',
      'chatbot demo account',
      'free AI assistant trial',
      'customer support software trial',
      'ecommerce chatbot free trial',
      'business automation trial'
    ],
    voiceSearchOptimized: true,
    featuredSnippetTargeting: true,
    userIntent: 'transactional' as const,
    pageType: 'landing' as const,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Free Trial Registration',
      description: 'Start your free trial of TrulyBot AI chatbot platform',
      url: 'https://trulybot.xyz/start-trial',
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: 'TrulyBot Free Trial',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: '7-day free trial of TrulyBot AI chatbot'
        }
      }
    }
  },

  'demo': {
    title: 'Live Demo - See TrulyBot AI Chatbot in Action | Book Personal Demo',
    description: 'Book a personalized TrulyBot demo with our AI experts. See how we reduce support tickets by 70% and increase leads by 5X. Schedule your demo now.',
    keywords: [
      'AI chatbot demo',
      'chatbot live demo',
      'customer support automation demo',
      'AI assistant demonstration',
      'chatbot product demo',
      'automated customer service demo',
      'business chatbot preview',
      'AI customer support walkthrough',
      'ecommerce chatbot demo',
      'personalized chatbot demo'
    ],
    voiceSearchOptimized: true,
    userIntent: 'commercial' as const,
    pageType: 'landing' as const
  },

  'success-stories': {
    title: 'Customer Success Stories - TrulyBot AI Chatbot Case Studies & Results',
    description: 'Discover how 10,000+ businesses transformed customer support with TrulyBot. Real case studies showing 70% ticket reduction and 5X lead increase.',
    keywords: [
      'AI chatbot success stories',
      'customer support automation case studies',
      'chatbot ROI results',
      'AI customer service testimonials',
      'business automation success',
      'ecommerce chatbot results',
      'customer support transformation',
      'AI chatbot case studies',
      'automated support success stories',
      'chatbot implementation results'
    ],
    userIntent: 'commercial' as const,
    pageType: 'blog' as const
  },

  'features': {
    title: 'AI Chatbot Features - TrulyBot Advanced Customer Support Automation',
    description: 'Discover TrulyBot\'s powerful AI features: smart conversations, order tracking, lead generation, multi-language support, and seamless integrations.',
    keywords: [
      'AI chatbot features',
      'customer support automation features',
      'intelligent chatbot capabilities',
      'AI conversation features',
      'automated customer service features',
      'chatbot functionality',
      'AI assistant features',
      'ecommerce chatbot features',
      'customer support AI features',
      'advanced chatbot capabilities'
    ],
    voiceSearchOptimized: true,
    featuredSnippetTargeting: true,
    userIntent: 'informational' as const,
    pageType: 'product' as const,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TrulyBot AI Features',
      description: 'Advanced AI chatbot features for customer support automation',
      url: 'https://trulybot.xyz/features',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web-based',
      offers: {
        '@type': 'Offer',
        price: '99',
        priceCurrency: 'INR',
        priceValidUntil: '2024-12-31'
      }
    }
  },

  'dashboard': {
    title: 'AI Dashboard - TrulyBot Analytics & Chatbot Management Platform',
    description: 'Advanced AI dashboard with real-time analytics, conversation insights, performance metrics, and chatbot management tools for data-driven optimization.',
    keywords: [
      'AI chatbot dashboard',
      'chatbot analytics platform',
      'customer support dashboard',
      'AI conversation analytics',
      'chatbot performance metrics',
      'customer service analytics',
      'AI management dashboard',
      'chatbot insights platform',
      'conversation analytics dashboard',
      'customer support metrics'
    ],
    userIntent: 'informational' as const,
    pageType: 'product' as const
  },

  'contact': {
    title: 'Contact TrulyBot - Get AI Chatbot Support & Custom Solutions',
    description: 'Contact TrulyBot team for personalized AI chatbot solutions, technical support, and custom integrations. 24/7 expert assistance available.',
    keywords: [
      'contact AI chatbot support',
      'TrulyBot customer service',
      'AI chatbot consultation',
      'custom chatbot solutions',
      'chatbot technical support',
      'AI customer support contact',
      'chatbot implementation help',
      'AI automation consultation',
      'TrulyBot contact us',
      'chatbot expert support'
    ],
    userIntent: 'commercial' as const,
    pageType: 'landing' as const
  }
};

// Generate sitelinks structured data for Google
function generateSitelinksStructuredData(): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TrulyBot',
    url: 'https://trulybot.xyz',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://trulybot.xyz/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'TrulyBot',
      url: 'https://trulybot.xyz',
      sameAs: [
        'https://linkedin.com/company/trulybot',
        'https://twitter.com/trulybot',
        'https://facebook.com/trulybot'
      ],
      potentialAction: PROFESSIONAL_SITELINKS.primary.map(link => ({
        '@type': 'Action',
        name: link.name,
        description: link.description,
        url: `https://trulybot.xyz${link.url}`
      }))
    }
  };
}

// Enhanced breadcrumb structured data
function generateProfessionalBreadcrumbs(currentPage: string): any {
  const breadcrumbMap: Record<string, Array<{name: string, url: string}>> = {
    'start-trial': [
      { name: 'Home', url: 'https://trulybot.xyz' },
      { name: 'Start Free Trial', url: 'https://trulybot.xyz/start-trial' }
    ],
    'pricing': [
      { name: 'Home', url: 'https://trulybot.xyz' },
      { name: 'Pricing', url: 'https://trulybot.xyz/pricing' }
    ],
    'features': [
      { name: 'Home', url: 'https://trulybot.xyz' },
      { name: 'Features', url: 'https://trulybot.xyz/features' }
    ],
    'dashboard': [
      { name: 'Home', url: 'https://trulybot.xyz' },
      { name: 'Dashboard', url: 'https://trulybot.xyz/dashboard' }
    ],
    'contact': [
      { name: 'Home', url: 'https://trulybot.xyz' },
      { name: 'Contact Us', url: 'https://trulybot.xyz/contact' }
    ]
  };

  const breadcrumbs = breadcrumbMap[currentPage] || [
    { name: 'Home', url: 'https://trulybot.xyz' }
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// Professional FAQ schema for specific pages
function generatePageSpecificFAQ(pageType: string): any {
  const faqMap: Record<string, Array<{question: string, answer: string}>> = {
    'start-trial': [
      {
        question: 'How long is the TrulyBot free trial?',
        answer: 'TrulyBot offers a 7-day free trial with full access to all features. No credit card required to start.'
      },
      {
        question: 'What happens after my free trial ends?',
        answer: 'After 7 days, you can choose a paid plan starting at ₹99/month or your chatbot will be paused until you upgrade.'
      },
      {
        question: 'Can I cancel my trial anytime?',
        answer: 'Yes, you can cancel your trial at any time with no obligations or fees.'
      }
    ],
    'pricing': [
      {
        question: 'What is included in the basic plan?',
        answer: 'The basic plan (₹99/month) includes 1,000 conversations, 24/7 support, basic integrations, and analytics dashboard.'
      },
      {
        question: 'Do you offer custom pricing for large businesses?',
        answer: 'Yes, we offer enterprise pricing for businesses with high volume needs. Contact our sales team for a custom quote.'
      },
      {
        question: 'Is there a setup fee?',
        answer: 'No, TrulyBot has no setup fees or hidden costs. You only pay the monthly subscription.'
      }
    ],
    'features': [
      {
        question: 'Does TrulyBot support multiple languages?',
        answer: 'Yes, TrulyBot supports 50+ languages including English, Hindi, Spanish, French, and more with automatic language detection.'
      },
      {
        question: 'Can TrulyBot integrate with my existing tools?',
        answer: 'TrulyBot integrates with 100+ tools including Shopify, WooCommerce, Slack, WhatsApp, and major CRM systems.'
      },
      {
        question: 'How accurate is TrulyBot AI?',
        answer: 'TrulyBot achieves 95%+ accuracy in understanding customer queries and provides relevant responses through advanced AI training.'
      }
    ],
    'dashboard': [
      {
        question: 'What analytics does the TrulyBot dashboard provide?',
        answer: 'The dashboard shows conversation analytics, customer satisfaction scores, response times, popular queries, and conversion tracking.'
      },
      {
        question: 'Can I customize the dashboard widgets?',
        answer: 'Yes, you can customize dashboard widgets, create custom reports, and set up automated insights based on your business needs.'
      },
      {
        question: 'How often is dashboard data updated?',
        answer: 'Dashboard data is updated in real-time, providing instant insights into your chatbot performance and customer interactions.'
      }
    ],
    'contact': [
      {
        question: 'How can I get support for TrulyBot setup?',
        answer: 'Contact our 24/7 support team via email, chat, or phone. We provide free setup assistance and ongoing technical support.'
      },
      {
        question: 'Do you offer custom chatbot development?',
        answer: 'Yes, we offer custom AI chatbot development, integrations, and white-label solutions for enterprise clients.'
      },
      {
        question: 'What is your response time for support requests?',
        answer: 'We respond to support requests within 2 hours during business hours and provide 24/7 emergency support for critical issues.'
      }
    ]
  };

  const faqs = faqMap[pageType] || [];
  
  if (faqs.length === 0) return null;

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

// Generate complete professional SEO metadata for any page
function generateProfessionalPageSEO(pageKey: string, config?: Partial<SEOIntelligenceConfig>) {
  const pageConfig = PROFESSIONAL_PAGE_SEO[pageKey as keyof typeof PROFESSIONAL_PAGE_SEO];
  
  if (!pageConfig) {
    console.warn(`No SEO config found for page: ${pageKey}`);
    return null;
  }

  // Merge with provided config
  const finalConfig: SEOIntelligenceConfig = {
    userIntent: pageConfig.userIntent,
    pageType: pageConfig.pageType,
    voiceSearchOptimized: pageConfig.voiceSearchOptimized || false,
    featuredSnippetTargeting: pageConfig.featuredSnippetTargeting || false,
    ...config
  };

  // Generate advanced metadata
  const metadata = generateAdvancedSEOMetadata(finalConfig);

  // Generate structured data
  const structuredData = [
    generateSitelinksStructuredData(),
    generateProfessionalBreadcrumbs(pageKey),
    generatePageSpecificFAQ(pageKey),
    ...(pageConfig.structuredData ? [pageConfig.structuredData] : [])
  ].filter(Boolean);

  return {
    metadata: {
      ...metadata,
      title: pageConfig.title,
      description: pageConfig.description,
      keywords: [...(metadata.keywords || []), ...pageConfig.keywords]
    },
    structuredData,
    sitelinks: [...PROFESSIONAL_SITELINKS.primary, ...PROFESSIONAL_SITELINKS.secondary]
  };
}

// Export all professional SEO utilities
export {
  PROFESSIONAL_SITELINKS,
  PROFESSIONAL_PAGE_SEO,
  generateProfessionalPageSEO
};