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
              className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity"
              title="TrulyBot - AI Chatbot Platform"
            >
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 512 512" 
                fill="none"
                className="flex-shrink-0"
              >
                <defs>
                  <linearGradient id="navigationLightning" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#06B6D4', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#8B5CF6', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <polygon 
                  fill="url(#navigationLightning)"
                  points="320,32 136,296 248,296 192,480 400,216 288,216"
                />
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-light text-slate-400">AI Platform</span>
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold text-xl tracking-wider">TrulyBot</span>
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
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-5 hover:opacity-90 transition-opacity">
              <svg width="32" height="32" viewBox="0 0 512 512" fill="none" className="flex-shrink-0">
                <defs>
                  <linearGradient id="footerLightning" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#06B6D4', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#8B5CF6', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <polygon fill="url(#footerLightning)" points="320,32 136,296 248,296 192,480 400,216 288,216" />
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-light text-slate-400">AI Platform</span>
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold text-xl tracking-wider">TrulyBot</span>
              </div>
            </Link>
            <p className="text-slate-400 mb-6 max-w-lg">
              Lightning-fast AI chatbot platform for e-commerce businesses. Reduce support tickets by 70% and increase leads by 5X with automated customer support.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="mailto:info@trulybot.xyz" className="text-slate-400 hover:text-white">Email Support</a>
              <a href="tel:+919101361482" className="text-slate-400 hover:text-white">Call Us</a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 tracking-wider mb-4">Product</h3>
            <ul className="space-y-2">
              {['/pricing','/features','/start-trial'].map((href, idx) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-white transition-colors">
                    {['Pricing','Features','Free Trial'][idx]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2">
              {['/about','/contact'].map((href, idx) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-white transition-colors">
                    {['About','Contact'][idx]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              {['/privacy','/terms','/refund-policy'].map((href, idx) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-white transition-colors">
                    {['Privacy Policy','Terms of Service','Refund Policy'][idx]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} TrulyBot Pvt. Ltd. All rights reserved.</p>
          <p className="text-slate-500 text-sm mt-4 md:mt-0">Lightning-fast AI chatbot platform.</p>
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