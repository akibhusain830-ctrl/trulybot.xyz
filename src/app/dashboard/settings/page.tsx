'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

interface ProfileSettings {
  chatbot_name: string;
  welcome_message: string;
  accent_color: string;
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
    accent_color: '#2563EB'
  });
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

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
          .select('chatbot_name, welcome_message, accent_color, trial_ends_at, created_at')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching settings:', profileError);
        } else if (profileData) {
          setSettings({
            chatbot_name: profileData.chatbot_name || '',
            welcome_message: profileData.welcome_message || '',
            accent_color: profileData.accent_color || '#2563EB'
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
  }, [user?.id, authLoading]); // Removed trialInfo from dependencies

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    const toastId = toast.loading('Saving settings...');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...settings
        });

      if (error) throw error;

      toast.success('Settings saved successfully!', { id: toastId });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields.');
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
        currentPassword: '',
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

        {/* Chatbot Settings */}
        <div className="p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Chatbot Settings</h2>
          {loading ? (
            <div className="text-center py-4 text-slate-400">Loading settings...</div>
          ) : (
            <>
              <div className="space-y-4">
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
                </div>
              </div>

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
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
            </div>

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