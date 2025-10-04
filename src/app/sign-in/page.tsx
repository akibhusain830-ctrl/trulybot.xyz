import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';
import SignInPageContent from './SignInPageContent';

// Sign-in page metadata export for SEO
export const metadata: Metadata = generateSEOMetadata({
  title: 'Sign In | TrulyBot - Access Your Account',
  description: 'Sign in to your TrulyBot account to access your AI chatbot dashboard, manage conversations, and view analytics.',
  keywords: ['sign in', 'login', 'account access', 'dashboard', 'authentication'],
  canonical: '/sign-in'
});

// Server component with metadata export
export default function SignInPage() {
  return <SignInPageContent />;
}
