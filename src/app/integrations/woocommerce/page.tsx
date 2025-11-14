'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  CubeIcon, 
  CheckCircleIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function WooCommerceIntegrationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gradient">
              TrulyBot
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30">
              <ShoppingBagIcon className="w-16 h-16 text-purple-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            TrulyBot for <span className="text-gradient">WooCommerce</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Integrate AI-powered customer support with your WooCommerce store. 
            Reduce support tickets by 70% with automated order tracking and instant customer service.
          </p>
        </motion.div>

        {/* Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-gray-700/50"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Download WordPress Plugin</h2>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <a
              href="/api/integrations/woocommerce/download"
              className="flex items-center px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg text-lg font-semibold"
            >
              <ArrowDownTrayIcon className="w-6 h-6 mr-3" />
              Download Plugin (v1.0.2)
            </a>
            <a
              href="/integrations/woocommerce/README.md"
              target="_blank"
              className="flex items-center px-8 py-4 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors text-lg"
            >
              <DocumentTextIcon className="w-6 h-6 mr-3" />
              Installation Guide
            </a>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {[
            {
              icon: CheckCircleIcon,
              title: "Order Tracking",
              description: "Customers can instantly check order status through the chatbot"
            },
            {
              icon: ShoppingBagIcon,
              title: "WooCommerce Integration",
              description: "Seamless integration with your existing WooCommerce store"
            },
            {
              icon: CubeIcon,
              title: "Automated Support",
              description: "Reduce support tickets with AI-powered customer service"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-gray-900/30 rounded-xl p-6 border border-gray-700/50">
              <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Installation Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Quick Installation</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Download", desc: "Download the plugin ZIP file" },
              { step: "2", title: "Upload", desc: "Upload to WordPress via Plugins > Add New" },
              { step: "3", title: "Configure", desc: "Enter your TrulyBot User ID" },
              { step: "4", title: "Connect", desc: "Click 'Connect Store' and you're done!" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of WooCommerce stores using TrulyBot for automated customer support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/api/integrations/woocommerce/download"
              className="bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-colors font-semibold"
            >
              Download Plugin Now
            </a>
            <Link
              href="/dashboard"
              className="border border-gray-600 text-gray-300 px-8 py-4 rounded-xl hover:bg-gray-800/50 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
