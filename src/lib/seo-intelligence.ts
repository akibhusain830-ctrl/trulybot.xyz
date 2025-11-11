// Advanced SEO Intelligence System
// AI-powered dynamic metadata, intelligent keyword optimization, and competitive SEO features

export interface SEOIntelligenceConfig {
  userIntent?: 'informational' | 'commercial' | 'transactional';
  userLocation?: 'india' | 'global';
  searchQuery?: string;
  pageType?: 'homepage' | 'product' | 'blog' | 'landing' | 'location';
  competitorAnalysis?: boolean;
  voiceSearchOptimized?: boolean;
  featuredSnippetTargeting?: boolean;
}

// Basic metadata interface (compatible with Next.js)
export interface AdvancedMetadata {
  title: string;
  description: string;
  keywords: string[];
  authors?: Array<{ name: string }>;
  creator?: string;
  publisher?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
    nocache?: boolean;
    googleBot?: {
      index?: boolean;
      follow?: boolean;
      'max-video-preview'?: number;
      'max-image-preview'?: string;
      'max-snippet'?: number;
    };
  };
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    siteName?: string;
    locale?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
  };
  other?: Record<string, string>;
}

// Advanced keyword intelligence with search intent analysis
export const ADVANCED_KEYWORD_INTELLIGENCE = {
  // Voice search and conversational keywords for maximum organic traffic
  voiceSearch: {
    questions: [
      'what is the best AI chatbot for ecommerce',
      'how to automate customer support with AI',
      'which chatbot increases sales the most',
      'how much does customer support automation cost',
      'what is the fastest way to setup a chatbot',
      'how to reduce customer support tickets with AI',
      'best AI chatbot for online stores',
      'how to generate more leads with chatbot',
      'what features should an ecommerce chatbot have',
      'how does AI customer service work',
      'which customer support automation tool is best'
    ],
    conversational: [
      'AI chatbot that actually works for ecommerce',
      'lightning fast customer support automation',
      'chatbot that increases sales and reduces costs',
      'AI assistant that understands customers perfectly',
      'smart chatbot for busy entrepreneurs',
      'customer service that never sleeps',
      'automated support that feels human',
      'AI that converts visitors into customers'
    ]
  },
  
  // Featured snippet targeting keywords for maximum visibility
  featuredSnippets: {
    definitions: [
      'what is an AI chatbot for ecommerce',
      'how does customer support automation work',
      'what are the benefits of AI customer service',
      'what is automated customer support',
      'how do ecommerce chatbots work',
      'what is lead generation automation'
    ],
    comparisons: [
      'AI chatbot vs human support agents',
      'TrulyBot vs other chatbot platforms',
      'automated vs manual customer service',
      'ecommerce chatbot vs live chat',
      'AI customer support vs traditional support',
      'chatbot vs help desk software'
    ],
    howTo: [
      'how to setup AI chatbot in 5 minutes',
      'how to reduce support tickets by 70%',
      'how to increase sales with AI chatbot',
      'how to automate customer support',
      'how to generate leads with chatbot',
      'how to integrate chatbot with ecommerce'
    ],
    lists: [
      'top benefits of AI customer support',
      'best practices for ecommerce chatbots',
      'features to look for in AI chatbot',
      'reasons to use customer support automation',
      'ways AI chatbot improves ecommerce',
      'benefits of automated customer service'
    ]
  },
  
  // Regional keyword intelligence - INDIA FOCUSED
  regional: {
    india: [
      'AI chatbot India price',
      'customer support automation India',
      'chatbot for Indian ecommerce',
      'AI customer service India cost',
      'best chatbot platform India',
      'automated support for Indian businesses',
      'AI assistant Hindi English support',
      'customer service chatbot Mumbai Delhi',
      'chatbot with Razorpay integration',
      'GST compliant chatbot India',
      'Hindi language AI chatbot',
      'Indian business automation software',
      'ecommerce chatbot India pricing',
      'AI customer support Indian market',
      'chatbot for Indian startups',
      'automated customer service India',
      'lead generation chatbot India',
      'customer support software India',
      // Hindi/Hinglish keywords for voice search
      'bharat mein AI chatbot',
      'chatbot ki price India mein',
      'customer support automation kaise kare',
      'sabse accha chatbot India mein',
      'AI chatbot Hindi support',
      'Indian business ke liye chatbot'
    ],
    global: [
      'enterprise AI chatbot solution',
      'scalable customer support automation',
      'global ecommerce chatbot platform',
      'multilingual AI customer service',
    ]
  },
  
  // Intent-based keywords
  intentBased: {
    informational: [
      'what is AI customer support',
      'how AI chatbots work',
      'benefits of automated customer service',
      'AI chatbot features explained',
    ],
    commercial: [
      'best AI chatbot for ecommerce',
      'compare chatbot platforms',
      'AI customer service reviews',
      'top automated support tools',
    ],
    transactional: [
      'buy AI chatbot subscription',
      'start chatbot free trial',
      'AI customer service pricing',
      'get AI chatbot for business',
    ]
  }
};

