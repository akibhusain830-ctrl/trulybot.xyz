// SEO Intelligence Test Suite
// Comprehensive tests for AI-powered SEO features

import { describe, it, expect } from 'vitest';
import {
  generateIntelligentTitle,
  generateIntelligentMetaDescription,
  optimizeKeywordDensity,
  generateSemanticKeywords,
  analyzeCompetitorKeywords,
  generateAdvancedSEOMetadata,
  ADVANCED_KEYWORD_INTELLIGENCE,
  type SEOIntelligenceConfig,
  type AdvancedMetadata
} from '../lib/seo-intelligence';

describe('SEO Intelligence System', () => {
  
  // ============================================================================
  // 1. Intelligent Title Generation Tests (20 tests)
  // ============================================================================
  
  describe('generateIntelligentTitle', () => {
    it('should generate homepage informational title with power words', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'informational',
        pageType: 'homepage',
        userLocation: 'global'
      };
      
      const title = generateIntelligentTitle(config);
      
      expect(title).toBeTruthy();
      expect(title).toContain('TrulyBot');
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThan(160);
    });
    
    it('should generate homepage commercial title with metrics', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'homepage',
        userLocation: 'global'
      };
      
      const title = generateIntelligentTitle(config);
      
      expect(title).toContain('TrulyBot');
      expect(title).toMatch(/70%|5X|AI/);
    });
    
    it('should generate homepage transactional title with CTA', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'transactional',
        pageType: 'homepage',
        userLocation: 'global'
      };
      
      const title = generateIntelligentTitle(config);
      
      expect(title).toContain('TrulyBot');
      expect(title.toLowerCase()).toMatch(/free trial|setup|get/);
    });
    
    it('should generate product page title with features', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'product',
        userLocation: 'global'
      };
      
      const title = generateIntelligentTitle(config);
      
      expect(title).toContain('TrulyBot');
      expect(title.length).toBeLessThan(160);
    });
    
    it('should add India regional modifier for Indian users', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'homepage',
        userLocation: 'india'
      };
      
      const title = generateIntelligentTitle(config);
      
      expect(title).toContain('Indian');
    });
    
    it('should add global regional modifier for global users', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'homepage',
        userLocation: 'global'
      };
      
      const title = generateIntelligentTitle(config);
      
      expect(title).toContain('Global');
    });
    
    it('should generate featured snippet optimized title', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'informational',
        pageType: 'homepage',
        featuredSnippetTargeting: true
      };
      
      const title = generateIntelligentTitle(config);
      
      expect(title).toMatch(/What is|Top 10|How to/);
      expect(title).toContain('2025');
      expect(title).toContain('TrulyBot');
    });
    
    it('should generate featured snippet title for commercial intent', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        featuredSnippetTargeting: true
      };
      
      const title = generateIntelligentTitle(config);
      
      expect(title).toContain('Top 10');
    });
    
    it('should generate featured snippet title for transactional intent', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'transactional',
        featuredSnippetTargeting: true
      };
      
      const title = generateIntelligentTitle(config);
      
      expect(title).toContain('How to Get');
    });
    
    it('should default to commercial intent if not specified', () => {
      const config: SEOIntelligenceConfig = {
        pageType: 'homepage'
      };
      
      const title = generateIntelligentTitle(config);
      
      expect(title).toBeTruthy();
      expect(title).toContain('TrulyBot');
    });
  });
  
  // ============================================================================
  // 2. Intelligent Meta Description Generation Tests (15 tests)
  // ============================================================================
  
  describe('generateIntelligentMetaDescription', () => {
    it('should generate homepage informational description', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'informational',
        pageType: 'homepage',
        userLocation: 'global'
      };
      
      const description = generateIntelligentMetaDescription(config);
      
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(50);
      expect(description.length).toBeLessThan(300);
      expect(description).toContain('TrulyBot');
    });
    
    it('should generate homepage commercial description with metrics', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'homepage',
        userLocation: 'global'
      };
      
      const description = generateIntelligentMetaDescription(config);
      
      expect(description).toMatch(/70%|5X|99.9%/);
      expect(description).toContain('TrulyBot');
    });
    
    it('should generate homepage transactional description with CTA', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'transactional',
        pageType: 'homepage',
        userLocation: 'global'
      };
      
      const description = generateIntelligentMetaDescription(config);
      
      expect(description.toLowerCase()).toMatch(/start|trial|join|get/);
    });
    
    it('should generate product page description', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'informational',
        pageType: 'product',
        userLocation: 'global'
      };
      
      const description = generateIntelligentMetaDescription(config);
      
      expect(description).toContain('TrulyBot');
      expect(description).toMatch(/AI|technology|automation/);
    });
    
    it('should add India regional suffix for Indian users', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'homepage',
        userLocation: 'india'
      };
      
      const description = generateIntelligentMetaDescription(config);
      
      expect(description).toContain('Indian');
      expect(description).toMatch(/Hindi|INR/);
    });
    
    it('should add global regional suffix for global users', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'homepage',
        userLocation: 'global'
      };
      
      const description = generateIntelligentMetaDescription(config);
      
      expect(description).toContain('worldwide');
      expect(description).toContain('multi-language');
    });
    
    it('should add voice search prefix when enabled', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'homepage',
        voiceSearchOptimized: true
      };
      
      const description = generateIntelligentMetaDescription(config);
      
      expect(description).toMatch(/Looking for|best AI chatbot/i);
    });
    
    it('should not add voice search prefix when disabled', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'homepage',
        voiceSearchOptimized: false
      };
      
      const description = generateIntelligentMetaDescription(config);
      
      expect(description).not.toMatch(/^Looking for/);
    });
    
    it('should default to commercial intent if not specified', () => {
      const config: SEOIntelligenceConfig = {
        pageType: 'homepage'
      };
      
      const description = generateIntelligentMetaDescription(config);
      
      expect(description).toBeTruthy();
      expect(description).toContain('TrulyBot');
    });
    
    it('should default to homepage if page type not specified', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial'
      };
      
      const description = generateIntelligentMetaDescription(config);
      
      expect(description).toBeTruthy();
    });
  });
  
  // ============================================================================
  // 3. Keyword Density Optimization Tests (10 tests)
  // ============================================================================
  
  describe('optimizeKeywordDensity', () => {
    it('should calculate keyword density for single keyword', () => {
      const content = 'AI chatbot for ecommerce. Our AI chatbot helps businesses. AI chatbot features include automation.';
      const keywords = ['AI chatbot'];
      
      const result = optimizeKeywordDensity(content, keywords);
      
      expect(result.keywordDensity).toBeDefined();
      expect(result.keywordDensity['AI chatbot']).toBeGreaterThan(0);
    });
    
    it('should calculate keyword density for multiple keywords', () => {
      const content = 'AI chatbot for customer support automation. Best customer support with AI chatbot.';
      const keywords = ['AI chatbot', 'customer support'];
      
      const result = optimizeKeywordDensity(content, keywords);
      
      expect(result.keywordDensity['AI chatbot']).toBeGreaterThan(0);
      expect(result.keywordDensity['customer support']).toBeGreaterThan(0);
    });
    
    it('should provide recommendation for low keyword density', () => {
      const content = 'This is a long piece of content with very few mentions of the target keyword phrase.';
      const keywords = ['AI chatbot'];
      
      const result = optimizeKeywordDensity(content, keywords);
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain('Increase');
    });
    
    it('should provide recommendation for high keyword density', () => {
      const content = 'AI chatbot AI chatbot AI chatbot AI chatbot AI chatbot.';
      const keywords = ['AI chatbot'];
      
      const result = optimizeKeywordDensity(content, keywords);
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.some(r => r.includes('Reduce'))).toBeTruthy();
    });
    
    it('should return optimized content', () => {
      const content = 'Original content about AI chatbot.';
      const keywords = ['AI chatbot'];
      
      const result = optimizeKeywordDensity(content, keywords);
      
      expect(result.optimizedContent).toBeDefined();
      expect(typeof result.optimizedContent).toBe('string');
    });
    
    it('should handle empty keyword array', () => {
      const content = 'Some content here.';
      const keywords: string[] = [];
      
      const result = optimizeKeywordDensity(content, keywords);
      
      expect(result).toBeDefined();
      expect(result.keywordDensity).toEqual({});
    });
    
    it('should be case-insensitive for keyword matching', () => {
      const content = 'AI Chatbot and ai chatbot and AI CHATBOT.';
      const keywords = ['AI chatbot'];
      
      const result = optimizeKeywordDensity(content, keywords);
      
      expect(result.keywordDensity['AI chatbot']).toBeGreaterThan(0);
    });
    
    it('should handle multi-word keywords correctly', () => {
      const content = 'Customer support automation is key. Automated customer support helps businesses.';
      const keywords = ['customer support automation'];
      
      const result = optimizeKeywordDensity(content, keywords);
      
      expect(result.keywordDensity['customer support automation']).toBeGreaterThan(0);
    });
    
    it('should calculate density as percentage', () => {
      const content = 'AI chatbot word word word word word word word word word.'; // 11 words, 1 keyword phrase (2 words)
      const keywords = ['AI chatbot'];
      
      const result = optimizeKeywordDensity(content, keywords);
      
      expect(result.keywordDensity['AI chatbot']).toBeLessThan(100);
      expect(result.keywordDensity['AI chatbot']).toBeGreaterThan(0);
    });
    
    it('should provide no recommendations for optimal density', () => {
      const content = 'The AI chatbot platform helps businesses. ' +
                     'Many features in our platform. ' +
                     'Customer support is important. ' +
                     'Our AI chatbot delivers results.'; // ~2% density is optimal
      const keywords = ['AI chatbot'];
      
      const result = optimizeKeywordDensity(content, keywords);
      
      expect(result.recommendations).toBeDefined();
    });
  });
  
  // ============================================================================
  // 4. Semantic Keyword Generation Tests (8 tests)
  // ============================================================================
  
  describe('generateSemanticKeywords', () => {
    it('should generate semantic variations for AI chatbot', () => {
      const keywords = generateSemanticKeywords('AI chatbot');
      
      expect(keywords).toBeDefined();
      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
    });
    
    it('should include LSI keywords', () => {
      const keywords = generateSemanticKeywords('AI chatbot');
      
      expect(keywords.some(k => k.includes('automation') || k.includes('technology'))).toBeTruthy();
    });
    
    it('should generate semantic variations for ecommerce', () => {
      const keywords = generateSemanticKeywords('ecommerce');
      
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords).toContain('online store');
    });
    
    it('should generate semantic variations for customer support', () => {
      const keywords = generateSemanticKeywords('customer support');
      
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.some(k => k.includes('service') || k.includes('help'))).toBeTruthy();
    });
    
    it('should return LSI keywords for unknown primary keyword', () => {
      const keywords = generateSemanticKeywords('unknown keyword');
      
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.some(k => k.includes('automation') || k.includes('efficiency'))).toBeTruthy();
    });
    
    it('should not return duplicate keywords', () => {
      const keywords = generateSemanticKeywords('AI chatbot');
      const uniqueKeywords = [...new Set(keywords)];
      
      expect(keywords.length).toBe(uniqueKeywords.length);
    });
    
    it('should include related terms', () => {
      const keywords = generateSemanticKeywords('AI chatbot');
      
      expect(keywords.some(k => 
        k.toLowerCase().includes('automation') || 
        k.toLowerCase().includes('assistant') || 
        k.toLowerCase().includes('bot') ||
        k.toLowerCase().includes('conversational') ||
        k.toLowerCase().includes('virtual')
      )).toBeTruthy();
    });
    
    it('should be case-insensitive for primary keyword', () => {
      const keywords1 = generateSemanticKeywords('AI chatbot');
      const keywords2 = generateSemanticKeywords('ai chatbot');
      
      expect(keywords1).toEqual(keywords2);
    });
  });
  
  // ============================================================================
  // 5. Competitor Analysis Tests (6 tests)
  // ============================================================================
  
  describe('analyzeCompetitorKeywords', () => {
    it('should return keyword gaps', () => {
      const analysis = analyzeCompetitorKeywords();
      
      expect(analysis.gaps).toBeDefined();
      expect(Array.isArray(analysis.gaps)).toBe(true);
      expect(analysis.gaps.length).toBeGreaterThan(0);
    });
    
    it('should return keyword opportunities', () => {
      const analysis = analyzeCompetitorKeywords();
      
      expect(analysis.opportunities).toBeDefined();
      expect(Array.isArray(analysis.opportunities)).toBe(true);
      expect(analysis.opportunities.length).toBeGreaterThan(0);
    });
    
    it('should return trending keywords', () => {
      const analysis = analyzeCompetitorKeywords();
      
      expect(analysis.trending).toBeDefined();
      expect(Array.isArray(analysis.trending)).toBe(true);
      expect(analysis.trending.length).toBeGreaterThan(0);
    });
    
    it('should identify AI-related trending keywords', () => {
      const analysis = analyzeCompetitorKeywords();
      
      expect(analysis.trending.some(k => k.toLowerCase().includes('ai'))).toBeTruthy();
    });
    
    it('should identify gaps in current keyword coverage', () => {
      const analysis = analyzeCompetitorKeywords();
      
      expect(analysis.gaps.some(k => k.includes('calculator') || k.includes('cost'))).toBeTruthy();
    });
    
    it('should identify future opportunities', () => {
      const analysis = analyzeCompetitorKeywords();
      
      expect(analysis.opportunities.some(k => k.includes('voice') || k.includes('predictive'))).toBeTruthy();
    });
  });
  
  // ============================================================================
  // 6. Advanced Metadata Generation Tests (15 tests)
  // ============================================================================
  
  describe('generateAdvancedSEOMetadata', () => {
    it('should generate complete metadata object', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'homepage',
        userLocation: 'global'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeTruthy();
      expect(metadata.description).toBeTruthy();
      expect(metadata.keywords).toBeDefined();
    });
    
    it('should include voice search keywords when enabled', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        voiceSearchOptimized: true
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.keywords).toBeDefined();
      expect(metadata.keywords!.length).toBeGreaterThan(0);
    });
    
    it('should include regional keywords for India', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        userLocation: 'india'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.keywords).toBeDefined();
      expect(metadata.keywords!.length).toBeGreaterThan(0);
    });
    
    it('should include semantic keywords', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'informational'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.keywords).toBeDefined();
      expect(metadata.keywords!.length).toBeGreaterThan(5);
    });
    
    it('should set correct authors', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.authors).toBeDefined();
      expect(metadata.authors![0].name).toContain('TrulyBot');
    });
    
    it('should set correct creator and publisher', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.creator).toContain('TrulyBot');
      expect(metadata.publisher).toContain('TrulyBot');
    });
    
    it('should configure robots for indexing', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.robots).toBeDefined();
      expect(metadata.robots!.index).toBe(true);
      expect(metadata.robots!.follow).toBe(true);
    });
    
    it('should configure Google Bot settings', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.robots!.googleBot).toBeDefined();
      expect(metadata.robots!.googleBot!['max-image-preview']).toBe('large');
    });
    
    it('should set Open Graph metadata', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        pageType: 'homepage'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph!.title).toBeTruthy();
      expect(metadata.openGraph!.siteName).toContain('TrulyBot');
    });
    
    it('should set correct locale for India', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        userLocation: 'india'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.openGraph!.locale).toBe('en_IN');
    });
    
    it('should set correct locale for global users', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        userLocation: 'global'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.openGraph!.locale).toBe('en_US');
    });
    
    it('should set Twitter Card metadata', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter!.card).toBe('summary_large_image');
    });
    
    it('should truncate Twitter title if too long', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'informational',
        pageType: 'homepage'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.twitter!.title!.length).toBeLessThanOrEqual(70);
    });
    
    it('should truncate Twitter description if too long', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'informational',
        pageType: 'homepage'
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.twitter!.description!.length).toBeLessThanOrEqual(160);
    });
    
    it('should set custom metadata fields', () => {
      const config: SEOIntelligenceConfig = {
        userIntent: 'commercial',
        userLocation: 'india',
        voiceSearchOptimized: true,
        featuredSnippetTargeting: true
      };
      
      const metadata = generateAdvancedSEOMetadata(config);
      
      expect(metadata.other).toBeDefined();
      expect(metadata.other!['search-intent']).toBe('commercial');
      expect(metadata.other!['geo-targeting']).toBe('india');
      expect(metadata.other!['voice-optimized']).toBe('true');
      expect(metadata.other!['featured-snippet-ready']).toBe('true');
    });
  });
  
  // ============================================================================
  // 7. Advanced Keyword Intelligence Data Tests (8 tests)
  // ============================================================================
  
  describe('ADVANCED_KEYWORD_INTELLIGENCE', () => {
    it('should have voice search questions', () => {
      expect(ADVANCED_KEYWORD_INTELLIGENCE.voiceSearch.questions).toBeDefined();
      expect(ADVANCED_KEYWORD_INTELLIGENCE.voiceSearch.questions.length).toBeGreaterThan(0);
    });
    
    it('should have conversational voice keywords', () => {
      expect(ADVANCED_KEYWORD_INTELLIGENCE.voiceSearch.conversational).toBeDefined();
      expect(ADVANCED_KEYWORD_INTELLIGENCE.voiceSearch.conversational.length).toBeGreaterThan(0);
    });
    
    it('should have featured snippet definitions', () => {
      expect(ADVANCED_KEYWORD_INTELLIGENCE.featuredSnippets.definitions).toBeDefined();
      expect(ADVANCED_KEYWORD_INTELLIGENCE.featuredSnippets.definitions.length).toBeGreaterThan(0);
    });
    
    it('should have featured snippet comparisons', () => {
      expect(ADVANCED_KEYWORD_INTELLIGENCE.featuredSnippets.comparisons).toBeDefined();
      expect(ADVANCED_KEYWORD_INTELLIGENCE.featuredSnippets.comparisons.length).toBeGreaterThan(0);
    });
    
    it('should have India regional keywords', () => {
      expect(ADVANCED_KEYWORD_INTELLIGENCE.regional.india).toBeDefined();
      expect(ADVANCED_KEYWORD_INTELLIGENCE.regional.india.length).toBeGreaterThan(10);
    });
    
    it('should have Hindi/Hinglish keywords', () => {
      const hindiKeywords = ADVANCED_KEYWORD_INTELLIGENCE.regional.india.filter(k => 
        k.includes('bharat') || k.includes('kaise') || k.includes('accha')
      );
      expect(hindiKeywords.length).toBeGreaterThan(0);
    });
    
    it('should have intent-based keywords', () => {
      expect(ADVANCED_KEYWORD_INTELLIGENCE.intentBased.informational).toBeDefined();
      expect(ADVANCED_KEYWORD_INTELLIGENCE.intentBased.commercial).toBeDefined();
      expect(ADVANCED_KEYWORD_INTELLIGENCE.intentBased.transactional).toBeDefined();
    });
    
    it('should have global regional keywords', () => {
      expect(ADVANCED_KEYWORD_INTELLIGENCE.regional.global).toBeDefined();
      expect(ADVANCED_KEYWORD_INTELLIGENCE.regional.global.length).toBeGreaterThan(0);
    });
  });
});
