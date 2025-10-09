'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { 
  UserIcon, 
  CogIcon, 
  PaintBrushIcon, 
  PhotoIcon,
  EyeIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

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

interface UserProfile {
  email: string;
  full_name: string;
  avatar_url: string;
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: '',
    full_name: '',
    avatar_url: ''
  });
  const [settings, setSettings] = useState<Settings>({
    chatbot_name: '',
    welcome_message: '',
    accent_color: '#3B82F6',
    chatbot_logo_url: '',
    chatbot_theme: 'default',
    custom_css: ''
  });
  
  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });
  
  // Logo upload states
  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  // Fetch subscription status and settings from server
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

        // Fetch user profile
        const profileResponse = await fetch('/api/user/profile');
        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          setUserProfile(profileData.profile);
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

  // Save chatbot settings
  const handleSaveSettings = async () => {
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

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to change password');
        return;
      }

      alert('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Handle email change
  const handleEmailChange = async () => {
    if (!emailForm.newEmail || !emailForm.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch('/api/user/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          password: emailForm.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to change email');
        return;
      }

      alert('Email change confirmation sent! Check your new email address.');
      setEmailForm({ newEmail: '', password: '' });
      
    } catch (error) {
      console.error('Error changing email:', error);
      alert('Failed to change email');
    } finally {
      setSaving(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    try {
      setLogoUploading(true);
      
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to upload logo');
        return;
      }

      setSettings({ ...settings, chatbot_logo_url: data.url });
      alert('Logo uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  // Helper to check if feature is available
  const canUseFeature = (feature: keyof SubscriptionStatus['features']): boolean => {
    return subscription?.features[feature] as boolean || false;
  };

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'account', name: 'Account', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-gray-300">Please log in to access settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account and chatbot configuration</p>
          
          {/* Subscription Badge */}
          {subscription && (
            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              
              {/* Chatbot Name */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-200">
                    Chatbot Name
                  </label>
                  {!canUseFeature('canCustomizeName') && (
                    <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded border border-yellow-600/30">
                      Pro+ Required
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={settings.chatbot_name}
                  onChange={(e) => setSettings({ ...settings, chatbot_name: e.target.value })}
                  disabled={!canUseFeature('canCustomizeName')}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800 disabled:cursor-not-allowed text-white placeholder-gray-400"
                  placeholder="My Chatbot"
                />
              </div>

              {/* Welcome Message */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-200">
                    Welcome Message
                  </label>
                  {!canUseFeature('canCustomizeWelcome') && (
                    <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded border border-yellow-600/30">
                      Pro+ Required
                    </span>
                  )}
                </div>
                <textarea
                  value={settings.welcome_message}
                  onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                  disabled={!canUseFeature('canCustomizeWelcome')}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800 disabled:cursor-not-allowed text-white placeholder-gray-400"
                  placeholder="Hello! How can I help you today?"
                />
              </div>

              {/* Accent Color */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-200">
                    Accent Color
                  </label>
                  {!canUseFeature('canCustomizeColor') && (
                    <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30">
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
                    className="h-12 w-20 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 bg-gray-700 border border-gray-600"
                  />
                  <input
                    type="text"
                    value={settings.accent_color}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    disabled={!canUseFeature('canCustomizeColor')}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800 disabled:cursor-not-allowed text-white placeholder-gray-400"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-200">
                    Chatbot Logo
                  </label>
                  {!canUseFeature('canCustomizeLogo') && (
                    <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30">
                      Ultra Required
                    </span>
                  )}
                </div>
                
                {/* Current Logo Preview */}
                {settings.chatbot_logo_url && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Current Logo:</p>
                    <img 
                      src={settings.chatbot_logo_url} 
                      alt="Current chatbot logo" 
                      className="w-16 h-16 object-contain bg-gray-700 rounded-lg border border-gray-600"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      ref={logoFileRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      disabled={!canUseFeature('canCustomizeLogo') || logoUploading}
                      className="hidden"
                    />
                    <button
                      onClick={() => logoFileRef.current?.click()}
                      disabled={!canUseFeature('canCustomizeLogo') || logoUploading}
                      className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                      <PhotoIcon className="h-5 w-5 mr-2" />
                      {logoUploading ? 'Uploading...' : 'Upload Logo'}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      Recommended: 64x64px, PNG or JPG, max 2MB
                    </p>
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Or enter logo URL:</label>
                    <input
                      type="url"
                      value={settings.chatbot_logo_url}
                      onChange={(e) => setSettings({ ...settings, chatbot_logo_url: e.target.value })}
                      disabled={!canUseFeature('canCustomizeLogo')}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800 disabled:cursor-not-allowed text-white placeholder-gray-400"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </div>

              {/* Theme */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-200">
                    Chatbot Theme
                  </label>
                  {!canUseFeature('canCustomizeTheme') && (
                    <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30">
                      Ultra Required
                    </span>
                  )}
                </div>
                <select
                  value={settings.chatbot_theme}
                  onChange={(e) => setSettings({ ...settings, chatbot_theme: e.target.value })}
                  disabled={!canUseFeature('canCustomizeTheme')}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800 disabled:cursor-not-allowed text-white"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              {/* Custom CSS */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-200">
                    Custom CSS
                  </label>
                  {!canUseFeature('canCustomizeCSS') && (
                    <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30">
                      Ultra Required
                    </span>
                  )}
                </div>
                <textarea
                  value={settings.custom_css}
                  onChange={(e) => setSettings({ ...settings, custom_css: e.target.value })}
                  disabled={!canUseFeature('canCustomizeCSS')}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-800 disabled:cursor-not-allowed text-white placeholder-gray-400"
                  placeholder=".chatbot-container { /* your custom styles */ }"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? 'Saving...' : 'Save Appearance Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              
              {/* Current Profile Info */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Profile Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Current Email</label>
                    <p className="text-white bg-gray-700 px-4 py-3 rounded-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Account Created</label>
                    <p className="text-white bg-gray-700 px-4 py-3 rounded-lg">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Email */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Change Email Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">New Email Address</label>
                    <input
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="new@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Current Password (for verification)</label>
                    <input
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Your current password"
                    />
                  </div>
                  <button
                    onClick={handleEmailChange}
                    disabled={saving || !emailForm.newEmail || !emailForm.password}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {saving ? 'Sending...' : 'Change Email'}
                  </button>
                  <p className="text-xs text-gray-400">
                    A confirmation email will be sent to your new address.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* Change Password */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Your current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="Confirm your new password"
                    />
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>

              {/* Security Information */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Security Information
                </h3>
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Your account is protected with enterprise-grade security</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>All data is encrypted in transit and at rest</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Sessions automatically expire for security</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade CTA */}
          {subscription && subscription.tier === 'basic' && (
            <div className="mt-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-6 border border-blue-600/20">
              <h3 className="text-lg font-semibold text-white mb-2">
                Unlock More Customization
              </h3>
              <p className="text-gray-300 mb-4">
                Upgrade to Pro or Ultra to customize your chatbot's appearance and unlock advanced features.
              </p>
              <a
                href="/pricing"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Plans
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
