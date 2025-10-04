import { Metadata } from 'next';
import { generateSEOMetadata, seoConfigs } from '@/lib/seo';
import HomePageContent from './HomePageContent';

// Homepage metadata export for SEO
export const metadata: Metadata = generateSEOMetadata({
  ...seoConfigs.home,
  keywords: [...seoConfigs.home.keywords],
  canonical: '/'
});

// Server component with metadata export
export default function HomePage() {
  return <HomePageContent />;
}