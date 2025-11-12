// Advanced Structured Data for Maximum SEO Impact
// Rich snippets, featured snippets, and advanced schema markup

export interface StructuredDataSchema {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// Advanced FAQ Schema for Featured Snippets
export function generateAdvancedFAQSchema(): StructuredDataSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the best AI chatbot for ecommerce in 2025?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TrulyBot is the #1 rated AI chatbot for ecommerce, reducing support tickets by 70% and increasing leads by 5X. It offers lightning-fast responses, intelligent lead capture, and seamless integration with popular ecommerce platforms like Shopify, WooCommerce, and Magento.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does an AI chatbot cost for small businesses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TrulyBot offers a FREE plan (₹0/month with 300 replies) and paid plans starting at ₹499/month for small businesses. This includes 1,000 conversations, 24/7 support, and all essential features to automate customer service and generate leads.'
        }
      },
      {
        '@type': 'Question',
        name: 'How quickly can I setup an AI chatbot for my online store?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TrulyBot can be setup in just 5 minutes with zero coding required. Simply connect your store, customize your chatbot personality, and start automating customer support instantly. Our one-click integrations work with all major ecommerce platforms.'
        }
      },
      {
        '@type': 'Question',
        name: 'What languages does TrulyBot AI chatbot support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TrulyBot supports 50+ languages including English, Hindi, Spanish, French, German, and more. It automatically detects customer language and responds appropriately, making it perfect for global ecommerce businesses and the Indian market.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can AI chatbots really reduce customer support tickets?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! TrulyBot customers see an average 70% reduction in support tickets by automating responses to common questions, order tracking, refunds, and product recommendations. This frees up your team to focus on complex issues and strategic growth.'
        }
      }
    ]
  };
}

// HowTo Schema for Step-by-Step Content
export function generateHowToSchema(): StructuredDataSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Setup AI Chatbot for Ecommerce in 5 Minutes',
    description: 'Complete guide to setting up TrulyBot AI chatbot for your ecommerce store with zero coding required.',
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '5'
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Ecommerce website (Shopify, WooCommerce, etc.)'
      },
      {
        '@type': 'HowToSupply',
        name: 'TrulyBot account (free trial available)'
      }
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Web browser'
      }
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Create TrulyBot Account',
        text: 'Sign up for TrulyBot free trial at trulybot.xyz/start-trial',
        url: 'https://trulybot.xyz/start-trial',
        image: 'https://trulybot.xyz/images/step1-signup.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Connect Your Store',
        text: 'Use one-click integration to connect your Shopify, WooCommerce, or other ecommerce platform',
        url: 'https://trulybot.xyz/integrations',
        image: 'https://trulybot.xyz/images/step2-connect.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Customize Chatbot',
        text: 'Set your brand voice, upload product catalog, and configure automated responses',
        url: 'https://trulybot.xyz/customization',
        image: 'https://trulybot.xyz/images/step3-customize.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Test and Launch',
        text: 'Test your chatbot with sample conversations and launch it live on your website',
        url: 'https://trulybot.xyz/testing',
        image: 'https://trulybot.xyz/images/step4-launch.jpg'
      }
    ]
  };
}

// Advanced Product Schema with Rich Data
export function generateAdvancedProductSchema(): StructuredDataSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TrulyBot AI Chatbot Platform',
    description: 'Revolutionary AI chatbot platform for ecommerce businesses. Automate customer support, generate leads, and boost sales with intelligent conversational AI.',
    url: 'https://trulybot.xyz',
    applicationCategory: 'Business Software',
    operatingSystem: 'Web-based, iOS, Android',
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter Plan',
        description: 'Perfect for small businesses getting started with AI automation',
        price: '99',
        priceCurrency: 'INR',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://trulybot.xyz/pricing-india',
        eligibleRegion: {
          '@type': 'Country',
          name: 'India'
        }
      },
      {
        '@type': 'Offer',
        name: 'Professional Plan',
        description: 'Advanced features for growing businesses',
        price: '299',
        priceCurrency: 'INR',
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://trulybot.xyz/pricing-india'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1247',
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
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        reviewBody: 'TrulyBot transformed our customer support! We reduced tickets by 80% and our customers love the instant responses. Setup was incredibly easy.',
        datePublished: '2024-10-01'
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Rajesh Kumar'
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        reviewBody: 'Best investment for our ecommerce business. The AI is incredibly smart and handles complex customer queries perfectly. ROI was positive within 2 weeks.',
        datePublished: '2024-09-15'
      }
    ],
    featureList: [
      'AI-Powered Customer Support Automation',
      'Intelligent Lead Generation & Qualification',
      '24/7 Multilingual Support (50+ Languages)',
      'One-Click Ecommerce Platform Integration',
      'Advanced Analytics & Performance Tracking',
      'Custom Branding & Personality Configuration',
      'Real-time Customer Conversation Management',
      'Automated Order Tracking & Updates'
    ],
    screenshot: 'https://trulybot.xyz/images/dashboard-screenshot.jpg',
    downloadUrl: 'https://trulybot.xyz/start-trial',
    installUrl: 'https://trulybot.xyz/start-trial'
  };
}

