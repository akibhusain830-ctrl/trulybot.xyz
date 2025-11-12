import { Metadata } from 'next';

export interface StructuredDataConfig {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export function generateStructuredData(type: 'Organization' | 'WebSite' | 'Product' | 'SoftwareApplication', data: any): StructuredDataConfig {
  const baseUrl = 'https://trulybot.xyz';
  
  const commonData = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'Organization':
      return {
        ...commonData,
        name: 'TrulyBot',
        url: baseUrl,
        logo: `${baseUrl}/logo.svg`,
        description: 'AI-powered chatbot platform for ecommerce businesses. Automate customer support, generate leads, and boost sales with intelligent conversational AI.',
        foundingDate: '2024',
        industry: 'Software',
        numberOfEmployees: '1-10',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'India',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-9999999999',
          contactType: 'Customer Service',
          email: 'support@trulybot.xyz',
        },
        sameAs: [
          'https://twitter.com/trulybot',
          'https://linkedin.com/company/trulybot',
        ],
        ...data,
      };

    case 'WebSite':
      return {
        ...commonData,
        name: 'TrulyBot - AI Chatbot Platform',
        url: baseUrl,
        description: 'Create intelligent AI chatbots for your ecommerce business. Easy integration, powerful automation, and excellent customer support.',
        publisher: {
          '@type': 'Organization',
          name: 'TrulyBot',
          logo: `${baseUrl}/logo.svg`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
        ...data,
      };

    case 'SoftwareApplication':
      return {
        ...commonData,
        name: 'TrulyBot AI Chatbot Platform',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        url: baseUrl,
        description: 'AI-powered chatbot platform that helps ecommerce businesses automate customer support, generate leads, and increase sales through intelligent conversational AI.',
        author: {
          '@type': 'Organization',
          name: 'TrulyBot',
        },
        offers: {
          '@type': 'Offer',
          price: '99',
          priceCurrency: 'INR',
          priceValidUntil: '2024-12-31',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'TrulyBot',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '127',
          bestRating: '5',
          worstRating: '1',
        },
        features: [
          'AI-powered conversations',
          'Easy website integration',
          'Lead generation',
          'Customer support automation',
          'Analytics and insights',
          'Multi-language support',
        ],
        ...data,
      };

    case 'Product':
      return {
        ...commonData,
        name: data.name || 'TrulyBot AI Chatbot',
        description: data.description || 'AI chatbot solution for ecommerce businesses',
        brand: {
          '@type': 'Brand',
          name: 'TrulyBot',
        },
        manufacturer: {
          '@type': 'Organization',
          name: 'TrulyBot',
        },
        offers: {
          '@type': 'Offer',
          price: data.price || '99',
          priceCurrency: data.currency || 'INR',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2024-12-31',
          seller: {
            '@type': 'Organization',
            name: 'TrulyBot',
          },
        },
        ...data,
      };

    default:
      return commonData;
  }
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): StructuredDataConfig {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): StructuredDataConfig {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateLocalBusinessStructuredData(location: 'india' | 'global' = 'global'): StructuredDataConfig {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'TrulyBot',
    url: 'https://trulybot.xyz',
    description: 'AI chatbot platform for ecommerce businesses',
    telephone: location === 'india' ? '+91-9999999999' : '+1-555-0123',
    email: 'support@trulybot.xyz',
    priceRange: location === 'india' ? '₹0-₹2,999' : '$5-$15',
    paymentAccepted: location === 'india' ? 'Cash, Credit Card, UPI, Net Banking' : 'Cash, Credit Card, PayPal',
    currenciesAccepted: location === 'india' ? 'INR' : 'USD',
  };

  if (location === 'india') {
    return {
      ...baseData,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
        addressRegion: 'India',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 20.5937,
        longitude: 78.9629,
      },
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
    };
  }

  return baseData;
}

// Enhanced metadata generation with structured data
export function generateEnhancedMetadata(config: {
  title: string;
  description: string;
  path: string;
  structuredData?: StructuredDataConfig[];
  locale?: string;
  currency?: 'INR' | 'USD';
}): Metadata {
  const baseUrl = 'https://trulybot.xyz';
  const canonicalUrl = `${baseUrl}${config.path}`;
  
  return {
    title: config.title,
    description: config.description,
    keywords: 'AI chatbot, ecommerce automation, customer support, lead generation, conversational AI, business automation',
    authors: [{ name: 'TrulyBot Team' }],
    creator: 'TrulyBot',
    publisher: 'TrulyBot',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-US': `${baseUrl}${config.path}`,
        'en-IN': `${baseUrl}/india${config.path === '/' ? '' : config.path}`,
      },
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonicalUrl,
      siteName: 'TrulyBot',
      locale: config.locale || 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'TrulyBot - AI Chatbot Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      site: '@trulybot',
      creator: '@trulybot',
      images: [`${baseUrl}/og-image.jpg`],
    },
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
    verification: {
      google: 'google-site-verification-code',
      yandex: 'yandex-verification-code',
      yahoo: 'yahoo-verification-code',
    },
    other: {
      'price:currency': config.currency || 'USD',
      'product:price:amount': config.currency === 'INR' ? '99' : '5',
      'product:price:currency': config.currency || 'USD',
    },
  };
}