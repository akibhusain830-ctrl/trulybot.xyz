'use client';

import React, { useState } from 'react';
import { Copy, ExternalLink, Download, CheckCircle, AlertCircle, Code, Book, Zap, Globe } from 'lucide-react';

const codeExamples = {
  html: `<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <!-- Your website content -->
    <h1>Welcome to my website</h1>
    
    <!-- TrulyBot Widget - Add before closing </body> tag -->
    <script 
        async 
        src="https://trulybot.xyz/widget.js" 
        data-bot-id="YOUR_BOT_ID"
        data-position="right"
        data-color="#007bff"
        data-greeting="Hello! How can I help you today?"
        data-theme="light">
    </script>
</body>
</html>`,

  wordpress: `// Method 1: Using WordPress Admin (Recommended)
// 1. Go to Appearance > Theme Editor
// 2. Edit your theme's footer.php file
// 3. Add this code before the closing </body> tag:

<script 
    async 
    src="https://trulybot.xyz/widget.js" 
    data-bot-id="YOUR_BOT_ID"
    data-position="right"
    data-color="#007bff"
    data-greeting="Hello! How can I help you today?"
    data-theme="light">
</script>

// Method 2: Using a Plugin
// 1. Install "Insert Headers and Footers" plugin
// 2. Go to Settings > Insert Headers and Footers
// 3. Paste the script in the "Scripts in Footer" section`,

  shopify: `<!-- Add to your Shopify theme -->
<!-- 1. Go to Online Store > Themes > Actions > Edit code -->
<!-- 2. Open theme.liquid file -->
<!-- 3. Add this before </body> tag -->

<script 
    async 
    src="https://trulybot.xyz/widget.js" 
    data-bot-id="YOUR_BOT_ID"
    data-position="right"
    data-color="#007bff"
    data-greeting="Hello! Welcome to our store!"
    data-theme="light">
</script>

<!-- For Shopify Plus users: -->
<!-- You can also add this via Scripts > Create script tag in admin -->`,

  react: `// React Component Integration
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load TrulyBot widget
    const script = document.createElement('script');
    script.src = 'https://trulybot.xyz/widget.js';
    script.async = true;
    script.setAttribute('data-bot-id', 'YOUR_BOT_ID');
    script.setAttribute('data-position', 'right');
    script.setAttribute('data-color', '#007bff');
    script.setAttribute('data-greeting', 'Hello! How can I help you today?');
    script.setAttribute('data-theme', 'light');
    
    document.body.appendChild(script);
    
    // Cleanup function
    return () => {
      // Remove widget on component unmount
      if (window.TrulyBotWidget) {
        window.TrulyBotWidget.cleanup();
      }
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="App">
      <h1>My React App</h1>
      {/* Your app content */}
    </div>
  );
}

export default App;`,

  nextjs: `// Next.js Integration
// pages/_app.js or app/layout.js
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      
      <Script
        src="https://trulybot.xyz/widget.js"
        data-bot-id="YOUR_BOT_ID"
        data-position="right"
        data-color="#007bff"
        data-greeting="Hello! How can I help you today?"
        data-theme="light"
        strategy="afterInteractive"
      />
    </>
  );
}

// Alternative: Using useEffect in a component
import { useEffect } from 'react';

export default function Layout({ children }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://trulybot.xyz/widget.js';
    script.async = true;
    script.setAttribute('data-bot-id', 'YOUR_BOT_ID');
    script.setAttribute('data-position', 'right');
    script.setAttribute('data-color', '#007bff');
    script.setAttribute('data-greeting', 'Hello! How can I help?');
    script.setAttribute('data-theme', 'light');
    
    document.body.appendChild(script);
    
    return () => {
      if (window.TrulyBotWidget) {
        window.TrulyBotWidget.cleanup();
      }
    };
  }, []);

  return <>{children}</>;
}`,

  vue: `<!-- Vue.js Integration -->
<template>
  <div id="app">
    <h1>My Vue App</h1>
    <!-- Your app content -->
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // Load TrulyBot widget when component mounts
    this.loadTrulyBot();
  },
  beforeDestroy() {
    // Cleanup when component is destroyed
    if (window.TrulyBotWidget) {
      window.TrulyBotWidget.cleanup();
    }
  },
  methods: {
    loadTrulyBot() {
      const script = document.createElement('script');
      script.src = 'https://trulybot.xyz/widget.js';
      script.async = true;
      script.setAttribute('data-bot-id', 'YOUR_BOT_ID');
      script.setAttribute('data-position', 'right');
      script.setAttribute('data-color', '#007bff');
      script.setAttribute('data-greeting', 'Hello! How can I help you today?');
      script.setAttribute('data-theme', 'light');
      
      document.body.appendChild(script);
    }
  }
}
</script>`,

  angular: `// Angular Component Integration
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <h1>My Angular App</h1>
    <!-- Your app content -->
  \`
})
export class AppComponent implements OnInit, OnDestroy {
  
  ngOnInit() {
    this.loadTrulyBot();
  }
  
  ngOnDestroy() {
    if ((window as any).TrulyBotWidget) {
      (window as any).TrulyBotWidget.cleanup();
    }
  }
  
  private loadTrulyBot() {
    const script = document.createElement('script');
    script.src = 'https://trulybot.xyz/widget.js';
    script.async = true;
    script.setAttribute('data-bot-id', 'YOUR_BOT_ID');
    script.setAttribute('data-position', 'right');
    script.setAttribute('data-color', '#007bff');
    script.setAttribute('data-greeting', 'Hello! How can I help you today?');
    script.setAttribute('data-theme', 'light');
    
    document.body.appendChild(script);
  }
}`,

  wix: `<!-- Wix Website Integration -->
<!-- 1. Go to your Wix Editor -->
<!-- 2. Click on Settings (gear icon) -->
<!-- 3. Go to Custom Code in Advanced settings -->
<!-- 4. Click "Add Custom Code" -->
<!-- 5. Select "Head" or "Body - end" -->
<!-- 6. Paste this code: -->

<script 
    async 
    src="https://trulybot.xyz/widget.js" 
    data-bot-id="YOUR_BOT_ID"
    data-position="right"
    data-color="#007bff"
    data-greeting="Hello! Welcome to our website!"
    data-theme="light">
</script>

<!-- Alternative: Use Wix's HTML embed element -->
<!-- 1. Add an HTML element to your page -->
<!-- 2. Paste the script code above -->
<!-- 3. The widget will appear on that page only -->`,

  webflow: `<!-- Webflow Integration -->
<!-- 1. Open your Webflow project -->
<!-- 2. Go to Project Settings > Custom Code -->
<!-- 3. In "Footer Code" section, add: -->

<script 
    async 
    src="https://trulybot.xyz/widget.js" 
    data-bot-id="YOUR_BOT_ID"
    data-position="right"
    data-color="#007bff"
    data-greeting="Hello! How can I help you today?"
    data-theme="light">
</script>

<!-- For page-specific installation: -->
<!-- 1. Select a page in the Designer -->
<!-- 2. Open Page Settings (gear icon) -->
<!-- 3. Go to Custom Code tab -->
<!-- 4. Add the script in "Before </body> tag" -->`,

  squarespace: `<!-- Squarespace Integration -->
<!-- 1. Go to Settings > Advanced > Code Injection -->
<!-- 2. In the "Footer" section, add: -->

<script 
    async 
    src="https://trulybot.xyz/widget.js" 
    data-bot-id="YOUR_BOT_ID"
    data-position="right"
    data-color="#007bff"
    data-greeting="Hello! Welcome to our site!"
    data-theme="light">
</script>

<!-- For Business/Commerce plans: -->
<!-- You can also add this to individual pages -->
<!-- Go to Pages > [Page] > Settings > Advanced > Page Header Code Injection -->`
};