// Dynamic meta description generation based on context
export function generateIntelligentMetaDescription(config: SEOIntelligenceConfig): string {
  const { userIntent, userLocation, pageType, voiceSearchOptimized } = config;
  
  // Base template variations for A/B testing
  const templates = {
    homepage: {
      informational: "Discover how TrulyBot's AI chatbot revolutionizes ecommerce customer support. Reduce tickets by 70%, increase leads 5X, and automate 24/7 support. See the difference AI makes.",
      commercial: "Compare TrulyBot with other AI chatbots - #1 rated for ecommerce. 70% fewer support tickets, 5X more leads, 99.9% uptime. Free trial, 5-minute setup.",
      transactional: "Start your TrulyBot AI chatbot free trial today! Reduce support workload 70%, boost sales 5X. Setup in 5 minutes. Join successful businesses."
    },
    product: {
      informational: "Learn how TrulyBot's advanced AI technology delivers lightning-fast customer support automation. Smart responses, lead capture, and seamless ecommerce integration.",
      commercial: "TrulyBot vs competitors: Superior AI accuracy, faster response times, better ROI. See why leading ecommerce brands choose our intelligent chatbot platform.",
      transactional: "Get TrulyBot AI chatbot for your ecommerce store. Instant setup, powerful automation, proven results. Start free trial - no credit card required."
    }
  };
  
  // Regional customization
  const regionalSuffixes = {
    india: " Perfect for Indian businesses with Hindi support, INR pricing, and local expertise.",
    global: " Serving businesses worldwide with multi-language support and global infrastructure."
  };
  
  // Voice search optimization
  const voiceSearchPrefix = voiceSearchOptimized ? "Looking for the best AI chatbot? " : "";
  
  const pageTemplates = templates[pageType as keyof typeof templates] || templates.homepage;
  const intentKey = (userIntent === 'informational' || userIntent === 'commercial' || userIntent === 'transactional') 
                    ? userIntent : 'commercial';
  let baseDescription = pageTemplates[intentKey];
  
  const regionalSuffix = regionalSuffixes[userLocation || 'global'];
  
  return voiceSearchPrefix + baseDescription + regionalSuffix;
}

// Intelligent title generation with power words and emotional triggers
export function generateIntelligentTitle(config: SEOIntelligenceConfig): string {
  const { userIntent, userLocation, pageType, featuredSnippetTargeting } = config;
  
  // Power words that increase CTR
  const powerWords = ['Revolutionary', 'Lightning-Fast', 'Game-Changing', 'Ultimate', 'Proven', 'Intelligent'];
  const emotionalTriggers = ['Transform', 'Skyrocket', 'Dominate', 'Breakthrough', 'Master'];
  
  const titleTemplates = {
    homepage: {
      informational: `How ${powerWords[0]} AI Chatbots Transform Ecommerce Customer Support | TrulyBot`,
      commercial: `TrulyBot: #1 ${powerWords[1]} AI Chatbot for Ecommerce | 70% Fewer Tickets, 5X More Leads`,
      transactional: `${emotionalTriggers[0]} Your Customer Support with TrulyBot AI | Free Trial + 5-Min Setup`
    },
    product: {
      informational: `${powerWords[5]} AI Customer Support: Features, Benefits & ROI | TrulyBot Platform`,
      commercial: `${powerWords[3]} AI Chatbot Platform for Ecommerce Success | TrulyBot vs Competitors`,
      transactional: `Get ${powerWords[1]} AI Customer Support for Your Store | TrulyBot Premium`
    }
  };
  
  // Featured snippet optimization
  if (featuredSnippetTargeting) {
    const snippetPrefixes = {
      informational: 'What is the Best',
      commercial: 'Top 10 Best',
      transactional: 'How to Get the Best'
    };
    const intentKey = (userIntent === 'informational' || userIntent === 'commercial' || userIntent === 'transactional') 
                      ? userIntent : 'commercial';
    return `${snippetPrefixes[intentKey]} AI Chatbot for Ecommerce in 2025 | TrulyBot Guide`;
  }
  
  // Regional customization
  const regionalModifiers = {
    india: ' | Made for Indian Businesses',
    global: ' | Global AI Platform'
  };
  
  const pageTemplates = titleTemplates[pageType as keyof typeof titleTemplates] || titleTemplates.homepage;
  const intentKey = (userIntent === 'informational' || userIntent === 'commercial' || userIntent === 'transactional') 
                    ? userIntent : 'commercial';
  let baseTitle = pageTemplates[intentKey];
  
  return baseTitle + (regionalModifiers[userLocation || 'global'] || '');
}