// Breadcrumb Schema for Navigation
export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>): StructuredDataSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// Advanced Organization Schema with Rich Data
export function generateAdvancedOrganizationSchema(): StructuredDataSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TrulyBot',
    alternateName: 'TrulyBot AI',
    url: 'https://trulybot.xyz',
    logo: {
      '@type': 'ImageObject',
      url: 'https://trulybot.xyz/logo-trulybot.svg',
      width: 512,
      height: 512
    },
    description: 'Leading AI chatbot platform revolutionizing ecommerce customer support and lead generation worldwide.',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Akib Rahman',
      jobTitle: 'Chief Technology Officer'
    },
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: 15
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'India',
      addressRegion: 'Assam',
      addressLocality: 'Guwahati'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-8638574534',
        contactType: 'Customer Service',
        availableLanguage: ['English', 'Hindi'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59'
        }
      }
    ],
    sameAs: [
      'https://linkedin.com/company/trulybot',
      'https://twitter.com/trulybot',
      'https://facebook.com/trulybot'
    ],
    award: [
      'Best AI Innovation Award 2024',
      'Top Ecommerce Tool 2024',
      'Customer Choice Award 2024'
    ],
    knowsAbout: [
      'Artificial Intelligence',
      'Customer Support Automation',
      'Ecommerce Technology',
      'Conversational AI',
      'Lead Generation',
      'Business Process Automation'
    ]
  };
}

// Event Schema for Webinars/Demos
export function generateEventSchema(): StructuredDataSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'TrulyBot AI Masterclass: Transform Your Ecommerce Customer Support',
    description: 'Free live masterclass showing how to reduce support tickets by 70% and increase leads by 5X using TrulyBot AI chatbot.',
    startDate: '2024-11-15T15:00:00+05:30',
    endDate: '2024-11-15T16:30:00+05:30',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://trulybot.xyz/masterclass'
    },
    image: 'https://trulybot.xyz/images/masterclass-banner.jpg',
    organizer: {
      '@type': 'Organization',
      name: 'TrulyBot',
      url: 'https://trulybot.xyz'
    },
    offers: {
      '@type': 'Offer',
      url: 'https://trulybot.xyz/masterclass-register',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      validFrom: '2024-10-01T00:00:00+05:30'
    },
    performer: {
      '@type': 'Person',
      name: 'Akib Rahman',
      jobTitle: 'AI Technology Expert & CTO'
    }
  };
}

// Video Schema for Enhanced Rich Snippets
export function generateVideoSchema(): StructuredDataSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'TrulyBot AI Chatbot Demo: 5-Minute Setup Walkthrough',
    description: 'Watch how easy it is to setup TrulyBot AI chatbot for your ecommerce store in just 5 minutes with zero coding required.',
    thumbnailUrl: 'https://trulybot.xyz/images/video-thumbnail.jpg',
    uploadDate: '2024-10-01T00:00:00+05:30',
    duration: 'PT5M30S',
    contentUrl: 'https://trulybot.xyz/videos/setup-demo.mp4',
    embedUrl: 'https://trulybot.xyz/embed/setup-demo',
    publisher: {
      '@type': 'Organization',
      name: 'TrulyBot',
      logo: {
        '@type': 'ImageObject',
        url: 'https://trulybot.xyz/logo-trulybot.svg'
      }
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: 12400
    }
  };
}

// Article Schema for Blog Posts
export function generateArticleSchema(articleData: {
  title: string;
  description: string;
  publishDate: string;
  modifiedDate: string;
  author: string;
  url: string;
}): StructuredDataSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articleData.title,
    description: articleData.description,
    image: 'https://trulybot.xyz/images/blog-featured.jpg',
    author: {
      '@type': 'Person',
      name: articleData.author,
      url: 'https://trulybot.xyz/about'
    },
    publisher: {
      '@type': 'Organization',
      name: 'TrulyBot',
      logo: {
        '@type': 'ImageObject',
        url: 'https://trulybot.xyz/logo-trulybot.svg'
      }
    },
    datePublished: articleData.publishDate,
    dateModified: articleData.modifiedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleData.url
    },
    articleSection: 'AI Technology',
    keywords: 'AI chatbot, ecommerce automation, customer support, artificial intelligence, business growth',
    wordCount: 1500,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.article-headline', '.article-summary']
    }
  };
}

// Local Business Schema for Regional SEO
export function generateLocalBusinessSchema(location: 'india' | 'global' = 'india'): StructuredDataSchema {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'TrulyBot India',
    image: 'https://trulybot.xyz/images/office-india.jpg',
    telephone: '+91-8638574534',
    email: 'hello@trulybot.xyz',
    url: 'https://trulybot.xyz',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tech Hub, Guwahati',
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
      postalCode: '781001',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.1445,
      longitude: 91.7362
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      }
    ],
    servedCuisine: 'AI Technology Services',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '847'
    }
  };

  if (location === 'india') {
    return {
      ...baseSchema,
      areaServed: {
        '@type': 'Country',
        name: 'India'
      }
    };
  }

  return baseSchema;
}

// Complete Schema Collection for any page
export function generateCompleteSchemaCollection(pageType: 'homepage' | 'product' | 'blog' | 'about' = 'homepage') {
  const schemas = [
    generateAdvancedOrganizationSchema(),
    generateAdvancedProductSchema(),
    generateAdvancedFAQSchema()
  ];

  if (pageType === 'homepage') {
    schemas.push(
      generateHowToSchema(),
      generateLocalBusinessSchema(),
      generateEventSchema()
    );
  }

  if (pageType === 'blog') {
    schemas.push(
      generateArticleSchema({
        title: 'AI Chatbot Implementation Guide',
        description: 'Complete guide to implementing AI chatbots for ecommerce success',
        publishDate: '2024-10-01',
        modifiedDate: '2024-10-06',
        author: 'TrulyBot Team',
        url: 'https://trulybot.xyz/blog/ai-chatbot-guide'
      }),
      generateVideoSchema()
    );
  }

  return schemas;
}