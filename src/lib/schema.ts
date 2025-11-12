/**
 * World-class schema markup for maximum SEO impact
 * Implementing industry-leading structured data patterns
 */

// FAQ Schema for common questions about TrulyBot AI Chatbot
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is TrulyBot and how does it work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TrulyBot is a lightning-fast AI chatbot platform designed for e-commerce businesses. It provides 24/7 automated customer support, lead generation, and reduces support tickets by 70%. The AI is trained on your business knowledge to provide accurate, instant responses.'
      }
    },
    {
      '@type': 'Question',
      name: 'How quickly can I set up TrulyBot on my website?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TrulyBot can be set up and integrated into your website in just 5 minutes. Our thunderbolt-speed deployment process requires no coding skills and includes instant widget integration.'
      }
    },
    {
      '@type': 'Question',
      name: 'What results can I expect from using TrulyBot?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Businesses using TrulyBot typically see 70% reduction in support tickets, 5X increase in lead generation, and 24/7 customer support coverage. Our lightning-fast AI responses improve customer satisfaction and conversion rates.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is TrulyBot suitable for e-commerce businesses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! TrulyBot is specifically designed for e-commerce businesses. It integrates seamlessly with online stores, handles product inquiries, processes orders, and captures leads with thunderbolt speed.'
      }
    },
    {
      '@type': 'Question',
      name: 'What pricing plans does TrulyBot offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TrulyBot offers four pricing plans in INR: Free (₹0/month with 300 replies), Basic (₹499/month with 1k replies), Pro (₹1,499/month with 3k replies), and Enterprise (₹2,999/month with 15k replies). All paid plans include a free 7-day trial with no credit card required.'
      }
    },
    {
      '@type': 'Question',
      name: 'Does TrulyBot provide multilingual support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, TrulyBot supports multiple languages and can provide customer support in various languages to serve global e-commerce businesses with lightning-fast multilingual AI responses.'
      }
    }
  ]
};

// Service Schema for TrulyBot AI Chatbot Services
export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `https://trulybot.xyz/#service`,
  name: 'TrulyBot AI Chatbot Service',
  description: 'Lightning-fast AI chatbot platform for e-commerce businesses. Automated customer support, lead generation, and thunderbolt-speed responses.',
  provider: {
    '@id': 'https://trulybot.xyz/#organization'
  },
  areaServed: {
    '@type': 'Country',
    name: 'Worldwide'
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'AI Chatbot Plans',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        description: 'Free AI chatbot with 300 conversations per month',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        name: 'Basic Plan',
        description: 'Core AI chatbot with 1,000 conversations per month',
        price: '499',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        description: 'Advanced AI chatbot with 3,000 conversations and analytics',
        price: '1499',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        name: 'Enterprise Plan',
        description: 'Enterprise AI chatbot with 15,000 conversations',
        price: '2999',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock'
      }
    ]
  },
  serviceType: [
    'AI Chatbot',
    'Customer Support Automation',
    'Lead Generation',
    'E-commerce Integration',
    'Conversational AI'
  ],
  category: 'SaaS Platform'
};

// Product Schema for TrulyBot Software
export const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': 'https://trulybot.xyz/#product',
  name: 'TrulyBot AI Chatbot Platform',
  description: 'Lightning-fast AI chatbot software for e-commerce businesses. Reduce support tickets by 70%, increase leads by 5X with thunderbolt-speed automation.',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Customer Support Software',
  operatingSystem: 'Web Browser',
  url: 'https://trulybot.xyz',
  screenshot: 'https://trulybot.xyz/og-image.svg',
  softwareVersion: '2.0',
  datePublished: '2024-01-01',
  dateModified: '2025-10-04',
  author: {
    '@id': 'https://trulybot.xyz/#organization'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1'
  },
  offers: {
    '@type': 'Offer',
    price: '99',
    priceCurrency: 'INR',
    priceValidUntil: '2025-12-31',
    availability: 'https://schema.org/InStock',
    seller: {
      '@id': 'https://trulybot.xyz/#organization'
    }
  },
  featureList: [
    '24/7 Automated Customer Support',
    'Lightning-Fast Lead Generation',
    'E-commerce Integration',
    'Multi-language Support',
    'Analytics & Reporting',
    '70% Ticket Reduction',
    '5-minute Setup',
    'Thunderbolt Speed Responses'
  ],
  installUrl: 'https://trulybot.xyz/sign-up',
  downloadUrl: 'https://trulybot.xyz/widget.js'
};

// Review Schema for Customer Testimonials
export const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'Review',
  '@id': 'https://trulybot.xyz/#review',
  itemReviewed: {
    '@id': 'https://trulybot.xyz/#product'
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: '5',
    bestRating: '5'
  },
  author: {
    '@type': 'Person',
    name: 'Sarah Johnson'
  },
  reviewBody: 'TrulyBot transformed our e-commerce customer support with lightning-fast AI responses. We reduced support tickets by 70% and increased leads by 5X. The thunderbolt-speed setup took just 5 minutes!',
  datePublished: '2025-10-01'
};

// BreadcrumbList Schema for navigation
export const breadcrumbSchema = {
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
      name: 'AI Chatbot for E-commerce',
      item: 'https://trulybot.xyz/ai-chatbot-for-ecommerce'
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Pricing',
      item: 'https://trulybot.xyz/pricing'
    }
  ]
};

// Local Business Schema for TrulyBot
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://trulybot.xyz/#localbusiness',
  name: 'TrulyBot Pvt. Ltd.',
  alternateName: 'TrulyBot AI Chatbot Company',
  description: 'Lightning-fast AI chatbot development company providing thunderbolt-speed customer support automation for e-commerce businesses worldwide.',
  image: 'https://trulybot.xyz/logo-trulybot.svg',
  telephone: '+91-9101361482',
  email: 'infotrulybot@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'MG Path, Christian Basti',
    addressLocality: 'Guwahati',
    addressRegion: 'Assam',
    postalCode: '781005',
    addressCountry: 'IN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 26.1445,
    longitude: 91.7362
  },
  url: 'https://trulybot.xyz',
  priceRange: '₹0-₹2,999 per month',
  paymentAccepted: ['Credit Card', 'PayPal', 'Razorpay'],
  currenciesAccepted: 'USD, INR',
  openingHours: 'Mo-Su 00:00-23:59',
  serviceArea: {
    '@type': 'Country',
    name: 'Worldwide'
  }
};

// Website Schema for enhanced search presence
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://trulybot.xyz/#website',
  url: 'https://trulybot.xyz',
  name: 'TrulyBot - Lightning-Fast AI Chatbot for E-Commerce',
  description: 'Transform your e-commerce with TrulyBot\'s lightning-fast AI chatbot. Reduce support tickets 70%, increase leads 5X. Thunderbolt-speed setup in 5 minutes.',
  publisher: {
    '@id': 'https://trulybot.xyz/#organization'
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://trulybot.xyz/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  },
  mainEntity: {
    '@id': 'https://trulybot.xyz/#product'
  }
};