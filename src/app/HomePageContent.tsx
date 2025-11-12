'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import SkeletonSection from '@/components/SkeletonSection';

// --- Core Components (Load Immediately) ---
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SignInPromptModal from '@/components/SignInPromptModal';
import ChatWidgetLauncher from '@/components/ChatWidgetLauncher';

// --- Lazy-Loaded Components (Load as needed) ---
// These components will only be loaded by the browser when they are needed,
// making the initial page load much faster.
const FeaturesSection = dynamic(
  () => import('@/components/FeaturesSection'),
  {
    loading: () => <SkeletonSection height={540} ariaLabel="Loading features" />,
    ssr: false
  }
);
const DemoSection = dynamic(
  () => import('@/components/DemoSection'),
  {
    loading: () => <SkeletonSection height={480} ariaLabel="Loading demo" />,
    ssr: false
  }
);
const PricingSection = dynamic(
  () => import('@/components/PricingSection'),
  {
    loading: () => <SkeletonSection height={820} ariaLabel="Loading pricing" />,
    ssr: false
  }
);
const Footer = dynamic(
  () => import('@/components/Footer'),
  {
    loading: () => <SkeletonSection height={380} ariaLabel="Loading footer" />,
    ssr: false
  }
);

function buildAdvancedJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://trulybot.xyz/#organization',
        name: 'TrulyBot',
        url: 'https://trulybot.xyz',
        logo: 'https://trulybot.xyz/logo-trulybot.svg',
        description: 'Leading AI chatbot platform for e-commerce customer support and lead generation',
        foundingDate: '2024',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'support@trulybot.xyz'
        },
        sameAs: [
          'https://twitter.com/trulybot',
          'https://linkedin.com/company/trulybot'
        ]
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://trulybot.xyz/#software',
        name: 'TrulyBot AI Chatbot',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Customer Support Software',
        operatingSystem: ['Web Browser', 'Any'],
        url: 'https://trulybot.xyz',
        description: 'Transform your e-commerce customer support with TrulyBot\'s AI chatbot. Get 70% fewer tickets, 5X more leads, and 24/7 automated support.',
        author: {
          '@id': 'https://trulybot.xyz/#organization'
        },
        offers: [
          {
            '@type': 'Offer',
            name: 'Basic Plan',
            price: '499',
            priceCurrency: 'INR',
            billingIncrement: 'monthly',
            description: 'Core AI chatbot with 1,000 replies per month',
            availability: 'https://schema.org/InStock',
            url: 'https://trulybot.xyz/pricing'
          },
          {
            '@type': 'Offer', 
            name: 'Pro Plan',
            price: '1499',
            priceCurrency: 'INR',
            billingIncrement: 'monthly',
            description: 'Advanced chatbot with lead capture and analytics',
            availability: 'https://schema.org/InStock',
            url: 'https://trulybot.xyz/pricing'
          },
          {
            '@type': 'Offer',
            name: 'Enterprise Plan', 
            price: '2999',
            priceCurrency: 'INR',
            billingIncrement: 'monthly',
            description: 'Enterprise-grade AI with advanced features and customization',
            availability: 'https://schema.org/InStock',
            url: 'https://trulybot.xyz/pricing'
          }
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '247',
          bestRating: '5'
        },
        featureList: [
          '24/7 Automated Customer Support',
          'Lead Generation & Capture', 
          'E-commerce Integration',
          'Multi-language Support',
          'Analytics & Reporting',
          '70% Ticket Reduction',
          '5-minute Setup'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://trulybot.xyz/#website',
        url: 'https://trulybot.xyz',
        name: 'TrulyBot - AI Chatbot for E-Commerce',
        publisher: {
          '@id': 'https://trulybot.xyz/#organization'
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://trulybot.xyz/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Service',
        '@id': 'https://trulybot.xyz/#service',
        name: 'AI Chatbot for E-Commerce Businesses',
        provider: {
          '@id': 'https://trulybot.xyz/#organization'
        },
        serviceType: 'Customer Support Automation',
        description: 'Complete AI-powered customer support and lead generation solution for e-commerce businesses',
        areaServed: {
          '@type': 'Country',
          name: 'Global'
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'TrulyBot Service Plans',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Basic Plan',
                description: 'Core AI chatbot with 1,000 replies per month'
              }
            },
            {
              '@type': 'Offer', 
              itemOffered: {
                '@type': 'Service',
                name: 'Pro Plan',
                description: 'Advanced chatbot with unlimited replies and lead capture'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service', 
                name: 'Enterprise Plan',
                description: 'Enterprise-grade solution with full customization'
              }
            }
          ]
        }
      }
    ]
  };
}

export default function HomePageContent() {
  const { user, loading, signOut } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);

  // Handle authentication success from OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    
    if (authSuccess === 'success') {
      // Clear the auth parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('auth');
      window.history.replaceState({}, '', newUrl.toString());
      
      console.log('OAuth callback success detected, user state:', { user: !!user, loading });
      
      // If we have a successful auth callback but no user yet, wait for the auth state to update
      if (!user && !loading) {
        console.log('Waiting for authentication state to update after OAuth callback...');
        // Give extra time for the session to be established
        const checkAuth = () => {
          // Force AuthContext to refresh
          const event = new CustomEvent('auth-state-refresh');
          window.dispatchEvent(event);
        };
        setTimeout(checkAuth, 300);
      }
    }
  }, [user, loading]);

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildAdvancedJsonLd())
        }}
      />
      
      {/* Navigation */}
      <Header user={user} loading={loading} signOut={signOut} />
      
      {/* Hero Section */}
      <Hero user={user} />
      
      {/* The lazy-loaded components will be rendered here */}
      <FeaturesSection />
      <DemoSection user={user} />
      <PricingSection
        user={user}
        loading={loading}
        setShowSignInModal={setShowSignInModal}
      />
      <Footer />
      
      {showSignInModal && <SignInPromptModal onClose={() => setShowSignInModal(false)} />}
      
      {/* Chat Widget - Always visible on homepage */}
      <ChatWidgetLauncher />
    </main>
  );
}