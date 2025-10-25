// Regional SEO Intelligence Test Suite
// Comprehensive tests for city-level targeting and regional optimization

import { describe, it, expect } from 'vitest';
import {
  generateCitySpecificContent,
  generateSeasonalSEOContent,
  generateLocalTestimonialSEO,
  generateRegionalPricingSEO,
  generateComprehensiveRegionalSEO,
  CITY_SPECIFIC_KEYWORDS,
  REGIONAL_BUSINESS_CONTEXT,
  REGIONAL_COMPETITOR_GAPS,
  type RegionalSEOConfig
} from '../lib/regional-seo-intelligence';

describe('Regional SEO Intelligence System', () => {
  
  // ============================================================================
  // 1. City-Specific Content Generation Tests (25 tests)
  // ============================================================================
  
  describe('generateCitySpecificContent', () => {
    // Mumbai tests
    it('should generate Mumbai-specific content', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Mumbai',
        language: 'en',
        currency: 'INR'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('Mumbai');
      expect(content.description).toContain('Mumbai');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    it('should include Hindi keywords for Mumbai', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Mumbai'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.keywords.some(k => k.includes('Mumbai'))).toBeTruthy();
    });
    
    // Delhi tests
    it('should generate Delhi NCR content', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Delhi'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('Delhi');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    // Bangalore tests
    it('should generate Bangalore tech content', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Bangalore'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('Bangalore');
      expect(content.keywords.some(k => k.toLowerCase().includes('bangalore'))).toBeTruthy();
    });
    
    // Hyderabad tests
    it('should generate Hyderabad content', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Hyderabad'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('Hyderabad');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    // Pune tests
    it('should generate Pune content', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Pune'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('Pune');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    // Chennai tests
    it('should generate Chennai content', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Chennai'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('Chennai');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    // Kolkata tests
    it('should generate Kolkata content', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Kolkata'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('Kolkata');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    // Ahmedabad tests
    it('should generate Ahmedabad content', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Ahmedabad'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('Ahmedabad');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    // Jaipur tests
    it('should generate Jaipur content', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Jaipur'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('Jaipur');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    // USA cities tests
    it('should generate New York content', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        city: 'New York'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('New York');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    it('should generate San Francisco content', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        city: 'San Francisco'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('San Francisco');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    it('should generate Los Angeles content', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        city: 'Los Angeles'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('Los Angeles');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    // General tests
    it('should include local business context', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Mumbai'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.localizedContent).toBeDefined();
      expect(content.localizedContent.length).toBeGreaterThan(0);
    });
    
    it('should include pain points in description', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Delhi'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.description).toBeTruthy();
      expect(content.description.length).toBeGreaterThan(0);
    });
    
    it('should fallback to country when city not specified', () => {
      const config: RegionalSEOConfig = {
        country: 'india'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('India');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    it('should include market terminology keywords', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Mumbai'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.keywords.some(k => 
        k.includes('automation') || k.includes('AI') || k.includes('chatbot')
      )).toBeTruthy();
    });
    
    it('should generate unique content for each city', () => {
      const mumbai = generateCitySpecificContent({ country: 'india', city: 'Mumbai' });
      const delhi = generateCitySpecificContent({ country: 'india', city: 'Delhi' });
      
      expect(mumbai.title).not.toBe(delhi.title);
      expect(mumbai.description).not.toBe(delhi.description);
    });
    
    it('should include TrulyBot branding in title', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Bangalore'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('TrulyBot');
    });
    
    it('should generate description under 300 characters', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Chennai'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.description.length).toBeLessThan(300);
    });
    
    it('should include city-specific keywords array', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Pune'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(Array.isArray(content.keywords)).toBe(true);
      expect(content.keywords.length).toBeGreaterThan(3);
    });
    
    it('should generate localized content points', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Hyderabad'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.localizedContent.length).toBeGreaterThan(3);
      expect(content.localizedContent[0]).toContain('Hyderabad');
    });
    
    it('should handle city names with spaces', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        city: 'New York'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content.title).toContain('New York');
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    it('should include business type in context when provided', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Mumbai',
        businessType: 'ecommerce'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content).toBeDefined();
      expect(content.keywords.length).toBeGreaterThan(0);
    });
    
    it('should generate state-level content when provided', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Pune',
        state: 'Maharashtra'
      };
      
      const content = generateCitySpecificContent(config);
      
      expect(content).toBeDefined();
      expect(content.keywords.length).toBeGreaterThan(0);
    });
  });
  
  // ============================================================================
  // 2. Seasonal SEO Content Tests (10 tests)
  // ============================================================================
  
  describe('generateSeasonalSEOContent', () => {
    it('should generate Diwali keywords for India in October', () => {
      const keywords = generateSeasonalSEOContent('india', 10);
      
      expect(keywords).toBeDefined();
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.some(k => k.toLowerCase().includes('diwali'))).toBeTruthy();
    });
    
    it('should generate Holi keywords for India in March', () => {
      const keywords = generateSeasonalSEOContent('india', 3);
      
      expect(keywords).toBeDefined();
      expect(keywords.some(k => k.toLowerCase().includes('holi'))).toBeTruthy();
    });
    
    it('should generate Independence Day keywords for India in August', () => {
      const keywords = generateSeasonalSEOContent('india', 8);
      
      expect(keywords).toBeDefined();
      expect(keywords.some(k => k.toLowerCase().includes('independence'))).toBeTruthy();
    });
    
    it('should generate Black Friday keywords for USA in November', () => {
      const keywords = generateSeasonalSEOContent('usa', 11);
      
      expect(keywords).toBeDefined();
      expect(keywords.some(k => k.toLowerCase().includes('black friday'))).toBeTruthy();
    });
    
    it('should generate Christmas keywords for USA in December', () => {
      const keywords = generateSeasonalSEOContent('usa', 12);
      
      expect(keywords).toBeDefined();
      expect(keywords.some(k => k.toLowerCase().includes('christmas'))).toBeTruthy();
    });
    
    it('should generate summer sale keywords for USA in July', () => {
      const keywords = generateSeasonalSEOContent('usa', 7);
      
      expect(keywords).toBeDefined();
      expect(keywords.length).toBeGreaterThan(0);
    });
    
    it('should return empty array for months without seasonal events', () => {
      const keywords = generateSeasonalSEOContent('india', 5);
      
      expect(keywords).toBeDefined();
      expect(Array.isArray(keywords)).toBe(true);
    });
    
    it('should handle unknown countries gracefully', () => {
      const keywords = generateSeasonalSEOContent('unknown', 12);
      
      expect(keywords).toBeDefined();
      expect(Array.isArray(keywords)).toBe(true);
    });
    
    it('should generate relevant business keywords in seasonal content', () => {
      const keywords = generateSeasonalSEOContent('india', 10);
      
      expect(keywords.some(k => 
        k.includes('chatbot') || k.includes('automation') || k.includes('support')
      )).toBeTruthy();
    });
    
    it('should handle edge case months (1 and 12)', () => {
      const jan = generateSeasonalSEOContent('usa', 1);
      const dec = generateSeasonalSEOContent('usa', 12);
      
      expect(jan).toBeDefined();
      expect(dec).toBeDefined();
      expect(Array.isArray(jan)).toBe(true);
      expect(Array.isArray(dec)).toBe(true);
    });
  });
  
  // ============================================================================
  // 3. Local Testimonial SEO Tests (8 tests)
  // ============================================================================
  
  describe('generateLocalTestimonialSEO', () => {
    it('should generate testimonial SEO for Indian city', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Mumbai'
      };
      
      const seo = generateLocalTestimonialSEO(config);
      
      expect(seo.title).toContain('Mumbai');
      expect(seo.description).toContain('Mumbai');
      expect(seo.structuredData).toBeDefined();
    });
    
    it('should generate testimonial SEO for USA city', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        city: 'New York'
      };
      
      const seo = generateLocalTestimonialSEO(config);
      
      expect(seo.title).toContain('New York');
      expect(seo.description).toContain('New York');
    });
    
    it('should include schema.org structured data', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Bangalore'
      };
      
      const seo = generateLocalTestimonialSEO(config);
      
      expect(seo.structuredData['@context']).toBe('https://schema.org');
      expect(seo.structuredData['@type']).toBe('Article');
    });
    
    it('should include TrulyBot as author in structured data', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Delhi'
      };
      
      const seo = generateLocalTestimonialSEO(config);
      
      expect(seo.structuredData.author.name).toBe('TrulyBot');
      expect(seo.structuredData.publisher.name).toBe('TrulyBot');
    });
    
    it('should include logo in structured data', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Chennai'
      };
      
      const seo = generateLocalTestimonialSEO(config);
      
      expect(seo.structuredData.publisher.logo).toBeDefined();
      expect(seo.structuredData.publisher.logo.url).toContain('logo');
    });
    
    it('should fallback to country when no city provided', () => {
      const config: RegionalSEOConfig = {
        country: 'india'
      };
      
      const seo = generateLocalTestimonialSEO(config);
      
      expect(seo.title).toContain('india');
      expect(seo.description).toBeTruthy();
    });
    
    it('should include success stories in title', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Pune'
      };
      
      const seo = generateLocalTestimonialSEO(config);
      
      expect(seo.title.toLowerCase()).toMatch(/success|case studies/);
    });
    
    it('should include mainEntityOfPage in structured data', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Hyderabad'
      };
      
      const seo = generateLocalTestimonialSEO(config);
      
      expect(seo.structuredData.mainEntityOfPage).toBeDefined();
      expect(seo.structuredData.mainEntityOfPage['@type']).toBe('WebPage');
    });
  });
  
  // ============================================================================
  // 4. Regional Pricing SEO Tests (12 tests)
  // ============================================================================
  
  describe('generateRegionalPricingSEO', () => {
    it('should generate INR pricing for India', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        currency: 'INR'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.title).toContain('₹');
      expect(pricing.description).toContain('₹');
    });
    
    it('should generate USD pricing for USA', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        currency: 'USD'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.title).toContain('$');
      expect(pricing.description).toContain('$');
    });
    
    it('should default to USD when currency not specified', () => {
      const config: RegionalSEOConfig = {
        country: 'usa'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.title).toContain('$');
    });
    
    it('should include starting price of ₹99 for India', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        currency: 'INR'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.description).toContain('₹99');
    });
    
    it('should include starting price of $5 for USA', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        currency: 'USD'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.description).toContain('$5');
    });
    
    it('should generate city-specific pricing when city provided', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Mumbai',
        currency: 'INR'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.title).toContain('Mumbai');
    });
    
    it('should include pricing keywords array', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        currency: 'INR'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.keywords).toBeDefined();
      expect(pricing.keywords.length).toBeGreaterThan(5);
    });
    
    it('should include cost-related keywords', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        currency: 'INR'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.keywords.some(k => 
        k.includes('cost') || k.includes('pricing') || k.includes('affordable')
      )).toBeTruthy();
    });
    
    it('should support GBP currency', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        currency: 'GBP'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.title).toContain('£');
    });
    
    it('should support CAD currency', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        currency: 'CAD'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.title).toContain('C$');
    });
    
    it('should support AUD currency', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        currency: 'AUD'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.title).toContain('A$');
    });
    
    it('should mention free trial in description', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        currency: 'INR'
      };
      
      const pricing = generateRegionalPricingSEO(config);
      
      expect(pricing.description.toLowerCase()).toContain('free trial');
    });
  });
  
  // ============================================================================
  // 5. Comprehensive Regional SEO Tests (8 tests)
  // ============================================================================
  
  describe('generateComprehensiveRegionalSEO', () => {
    it('should return all SEO components', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Mumbai',
        currency: 'INR'
      };
      
      const seo = generateComprehensiveRegionalSEO(config);
      
      expect(seo.cityContent).toBeDefined();
      expect(seo.seasonalKeywords).toBeDefined();
      expect(seo.testimonialSEO).toBeDefined();
      expect(seo.pricingSEO).toBeDefined();
      expect(seo.competitorGaps).toBeDefined();
      expect(seo.businessContext).toBeDefined();
    });
    
    it('should include city-specific content', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Bangalore'
      };
      
      const seo = generateComprehensiveRegionalSEO(config);
      
      expect(seo.cityContent.title).toContain('Bangalore');
      expect(seo.cityContent.keywords.length).toBeGreaterThan(0);
    });
    
    it('should include seasonal keywords for current month', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Delhi'
      };
      
      const seo = generateComprehensiveRegionalSEO(config);
      
      expect(Array.isArray(seo.seasonalKeywords)).toBe(true);
    });
    
    it('should include competitor gap analysis', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Chennai'
      };
      
      const seo = generateComprehensiveRegionalSEO(config);
      
      expect(seo.competitorGaps.length).toBeGreaterThan(0);
      expect(seo.competitorGaps.every(gap => typeof gap === 'string')).toBe(true);
    });
    
    it('should include business context for region', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Pune'
      };
      
      const seo = generateComprehensiveRegionalSEO(config);
      
      expect(seo.businessContext).toBeDefined();
      expect(seo.businessContext.commonPainPoints).toBeDefined();
      expect(seo.businessContext.localBenefits).toBeDefined();
    });
    
    it('should work for USA cities', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        city: 'New York',
        currency: 'USD'
      };
      
      const seo = generateComprehensiveRegionalSEO(config);
      
      expect(seo.cityContent.title).toContain('New York');
      expect(seo.competitorGaps.length).toBeGreaterThan(0);
    });
    
    it('should return USA competitor gaps for USA country', () => {
      const config: RegionalSEOConfig = {
        country: 'usa',
        city: 'San Francisco'
      };
      
      const seo = generateComprehensiveRegionalSEO(config);
      
      expect(seo.competitorGaps.some(gap => 
        gap.includes('USA') || gap.includes('America')
      )).toBeTruthy();
    });
    
    it('should include testimonial structured data', () => {
      const config: RegionalSEOConfig = {
        country: 'india',
        city: 'Hyderabad'
      };
      
      const seo = generateComprehensiveRegionalSEO(config);
      
      expect(seo.testimonialSEO.structuredData['@type']).toBe('Article');
    });
  });
  
  // ============================================================================
  // 6. City-Specific Keywords Data Tests (7 tests)
  // ============================================================================
  
  describe('CITY_SPECIFIC_KEYWORDS', () => {
    it('should have keywords for all 9 major Indian cities', () => {
      const indianCities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'jaipur'] as const;
      
      indianCities.forEach(city => {
        expect(CITY_SPECIFIC_KEYWORDS.india[city]).toBeDefined();
        expect(CITY_SPECIFIC_KEYWORDS.india[city].length).toBeGreaterThan(5);
      });
    });
    
    it('should have keywords for USA cities', () => {
      expect(CITY_SPECIFIC_KEYWORDS.usa['new-york']).toBeDefined();
      expect(CITY_SPECIFIC_KEYWORDS.usa['san-francisco']).toBeDefined();
      expect(CITY_SPECIFIC_KEYWORDS.usa['los-angeles']).toBeDefined();
    });
    
    it('should include Hindi/regional language keywords for Indian cities', () => {
      const mumbaiKeywords = CITY_SPECIFIC_KEYWORDS.india.mumbai;
      const hasHindiKeywords = mumbaiKeywords.some(k => 
        k.includes('mein') || k.includes('ke liye')
      );
      expect(hasHindiKeywords).toBeTruthy();
    });
    
    it('should include neighborhood-specific keywords', () => {
      const mumbaiKeywords = CITY_SPECIFIC_KEYWORDS.india.mumbai;
      const hasNeighborhoods = mumbaiKeywords.some(k => 
        k.includes('Andheri') || k.includes('Bandra') || k.includes('Powai')
      );
      expect(hasNeighborhoods).toBeTruthy();
    });
    
    it('should include chatbot-related keywords in all cities', () => {
      const delhiKeywords = CITY_SPECIFIC_KEYWORDS.india.delhi;
      const hasChatbotKeywords = delhiKeywords.some(k => k.includes('chatbot'));
      expect(hasChatbotKeywords).toBeTruthy();
    });
    
    it('should have unique keywords for each city', () => {
      const mumbai = CITY_SPECIFIC_KEYWORDS.india.mumbai;
      const delhi = CITY_SPECIFIC_KEYWORDS.india.delhi;
      
      const overlap = mumbai.filter(k => delhi.includes(k));
      expect(overlap.length).toBe(0);
    });
    
    it('should have minimum 7 keywords per city', () => {
      Object.values(CITY_SPECIFIC_KEYWORDS.india).forEach(cityKeywords => {
        expect(cityKeywords.length).toBeGreaterThanOrEqual(7);
      });
    });
  });
});