// Advanced keyword density optimization
export function optimizeKeywordDensity(content: string, primaryKeywords: string[]): {
  optimizedContent: string;
  keywordDensity: Record<string, number>;
  recommendations: string[];
} {
  const words = content.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  
  const keywordDensity: Record<string, number> = {};
  const recommendations: string[] = [];
  
  // Calculate current density
  primaryKeywords.forEach(keyword => {
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    let count = 0;
    
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const slice = words.slice(i, i + keywordWords.length).join(' ');
      if (slice === keyword.toLowerCase()) {
        count++;
      }
    }
    
    const density = (count / totalWords) * 100;
    keywordDensity[keyword] = density;
    
    // SEO recommendations
    if (density < 0.5) {
      recommendations.push(`Increase "${keyword}" density (currently ${density.toFixed(2)}%)`);
    } else if (density > 3) {
      recommendations.push(`Reduce "${keyword}" density to avoid keyword stuffing (currently ${density.toFixed(2)}%)`);
    }
  });
  
  return {
    optimizedContent: content, // Would implement actual optimization logic
    keywordDensity,
    recommendations
  };
}

// Semantic keyword expansion for better content coverage
export function generateSemanticKeywords(primaryKeyword: string): string[] {
  const semanticMap: Record<string, string[]> = {
    'AI chatbot': [
      'artificial intelligence chatbot',
      'intelligent virtual assistant',
      'conversational AI',
      'automated customer service',
      'smart chat assistant',
      'AI-powered support bot'
    ],
    'ecommerce': [
      'online store',
      'e-commerce business',
      'digital marketplace',
      'online retail',
      'internet commerce',
      'web store'
    ],
    'customer support': [
      'customer service',
      'client support',
      'help desk',
      'customer care',
      'technical support',
      'customer assistance'
    ]
  };
  
  const related = semanticMap[primaryKeyword.toLowerCase()] || [];
  
  // Add LSI (Latent Semantic Indexing) keywords
  const lsiKeywords = [
    'automation technology',
    'business efficiency',
    'digital transformation',
    'customer experience optimization',
    'sales conversion improvement'
  ];
  
  return [...related, ...lsiKeywords];
}

// Competition analysis for keyword opportunities
export function analyzeCompetitorKeywords(): {
  gaps: string[];
  opportunities: string[];
  trending: string[];
} {
  // This would integrate with real competitor analysis tools
  return {
    gaps: [
      'AI chatbot ROI calculator',
      'customer support automation cost',
      'intelligent lead qualification',
      'multilingual customer service AI'
    ],
    opportunities: [
      'voice commerce chatbot',
      'AI customer insights',
      'predictive customer support',
      'emotional AI customer service'
    ],
    trending: [
      'generative AI customer support',
      'AI chatbot personalization',
      'autonomous customer service',
      'conversational commerce AI'
    ]
  };
}

// Generate comprehensive SEO metadata with all intelligence features
export function generateAdvancedSEOMetadata(config: SEOIntelligenceConfig): AdvancedMetadata {
  const title = generateIntelligentTitle(config);
  const description = generateIntelligentMetaDescription(config);
  
  // Enhanced keywords with semantic expansion
  const intentKey = (config.userIntent === 'informational' || config.userIntent === 'commercial' || config.userIntent === 'transactional') 
                    ? config.userIntent : 'commercial';
  const baseKeywords = ADVANCED_KEYWORD_INTELLIGENCE.intentBased[intentKey];
  const voiceKeywords = config.voiceSearchOptimized ? ADVANCED_KEYWORD_INTELLIGENCE.voiceSearch.questions : [];
  const regionalKeywords = ADVANCED_KEYWORD_INTELLIGENCE.regional[config.userLocation || 'global'];
  
  const allKeywords = [
    ...baseKeywords,
    ...voiceKeywords.slice(0, 3),
    ...regionalKeywords.slice(0, 5),
    ...generateSemanticKeywords('AI chatbot').slice(0, 3)
  ];
  
  return {
    title,
    description,
    keywords: allKeywords,
    authors: [{ name: 'TrulyBot AI Intelligence Team' }],
    creator: 'TrulyBot - Advanced AI Platform',
    publisher: 'TrulyBot Intelligence',
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      siteName: 'TrulyBot - Revolutionary AI Platform',
      locale: config.userLocation === 'india' ? 'en_IN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: title.length > 70 ? title.substring(0, 67) + '...' : title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    },
    other: {
      'search-intent': config.userIntent || 'commercial',
      'geo-targeting': config.userLocation || 'global',
      'content-type': config.pageType || 'product',
      'voice-optimized': config.voiceSearchOptimized ? 'true' : 'false',
      'featured-snippet-ready': config.featuredSnippetTargeting ? 'true' : 'false',
    }
  };
}

// Real-time SEO performance tracking
export function trackSEOPerformance(pageUrl: string, keywords: string[]) {
  if (typeof window === 'undefined') return;
  
  // Track SEO events
  window.dispatchEvent(new CustomEvent('trulybot:seo-tracking', {
    detail: {
      page: pageUrl,
      keywords: keywords,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      location: window.location.href
    }
  }));
}