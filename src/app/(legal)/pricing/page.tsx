import React from 'react';
import { Metadata } from 'next';
import { generateSEOMetadata, seoConfigs } from '@/lib/seo';
import PricingClientPage from './pricing-client-page';

export const metadata: Metadata = generateSEOMetadata({
  ...seoConfigs.pricing,
  keywords: [...seoConfigs.pricing.keywords],
  canonical: '/pricing'
});

export default function PricingPage() {
  return <PricingClientPage />;
}