'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

interface SubscriptionStatus {
  tier: 'basic' | 'pro' | 'ultra' | 'trial';
  isActive: boolean;
  isTrial: boolean;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  daysRemaining: number | null;
  features: {
    canCustomizeName: boolean;
    canCustomizeWelcome: boolean;
    canCustomizeColor: boolean;
    canCustomizeLogo: boolean;
    canCustomizeTheme: boolean;
    canCustomizeCSS: boolean;
    maxKnowledgeItems: number;
    maxMessagesPerMonth: number;
  };
}

interface Settings {
  chatbot_name: string;
  welcome_message: string;
  accent_color: string;
  chatbot_logo_url: string;
  chatbot_theme: string;
  custom_css: string;
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [settings, setSettings] = useState<Settings>({
    chatbot_name: '',
    welcome_message: '',
    accent_color: '#2563EB',
    chatbot_logo_url: '',
    chatbot_theme: 'default',
    custom_css: ''
  });

  // Fetch subscription status from server
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch subscription status
        const subResponse = await fetch('/api/subscription/status');
        const subData = await subResponse.json();
        
        if (subData.success) {
          setSubscription(subData.subscription);
        }

        // Fetch current settings
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        
        if (settingsData.success) {
          setSettings(settingsData.settings);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Save settings with server-side validation
  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show specific error message from server
        alert(data.error || 'Failed to save settings');
        return;
      }

      alert('Settings saved successfully!');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Helper to check if feature is available
  const canUseFeature = (feature: keyof SubscriptionStatus['features']): boolean => {
    return subscription?.features[feature] as boolean || false;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chatbot Settings</h1>
        <p className="text-gray-600 mt-2">Customize your chatbot appearance and behavior</p>
        
        {/* Subscription Badge */}
        {subscription && (
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800">
            <span className="font-semibold">
              {subscription.isTrial ? 'Trial' : subscription.tier.toUpperCase()} Plan
            </span>
            {subscription.daysRemaining && (
              <span className="ml-2 text-sm">
                ({subscription.daysRemaining} days remaining)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        
        {/* Chatbot Name */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Chatbot Name
            </label>
            {!canUseFeature('canCustomizeName') && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Pro+ Required
              </span>
            )}
          </div>
          <input
            type="text"
            value={settings.chatbot_name}
            onChange={(e) => setSettings({ ...settings, chatbot_name: e.target.value })}
            disabled={!canUseFeature('canCustomizeName')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="My Chatbot"
          />
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Welcome Message
            </label>
            {!canUseFeature('canCustomizeWelcome') && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Pro+ Required
              </span>
            )}
          </div>
          <textarea
            value={settings.welcome_message}
            onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
            disabled={!canUseFeature('canCustomizeWelcome')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Hello! How can I help you today?"
          />
        </div>

        {/* Accent Color */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Accent Color
            </label>
            {!canUseFeature('canCustomizeColor') && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Ultra Required
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={settings.accent_color}
              onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
              disabled={!canUseFeature('canCustomizeColor')}
              className="h-10 w-20 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <input
              type="text"
              value={settings.accent_color}
              onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
              disabled={!canUseFeature('canCustomizeColor')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="#2563EB"
            />
          </div>
        </div>

        {/* Logo URL */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Chatbot Logo URL
            </label>
            {!canUseFeature('canCustomizeLogo') && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Ultra Required
              </span>
            )}
          </div>
          <input
            type="url"
            value={settings.chatbot_logo_url}
            onChange={(e) => setSettings({ ...settings, chatbot_logo_url: e.target.value })}
            disabled={!canUseFeature('canCustomizeLogo')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Theme */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Chatbot Theme
            </label>
            {!canUseFeature('canCustomizeTheme') && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Ultra Required
              </span>
            )}
          </div>
          <select
            value={settings.chatbot_theme}
            onChange={(e) => setSettings({ ...settings, chatbot_theme: e.target.value })}
            disabled={!canUseFeature('canCustomizeTheme')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="default">Default</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        {/* Custom CSS */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Custom CSS
            </label>
            {!canUseFeature('canCustomizeCSS') && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Ultra Required
              </span>
            )}
          </div>
          <textarea
            value={settings.custom_css}
            onChange={(e) => setSettings({ ...settings, custom_css: e.target.value })}
            disabled={!canUseFeature('canCustomizeCSS')}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder=".chatbot-container { /* your custom styles */ }"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Upgrade CTA */}
        {subscription && subscription.tier === 'basic' && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unlock More Customization
            </h3>
            <p className="text-gray-600 mb-4">
              Upgrade to Pro or Ultra to customize your chatbot's appearance and unlock advanced features.
            </p>
            <a
              href="/dashboard/billing"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Plans
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
