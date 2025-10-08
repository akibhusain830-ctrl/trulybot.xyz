// Professional Enhanced Sitemap for Better SEO
// Comprehensive sitemap with all professional pages and priority optimization

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

type MetadataRouteSitemap = SitemapEntry[];

// Professional sitemap with enhanced structure
export default function sitemap(): MetadataRouteSitemap {
  const baseUrl = 'https://trulybot.xyz'
  const now = new Date()
  
  // Core business pages (highest priority)
  const corePages: SitemapEntry[] = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/start-trial`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  ];

  // Product and feature pages
  const productPages: SitemapEntry[] = [
    // Features page is already included in core pages, no additional product pages
  ];

  // Customer success and social proof
  const socialProofPages: SitemapEntry[] = [
    // No additional social proof pages exist
  ];

  // Regional and localized pages
  const regionalPages: SitemapEntry[] = [
    // No specific regional pages exist currently
  ];

  // Support and information pages
  const supportPages: SitemapEntry[] = [
    // Contact page is already included in core pages
  ];

  // Blog and content pages
  const contentPages: SitemapEntry[] = [
    // No blog pages exist currently
  ];

  // Company and legal pages
  const companyPages: SitemapEntry[] = [
    // Contact page is already included in core pages
  ];

  // Authentication pages (lower priority)
  const authPages: SitemapEntry[] = [
    // No additional auth pages included in sitemap
  ];

  // Combine all pages
  const allPages = [
    ...corePages,
    ...productPages,
    ...socialProofPages,
    ...regionalPages,
    ...supportPages,
    ...contentPages,
    ...companyPages,
    ...authPages
  ];

  // Convert to MetadataRoute.Sitemap format
  return allPages.map(page => ({
    url: page.url,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }));
}

// Generate additional specialized sitemaps
export function generateImageSitemap(): MetadataRouteSitemap {
  const baseUrl = 'https://trulybot.xyz';
  const now = new Date();
  
  const images = [
    '/og-image.svg',
    '/logo-trulybot.svg',
    '/images/dashboard-screenshot.jpg',
    '/images/hero-banner.webp',
    '/images/features-overview.webp',
    '/images/integration-showcase.webp',
    '/images/success-stories.webp'
  ];
  
  return images.map(image => ({
    url: `${baseUrl}${image}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5
  }));
}

export function generateBlogSitemap(): MetadataRouteSitemap {
  const baseUrl = 'https://trulybot.xyz';
  const now = new Date();
  
  // This would typically come from your CMS or blog data
  const blogPosts = [
    {
      slug: 'ai-chatbot-ecommerce-guide',
      lastModified: new Date('2024-10-01'),
      priority: 0.8
    },
    {
      slug: 'reduce-customer-support-costs',
      lastModified: new Date('2024-09-15'),
      priority: 0.7
    },
    {
      slug: 'whatsapp-business-automation',
      lastModified: new Date('2024-09-01'),
      priority: 0.7
    },
    {
      slug: 'shopify-chatbot-integration',
      lastModified: new Date('2024-08-15'),
      priority: 0.6
    }
  ];
  
  return blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.lastModified,
    changeFrequency: 'monthly' as const,
    priority: post.priority
  }));
}
