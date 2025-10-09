/**
 * SEO-Optimized Breadcrumb Component
 * Provides enhanced navigation and search engine understanding
 */

import Link from 'next/link';
import { breadcrumbSchema } from '@/lib/schema';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Generate dynamic breadcrumb schema
  const dynamicBreadcrumbSchema = {
    ...breadcrumbSchema,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://trulybot.xyz${item.href}`
    }))
  };

  return (
    <>
      {/* Breadcrumb Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dynamicBreadcrumbSchema)
        }}
      />
      
      <nav 
        aria-label="Breadcrumb navigation for TrulyBot AI chatbot pages"
        className={`flex items-center space-x-2 text-sm text-slate-400 ${className}`}
      >
        {items.map((item, index) => (
          <div key={item.href} className="flex items-center">
            {index > 0 && (
              <svg 
                width="10" 
                height="10" 
                viewBox="0 0 512 512" 
                fill="none"
                className="mx-2"
              >
                <defs>
                  <linearGradient id="breadcrumbLightning" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <polygon 
                  fill="url(#breadcrumbLightning)"
                  points="320,8 136,296 248,296 192,504 400,216 288,216"
                />
              </svg>
            )}
            {index === items.length - 1 ? (
              <span className="text-slate-300 font-medium" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-blue-400 transition-colors duration-200"
                title={`Navigate to ${item.name} - TrulyBot AI Chatbot`}
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}