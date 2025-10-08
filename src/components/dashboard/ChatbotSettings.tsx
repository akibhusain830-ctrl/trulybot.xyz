'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchProfileSettings, saveProfileSettings, ProfileSettings } from '@/lib/api/dashboard';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';

export default function ChatbotSettings() {
  const { user } = useAuth();
  const [chatbotName, setChatbotName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
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
        <input
          type="text"
          value={chatbotName}
          onChange={(e) => setChatbotName(e.target.value)}
          maxLength={50}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter chatbot name"
        />
        <textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          maxLength={200}
          rows={3}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter welcome message"
        />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Accent Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-12 h-10 border border-slate-700 rounded cursor-pointer"
            />
            <span className="text-slate-400">{accentColor}</span>
          </div>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
