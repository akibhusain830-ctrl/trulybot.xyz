import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';
import SignUpPageContent from './SignUpPageContent';

// Sign-up page metadata export for SEO
export const metadata: Metadata = generateSEOMetadata({
  title: 'Sign Up | TrulyBot - Create Your Account',
  description: 'Create your TrulyBot account to start building AI chatbots for your business. Get started with custom AI assistants in minutes.',
  keywords: ['sign up', 'register', 'create account', 'get started', 'AI chatbot'],
  canonical: '/sign-up'
});

// Server component with metadata export
export default function SignUpPage() {
  return <SignUpPageContent />;
}
