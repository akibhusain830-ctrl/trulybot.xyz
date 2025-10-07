'use client';

import { ProfessionalNavigation, ProfessionalFooter, InternalLinkingSection } from '@/components/ProfessionalNavigation';
import Image from 'next/image';
import Link from 'next/link';

export default function EnhancedHomePageContent() {
  return (
    <>
      <ProfessionalNavigation />
      
      {/* Main Content */}
      <main>
        
        {/* Hero Section - Above the Fold */}
        <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Hero Content */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-blue-400">⚡ TrulyBot</span><br />
                  #1 AI Chatbot for<br />
                  <span className="text-blue-400">E-Commerce Success</span>
                </h1>
                
                <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
                  Transform your e-commerce customer support with our lightning-fast AI chatbot. 
                  <strong className="text-white"> Reduce support tickets by 70%, increase leads by 5X, 
                  and provide 24/7 automated support.</strong> Free 7-day trial with 5-minute setup.
                </p>

                {/* Key Benefits */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">24/7</div>
                    <div className="text-sm text-gray-400">Support<br />Availability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">70%</div>
                    <div className="text-sm text-gray-400">Ticket<br />Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">5min</div>
                    <div className="text-sm text-gray-400">Setup<br />Time</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/start-trial"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 text-center"
                    title="Start Your Free 7-Day TrulyBot Trial"
                  >
                    Start 7-Day Free Trial →
                  </Link>
                  <Link
                    href="/pricing"
                    className="border border-gray-400 hover:border-white text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 text-center"
                    title="View TrulyBot AI Chatbot Pricing Plans"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <Image
                  src="/og-image.svg"
                  alt="TrulyBot AI Chatbot Dashboard - Lightning-Fast Customer Support Interface"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* What is TrulyBot Section - 800+ Words SEO Content */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  What is TrulyBot AI Chatbot Platform?
                </h2>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  <strong>TrulyBot is the world's most advanced AI chatbot platform</strong> specifically designed for 
                  e-commerce businesses seeking to revolutionize their customer support operations. Our lightning-fast 
                  conversational AI technology enables businesses to provide instant, intelligent responses to customer 
                  inquiries while dramatically reducing support team workload.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  How TrulyBot AI Chatbot Works
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our intelligent AI chatbot system integrates seamlessly with your existing e-commerce platform, 
                  learning from your business knowledge base to provide accurate, contextual responses. The automated 
                  customer support system handles routine inquiries, product questions, order status updates, and 
                  lead qualification processes without human intervention.
                </p>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Unlike traditional chatbot solutions, TrulyBot's conversational AI platform understands natural 
                  language patterns, customer intent, and business context. This advanced AI customer service 
                  technology ensures that every interaction feels personal and helpful, maintaining the quality 
                  your customers expect while operating at scale.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Key Benefits of AI-Powered Customer Support
                </h3>

                <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <strong>70% Reduction in Support Tickets:</strong> Automate responses to common customer inquiries
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <strong>5X Increase in Lead Generation:</strong> Intelligent lead qualification and capture system
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <strong>24/7 Customer Support Availability:</strong> Never miss a customer inquiry again
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <strong>Lightning-Fast Response Times:</strong> Instant AI-powered customer service
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <strong>Multi-Language Support:</strong> Serve global customers in their preferred language
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Why Choose TrulyBot Over Other AI Chatbot Solutions?
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  TrulyBot stands out in the competitive landscape of AI chatbot platforms through our focus on 
                  e-commerce-specific functionality. While generic chatbot software requires extensive customization, 
                  our platform comes pre-configured with industry-specific features that e-commerce businesses need most.
                </p>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Our automated helpdesk system includes advanced features like product recommendation engines, 
                  order tracking integration, payment support, and inventory management connections. This comprehensive 
                  approach means you get a complete customer service automation solution, not just a basic chat widget.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Advanced AI Technology Features
                </h3>

                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Natural Language Processing (NLP)</h4>
                    <p>Advanced AI algorithms understand customer intent and context for more accurate responses.</p>
                  </div>
                  
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Machine Learning Optimization</h4>
                    <p>The system continuously learns from interactions to improve response quality over time.</p>
                  </div>
                  
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Real-Time Analytics</h4>
                    <p>Monitor performance metrics, customer satisfaction, and conversion rates in real-time.</p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/features"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                    title="Explore All TrulyBot AI Chatbot Features"
                  >
                    Explore All Features →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Trusted by 10,000+ E-Commerce Businesses
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                See how TrulyBot AI chatbot has transformed customer support operations worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    ★★★★★
                  </div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">5.0</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  "TrulyBot reduced our support tickets by 75% in just two weeks. Our customers love the instant responses!"
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Priya Sharma</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">E-Commerce Director</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    ★★★★★
                  </div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">5.0</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  "Setup took only 5 minutes and our sales increased by 400% with TrulyBot's lead generation features."
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Rajesh Kumar</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Online Store Owner</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    ★★★★★
                  </div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">5.0</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  "The AI understands our products perfectly. Customer satisfaction scores improved by 40%!"
                </p>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Sarah Johnson</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Customer Success Manager</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Linking Section for Sitelinks */}
        <InternalLinkingSection />

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Customer Support?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 10,000+ businesses already using TrulyBot AI chatbot to reduce support costs and increase sales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/start-trial"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                title="Start Free Trial - No Credit Card Required"
              >
                Start Free Trial - No Credit Card Required
              </Link>
              <Link
                href="/contact"
                className="border border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                title="Contact TrulyBot Sales Team"
              >
                Contact Sales Team
              </Link>
            </div>
          </div>
        </section>
      </main>

      <ProfessionalFooter />
    </>
  );
}