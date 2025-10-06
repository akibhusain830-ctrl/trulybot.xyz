import React from 'react';
import { Metadata } from 'next';
import { generateSEOMetadata, seoConfigs } from '@/lib/seo';
import PricingClientPage from './pricing-client-page';

export const metadata: Metadata = generateSEOMetadata({
  ...seoConfigs.pricing,
  keywords: [...seoConfigs.pricing.keywords],
  canonical: '/pricing'
});

// Structured data for pricing page
const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'TrulyBot AI Chatbot',
  description: 'Professional AI chatbot for e-commerce customer support and lead generation',
  brand: {
    '@type': 'Brand',
    name: 'TrulyBot'
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Basic Plan',
      price: '99',
      priceCurrency: 'INR',
      billingIncrement: 'monthly',
      description: 'Core AI chatbot with 1,000 conversations per month',
      availability: 'https://schema.org/InStock',
      url: 'https://trulybot.xyz/pricing'
    },
    {
      '@type': 'Offer', 
      name: 'Pro Plan',
      price: '399',
      priceCurrency: 'INR',
      billingIncrement: 'monthly',
      description: 'Advanced chatbot with lead capture and analytics',
      availability: 'https://schema.org/InStock',
      url: 'https://trulybot.xyz/pricing'
    },
    {
      '@type': 'Offer',
      name: 'Ultra Plan', 
      price: '599',
      priceCurrency: 'INR',
      billingIncrement: 'monthly',
      description: 'Enterprise-grade AI with unlimited conversations and advanced features',
      availability: 'https://schema.org/InStock',
      url: 'https://trulybot.xyz/pricing'
    }
  ]
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <PricingClientPage />
    </>
  );
}