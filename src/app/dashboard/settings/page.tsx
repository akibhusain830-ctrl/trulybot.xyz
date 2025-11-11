'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';

interface ProfileSettings {
  chatbot_name: string;
  welcome_message: string;
  accent_color: string;
  chatbot_logo_url: string;
  chatbot_theme: string;
  custom_css: string;
}

interface SubscriptionInfo {
  plan_name: string;
  status: string;
  current_period_end: string;
  created_at: string;
}

interface TrialInfo {
  trial_end_date: string;
  is_trial_active: boolean;
  days_remaining: number;
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ProfileSettings>({
    chatbot_name: '',
    welcome_message: '',
    accent_color: '#2563EB',
    chatbot_logo_url: '',
    chatbot_theme: 'default',
    custom_css: ''
  });
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  // Helper function to get current subscription tier
  const getCurrentTier = (): 'basic' | 'pro' | 'ultra' | 'trial' => {
    if (!subscription) {
      // Check if user is in trial
      if (trialInfo?.is_trial_active) {
        return 'trial'; // Trial users are in trial mode
      }
      return 'basic';
    }
    
    const planName = subscription.plan_name?.toLowerCase() || '';
    if (planName.includes('ultra')) return 'ultra';
    if (planName.includes('pro')) return 'pro';
    return 'basic';
  };

  // Helper function to check if user is on trial
  const isOnTrial = (): boolean => {
    return !subscription && trialInfo?.is_trial_active === true;
  };

  // Helper function to check feature availability
  const canAccessFeature = (feature: 'name' | 'welcome' | 'color' | 'logo' | 'theme' | 'css'): boolean => {
    // Trial users get full Ultra plan features during trial
    if (isOnTrial()) {
      return true;
    }
    
    const tier = getCurrentTier();
    
    switch (feature) {
      case 'name':
      case 'welcome':
        return tier === 'pro' || tier === 'ultra';
      case 'color':
      case 'logo':
      case 'theme':
      case 'css':
        return tier === 'ultra';
      default:
        return false;
    }
  };

  const calculateTrialInfo = (trialEndDate: string): TrialInfo => {
    const endDate = new Date(trialEndDate);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    
    return {
      trial_end_date: trialEndDate,
      is_trial_active: daysRemaining > 0,
      days_remaining: daysRemaining
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || authLoading) return;
      
      setLoading(true);
      try {
        // Fetch profile settings and trial info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('chatbot_name, welcome_message, accent_color, chatbot_logo_url, chatbot_theme, custom_css, trial_ends_at, created_at')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching settings:', profileError);
        } else if (profileData) {
          setSettings({
            chatbot_name: profileData.chatbot_name || '',
            welcome_message: profileData.welcome_message || '',
            accent_color: profileData.accent_color || '#2563EB',
            chatbot_logo_url: profileData.chatbot_logo_url || '', // Load from database
            chatbot_theme: profileData.chatbot_theme || 'default', // Load from database
            custom_css: profileData.custom_css || '' // Load from database
          });

          // Check for trial information
          if (profileData.trial_ends_at) {
            const trial = calculateTrialInfo(profileData.trial_ends_at);
            setTrialInfo(trial);
          } else if (profileData.created_at) {
            // Fallback: calculate 7-day trial from profile creation date
            const createdDate = new Date(profileData.created_at);
            const trialEndDate = new Date(createdDate.getTime() + (7 * 24 * 60 * 60 * 1000));
            const trial = calculateTrialInfo(trialEndDate.toISOString());
            setTrialInfo(trial);
          }
        }

        // Fetch subscription info
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('plan_name, status, current_period_end, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subError && subError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subError);
        } else if (subData) {
          setSubscription(subData);
          // If user has a subscription, clear trial info
          setTrialInfo(null);
        }

        // If no subscription and no trial info from profile, try to get from auth user
        if (!subData && !profileData?.trial_ends_at && user.created_at) {
          const createdDate = new Date(user.created_at);
          const trialEndDate = new Date(createdDate.getTime() + (7 * 24 * 60 * 60 * 1000));
          const trial = calculateTrialInfo(trialEndDate.toISOString());
          setTrialInfo(trial);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, user?.created_at, authLoading]); // Added user.created_at dependency

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    const toastId = toast.loading('Saving settings...');
    
