import { Metadata } from 'next';
import { generateSEOMetadata, seoConfigs } from '@/lib/seo';
import { faqSchema, serviceSchema, productSchema, reviewSchema, websiteSchema } from '@/lib/schema';
import HomePageContent from './HomePageContent';

// Homepage metadata export for SEO
export const metadata: Metadata = generateSEOMetadata({
  ...seoConfigs.home,
  keywords: [...seoConfigs.home.keywords],
  canonical: '/'
});

// Server component with metadata export
export default function HomePage() {
  return (
    <>
      {/* Comprehensive Schema Markup for Maximum SEO Impact */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(reviewSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <HomePageContent />
    </>
  );
}