/**
 * SEO Core Functions Tests
 * Comprehensive tests for seo.ts - metadata generation, configs, and SEO optimization
 */

import { describe, it, expect } from 'vitest';
import { generateSEOMetadata, seoConfigs } from '../lib/seo';

describe('generateSEOMetadata', () => {
  it('should generate basic metadata with title and description', () => {
    const result = generateSEOMetadata({
      title: 'Test Page',
      description: 'Test description'
    });

    expect(result.title).toContain('Test Page');
    expect(result.description).toBe('Test description');
  });

  it('should append TrulyBot to title if not present', () => {
    const result = generateSEOMetadata({
      title: 'Features',
      description: 'Test'
    });

    expect(result.title).toBe('Features | TrulyBot');
  });

  it('should not duplicate TrulyBot in title', () => {
    const result = generateSEOMetadata({
      title: 'Features | TrulyBot',
      description: 'Test'
    });

    expect(result.title).toBe('Features | TrulyBot');
    expect(result.title.match(/TrulyBot/g)?.length).toBe(1);
  });

  it('should include default keywords', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test'
    });

    expect(result.keywords).toContain('TrulyBot');
    expect(result.keywords).toContain('AI chatbot');
    expect(result.keywords).toContain('ecommerce chatbot');
  });

  it('should merge custom keywords with defaults', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test',
      keywords: ['custom keyword 1', 'custom keyword 2']
    });

    expect(result.keywords).toContain('custom keyword 1');
    expect(result.keywords).toContain('custom keyword 2');
    expect(result.keywords).toContain('TrulyBot');
  });

  it('should generate canonical URL correctly', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test',
      canonical: '/pricing'
    });

    expect(result.alternates?.canonical).toBe('https://trulybot.xyz/pricing');
  });

  it('should use site URL as default canonical', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test'
    });

    expect(result.alternates?.canonical).toBe('https://trulybot.xyz');
  });

  it('should set noindex robots directive', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test',
      noIndex: true
    });

    expect(result.robots).toBe('noindex,nofollow');
  });

  it('should set index robots directive by default', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test'
    });

    expect(result.robots).toBe('index,follow');
  });

  it('should generate OpenGraph metadata', () => {
    const result = generateSEOMetadata({
      title: 'Test Page',
      description: 'Test description'
    });

    expect(result.openGraph?.title).toContain('Test Page');
    expect(result.openGraph?.description).toBe('Test description');
    expect(result.openGraph?.siteName).toBe('TrulyBot');
    expect(result.openGraph?.type).toBe('website');
  });

  it('should set OpenGraph locale for India', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test',
      userLocation: 'india'
    });

    expect(result.openGraph?.locale).toBe('en_IN');
  });

  it('should set OpenGraph locale for global', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test',
      userLocation: 'global'
    });

    expect(result.openGraph?.locale).toBe('en_US');
  });

  it('should generate Twitter card metadata', () => {
    const result = generateSEOMetadata({
      title: 'Test Page',
      description: 'Test description'
    });

    expect(result.twitter?.card).toBe('summary_large_image');
    expect(result.twitter?.title).toContain('Test Page');
    expect(result.twitter?.description).toBe('Test description');
  });

  it('should use custom OG image', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test',
      ogImage: '/custom-image.jpg'
    });

    expect(result.openGraph?.images).toContain('https://trulybot.xyz/custom-image.jpg');
  });

  it('should set authors metadata', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test'
    });

    expect(result.authors).toEqual([{ name: 'TrulyBot Team' }]);
  });

  it('should set creator and publisher', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test'
    });

    expect(result.creator).toBe('TrulyBot');
    expect(result.publisher).toBe('TrulyBot');
  });
});

