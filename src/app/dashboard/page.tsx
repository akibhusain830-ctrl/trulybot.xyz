'use client';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect, useCallback, useRef } from 'react';
import KnowledgeBaseManager from '@/components/dashboard/KnowledgeBaseManager';
import { Toaster, toast } from 'react-hot-toast';
import { logSupabaseError } from '@/lib/utils/errorLogger';
import { buildEmbedSnippet } from '@/lib/utils/embedSnippet';

export default function DashboardPage() {
  const { user } = useAuth();
  const [chatbotName, setChatbotName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const unmountedRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('chatbot_name, welcome_message, accent_color')
        .eq('id', user.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && !unmountedRef.current) {
        setChatbotName(data.chatbot_name || '');
        setWelcomeMessage(data.welcome_message || '');
        setAccentColor(data.accent_color || '#2563EB');
      }
    } catch (error) {
      logSupabaseError('Error fetching profile', error);
      toast.error('Failed to fetch chatbot settings.');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const handleSaveSettings = async () => {
    if (!user) return;
    setSaving(true);
    const toastId = toast.loading('Saving settings...');
    try {
      const { error } = await supabase.from('profiles').update({
        chatbot_name: chatbotName,
        welcome_message: welcomeMessage,
        accent_color: accentColor,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);
      if (error) throw error;
      toast.success('Settings saved successfully!', { id: toastId });
    } catch (error) {
      logSupabaseError('Error saving settings', error);
      toast.error('Failed to save settings.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleCopySnippet = () => {
    if (!user) return;
    const snippet = buildEmbedSnippet(user.id);
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success('Snippet copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold tracking-tighter">Workbench</h1>
      <p className="text-slate-400 mt-1">Manage and customize your chatbot.</p>

      <div className="mt-8 p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800">
        <h2 className="text-xl font-semibold">Embed Chatbot on Your Website</h2>
        <p className="text-sm text-slate-400 mt-1">
          Copy and paste this snippet into the `&lt;head&gt;` tag of your website&apos;s HTML.
        </p>
        <div className="mt-4 p-4 bg-slate-950 rounded-md relative">
          <pre className="text-sm text-slate-300 overflow-x-auto">
            <code>
              {user ? buildEmbedSnippet(user.id) : 'Loading snippet...'}
            </code>
          </pre>
          <button
            onClick={handleCopySnippet}
            disabled={!user}
            className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <KnowledgeBaseManager />

      <div className="mt-8 p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800">
        <h2 className="text-xl font-semibold">Chatbot Appearance</h2>
        <p className="text-sm text-slate-400 mt-1">Customize the look and feel of your chatbot widget.</p>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="chatbotName" className="block text-sm font-medium text-slate-300 mb-1">Chatbot Name</label>
            <input
              id="chatbotName"
              type="text"
              value={chatbotName}
              onChange={(e) => setChatbotName(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Support Bot"
            />
          </div>
          <div>
            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-slate-300 mb-1">Welcome Message</label>
            <input
              id="welcomeMessage"
              type="text"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Hello! How can I help you today?"
            />
          </div>
          <div>
            <label htmlFor="accentColor" className="block text-sm font-medium text-slate-300 mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                id="accentColor"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 p-1 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-sm text-slate-400">{accentColor}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2.5 rounded-full font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}