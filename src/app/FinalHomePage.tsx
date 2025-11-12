'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '../../final landing page components/Navbar';
import { Hero } from '../../final landing page components/Hero';
import { Features } from '../../final landing page components/Features';
import { HowItWorks } from '../../final landing page components/HowItWorks';
import { Pricing } from '../../final landing page components/Pricingdemo';
import { ProductShowcase } from '../../final landing page components/ProductShowcase';
import { Results } from '../../final landing page components/Results';
import { FAQs } from '../../final landing page components/FAQs';
import { CallToAction } from '../../final landing page components/CallToAction';
import { Footer } from '../../final landing page components/Footer';
import SignInPromptModal from '@/components/SignInPromptModal';
import ChatWidgetLauncher from '@/components/ChatWidgetLauncher';

export default function FinalHomePage() {
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
      <Navbar user={user} loading={loading} signOut={signOut} />
      <Hero />
      <HowItWorks />
      <Results />
      <Features />
      <ProductShowcase />
      <FAQs />
      <Pricing />
      <CallToAction />
      <Footer />

      {/* Chat Widget with Thunderbolt Icon */}
      <ChatWidgetLauncher />

      {showSignInModal && <SignInPromptModal onClose={() => setShowSignInModal(false)} />}
    </main>
  );
}