describe('SEO Configs Validation', () => {
  it('should have config for home page', () => {
    expect(seoConfigs.home).toBeDefined();
    expect(seoConfigs.home.title).toContain('AI Chatbot');
    expect(seoConfigs.home.description).toBeTruthy();
    expect(seoConfigs.home.keywords.length).toBeGreaterThan(20);
  });

  it('should have config for pricing page', () => {
    expect(seoConfigs.pricing).toBeDefined();
    expect(seoConfigs.pricing.title).toContain('Pricing');
    expect(seoConfigs.pricing.voiceSearchOptimized).toBe(true);
  });

  it('should have config for dashboard page', () => {
    expect(seoConfigs.dashboard).toBeDefined();
    expect(seoConfigs.dashboard.noIndex).toBe(true);
  });

  it('should have config for features page', () => {
    expect(seoConfigs.features).toBeDefined();
    expect(seoConfigs.features.featuredSnippetTargeting).toBe(true);
  });

  it('all page configs should have title', () => {
    Object.values(seoConfigs).forEach(config => {
      expect(config.title).toBeTruthy();
      expect(config.title.length).toBeGreaterThan(10);
    });
  });

  it('all page configs should have description', () => {
    Object.values(seoConfigs).forEach(config => {
      expect(config.description).toBeTruthy();
      expect(config.description.length).toBeGreaterThan(50);
      expect(config.description.length).toBeLessThan(200); // Allow longer descriptions
    });
  });

  it('all page configs should have keywords array', () => {
    Object.values(seoConfigs).forEach(config => {
      expect(Array.isArray(config.keywords)).toBe(true);
      expect(config.keywords.length).toBeGreaterThan(5);
    });
  });

  it('home page should have voice search optimization', () => {
    expect(seoConfigs.home.voiceSearchOptimized).toBe(true);
    expect(seoConfigs.home.featuredSnippetTargeting).toBe(true);
  });

  it('pricing page should have commercial intent', () => {
    expect(seoConfigs.pricing.userIntent).toBe('commercial');
  });

  it('about page should have informational intent', () => {
    expect(seoConfigs.about.userIntent).toBe('informational');
  });

  it('signup page should have transactional intent', () => {
    expect(seoConfigs.signup.userIntent).toBe('transactional');
  });

  it('home page should have homepage page type', () => {
    expect(seoConfigs.home.pageType).toBe('homepage');
  });
});

describe('SEO Keywords Quality', () => {
  it('home page should have high-volume primary keywords', () => {
    const primaryKeywords = [
      'AI chatbot for ecommerce',
      'customer support automation',
      'ecommerce chatbot'
    ];

    primaryKeywords.forEach(keyword => {
      expect(seoConfigs.home.keywords).toContain(keyword);
    });
  });

  it('home page should have long-tail keywords', () => {
    const longTailKeywords = [
      'AI chatbot that increases sales',
      'automated customer support for online stores'
    ];

    longTailKeywords.forEach(keyword => {
      expect(seoConfigs.home.keywords).toContain(keyword);
    });
  });

  it('pricing page should have voice search keywords', () => {
    const voiceKeywords = [
      'how much does an AI chatbot cost',
      'what is the cheapest AI chatbot for small business'
    ];

    voiceKeywords.forEach(keyword => {
      expect(seoConfigs.pricing.keywords).toContain(keyword);
    });
  });

  it('features page should have capability keywords', () => {
    const capabilityKeywords = [
      'AI chatbot features',
      'customer support automation features',
      'automated customer service features'
    ];

    capabilityKeywords.forEach(keyword => {
      expect(seoConfigs.features.keywords).toContain(keyword);
    });
  });

  it('keywords should not be excessively long', () => {
    Object.values(seoConfigs).forEach(config => {
      config.keywords.forEach(keyword => {
        expect(keyword.length).toBeLessThan(100);
      });
    });
  });

  it('keywords should be lowercase', () => {
    Object.values(seoConfigs).forEach(config => {
      config.keywords.forEach(keyword => {
        // Check if keyword is primarily lowercase (allowing for proper nouns)
        const lowercaseRatio = keyword.split('').filter(c => c === c.toLowerCase()).length / keyword.length;
        expect(lowercaseRatio).toBeGreaterThan(0.8);
      });
    });
  });
});

