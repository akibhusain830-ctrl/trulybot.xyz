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

interface ProfileSubscription {
  subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise';
  subscription_status: 'none' | 'trial' | 'active' | 'expired' | 'cancelled';
  subscription_ends_at?: string;
  trial_ends_at?: string;
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
  const [profileSubscription, setProfileSubscription] = useState<ProfileSubscription | null>(null);
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [monthlyConversations, setMonthlyConversations] = useState<number | null>(null);
  const [conversationCap, setConversationCap] = useState<number | null>(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [chatBubbleIcon, setChatBubbleIcon] = useState<string>('lightning');

  const IconSVG = ({ name, size = 18, selected = false }: { name: string; size?: number; selected?: boolean }) => {
    const common = {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
    };
    const stroke = selected ? '#60A5FA' : '#CBD5E1';
    if (name === 'lightning') {
      return (
        <svg {...common}>
          <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" fill={stroke} />
        </svg>
      );
    }
    if (name === 'chat') {
      return (
        <svg {...common}>
          <path d="M4 6a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H9l-5 4V6z" stroke={stroke} strokeWidth={1.6} />
          <circle cx="9" cy="10" r="1.5" fill={stroke} />
          <circle cx="13" cy="10" r="1.5" fill={stroke} />
          <circle cx="17" cy="10" r="1.5" fill={stroke} />
        </svg>
      );
    }
    if (name === 'robot') {
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="12" rx="3" stroke={stroke} strokeWidth={1.6} />
          <circle cx="9" cy="13" r="1.8" fill={stroke} />
          <circle cx="15" cy="13" r="1.8" fill={stroke} />
          <rect x="11" y="3" width="2" height="3" fill={stroke} />
        </svg>
      );
    }
    if (name === 'message') {
      return (
        <svg {...common}>
          <path d="M3 5h18v12H9l-6 4V5z" stroke={stroke} strokeWidth={1.6} />
          <path d="M6 9h12M6 12h8" stroke={stroke} strokeWidth={1.6} />
        </svg>
      );
    }
    if (name === 'spark') {
      return (
        <svg {...common}>
          <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" fill={stroke} />
        </svg>
      );
    }
    if (name === 'help') {
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={1.6} />
          <path d="M9.5 9a2.5 2.5 0 115 0c0 1.5-1.2 2-2 2.5v1" stroke={stroke} strokeWidth={1.6} />
          <circle cx="12" cy="17" r="1" fill={stroke} />
        </svg>
      );
    }
    return null;
  };

  // Helper function to get current subscription tier
  const getCurrentTier = (): 'free' | 'basic' | 'pro' | 'enterprise' | 'trial' => {
    // First check if user is in trial
    if (trialInfo?.is_trial_active) {
      return 'trial'; // Trial users are in trial mode
    }
    
    // Check profile subscription tier first (this is the primary source of truth)
    if (profileSubscription?.subscription_tier) {
      const profileTier = profileSubscription.subscription_tier.toLowerCase();
      if (profileTier === 'free') return 'free';
      if (profileTier === 'basic') return 'basic';
      if (profileTier === 'pro') return 'pro';
      if (profileTier === 'enterprise') return 'enterprise';
    }
    
    // Fallback to subscriptions table if available
    if (subscription) {
      const planName = subscription.plan_name?.toLowerCase() || '';
      if (planName.includes('enterprise')) return 'enterprise';
      if (planName.includes('pro')) return 'pro';
      return 'basic';
    }
    
    // Default to free tier for users with no subscription data
    return 'free';
  };

  // Helper function to check if user is on trial
  const isOnTrial = (): boolean => {
    return !subscription && trialInfo?.is_trial_active === true;
  };

  // Helper function to check feature availability
  const canAccessFeature = (feature: 'name' | 'welcome' | 'color' | 'logo' | 'theme' | 'css'): boolean => {
    // Trial users get full Enterprise plan features during trial
    if (isOnTrial()) {
      return true;
    }
    
    const tier = getCurrentTier();
    
    switch (feature) {
      case 'name':
      case 'welcome':
        return tier === 'pro' || tier === 'enterprise';
      case 'color':
      case 'logo':
      case 'theme':
      case 'css':
        return tier === 'enterprise';
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
        // Fetch profile settings including subscription data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('chatbot_name, welcome_message, accent_color, chatbot_logo_url, chatbot_theme, custom_css, chat_bubble_icon, trial_ends_at, subscription_tier, subscription_status, subscription_ends_at, created_at')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching settings:', profileError);
        } else if (profileData) {
          setSettings({
            chatbot_name: profileData.chatbot_name || '',
            welcome_message: profileData.welcome_message || '',
            accent_color: profileData.accent_color || '#2563EB',
            chatbot_logo_url: profileData.chatbot_logo_url || '',
            chatbot_theme: profileData.chatbot_theme || 'default',
            custom_css: profileData.custom_css || ''
          });
          setChatBubbleIcon(profileData.chat_bubble_icon || 'lightning');

          // Set profile subscription data
          const finalSubscriptionStatus = profileData.subscription_tier === 'free' && 
            (profileData.subscription_status === 'expired' || profileData.subscription_status === 'none')
            ? 'active' 
            : profileData.subscription_status || 'none';
          
          setProfileSubscription({
            subscription_tier: profileData.subscription_tier || 'free',
            subscription_status: finalSubscriptionStatus,
            subscription_ends_at: profileData.subscription_ends_at,
            trial_ends_at: profileData.trial_ends_at
          });

          console.log('Profile subscription data:', {
            tier: profileData.subscription_tier,
            status: profileData.subscription_status,
            finalStatus: finalSubscriptionStatus,
            trial_ends_at: profileData.trial_ends_at
          });

          // Check for trial information
          if (profileData.trial_ends_at && profileData.subscription_status === 'trial') {
            const trial = calculateTrialInfo(profileData.trial_ends_at);
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
        }

        // Ensure a sensible default when profile data is missing
        if (!profileData) {
          setProfileSubscription({
            subscription_tier: 'free',
            subscription_status: 'active'
          });
        }

        setUsageLoading(true);
        try {
          const res = await fetch('/api/usage');
          if (res.ok) {
            const data = await res.json();
            setMonthlyConversations(data.monthly_conversations ?? 0);
            setConversationCap(data.monthly_conversation_cap ?? null);
          }
        } catch {}
        setUsageLoading(false);

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

      const allSettings = { ...basicSettings, ...advancedSettings, chat_bubble_icon: chatBubbleIcon };

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
          ) : profileSubscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Current Plan
                  </label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                    <span className="text-base font-medium text-blue-400 capitalize">
                      {profileSubscription.subscription_tier === 'free' ? 'Free' : 
                       profileSubscription.subscription_tier === 'basic' ? 'Basic' :
                       profileSubscription.subscription_tier === 'pro' ? 'Pro' :
                       profileSubscription.subscription_tier === 'enterprise' ? 'Enterprise' : 'Free'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                    <span className={`text-base font-medium capitalize ${
                      profileSubscription.subscription_status === 'active' ? 'text-green-400' : 
                      profileSubscription.subscription_status === 'trial' ? 'text-blue-400' :
                      profileSubscription.subscription_status === 'expired' ? 'text-red-400' :
                      profileSubscription.subscription_status === 'cancelled' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {profileSubscription.subscription_status === 'trial' && trialInfo?.is_trial_active ? 'Active Trial' :
                       profileSubscription.subscription_status === 'trial' && !trialInfo?.is_trial_active ? 'Expired' :
                       profileSubscription.subscription_status === 'active' ? 'Active' :
                       profileSubscription.subscription_status === 'expired' ? 'Expired' :
                       profileSubscription.subscription_status === 'cancelled' ? 'Cancelled' : 'Active'}
                    </span>
                  </div>
                </div>
                
                {/* Show trial end date if on trial */}
                {profileSubscription.subscription_status === 'trial' && trialInfo && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Plan Ends At
                      </label>
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                        <span className="text-base text-slate-300">
                          {formatDate(trialInfo.trial_end_date)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Days Remaining
                      </label>
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                        <span className={`text-base font-medium ${
                          trialInfo.days_remaining > 3 ? 'text-green-400' : 
                          trialInfo.days_remaining > 0 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {trialInfo.days_remaining} {trialInfo.days_remaining === 1 ? 'day' : 'days'} left
                        </span>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Show never expires for free plan */}
                {profileSubscription.subscription_tier === 'free' && profileSubscription.subscription_status !== 'trial' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Plan Ends At
                    </label>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                      <span className="text-base text-green-400 font-medium">
                        Never Expires
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Show subscription end date if active paid plan */}
                {profileSubscription.subscription_status === 'active' && profileSubscription.subscription_tier !== 'free' && profileSubscription.subscription_ends_at && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Plan Ends At
                    </label>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                      <span className="text-base text-slate-300">
                        {formatDate(profileSubscription.subscription_ends_at)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Replies (Monthly)</label>
                {usageLoading ? (
                  <div className="text-slate-400 text-sm">Loading usage...</div>
                ) : (
                  <div className="w-full bg-slate-800/40 border border-slate-700/60 rounded-lg p-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>Replies (Monthly)</span>
                      <span className="text-slate-300">
                        {(monthlyConversations ?? 0).toLocaleString()} / {((conversationCap ?? (profileSubscription.subscription_tier === 'free' ? 300 : null)) ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded bg-slate-800 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={(conversationCap ?? (profileSubscription.subscription_tier === 'free' ? 300 : 0)) || 0} aria-valuenow={monthlyConversations ?? 0}>
                      <div
                        className={`h-full transition-all duration-500 ${(((monthlyConversations ?? 0) / ((conversationCap ?? (profileSubscription.subscription_tier === 'free' ? 300 : 0)) || 1)) >= 0.95) ? 'bg-red-600' : (((monthlyConversations ?? 0) / ((conversationCap ?? (profileSubscription.subscription_tier === 'free' ? 300 : 0)) || 1)) >= 0.8) ? 'bg-amber-500' : 'bg-indigo-600'}`}
                        style={{ width: `${Math.min(100, (((monthlyConversations ?? 0) / ((conversationCap ?? (profileSubscription.subscription_tier === 'free' ? 300 : 0)) || 1)) * 100)).toFixed(2)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                {profileSubscription.subscription_tier === 'free' || 
                 (profileSubscription.subscription_status === 'trial' && trialInfo && !trialInfo.is_trial_active) ? (
                  <button
                    onClick={() => window.location.href = '/#pricing'}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Upgrade Now
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => window.location.href = '/#pricing'}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Change Plan
                    </button>
                    <button
                      onClick={() => toast('Contact support to manage your subscription: support@trulybot.xyz', { duration: 5000 })}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                    >
                      Manage Billing
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="mb-4">Loading subscription information...</p>
            </div>
          )}
        </div>

        {/* Chatbot Customization Settings */}
        <div className="p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Chatbot Customization</h2>
          <p className="text-sm text-slate-400 mb-6">
            Customize your chatbot based on your subscription plan. 
            {getCurrentTier() === 'trial' && ' You have full access to all Enterprise plan features during your trial! Upgrade to keep these customization options after your trial ends.'}
            {getCurrentTier() === 'basic' && ' Upgrade to Pro or Enterprise to unlock customization features.'}
            {getCurrentTier() === 'pro' && ' Upgrade to Enterprise to unlock advanced customization options.'}
            {getCurrentTier() === 'enterprise' && ' You have access to all customization features!'}
          </p>
          
          {loading ? (
            <div className="text-center py-4 text-slate-400">Loading settings...</div>
          ) : (
            <>
              {(!canAccessFeature('name') && !canAccessFeature('welcome') && !canAccessFeature('color') && !canAccessFeature('logo') && !canAccessFeature('theme') && !canAccessFeature('css')) && (
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
                  <p className="text-slate-300 text-sm">Upgrade to unlock full customization (name, welcome, logo, colors, themes).</p>
                  <button onClick={() => window.location.href = '/pricing'} className="mt-3 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">Upgrade Now</button>
                </div>
              )}
              {/* Basic Information - Pro & Enterprise Plans */}
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

              {/* Chat Icon - available for all plans */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Chat Icon
                  <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">All Plans</span>
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {['lightning','chat','robot','message','spark','help'].map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setChatBubbleIcon(icon)}
                        className={`flex items-center justify-center w-12 h-12 rounded-lg border ${chatBubbleIcon === icon ? 'border-blue-500 ring-2 ring-blue-400 bg-blue-900/25' : 'border-slate-700 bg-slate-800/60'} text-slate-200 hover:border-blue-400 transition-all`}
                        aria-pressed={chatBubbleIcon === icon}
                        aria-label={icon}
                        title={icon}
                      >
                        <IconSVG name={icon} selected={chatBubbleIcon === icon} />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Icon selection is available for all plans.</p>
                </div>
              </div>

              {/* Visual Customization - Enterprise Plan Only */}
              {canAccessFeature('color') && (
              <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Visual Customization
                    <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">Enterprise</span>
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

              {/* Chat Icon - available for all plans */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Chat Icon
                  <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">All Plans</span>
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {['lightning','chat','robot','message','spark','help'].map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setChatBubbleIcon(icon)}
                        className={`px-3 py-2 rounded-lg border ${chatBubbleIcon === icon ? 'border-blue-500 bg-blue-900/30' : 'border-slate-700 bg-slate-800/50'} text-sm text-slate-200`}
                        aria-pressed={chatBubbleIcon === icon}
                      >
                        {icon === 'lightning' && '⚡'}
                        {icon === 'chat' && '💬'}
                        {icon === 'robot' && '🤖'}
                        {icon === 'message' && '✉️'}
                        {icon === 'spark' && '✨'}
                        {icon === 'help' && '❓'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Icon selection is available for all plans.</p>
                </div>
              </div>

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
                        You're enjoying full Enterprise features during your trial! Upgrade before your trial ends to keep all these customization options and ensure your branding remains active.
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
                        Upgrade to Pro to customize your chatbot's name and welcome message, or go Enterprise for full branding control including logo, colors, and themes.
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
                        Upgrade to Enterprise to add your custom logo, brand colors, themes, and even custom CSS for complete control over your chatbot's appearance.
                      </p>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Upgrade to Enterprise
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
