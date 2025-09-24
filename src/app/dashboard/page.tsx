'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { BRAND } from '@/lib/branding';

interface Document {
  id: string;
  content: string;
  filename?: string | null;
  created_at: string;
  status?: 'PENDING' | 'INDEXED' | 'FAILED' | null;
}

function logSupabaseError(context: string, err: unknown) {
  if (!err) {
    console.error(`${context}: <empty error>`);
    return;
  }
  if (err instanceof Error) {
    console.error(`${context}:`, { message: err.message, stack: err.stack, name: err.name });
    return;
  }
  try {
    console.error(`${context}:`, JSON.parse(JSON.stringify(err)));
  } catch {
    console.error(`${context}:`, err);
  }
}

const StatusBadge = ({ status }: { status: Document['status'] }) => {
  const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full';
  switch (status) {
    case 'INDEXED':
      return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>Ready</span>;
    case 'PENDING':
      return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}>Processing</span>;
    case 'FAILED':
      return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>Failed</span>;
    default:
      return null;
  }
};

// Build the embed snippet using the single source of truth BRAND
function buildEmbedSnippet(botId: string) {
  const base = (() => {
    try {
      const u = new URL(BRAND.url || 'https://trulybot.xyz');
      // Strip trailing slash just in case
      return `${u.origin}`;
    } catch {
      return 'https://trulybot.xyz';
    }
  })();
  const src = `${base}/widget.js`;
  const safeBotId = botId || 'demo';
  return `<script src="${src}" data-bot-id="${safeBotId}" defer></script>`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [chatbotName, setChatbotName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const unmountedRef = useRef(false);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoadingDocs(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, content, filename, created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!unmountedRef.current) setDocuments(data || []);
    } catch (error) {
      logSupabaseError('Error fetching documents', error);
      if (!unmountedRef.current) setMessage('Failed to fetch documents.');
    } finally {
      if (!unmountedRef.current) setLoadingDocs(false);
    }
  }, [user]);

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
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchProfile();
    } else {
      setDocuments([]);
    }
  }, [user, fetchDocuments, fetchProfile]);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const handleUpload = async (textToUpload: string, nameOfFile: string) => {
    if (!textToUpload || !user || !nameOfFile.trim()) {
      setMessage('File name and content are required.');
      return false;
    }
    setUploading(true);
    setMessage('');
    try {
      const res = await fetch('/api/text-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToUpload, filename: nameOfFile }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || `Upload failed (${res.status})`);
      return true;
    } catch (error) {
      logSupabaseError('Upload error', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during upload.';
      setMessage(`Error: ${errorMessage}`);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleNewUpload = async () => {
    const success = await handleUpload(pastedText, fileName);
    if (success) {
      setMessage('Text uploaded and indexed successfully!');
      setPastedText('');
      setFileName('');
      await fetchDocuments();
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document? This will remove it from your chatbot's knowledge base.")) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete the document.');
      setMessage('Document deleted successfully.');
      await fetchDocuments();
    } catch (error) {
      logSupabaseError('Error deleting document', error);
      setMessage('Failed to delete document.');
    }
  };

  const startEdit = (doc: Document) => {
    setEditingDocId(doc.id);
    setEditingContent(doc.content);
  };

  const saveEdit = async () => {
    if (!user || editingDocId === null) return;
    setUploading(true);
    setMessage('Re-indexing document...');
    try {
      const deleteRes = await fetch(`/api/documents/${editingDocId}`, { method: 'DELETE' });
      if (!deleteRes.ok) throw new Error('Failed to remove the old version of the document.');
      const currentDoc = documents.find((d) => d.id === editingDocId);
      const success = await handleUpload(editingContent, currentDoc?.filename || 'Untitled');
      if (success) {
        setMessage('Document updated and re-indexed successfully!');
        setEditingDocId(null);
        setEditingContent('');
        await fetchDocuments();
      } else {
        throw new Error('Failed to re-index the new content.');
      }
    } catch (error) {
      logSupabaseError('Error updating document', error);
      setMessage('Failed to update document.');
    } finally {
      setUploading(false);
    }
  };

  const cancelEdit = () => {
    setEditingDocId(null);
    setEditingContent('');
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        chatbot_name: chatbotName,
        welcome_message: welcomeMessage,
        accent_color: accentColor,
      });
      if (error) throw error;
      setSaveMessage('Settings saved successfully!');
    } catch (error) {
      logSupabaseError('Error saving settings', error);
      setSaveMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopySnippet = () => {
    if (!user) return;
    const snippet = buildEmbedSnippet(user.id);
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold tracking-tighter">Workbench</h1>
      <p className="text-slate-400 mt-1">Manage and customize your chatbot.</p>

      <div className="mt-8 p-6 bg-slate-900/50 rounded-lg border border-slate-800">
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

      <div className="mt-8 p-6 bg-slate-900/50 rounded-lg border border-slate-800">
        <h2 className="text-xl font-semibold">Add to Knowledge Base</h2>
        <p className="text-sm text-slate-400 mt-1">
          Paste your business information or FAQs into the text box below.
        </p>
        <div className="mt-4 space-y-4">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            maxLength={100}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="File name (e.g., FAQs, Pricing, About Us)..."
            autoComplete="off"
          />
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            rows={8}
            placeholder="Paste your content here..."
            style={{ minHeight: '150px', resize: 'vertical' }}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleNewUpload}
            disabled={!pastedText || uploading || !fileName.trim()}
            className={`px-6 py-2.5 rounded-full font-semibold text-base ${
              !pastedText || !fileName.trim() || uploading
                ? 'bg-slate-400 text-slate-700 opacity-60 cursor-not-allowed'
                : 'bg-slate-50 text-black hover:bg-slate-200'
            } transition-colors`}
          >
            {uploading ? 'Processing...' : 'Upload Text'}
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-slate-400">{message}</p>}
      </div>

      <div className="mt-8 p-6 bg-slate-900/50 rounded-lg border border-slate-800">
        <h2 className="text-xl font-semibold">Chatbot Customization</h2>
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="chatbotName" className="text-sm font-medium text-slate-300">Chatbot Name</label>
            <input
              type="text"
              id="chatbotName"
              value={chatbotName}
              onChange={(e) => setChatbotName(e.target.value)}
              className="mt-1 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="e.g., Trulybot Support"
            />
          </div>
          <div>
            <label htmlFor="welcomeMessage" className="text-sm font-medium text-slate-300">Welcome Message</label>
            <textarea
              id="welcomeMessage"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="mt-1 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              rows={3}
              placeholder="e.g., Hi there! How can I help you today?"
            />
          </div>
          <div>
            <label htmlFor="accentColor" className="text-sm font-medium text-slate-300">Accent Color</label>
            <input
              type="color"
              id="accentColor"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="mt-1 w-24 h-10 p-1 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-4">
          {saveMessage && <p className="text-sm text-green-400">{saveMessage}</p>}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2.5 rounded-full font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Your Documents</h2>
        {loadingDocs ? (
          <p className="text-slate-500 mt-2">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-slate-500 mt-2">You haven't uploaded any documents yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
                <div className="flex-grow min-w-0">
                  {editingDocId === doc.id ? (
                    <>
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full bg-[#161d29] border border-slate-700 rounded-lg px-4 py-3 text-base text-white shadow-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        rows={7}
                        style={{ minHeight: '120px', fontFamily: 'inherit', lineHeight: 1.6, marginBottom: '0.75rem' }}
                        autoFocus
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={saveEdit}
                          disabled={uploading}
                          className="px-6 py-2 rounded-lg font-semibold text-base bg-blue-600 text-white hover:bg-blue-700 shadow transition-all disabled:opacity-50"
                        >
                          {uploading ? 'Re-indexing...' : 'Save & Re-index'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-2 rounded-lg font-semibold text-base bg-slate-600 text-white hover:bg-slate-500 shadow transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={doc.status} />
                        <p className="text-white truncate font-semibold text-blue-400">{doc.filename || 'Untitled'}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 pl-1">
                        Uploaded on: {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex-shrink-0 ml-4 flex gap-4">
                  {editingDocId !== doc.id && (
                    <>
                      <button onClick={() => startEdit(doc)} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}