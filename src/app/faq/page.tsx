import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';
import { generateBreadcrumbSchema } from '@/lib/enhanced-schema';
import { faqSchema } from '@/lib/schema';
import { ProfessionalNavigation, ProfessionalFooter } from '@/components/ProfessionalNavigation';
import Link from 'next/link';

export const metadata: Metadata = generateSEOMetadata({
  title: 'TrulyBot FAQ - Frequently Asked Questions about AI Chatbots',
  description: 'Find answers to common questions about TrulyBot AI chatbot platform. Learn about features, pricing, setup process, and technical requirements.',
  keywords: [
    'TrulyBot FAQ',
    'AI chatbot questions',
    'chatbot setup help',
    'TrulyBot support',
    'AI customer service FAQ',
    'chatbot pricing questions',
    'ecommerce chatbot help',
    'automated support FAQ'
  ],
  canonical: '/faq'
});

const breadcrumbSchema = generateBreadcrumbSchema('FAQ', 'https://trulybot.xyz/faq');

// Enhanced FAQ data with more comprehensive coverage
const faqData = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'What is TrulyBot and how does it work?',
        answer: 'TrulyBot is a lightning-fast AI chatbot platform designed specifically for e-commerce businesses. It uses advanced natural language processing to understand customer inquiries and provides instant, accurate responses based on your business knowledge base. The AI learns from your product information, policies, and common customer questions to deliver personalized support 24/7.'
      },
      {
        question: 'How quickly can I set up TrulyBot on my website?',
        answer: 'TrulyBot can be set up and integrated into your website in just 5 minutes. Our streamlined onboarding process includes: 1) Account creation, 2) Knowledge base upload, 3) Widget customization, 4) Code installation. No coding skills required - just copy and paste our widget code into your website.'
      },
      {
        question: 'Do I need technical knowledge to use TrulyBot?',
        answer: 'No technical knowledge is required. TrulyBot is designed for business owners and marketing teams. Our intuitive dashboard allows you to manage conversations, update knowledge bases, and customize responses without any coding. We provide step-by-step tutorials and 24/7 support to help you get started.'
      }
    ]
  },
  {
    category: 'Features & Capabilities',
    questions: [
      {
        question: 'What results can I expect from using TrulyBot?',
        answer: 'Based on our customer data, businesses typically see: 70% reduction in support tickets, 5X increase in lead generation, 24/7 customer support coverage, 90% customer satisfaction improvement, and 50% faster response times. Results may vary based on your industry and implementation.'
      },
      {
        question: 'Can TrulyBot integrate with my existing e-commerce platform?',
        answer: 'Yes! TrulyBot integrates seamlessly with popular platforms including Shopify, WooCommerce, Magento, BigCommerce, and custom websites. We also connect with CRM systems, help desk software, and email marketing tools to provide a complete customer experience.'
      },
      {
        question: 'Does TrulyBot support multiple languages?',
        answer: 'TrulyBot supports over 50 languages including English, Hindi, Spanish, French, German, Chinese, Japanese, and more. The AI automatically detects customer language and responds appropriately, making it perfect for global businesses.'
      },
      {
        question: 'How does TrulyBot handle complex customer inquiries?',
        answer: 'TrulyBot uses advanced AI to understand context and intent. For complex issues beyond its knowledge base, it intelligently escalates to human agents while providing complete conversation history. You can also set up custom escalation rules based on keywords, customer tier, or inquiry type.'
      }
    ]
  },
  {
    category: 'Pricing & Plans',
    questions: [
      {
        question: 'What pricing plans does TrulyBot offer?',
        answer: 'TrulyBot offers three plans: Basic (₹99/$5/month) for small businesses, Pro (₹399/$10/month) for growing companies, and Ultra (₹599/$15/month) for enterprises. All plans include a free 7-day trial with no credit card required. Visit our pricing page for detailed feature comparisons.'
      },
      {
        question: 'Is there a free trial available?',
        answer: 'Yes! We offer a completely free 7-day trial with full access to all features. No credit card required to start. You can test TrulyBot with your actual customers and see the results before making any commitment.'
      },
      {
        question: 'Can I upgrade or downgrade my plan anytime?',
        answer: 'Absolutely! You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect immediately, and billing is prorated. There are no long-term contracts or cancellation fees.'
      },
      {
        question: 'What happens if I exceed my plan limits?',
        answer: 'If you approach your plan limits, we\'ll notify you in advance. You can either upgrade your plan or purchase additional conversations as needed. We never cut off service abruptly - your customers will always receive support.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        question: 'What kind of support do you provide?',
        answer: 'We provide comprehensive support including: 24/7 live chat support, email assistance, video tutorials, knowledge base, setup assistance, and dedicated account managers for enterprise customers. Our average response time is under 30 minutes.'
      },
      {
        question: 'How secure is my customer data with TrulyBot?',
        answer: 'Data security is our top priority. We use enterprise-grade encryption, comply with GDPR and CCPA regulations, and store data in secure, SOC 2 certified data centers. Your customer conversations and business data are never shared with third parties.'
      },
      {
        question: 'Can I export my chat data and analytics?',
        answer: 'Yes! You can export all conversation data, analytics reports, and customer insights in CSV or PDF format. This includes conversation transcripts, performance metrics, customer feedback, and detailed analytics for your records.'
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <>
      <ProfessionalNavigation />
      
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />

      <main className="min-h-screen bg-white dark:bg-gray-900">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-300">
              Find answers to common questions about TrulyBot AI chatbot platform, 
              features, pricing, and implementation.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Quick Navigation */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Navigation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {faqData.map((category, index) => (
                  <a
                    key={index}
                    href={`#${category.category.toLowerCase().replace(' ', '-')}`}
                    className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {category.category}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ Sections */}
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 
                  id={category.category.toLowerCase().replace(' ', '-')}
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-8"
                >
                  {category.category}
                </h2>
                
                <div className="space-y-6">
                  {category.questions.map((faq, questionIndex) => (
                    <div 
                      key={questionIndex}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Contact Support Section */}
            <div className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Still Have Questions?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our support team is here to help you get the most out of TrulyBot. 
                Reach out anytime for personalized assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Contact Support
                </Link>
                <Link
                  href="/start-trial"
                  className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>

            {/* Related Links */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Helpful Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/blog"
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Blog & Tutorials
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Learn best practices and implementation strategies
                  </p>
                </Link>
                
                <Link
                  href="/features"
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Features Overview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Explore all TrulyBot capabilities and features
                  </p>
                </Link>
                
                <Link
                  href="/pricing"
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Pricing Plans
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Compare plans and find the right fit for your business
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ProfessionalFooter />
    </>
  );
}
