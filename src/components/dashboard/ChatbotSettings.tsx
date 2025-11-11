'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchProfileSettings, saveProfileSettings, ProfileSettings } from '@/lib/api/dashboard';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import { calculateSubscriptionAccess } from '@/lib/subscription';
import { getFeatureRestrictions, getUpgradeMessage } from '@/lib/featureRestrictions';

export default function ChatbotSettings() {
  const { user } = useAuth();
  const [chatbotName, setChatbotName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [saving, setSaving] = useState(false);
  const [userTier, setUserTier] = useState<string>('free');

  useEffect(() => {
    if (user) {
      // Get user subscription tier
      const userProfile = { id: user.id };
      const access = calculateSubscriptionAccess(userProfile);
      setUserTier(access.tier);

      fetchProfileSettings(user.id).then(settings => {
        if (settings) {
          setChatbotName(settings.chatbot_name || '');
          setWelcomeMessage(settings.welcome_message || '');
          setAccentColor(settings.accent_color || '#2563EB');
        }
      }).catch(err => {
        logger.error(err);
        toast.error('Failed to load chatbot settings.');
      });
    }
  }, [user]);

  const restrictions = getFeatureRestrictions(userTier as any);

  const handleSaveSettings = async () => {
    if (!user) return;
    setSaving(true);
    const settings: ProfileSettings = {
      chatbot_name: chatbotName,
      welcome_message: welcomeMessage,
      accent_color: accentColor,
    };
    try {
      await saveProfileSettings(user.id, settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      logger.error('Error saving settings', error);
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800">
      <h2 className="text-xl font-semibold">Customize Your Chatbot</h2>
      <p className="text-sm text-slate-400 mt-1">
        Change the appearance and behavior of your chatbot.
      </p>
      <div className="mt-4 space-y-4">
        {/* Chatbot Name */}
        <div className="relative">
          <input
            type="text"
            value={chatbotName}
            onChange={(e) => setChatbotName(e.target.value)}
            maxLength={50}
            disabled={!restrictions.canCustomizeName}
            className={`w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !restrictions.canCustomizeName ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder="Enter chatbot name"
          />
          {!restrictions.canCustomizeName && (
            <div className="mt-1 text-xs text-amber-400">
              🔒 {getUpgradeMessage(userTier as any, 'canCustomizeName')}
            </div>
          )}
        </div>

        {/* Welcome Message */}
        <div className="relative">
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            maxLength={200}
            rows={3}
            disabled={!restrictions.canCustomizeWelcomeMessage}
            className={`w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !restrictions.canCustomizeWelcomeMessage ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder="Enter welcome message"
          />
          {!restrictions.canCustomizeWelcomeMessage && (
            <div className="mt-1 text-xs text-amber-400">
              🔒 {getUpgradeMessage(userTier as any, 'canCustomizeWelcomeMessage')}
            </div>
          )}
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Accent Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              disabled={!restrictions.canChangeColors}
              className={`w-12 h-10 border border-slate-700 rounded cursor-pointer ${
                !restrictions.canChangeColors ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <span className="text-slate-400">{accentColor}</span>
          </div>
          {!restrictions.canChangeColors && (
            <div className="mt-1 text-xs text-amber-400">
              🔒 {getUpgradeMessage(userTier as any, 'canChangeColors')}
            </div>
          )}
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving || (!restrictions.canCustomizeName && !restrictions.canCustomizeWelcomeMessage && !restrictions.canChangeColors)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        
        {userTier === 'free' && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-amber-400">
              <span>⭐</span>
              <span className="font-medium">Upgrade to unlock customization</span>
            </div>
            <p className="text-sm text-amber-300/80 mt-1">
              Get Basic plan to customize your chatbot name and welcome message, or Pro plan for full customization including colors and logo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}