    try {
      console.log('Attempting to save settings:', settings);
      console.log('User ID:', user.id);

      // Only save columns that exist in the database
      const basicSettings = {
        chatbot_name: settings.chatbot_name,
        welcome_message: settings.welcome_message,
        accent_color: settings.accent_color
      };

      // Add advanced settings if user has access to them
      const advancedSettings: any = {};
      if (canAccessFeature('logo')) {
        advancedSettings.chatbot_logo_url = settings.chatbot_logo_url;
      }
      if (canAccessFeature('theme')) {
        advancedSettings.chatbot_theme = settings.chatbot_theme;
      }
      if (canAccessFeature('css')) {
        advancedSettings.custom_css = settings.custom_css;
      }

      const allSettings = { ...basicSettings, ...advancedSettings };

      console.log('Saving all settings:', allSettings);

      const { error } = await supabase
        .from('profiles')
        .update({
          ...allSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      toast.success('Settings saved successfully!', { id: toastId });
    } catch (error) {
      console.error('Error saving settings:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to save settings.';
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please enter and confirm your new password.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setChangingPassword(true);
    const toastId = toast.loading('Changing password...');

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully!', { id: toastId });
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password.', { id: toastId });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.');
      return;
    }

    setLogoUploading(true);
    const toastId = toast.loading('Uploading logo...');

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/logo-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('chatbot-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chatbot-assets')
        .getPublicUrl(fileName);

      // Update settings with new logo URL
      setSettings(prev => ({
        ...prev,
        chatbot_logo_url: publicUrl
      }));

      // Save logo URL to database immediately
      if (canAccessFeature('logo') && user?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            chatbot_logo_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error saving logo URL to database:', updateError);
          toast.error('Logo uploaded but failed to save. Please click "Save Settings".', { id: toastId });
          return;
        }
      }

      toast.success('Logo uploaded and saved successfully!', { id: toastId });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo.', { id: toastId });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!user?.id) return;

    try {
      // Update local state
      setSettings(prev => ({
        ...prev,
        chatbot_logo_url: ''
      }));

      // Save removal to database immediately if user has access
      if (canAccessFeature('logo')) {
        const { error } = await supabase
          .from('profiles')
          .update({
            chatbot_logo_url: '',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error removing logo from database:', error);
          toast.error('Failed to remove logo. Please try again.');
          return;
        }
      }

      toast.success('Logo removed successfully!');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Failed to remove logo. Please try again.');
    }
  };

  const handleInputChange = (field: keyof ProfileSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTrialStatus = (isActive: boolean) => {
    return isActive ? 'Active' : 'Expired';
  };

  // Show loading only when auth is loading
  if (authLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-8 text-slate-400">
          Loading...
        </div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-8 text-slate-400">
          Please log in to access settings.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toaster position="top-center" reverseOrder={false} />
      
      <h1 className="text-3xl font-bold tracking-tighter">Settings</h1>
      <p className="text-slate-400 mt-1">Manage your account and chatbot preferences.</p>

      <div className="mt-8 space-y-8">
        {/* Account Information */}
        <div className="p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base text-slate-400 cursor-not-allowed"
                />
                <button
                  onClick={() => toast.error('Email change not implemented yet. Contact support.')}
                  className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  Change Email
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Contact support to change your email address.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Account Created
              </label>
              <input
                type="text"
                value={user.created_at ? formatDate(user.created_at) : 'Unknown'}
                disabled
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base text-slate-400 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                TrulyBot User ID
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={user.id || ''}
                  disabled
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base text-slate-400 cursor-not-allowed font-mono text-sm"
                />
                <button
                  onClick={() => {
                    if (user?.id) {
                      navigator.clipboard.writeText(user.id);
                      toast.success('User ID copied to clipboard!');
                    }
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Use this ID when connecting stores to TrulyBot. Keep it private.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Information */}
        <div className="p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Subscription & Billing</h2>
          {loading ? (
            <div className="text-center py-4 text-slate-400">Loading subscription info...</div>
          ) : subscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Current Plan
                  </label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                    <span className="text-base font-medium text-blue-400 capitalize">
                      {subscription.plan_name}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                    <span className={`text-base font-medium capitalize ${
                      subscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Next Billing Date
                  </label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                    <span className="text-base text-slate-300">
                      {formatDate(subscription.current_period_end)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Subscribed Since
                  </label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                    <span className="text-base text-slate-300">
                      {formatDate(subscription.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => toast.error('Billing portal not implemented yet.')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Manage Billing
                </button>
                <button
                  onClick={() => toast.error('Plan changes not implemented yet.')}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  Change Plan
                </button>
              </div>
            </div>
          ) : trialInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Current Plan
                  </label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                    <span className="text-base font-medium text-blue-400 capitalize">
                      Free Trial
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                    <span className={`text-base font-medium capitalize ${
                      trialInfo.is_trial_active ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {formatTrialStatus(trialInfo.is_trial_active)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Trial Ends
                  </label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                    <span className="text-base text-slate-300">
                      {trialInfo.trial_end_date ? formatDate(trialInfo.trial_end_date) : 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Days Remaining
                  </label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                    <span className={`text-base font-medium ${
                      trialInfo.days_remaining > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trialInfo.days_remaining} {trialInfo.days_remaining === 1 ? 'day' : 'days'} left
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="mb-4">No active subscription found.</p>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View Plans
              </button>
            </div>
          )}
        </div>

        {/* Chatbot Customization Settings */}
        <div className="p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Chatbot Customization</h2>
          <p className="text-sm text-slate-400 mb-6">
            Customize your chatbot based on your subscription plan. 
            {getCurrentTier() === 'trial' && ' You have full access to all Ultra plan features during your trial! Upgrade to keep these customization options after your trial ends.'}
            {getCurrentTier() === 'basic' && ' Upgrade to Pro or Ultra to unlock customization features.'}
            {getCurrentTier() === 'pro' && ' Upgrade to Ultra to unlock advanced customization options.'}
            {getCurrentTier() === 'ultra' && ' You have access to all customization features!'}
          </p>
          
          {loading ? (
            <div className="text-center py-4 text-slate-400">Loading settings...</div>
          ) : (
            <>
              {/* Basic Information - Pro & Ultra Plans */}
              {(canAccessFeature('name') || canAccessFeature('welcome')) && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    {canAccessFeature('name') && (
                      <div>
                        <label htmlFor="chatbot_name" className="block text-sm font-medium text-slate-300 mb-1">
                          Chatbot Name
                        </label>
                        <input
                          id="chatbot_name"
                          type="text"
                          value={settings.chatbot_name}
                          onChange={(e) => handleInputChange('chatbot_name', e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Support Bot, Assistant"
                        />
                      </div>
                    )}

                    {canAccessFeature('welcome') && (
                      <div>
                        <label htmlFor="welcome_message" className="block text-sm font-medium text-slate-300 mb-1">
                          Welcome Message
                        </label>
                        <input
                          id="welcome_message"
                          type="text"
                          value={settings.welcome_message}
                          onChange={(e) => handleInputChange('welcome_message', e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Hello! How can I help you today?"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Visual Customization - Ultra Plan Only */}
              {canAccessFeature('color') && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Visual Customization
                    <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">Ultra</span>
                  </h3>
                  <div className="space-y-6">
                    {/* Accent Color */}
                    <div>
                      <label htmlFor="accent_color" className="block text-sm font-medium text-slate-300 mb-1">
                        Accent Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          id="accent_color"
                          type="color"
                          value={settings.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          className="w-12 h-10 p-1 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer"
                        />
                        <span className="text-sm text-slate-400">{settings.accent_color}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">This color will be used for buttons, links, and highlights in your chatbot.</p>
                    </div>

                    {/* Logo Upload */}
                    {canAccessFeature('logo') && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Custom Logo
                        </label>
                        <div className="space-y-3">
                          {settings.chatbot_logo_url ? (
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <Image 
                                  src={settings.chatbot_logo_url} 
                                  alt="⚡ Chatbot Logo - Lightning-Fast AI Assistant Branding" 
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 object-contain bg-slate-800 rounded-lg border border-slate-700"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-300">Logo uploaded successfully</p>
                                <button
                                  type="button"
                                  onClick={handleRemoveLogo}
                                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                  Remove Logo
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center">
                              <div className="mb-2">
                                <svg className="mx-auto h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <label htmlFor="logo-upload" className="cursor-pointer">
                                <span className="text-sm text-slate-300">Click to upload your logo</span>
                                <input
                                  id="logo-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoUpload}
                                  className="hidden"
                                  disabled={logoUploading}
                                />
                              </label>
                              <p className="text-xs text-slate-500 mt-1">PNG, JPG, or SVG. Max 5MB.</p>
                            </div>
                          )}
                          {logoUploading && (
                            <div className="text-center py-2">
                              <div className="text-sm text-blue-400">Uploading...</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Theme Selection */}
                    {canAccessFeature('theme') && (
                      <div>
                        <label htmlFor="chatbot_theme" className="block text-sm font-medium text-slate-300 mb-1">
                          Theme
                        </label>
                        <select
                          id="chatbot_theme"
                          value={settings.chatbot_theme}
                          onChange={(e) => handleInputChange('chatbot_theme', e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="default">Default</option>
                          <option value="minimal">Minimal</option>
                          <option value="corporate">Corporate</option>
                          <option value="friendly">Friendly</option>
                          <option value="modern">Modern</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Choose a pre-built theme for your chatbot's appearance.</p>
                      </div>
                    )}

                    {/* Custom CSS */}
                    {canAccessFeature('css') && (
                      <div>
                        <label htmlFor="custom_css" className="block text-sm font-medium text-slate-300 mb-1">
                          Custom CSS <span className="text-xs text-slate-500">(Advanced)</span>
                        </label>
                        <textarea
                          id="custom_css"
                          value={settings.custom_css}
                          onChange={(e) => handleInputChange('custom_css', e.target.value)}
                          rows={6}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="/* Add your custom CSS here */
.chatbot-container {
  border-radius: 12px;
}
.chatbot-message {
  font-family: 'Your Font', sans-serif;
}"
                        />
                        <p className="text-xs text-slate-500 mt-1">Add custom CSS to further customize your chatbot's appearance.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upgrade Prompts */}
              {getCurrentTier() === 'trial' && (
                <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Trial - Keep Your Customizations</h4>
                      <p className="text-slate-300 text-sm mt-1">
                        You're enjoying full Ultra features during your trial! Upgrade before your trial ends to keep all these customization options and ensure your branding remains active.
                      </p>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Upgrade to Keep Features
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {getCurrentTier() === 'basic' && (
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Unlock Chatbot Customization</h4>
                      <p className="text-slate-300 text-sm mt-1">
                        Upgrade to Pro to customize your chatbot's name and welcome message, or go Ultra for full branding control including logo, colors, and themes.
                      </p>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        View Pricing Plans
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {getCurrentTier() === 'pro' && (
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Unlock Advanced Branding</h4>
                      <p className="text-slate-300 text-sm mt-1">
                        Upgrade to Ultra to add your custom logo, brand colors, themes, and even custom CSS for complete control over your chatbot's appearance.
                      </p>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Upgrade to Ultra
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Password Change */}
        <div className="p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <p className="text-sm text-slate-400 mb-4">
            Set a new password for your account. Since you're already logged in, you don't need to enter your current password. This is helpful if you've forgotten your current password.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className="px-6 py-2.5 rounded-full font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-4 sm:p-6 bg-red-900/10 rounded-lg border border-red-800/30">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-200">Delete Account</h3>
                <p className="text-sm text-slate-400">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <button
                onClick={() => toast.error('Account deletion not implemented yet.')}
                className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 rounded-lg transition-colors border border-red-600/30"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}