import Link from 'next/link';
import { navigationSchema } from '@/lib/enhanced-schema';

interface NavItem {
  name: string;
  href: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

// Professional navigation structure optimized for Google Sitelinks
const mainNavItems: NavItem[] = [
  {
    name: 'Home',
    href: '/',
    description: 'TrulyBot AI Chatbot Platform',
    priority: 'high'
  },
  {
    name: 'Pricing',
    href: '/pricing',
    description: 'AI Chatbot Pricing Plans',
    priority: 'high'
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    description: 'Chatbot Management Dashboard',
    priority: 'high'
  },
  {
    name: 'Start Free Trial',
    href: '/start-trial',
    description: 'Free 7-Day Trial',
    priority: 'high'
  },
  {
    name: 'Features',
    href: '/features',
    description: 'AI Chatbot Features',
    priority: 'medium'
  },
  {
    name: 'Contact Us',
    href: '/contact',
    description: 'Support & Sales',
    priority: 'medium'
  },
  {
    name: 'Blog',
    href: '/blog',
    description: 'AI Chatbot Resources',
    priority: 'medium'
  },
  {
    name: 'FAQ',
    href: '/faq',
    description: 'Frequently Asked Questions',
    priority: 'low'
  }
];

// Secondary navigation for comprehensive site structure
const secondaryNavItems: NavItem[] = [
  {
    name: 'About',
    href: '/about',
    description: 'About TrulyBot',
    priority: 'low'
  },
  {
    name: 'Privacy Policy',
    href: '/privacy',
    description: 'Privacy & Data Protection',
    priority: 'low'
  },
  {
    name: 'Terms of Service',
    href: '/terms',
    description: 'Terms & Conditions',
    priority: 'low'
  }
];

export function ProfessionalNavigation() {
  return (
    <>
      {/* Navigation Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(navigationSchema)
        }}
      />
      
      {/* Professional Navigation Bar */}
      <nav className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2"
              title="TrulyBot - AI Chatbot Platform"
            >
              <div className="text-2xl font-bold text-white">
                ⚡ <span className="text-blue-500">TrulyBot</span>
              </div>
            </Link>

            {/* Main Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {mainNavItems.filter(item => item.priority === 'high').map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  title={item.description}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* CTA Button */}
              <Link
                href="/start-trial"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                title="Start Your Free 7-Day Trial"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
                aria-label="Open main menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/95">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                title={item.description}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

export function ProfessionalFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="text-2xl font-bold">
                ⚡ <span className="text-blue-500">TrulyBot</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Lightning-fast AI chatbot platform for e-commerce businesses. 
              Reduce support tickets by 70%, increase leads by 5X with automated customer support.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:info@trulybot.xyz" className="text-gray-400 hover:text-white">
                Email Support
              </a>
              <a href="tel:+919101361482" className="text-gray-400 hover:text-white">
                Call Us
              </a>
            </div>
          </div>

          {/* Main Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              {mainNavItems.filter(item => item.priority === 'high').map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                    title={item.description}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {[...mainNavItems.filter(item => item.priority === 'medium'), ...secondaryNavItems].map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                    title={item.description}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 TrulyBot. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white text-sm">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Internal linking component for homepage
export function InternalLinkingSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Explore TrulyBot Platform
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover all the powerful features and resources available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
              title={item.description}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {item.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}