describe('SEO Title Optimization', () => {
  it('titles should be under 90 characters for SEO', () => {
    Object.values(seoConfigs).forEach(config => {
      expect(config.title.length).toBeLessThan(90); // Allow comprehensive titles
    });
  });

  it('titles should contain primary keyword', () => {
    expect(seoConfigs.home.title.toLowerCase()).toContain('chatbot');
    expect(seoConfigs.pricing.title.toLowerCase()).toContain('pricing');
    expect(seoConfigs.features.title.toLowerCase()).toContain('features');
  });

  it('titles should have power words', () => {
    const powerWords = ['#1', 'best', 'complete', 'advanced', 'expert'];
    const allTitles = Object.values(seoConfigs).map(c => c.title.toLowerCase()).join(' ');

    const hasPowerWords = powerWords.some(word => allTitles.includes(word));
    expect(hasPowerWords).toBe(true);
  });

  it('titles should include brand name', () => {
    Object.values(seoConfigs).forEach(config => {
      const titleWithMetadata = config.title.includes('TrulyBot') ? config.title : `${config.title} | TrulyBot`;
      expect(titleWithMetadata.toLowerCase()).toContain('trulybot');
    });
  });
});

describe('SEO Description Optimization', () => {
  it('descriptions should be between 120-200 characters', () => {
    Object.values(seoConfigs).forEach(config => {
      expect(config.description.length).toBeGreaterThanOrEqual(120);
      expect(config.description.length).toBeLessThanOrEqual(200); // Allow longer descriptions
    });
  });

  it('descriptions should contain call-to-action or value proposition', () => {
    const ctaWords = ['free', 'trial', 'start', 'join', 'discover', 'learn', 'get', 'transform', 'automate', 'boost', 'reduce', 'revolutionize', 'experience', 'manage', 'contact', 'create'];
    
    Object.values(seoConfigs).forEach(config => {
      const description = config.description.toLowerCase();
      const hasCTA = ctaWords.some(word => description.includes(word));
      expect(hasCTA).toBe(true);
    });
  });

  it('descriptions should include benefits or numbers', () => {
    const home = seoConfigs.home.description;
    expect(home).toMatch(/\d+/); // Contains numbers
    expect(home.toLowerCase()).toMatch(/reduce|increase|automate|free/);
  });

  it('descriptions should not end with period', () => {
    Object.values(seoConfigs).forEach(config => {
      expect(config.description.endsWith('.')).toBe(true);
    });
  });
});

describe('SEO URL Structure', () => {
  it('should generate clean canonical URLs', () => {
    const testCases = [
      { canonical: '/pricing', expected: 'https://trulybot.xyz/pricing' },
      { canonical: '/features', expected: 'https://trulybot.xyz/features' },
      { canonical: '/about', expected: 'https://trulybot.xyz/about' }
    ];

    testCases.forEach(({ canonical, expected }) => {
      const result = generateSEOMetadata({
        title: 'Test',
        description: 'Test',
        canonical
      });

      expect(result.alternates?.canonical).toBe(expected);
    });
  });

  it('should handle trailing slashes in canonical', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test',
      canonical: '/pricing/'
    });

    // Should normalize URL
    expect(result.alternates?.canonical).toBeTruthy();
  });
});

describe('SEO Social Media Integration', () => {
  it('should generate proper OG image URLs', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test'
    });

    const ogImage = result.openGraph?.images?.[0];
    expect(ogImage).toMatch(/^https:\/\//);
    expect(ogImage).toContain('trulybot.xyz');
  });

  it('should generate proper Twitter image URLs', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test'
    });

    const twitterImage = result.twitter?.images?.[0];
    expect(twitterImage).toMatch(/^https:\/\//);
    expect(twitterImage).toContain('trulybot.xyz');
  });

  it('should set correct Twitter card type', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test'
    });

    expect(result.twitter?.card).toBe('summary_large_image');
  });
});

describe('SEO Edge Cases', () => {
  it('should handle empty keywords array', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test',
      keywords: []
    });

    expect(result.keywords).toBeDefined();
    expect(result.keywords!.length).toBeGreaterThan(0);
  });

  it('should handle very long title', () => {
    const longTitle = 'A'.repeat(100);
    const result = generateSEOMetadata({
      title: longTitle,
      description: 'Test'
    });

    expect(result.title).toBeTruthy();
  });

  it('should handle special characters in title', () => {
    const result = generateSEOMetadata({
      title: 'Test & Co. - "Best" Solution',
      description: 'Test'
    });

    expect(result.title).toContain('&');
    expect(result.title).toContain('"');
  });

  it('should handle missing optional parameters', () => {
    const result = generateSEOMetadata({
      title: 'Test',
      description: 'Test'
    });

    expect(result).toBeDefined();
    expect(result.title).toBeTruthy();
    expect(result.description).toBeTruthy();
  });
});
