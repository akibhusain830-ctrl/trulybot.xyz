'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

// --- Core Components (Load Immediately) ---
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SignInPromptModal from '@/components/SignInPromptModal';

// --- Lazy-Loaded Components (Load as needed) ---
// These components will only be loaded by the browser when they are needed,
// making the initial page load much faster.
const FeaturesSection = dynamic(() => import('@/components/FeaturesSection'));
const DemoSection = dynamic(() => import('@/components/DemoSection'));
const PricingSection = dynamic(() => import('@/components/PricingSection'));
const Footer = dynamic(() => import('@/components/Footer'));

export default function HomePage() {
  const { user, signOut, loading } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isGeoLoading, setIsGeoLoading] = useState(true);

  useEffect(() => {
    const fetchCountry = async () => {
      // 1. Check for a cached value in localStorage first
      const cachedCountry = localStorage.getItem('user_country');

      if (cachedCountry) {
        if (cachedCountry !== 'IN') {
          setCurrency('USD');
        }
        setIsGeoLoading(false);
        return; // Exit if we have a cached value
      }

      // 2. If not cached, fetch from the API
      try {
        const response = await fetch('/api/geolocation');
        if (!response.ok) throw new Error('Geolocation API failed');
        
        const data = await response.json();
        const country = data.country || 'US'; // Default to a country code

        // 3. Save the new value to the cache for next time
        localStorage.setItem('user_country', country);
        
        if (country !== 'IN') {
          setCurrency('USD');
        }
      } catch (error) {
        console.error('Failed to fetch geolocation:', error);
        // Default to USD on error
        setCurrency('USD');
        localStorage.setItem('user_country', 'US'); // Cache a default on error
      } finally {
        setIsGeoLoading(false);
      }
    };

    fetchCountry();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <main className="min-h-screen font-sans text-white bg-black overflow-x-hidden">
      <Header user={user} loading={loading} signOut={signOut} />
      <Hero user={user} />
      
      {/* The lazy-loaded components will be rendered here */}
      <FeaturesSection />
      <DemoSection user={user} />
      <PricingSection
        user={user}
        loading={loading}
        currency={currency}
        isGeoLoading={isGeoLoading}
        setShowSignInModal={setShowSignInModal}
      />
      <Footer />
      
      {showSignInModal && <SignInPromptModal onClose={() => setShowSignInModal(false)} />}
    </main>
  );
}