const troubleshooting = [
  {
    problem: "Widget not appearing on my website",
    solutions: [
      "Ensure the script is placed before the closing </body> tag",
      "Check that data-bot-id is correctly set to your bot ID",
      "Verify there are no JavaScript errors in browser console",
      "Make sure your website allows external scripts to load"
    ]
  },
  {
    problem: "Widget shows 'refused to connect' error",
    solutions: [
      "This indicates iframe blocking - contact support if issue persists",
      "Check if your website has Content Security Policy blocking iframes",
      "Try clearing browser cache and cookies",
      "Ensure you're using the latest widget code"
    ]
  },
  {
    problem: "Widget appears but chat doesn't work",
    solutions: [
      "Verify your bot ID is correct and active",
      "Check network tab for failed API requests",
      "Ensure your bot has knowledge base content configured",
      "Try refreshing the page or testing in incognito mode"
    ]
  },
  {
    problem: "Widget position is wrong",
    solutions: [
      "Check data-position attribute (should be 'left' or 'right')",
      "Ensure there are no CSS conflicts with your website",
      "Try setting a different z-index if widget is hidden behind elements",
      "Check if your website has position: fixed elements conflicting"
    ]
  },
  {
    problem: "Widget color doesn't match my brand",
    solutions: [
      "Use data-color attribute with your brand hex color (e.g., #ff6b35)",
      "Ensure color format is valid hex code with # prefix",
      "Try using the widget customizer in dashboard for live preview",
      "Check if your website CSS is overriding widget styles"
    ]
  }
];

