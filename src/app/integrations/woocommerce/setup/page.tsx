'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const Step = ({ number, title, children, icon }: { number: number; title: string; children: React.ReactNode; icon: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: number * 0.1 }}
    className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8"
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
        {number}
      </div>
      <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white">{title}</h3>
    </div>
    <div className="text-slate-300 leading-relaxed">
      {children}
    </div>
  </motion.div>
);

const CodeBlock = ({ children }: { children: string }) => (
  <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm text-green-400 border border-slate-600 my-4">
    <code>{children}</code>
  </div>
);

const ImportantNote = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 my-4 flex items-start gap-3">
    <AlertIcon />
    <div className="text-amber-200 text-sm">{children}</div>
  </div>
);

export default function WooCommerceSetupPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-black border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/dashboard/integrations" 
              className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              ← Back to Integrations
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            WooCommerce Integration Setup
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Follow this step-by-step guide to integrate TrulyBot AI chatbot with your WooCommerce store. 
            The entire process takes less than 5 minutes.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Prerequisites */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <CheckIcon />
            Before You Start
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  WordPress 5.0 or higher
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  WooCommerce 6.0 or higher
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  PHP 7.4 or higher
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Administrator access to WordPress
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">What You'll Need</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Your TrulyBot User ID
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  FTP or WordPress admin access
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Less than 5 minutes of your time
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 1: Download Plugin */}
        <Step number={1} title="Download the TrulyBot Plugin" icon={<DownloadIcon />}>
          <p className="mb-4">
            First, download the official TrulyBot for WooCommerce plugin from your integrations dashboard.
          </p>
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">trulybot-woocommerce.zip</h4>
                <p className="text-slate-400 text-sm">Official WordPress plugin package</p>
              </div>
              <Link 
                href="/integrations/woocommerce/trulybot-woocommerce.zip"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                download
              >
                <DownloadIcon />
                Download Plugin
              </Link>
            </div>
          </div>
          <ImportantNote>
            The plugin file is about 12KB in size. Make sure the download completes successfully before proceeding.
          </ImportantNote>
        </Step>

        {/* Step 2: Install Plugin */}
        <Step number={2} title="Install the Plugin in WordPress" icon={<UploadIcon />}>
          <p className="mb-4">
            Now install the downloaded plugin in your WordPress admin dashboard.
          </p>
          <div className="space-y-4">
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <h4 className="text-white font-semibold mb-2">Option A: Through WordPress Admin (Recommended)</h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 ml-4">
                <li>Log in to your WordPress admin dashboard</li>
                <li>Navigate to <code className="bg-slate-700 px-2 py-1 rounded text-blue-300">Plugins → Add New</code></li>
                <li>Click <code className="bg-slate-700 px-2 py-1 rounded text-blue-300">Upload Plugin</code> button</li>
                <li>Click <code className="bg-slate-700 px-2 py-1 rounded text-blue-300">Choose File</code> and select the downloaded ZIP file</li>
                <li>Click <code className="bg-slate-700 px-2 py-1 rounded text-blue-300">Install Now</code></li>
                <li>After installation completes, click <code className="bg-slate-700 px-2 py-1 rounded text-blue-300">Activate Plugin</code></li>
              </ol>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <h4 className="text-white font-semibold mb-2">Option B: Via FTP (Advanced Users)</h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 ml-4">
                <li>Unzip the downloaded plugin file on your computer</li>
                <li>Upload the <code className="bg-slate-700 px-2 py-1 rounded text-blue-300">trulybot-woocommerce</code> folder to <code className="bg-slate-700 px-2 py-1 rounded text-blue-300">/wp-content/plugins/</code></li>
                <li>Go to WordPress admin → Plugins and activate "TrulyBot for WooCommerce"</li>
              </ol>
            </div>
          </div>
        </Step>

        {/* Step 3: Get User ID */}
        <Step number={3} title="Find Your TrulyBot User ID" icon={<LinkIcon />}>
          <p className="mb-4">
            You'll need your unique TrulyBot User ID to connect the plugin to your account.
          </p>
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">i</div>
              <h4 className="text-white font-semibold">Your User ID is displayed above!</h4>
            </div>
            <p className="text-blue-200 mb-4">
              Your TrulyBot User ID is shown at the top of the integrations page. It looks something like:
            </p>
            <CodeBlock>46bd8800-5fd6-4fac-a253-6c43920cc396</CodeBlock>
            <p className="text-blue-200 text-sm">
              Copy this ID - you'll need it in the next step. You can also find it in your Settings page.
            </p>
          </div>
        </Step>

        {/* Step 4: Configure Plugin */}
        <Step number={4} title="Configure the Plugin Settings" icon={<SettingsIcon />}>
          <p className="mb-4">
            Now configure the plugin with your TrulyBot account details.
          </p>
          <div className="space-y-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Access Plugin Settings</h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 ml-4">
                <li>In your WordPress admin, look for <code className="bg-slate-700 px-2 py-1 rounded text-blue-300">TrulyBot</code> in the left menu</li>
                <li>Click on it to open the plugin settings page</li>
                <li>You'll see the connection setup form</li>
              </ol>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h4 className="text-white font-semibold mb-4">Connection Setup</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">TrulyBot User ID</label>
                  <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                    <code className="text-green-400">Paste your User ID here</code>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">
                    Enter the User ID you copied from your TrulyBot dashboard
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
                  Connect to TrulyBot
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h4 className="text-white font-semibold mb-4">Widget Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600" />
                  <label className="text-slate-300">Enable chatbot widget on frontend</label>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Widget Position</label>
                  <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
                    <option>Bottom Right</option>
                    <option>Bottom Left</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Step>

        {/* Step 5: Test Integration */}
        <Step number={5} title="Test Your Integration" icon={<CheckIcon />}>
          <p className="mb-4">
            Verify that everything is working correctly by testing the chatbot on your store.
          </p>
          <div className="space-y-4">
            <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-6">
              <h4 className="text-green-300 font-semibold mb-3">✅ What to Check</h4>
              <ul className="space-y-2 text-green-200">
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Visit your store's frontend - you should see the chatbot widget
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Click the widget to open the chat interface
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Send a test message (try "Hello" or ask about your products)
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  Test order tracking by asking "Track my order with ID #123"
                </li>
              </ul>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h4 className="text-white font-semibold mb-3">🤖 Sample Questions to Test</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-slate-300 font-medium mb-2">Product Questions</h5>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>"What products do you sell?"</li>
                    <li>"Tell me about your best sellers"</li>
                    <li>"Do you have any discounts?"</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-slate-300 font-medium mb-2">Order Tracking</h5>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>"Track my order #12345"</li>
                    <li>"What's my order status?"</li>
                    <li>"When will my order arrive?"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Step>

        {/* Troubleshooting */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <AlertIcon />
            Troubleshooting
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Common Issues</h3>
              <div className="space-y-4">
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-white font-medium mb-2">Widget not appearing on frontend</h4>
                  <ul className="text-slate-300 text-sm space-y-1 ml-4">
                    <li>• Check that the plugin is activated</li>
                    <li>• Verify "Enable chatbot widget" is checked in settings</li>
                    <li>• Clear your website cache</li>
                    <li>• Check for JavaScript conflicts with other plugins</li>
                  </ul>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-white font-medium mb-2">Connection failed error</h4>
                  <ul className="text-slate-300 text-sm space-y-1 ml-4">
                    <li>• Double-check your User ID is correct</li>
                    <li>• Ensure your WordPress site can make outbound API calls</li>
                    <li>• Contact your hosting provider about firewall restrictions</li>
                  </ul>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-white font-medium mb-2">Order tracking not working</h4>
                  <ul className="text-slate-300 text-sm space-y-1 ml-4">
                    <li>• Verify WooCommerce REST API is enabled</li>
                    <li>• Check that API keys were generated successfully</li>
                    <li>• Test with a valid order number from your store</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl p-8 border border-green-500/30 text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">🎉 Congratulations!</h2>
          <p className="text-green-200 mb-6 max-w-2xl mx-auto">
            You've successfully integrated TrulyBot with your WooCommerce store. Your customers can now get instant AI-powered support 
            and track their orders through the chatbot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard/integrations"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link 
              href="/dashboard/settings"
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Customize Chatbot
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-12 p-6 bg-slate-900/30 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
          <p className="text-slate-300 mb-4">
            If you encounter any issues during setup, we're here to help!
          </p>
          <Link 
            href="/contact" 
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}