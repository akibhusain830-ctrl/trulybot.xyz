'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Copy, Download, Eye, Smartphone, Monitor, RefreshCw, Settings, Code, Palette, MessageCircle } from 'lucide-react';

interface WidgetConfig {
  botId: string;
  position: 'left' | 'right';
  color: string;
  greeting: string;
  theme: 'light' | 'dark';
  size: 'small' | 'medium' | 'large';
}

interface User {
  id: string;
  email: string;
}

const sizeSettings = {
  small: { width: '50px', height: '50px', fontSize: '20px' },
  medium: { width: '60px', height: '60px', fontSize: '24px' },
  large: { width: '70px', height: '70px', fontSize: '28px' }
};

const presetColors = [
  '#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1',
  '#e83e8c', '#fd7e14', '#20c997', '#6c757d', '#343a40'
];

export default function WidgetCustomizer() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<WidgetConfig>({
    botId: '',
    position: 'right',
    color: '#007bff',
    greeting: 'Hello! How can I help you today?',
    theme: 'light',
    size: 'medium'
  });
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [embedCode, setEmbedCode] = useState('');

  const supabase = require('@/lib/supabaseClient').supabase;

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    generateEmbedCode();
  }, [config, user]);

  const loadUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.error('Please sign in to customize your widget');
        return;
      }

      setUser(authUser);
      setConfig(prev => ({ ...prev, botId: authUser.id }));
    } catch (error) {
      console.error('Error loading user data:', error);
      console.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const generateEmbedCode = () => {
    if (!user) return;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trulybot.xyz';
    const code = `<script 
  async 
  src="${baseUrl}/widget.js" 
  data-bot-id="${config.botId}"
  data-position="${config.position}"
  data-color="${config.color}"
  data-greeting="${config.greeting}"
  data-theme="${config.theme}">
</script>`;

    setEmbedCode(code);
  };

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      alert('Embed code copied to clipboard!');
    } catch (error) {
      alert('Failed to copy embed code');
    }
  };

  const downloadEmbedCode = () => {
    const blob = new Blob([embedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trulybot-widget-embed.html';
    a.click();
    URL.revokeObjectURL(url);
    alert('Embed code downloaded!');
  };

  const testWidget = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trulybot.xyz';
    const testUrl = `${baseUrl}/widget-test-suite.html?botId=${config.botId}&position=${config.position}&color=${encodeURIComponent(config.color)}&greeting=${encodeURIComponent(config.greeting)}&theme=${config.theme}`;
    window.open(testUrl, '_blank');
  };

  const resetToDefaults = () => {
    setConfig({
      botId: user?.id || '',
      position: 'right',
      color: '#007bff',
      greeting: 'Hello! How can I help you today?',
      theme: 'light',
      size: 'medium'
    });
    alert('Settings reset to defaults');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access the widget customizer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Widget Customizer
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Customize your TrulyBot chat widget and generate embed code for your website.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Basic Settings
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Bot ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bot ID
                  </label>
                  <input
                    type="text"
                    value={config.botId}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Your unique bot identifier (automatically set)
                  </p>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position
                  </label>
                  <select
                    value={config.position}
                    onChange={(e) => setConfig(prev => ({ ...prev, position: e.target.value as 'left' | 'right' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="right">Bottom Right</option>
                    <option value="left">Bottom Left</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={config.theme}
                    onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Button Size
                  </label>
                  <select
                    value={config.size}
                    onChange={(e) => setConfig(prev => ({ ...prev, size: e.target.value as 'small' | 'medium' | 'large' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="small">Small (50px)</option>
                    <option value="medium">Medium (60px)</option>
                    <option value="large">Large (70px)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.color}
                      onChange={(e) => setConfig(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.color}
                      onChange={(e) => setConfig(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="#007bff"
                    />
                  </div>
                  
                  {/* Preset Colors */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preset Colors:</p>
                    <div className="flex flex-wrap gap-2">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setConfig(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded border-2 ${
                            config.color === color 
                              ? 'border-gray-900 dark:border-white' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Greeting Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Welcome Greeting
                  </label>
                  <textarea
                    value={config.greeting}
                    onChange={(e) => setConfig(prev => ({ ...prev, greeting: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your welcome message..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This message will be shown when users first open the chat
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={testWidget}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Test Widget
                  </button>
                  <button
                    onClick={resetToDefaults}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Preview Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Preview
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-2 rounded ${
                        previewMode === 'desktop'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title="Desktop Preview"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-2 rounded ${
                        previewMode === 'mobile'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title="Mobile Preview"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Area */}
              <div className="p-6">
                <div 
                  className={`relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${
                    previewMode === 'desktop' 
                      ? 'h-96' 
                      : 'h-[600px] w-80 mx-auto'
                  }`}
                  style={{
                    background: config.theme === 'dark' 
                      ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                    Your website content
                  </div>
                  
                  {/* Mock Chat Button */}
                  <div
                    className={`absolute bottom-5 ${
                      config.position === 'left' ? 'left-5' : 'right-5'
                    }`}
                  >
                    <button
                      className="rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: config.color,
                        width: sizeSettings[config.size].width,
                        height: sizeSettings[config.size].height,
                        fontSize: sizeSettings[config.size].fontSize
                      }}
                      title="Chat with us"
                    >
                      💬
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Embed Code */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Embed Code
                  </h2>
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                  >
                    {showCode ? 'Hide' : 'Show'} Code
                  </button>
                </div>
              </div>

              {showCode && (
                <div className="p-6">
                  <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                    <pre>{embedCode}</pre>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={copyEmbedCode}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </button>
                    <button
                      onClick={downloadEmbedCode}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>

                  {/* Installation Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      Installation Instructions:
                    </h3>
                    <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>1. Copy the embed code above</li>
                      <li>2. Paste it into your website's HTML, just before the closing &lt;/body&gt; tag</li>
                      <li>3. Save and publish your website</li>
                      <li>4. The chat widget will appear automatically</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Platform-Specific Instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Platform Guides
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'WordPress', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
                    { name: 'Shopify', color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
                    { name: 'React', color: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300' },
                    { name: 'HTML/CSS', color: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' },
                  ].map((platform) => (
                    <button
                      key={platform.name}
                      onClick={() => window.open('/docs/widget-embedding', '_blank')}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors hover:opacity-80 ${platform.color}`}
                    >
                      {platform.name}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Click any platform for detailed installation instructions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
