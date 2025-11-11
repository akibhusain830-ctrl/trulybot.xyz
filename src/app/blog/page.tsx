import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';

// Blog page metadata export for SEO
export const metadata: Metadata = generateSEOMetadata({
  title: '⚡ TrulyBot Blog - Lightning-Fast AI Chatbot Insights',
  description: 'Discover expert insights on AI chatbots, e-commerce automation, customer support strategies, and thunderbolt-speed lead generation with TrulyBot.',
  keywords: [
    'AI chatbot blog',
    'ecommerce automation tips',
    'customer support strategies',
    'chatbot best practices',
    'AI customer service',
    'lead generation tactics',
    'thunderbolt chatbot insights',
    'lightning fast automation'
  ],
  canonical: '/blog'
});

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    slug: 'ai-chatbot-ecommerce-guide',
    title: '⚡ The Complete Guide to AI Chatbots for E-commerce Success',
    excerpt: 'Discover how lightning-fast AI chatbots can transform your e-commerce business, reduce support tickets by 70%, and increase leads by 5X.',
    publishDate: '2025-10-04',
    readTime: '8 min read',
    category: 'E-commerce',
    tags: ['AI chatbot', 'ecommerce', 'automation']
  },
  {
    slug: 'customer-support-automation-thunderbolt-speed',
    title: '🚀 Customer Support Automation at Thunderbolt Speed',
    excerpt: 'Learn how to implement lightning-fast customer support automation that handles 70% of inquiries instantly.',
    publishDate: '2025-10-03',
    readTime: '6 min read',
    category: 'Automation',
    tags: ['customer support', 'automation', 'AI']
  },
  {
    slug: 'lead-generation-ai-chatbot-strategies',
    title: '🎯 Lead Generation Strategies with AI Chatbots',
    excerpt: 'Proven strategies to capture 5X more leads using intelligent AI chatbots with thunderbolt-speed responses.',
    publishDate: '2025-10-02',
    readTime: '7 min read',
    category: 'Lead Generation',
    tags: ['lead generation', 'chatbot strategies', 'conversion']
  },
  {
    slug: 'chatbot-integration-5-minutes',
    title: '⚡ How to Integrate AI Chatbot in 5 Minutes',
    excerpt: 'Step-by-step guide to lightning-fast chatbot integration for your website with zero coding required.',
    publishDate: '2025-10-01',
    readTime: '5 min read',
    category: 'Tutorial',
    tags: ['integration', 'setup', 'tutorial']
  },
  {
    slug: 'ai-customer-service-best-practices',
    title: '🛡️ AI Customer Service Best Practices for 2025',
    excerpt: 'Industry best practices for implementing AI customer service that delights customers and reduces workload.',
    publishDate: '2025-09-30',
    readTime: '9 min read',
    category: 'Best Practices',
    tags: ['customer service', 'AI', 'best practices']
  },
  {
    slug: 'chatbot-roi-calculator-guide',
    title: '📊 Calculate Your Chatbot ROI: Complete Guide',
    excerpt: 'Learn how to measure and maximize your AI chatbot ROI with our comprehensive calculator and metrics guide.',
    publishDate: '2025-09-29',
    readTime: '6 min read',
    category: 'Analytics',
    tags: ['ROI', 'analytics', 'business metrics']
  }
];

const categories = ['All', 'E-commerce', 'Automation', 'Lead Generation', 'Tutorial', 'Best Practices', 'Analytics'];

export default function BlogPage() {
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 512 512" 
            fill="none"
            className="inline-block mr-2 -mt-2"
          >
            <defs>
              <linearGradient id="blogHeaderLightning" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#00D4FF', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#0EA5E9', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#0284C7', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <polygon 
              fill="url(#blogHeaderLightning)"
              points="320,8 136,296 248,296 192,504 400,216 288,216"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon 
              fill="#ffffff"
              opacity="0.3"
              points="310,20 146,290 240,290 200,480 380,220 280,220"
            />
          </svg>
          AI Chatbot Insights & Best Practices
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          Expert insights on lightning-fast AI chatbots, e-commerce automation, and thunderbolt-speed customer support strategies.
        </p>
      </header>

      {/* Category Filter */}
      <section className="mb-8">
        <h2 className="sr-only">Blog Categories</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors duration-200"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">🌟 Featured Article</h2>
        <article className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
              {blogPosts[0].category}
            </span>
            <span className="text-slate-500 text-sm">{blogPosts[0].publishDate}</span>
            <span className="text-slate-500 text-sm">{blogPosts[0].readTime}</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4 leading-tight">
            <Link href={`/blog/${blogPosts[0].slug}`} className="hover:text-blue-400 transition-colors">
              {blogPosts[0].title}
            </Link>
          </h3>
          <p className="text-slate-300 text-lg mb-6 leading-relaxed">
            {blogPosts[0].excerpt}
          </p>
          <div className="flex flex-wrap gap-2">
            {blogPosts[0].tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm">
                #{tag}
              </span>
            ))}
          </div>
        </article>
      </section>

      {/* Blog Grid */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">📚 Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <article key={post.slug} className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-blue-500/50 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs font-medium">
                  {post.category}
                </span>
                <span className="text-slate-500 text-xs">{post.readTime}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                <Link href={`/blog/${post.slug}`} className="hover:text-blue-400 transition-colors">
                  {post.title}
                </Link>
              </h3>
              
              <p className="text-slate-400 mb-4 leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">{post.publishDate}</span>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Read More ⚡
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="mt-16 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          ⚡ Get Lightning-Fast AI Insights
        </h2>
        <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
          Subscribe to our newsletter for the latest AI chatbot strategies, thunderbolt-speed automation tips, and exclusive industry insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Subscribe ⚡
          </button>
        </div>
      </section>
    </main>
  );
}