export default function WidgetEmbeddingDocs() {
  const [selectedPlatform, setSelectedPlatform] = useState('html');
  const [copiedCode, setCopiedCode] = useState('');

  const copyCode = async (code: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(platform);
      alert('Code copied to clipboard!');
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (error) {
      alert('Failed to copy code');
    }
  };

  const platforms = [
    { id: 'html', name: 'HTML/CSS', icon: '🌐' },
    { id: 'wordpress', name: 'WordPress', icon: '🔷' },
    { id: 'shopify', name: 'Shopify', icon: '🛒' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'nextjs', name: 'Next.js', icon: '▲' },
    { id: 'vue', name: 'Vue.js', icon: '💚' },
    { id: 'angular', name: 'Angular', icon: '🅰️' },
    { id: 'wix', name: 'Wix', icon: '🎨' },
    { id: 'webflow', name: 'Webflow', icon: '💙' },
    { id: 'squarespace', name: 'Squarespace', icon: '⬛' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Widget Embedding Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Add TrulyBot to any website in minutes. Choose your platform below for step-by-step instructions.
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 mb-12 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Quick Start</h2>
              <p className="text-blue-100">Get your widget running in under 5 minutes</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="font-semibold mb-1">Get Your Bot ID</h3>
                <p className="text-blue-100 text-sm">Found in your dashboard settings</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="font-semibold mb-1">Copy the Code</h3>
                <p className="text-blue-100 text-sm">Choose your platform and copy the script</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="font-semibold mb-1">Paste & Publish</h3>
                <p className="text-blue-100 text-sm">Add to your site and you're done!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Choose Your Platform
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedPlatform === platform.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-2">{platform.icon}</div>
                <div className="text-sm font-medium">{platform.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Code className="w-5 h-5" />
                {platforms.find(p => p.id === selectedPlatform)?.name} Integration
              </h3>
              <button
                onClick={() => copyCode(codeExamples[selectedPlatform as keyof typeof codeExamples], selectedPlatform)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copiedCode === selectedPlatform ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="p-0">
            <pre className="bg-gray-900 text-green-400 p-6 rounded-b-xl overflow-x-auto text-sm">
              <code>{codeExamples[selectedPlatform as keyof typeof codeExamples]}</code>
            </pre>
          </div>
        </div>

        {/* Configuration Options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configuration Options
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 font-semibold text-gray-900 dark:text-white">Attribute</th>
                    <th className="text-left py-3 font-semibold text-gray-900 dark:text-white">Required</th>
                    <th className="text-left py-3 font-semibold text-gray-900 dark:text-white">Options</th>
                    <th className="text-left py-3 font-semibold text-gray-900 dark:text-white">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-3 font-mono text-blue-600 dark:text-blue-400">data-bot-id</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                        Required
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">Your unique bot ID</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">Identifies your specific chatbot</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-blue-600 dark:text-blue-400">data-position</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        Optional
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">"left" | "right"</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">Widget position (default: "right")</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-blue-600 dark:text-blue-400">data-color</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        Optional
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">Hex color code</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">Button and accent color (default: "#007bff")</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-blue-600 dark:text-blue-400">data-greeting</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        Optional
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">Any text string</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">Welcome message shown to users</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-blue-600 dark:text-blue-400">data-theme</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        Optional
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">"light" | "dark"</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">Chat interface theme (default: "light")</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Troubleshooting
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {troubleshooting.map((item, index) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.problem}
                  </h4>
                  <ul className="space-y-1">
                    {item.solutions.map((solution, sIndex) => (
                      <li key={sIndex} className="text-gray-600 dark:text-gray-400 text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Book className="w-5 h-5" />
                Additional Resources
              </h3>
              <div className="space-y-3">
                <a
                  href="/dashboard/widget-customizer"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  Widget Customizer
                </a>
                <a
                  href="/widget-test-suite.html"
                  target="_blank"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  Test Suite
                </a>
                <a
                  href="/api/docs"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  API Documentation
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Need Help?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Can't find what you're looking for? Our support team is here to help you get your widget up and running.
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:support@trulybot.xyz"
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="/docs"
                  className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-center py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  View All Docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
