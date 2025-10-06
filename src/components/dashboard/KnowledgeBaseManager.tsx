'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDocuments, uploadTextDocument, deleteDocument, updateDocument, Document } from '@/lib/api/dashboard';
import toast from 'react-hot-toast';

export default function KnowledgeBaseManager() {
  const { user } = useAuth();
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Quota state
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [uploadsRemaining, setUploadsRemaining] = useState<number | null>(null);
  const [uploadLimit, setUploadLimit] = useState<number | null>(null);
  const [perUploadWordLimit, setPerUploadWordLimit] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [totalStoredWords, setTotalStoredWords] = useState<number | null>(null);
  const [totalWordCap, setTotalWordCap] = useState<number | null>(null);
  const [monthlyConversations, setMonthlyConversations] = useState<number | null>(null);
  const [conversationCap, setConversationCap] = useState<number | null>(null);

  const warned80Ref = useRef(false);

  const wordCount = useMemo(() => {
    const trimmed = pastedText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [pastedText]);

  const wordLimitReached = perUploadWordLimit !== null && wordCount > perUploadWordLimit;

  const loadUsage = useCallback(async () => {
    if (!user?.id) return;
    setLoadingUsage(true);
    setUsageError(null);
    try {
      const res = await fetch('/api/usage');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load usage');
      }
      const data = await res.json();
      // Persist to localStorage for flicker-free reloads
      try { localStorage.setItem('lastUsage', JSON.stringify({ ts: Date.now(), data })); } catch {}
      setUploadsRemaining(data.uploads_remaining);
      setUploadLimit(data.monthly_upload_limit);
      setPerUploadWordLimit(data.per_upload_word_limit);
      setPlan(data.plan);
  setTotalStoredWords(data.total_stored_words);
      setTotalWordCap(data.total_word_cap);
  setMonthlyConversations(data.monthly_conversations);
  setConversationCap(data.monthly_conversation_cap);
    } catch (e: any) {
      setUsageError(e.message || 'Failed to load usage');
    } finally {
      setLoadingUsage(false);
    }
  }, [user?.id]);

  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingDocs(true);
    try {
      const docs = await fetchDocuments(user.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents.');
    } finally {
      setLoadingDocs(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Hydrate from lastUsage first (optimistic) then fetch fresh
    try {
      const raw = localStorage.getItem('lastUsage');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data) {
          setUploadsRemaining(parsed.data.uploads_remaining);
          setUploadLimit(parsed.data.monthly_upload_limit);
          setPerUploadWordLimit(parsed.data.per_upload_word_limit);
          setPlan(parsed.data.plan);
          setTotalStoredWords(parsed.data.total_stored_words);
          setTotalWordCap(parsed.data.total_word_cap);
          setMonthlyConversations(parsed.data.monthly_conversations);
          setConversationCap(parsed.data.monthly_conversation_cap);
          setLoadingUsage(false); // show cached quickly
        }
      }
    } catch {}
    loadDocuments();
    loadUsage();
  }, [loadDocuments, loadUsage]);

  // 80% usage toast (total words)
  useEffect(() => {
    if (!totalStoredWords || !totalWordCap) return;
    const ratio = totalStoredWords / totalWordCap;
    if (ratio >= 0.8 && !warned80Ref.current) {
      // Lazy load toast to avoid circular import (already imported toast earlier)
      import('react-hot-toast').then(({ toast }) => {
        toast((t) => (
          <div className="text-sm">
            <p className="font-semibold text-slate-100">Approaching plan capacity</p>
            <p className="mt-1 text-slate-300">{Math.round(ratio * 100)}% of your word limit used. Consider upgrading for more space.</p>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="mt-2 px-2 py-1 bg-slate-700/60 hover:bg-slate-600 rounded text-xs text-slate-200"
            >Dismiss</button>
          </div>
        ), { duration: 7000 });
      });
      warned80Ref.current = true;
    }
    if (ratio < 0.75) {
      // Reset warning if they delete docs and drop below 75%
      warned80Ref.current = false;
    }
  }, [totalStoredWords, totalWordCap]);

  const retry = async (fn: () => Promise<void>, attempts = 3, delay = 400) => {
    for (let i = 0; i < attempts; i++) {
      try { await fn(); return; } catch (e) { if (i === attempts - 1) throw e; await new Promise(r => setTimeout(r, delay * (i+1))); }
    }
  };

  const handleNewUpload = async () => {
    if (!pastedText.trim() || !fileName.trim() || !user) {
      toast.error('File name and content are required.');
      return;
    }
    if (wordLimitReached) {
      toast.error('Word limit exceeded for your plan.');
      return;
    }
    if (uploadsRemaining !== null && uploadsRemaining <= 0) {
      toast.error('No uploads remaining this month.');
      return;
    }
    
    setUploading(true);
    const toastId = toast.loading('Uploading and indexing document...');
    try {
      const result = await uploadTextDocument(pastedText, fileName);
      // Optimistic usage adjustments if limits known
      if (perUploadWordLimit !== null) {
        setUploadsRemaining(prev => prev !== null ? Math.max(0, prev - 1) : prev);
      }
      if (totalStoredWords !== null) {
        const wordsAdded = pastedText.trim().split(/\s+/).length;
        setTotalStoredWords(prev => prev !== null ? prev + wordsAdded : prev);
      }
      toast.success('Document uploaded successfully!', { id: toastId });
      setPastedText('');
      setFileName('');
      await loadDocuments();
      // Retry usage load to account for potential replication delay
      await retry(loadUsage);
    } catch (error) {
      console.error('Upload error', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Upload failed: ${errorMessage}`, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document? This will remove it from your chatbot's knowledge base.")) return;
    
    const toastId = toast.loading('Deleting document...');
    try {
      const target = documents.find(d => d.id === docId);
      await deleteDocument(docId);
      toast.success('Document deleted.', { id: toastId });
      setDocuments(docs => docs.filter(d => d.id !== docId));
      
      // Optimistically update counters for immediate UI feedback
      if (target && totalStoredWords !== null) {
        const removed = target.content.trim().split(/\s+/).filter(Boolean).length;
        setTotalStoredWords(prev => prev !== null ? Math.max(0, prev - removed) : prev);
      }
      
      // Optimistically decrement uploads count for real-time update
      if (uploadsRemaining !== null && uploadLimit !== null) {
        const currentUploads = uploadLimit - uploadsRemaining;
        if (currentUploads > 0) {
          setUploadsRemaining(prev => prev !== null ? prev + 1 : prev);
        }
      }
      
      // Refresh usage to ensure accuracy (in background)
      setTimeout(() => {
        loadUsage();
      }, 100);
    } catch (error) {
      console.error('Error deleting document', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Deletion failed: ${errorMessage}`, { id: toastId });
    }
  };

  const startEdit = (doc: Document) => {
    setEditingDocId(doc.id);
    setEditingContent(doc.content);
  };

  const saveEdit = async () => {
    if (!user || editingDocId === null) return;

    setUploading(true);
    const toastId = toast.loading('Updating and re-indexing document...');
    try {
      const original = documents.find(d => d.id === editingDocId);
      const updatedDoc = await updateDocument(editingDocId, editingContent);
      setDocuments(docs => docs.map(d => d.id === editingDocId ? updatedDoc : d));
      if (original && totalStoredWords !== null) {
        const oldCount = original.content.trim().split(/\s+/).filter(Boolean).length;
        const newCount = editingContent.trim().split(/\s+/).filter(Boolean).length;
        const delta = newCount - oldCount;
        if (delta !== 0) setTotalStoredWords(prev => prev !== null ? Math.max(0, prev + delta) : prev);
      }
      loadUsage();
      toast.success('Document updated successfully!', { id: toastId });
      setEditingDocId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Error updating document', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Update failed: ${errorMessage}`, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const cancelEdit = () => {
    setEditingDocId(null);
    setEditingContent('');
  };

  return (
    <>
      <div className="mt-8 p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800 relative">
        <h2 className="text-xl font-semibold">Add to Knowledge Base</h2>
        <p className="text-sm text-slate-400 mt-1">
          Paste your business information or FAQs into the text box below.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          {loadingUsage ? (
            <span>Loading quota…</span>
          ) : usageError ? (
            <span className="text-red-400">Usage error</span>
          ) : (
            <>
              {typeof uploadsRemaining === 'number' && typeof uploadLimit === 'number' && (
                <span>
                  Uploads remaining: <span className={uploadsRemaining === 0 ? 'text-red-400' : 'text-slate-200'}>{uploadsRemaining}</span>/<span>{uploadLimit}</span>
                </span>
              )}
              {typeof perUploadWordLimit === 'number' && (
                <span>
                  Per-upload word limit: <span className="text-slate-200">{perUploadWordLimit.toLocaleString()}</span>
                </span>
              )}
              {plan && <span>Plan: <span className="uppercase text-slate-300">{plan}</span></span>}
            </>
          )}
        </div>
        <div className="mt-4 space-y-4">
          {totalWordCap !== null && totalStoredWords !== null && (
            <div className="w-full bg-slate-800/40 border border-slate-700/60 rounded-lg p-3">
              <div className="flex flex-wrap justify-between text-xs text-slate-400 mb-2 gap-2">
                <span>Storage Usage</span>
                <span className="text-slate-300">{totalStoredWords.toLocaleString()} / {totalWordCap.toLocaleString()} words</span>
              </div>
              <div className="h-2 rounded bg-slate-800 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={totalWordCap} aria-valuenow={totalStoredWords} aria-label="Stored words usage">
                <div
                  className={"h-full transition-all duration-500 " + ((totalStoredWords / totalWordCap) >= 0.9 ? 'bg-red-500' : (totalStoredWords / totalWordCap) >= 0.8 ? 'bg-amber-500' : 'bg-blue-600')}
                  style={{ width: `${Math.min(100, (totalStoredWords / totalWordCap) * 100).toFixed(2)}%` }}
                />
              </div>
            </div>
          )}
          {uploadLimit !== null && uploadsRemaining !== null && (
            <div className="w-full bg-slate-800/40 border border-slate-700/60 rounded-lg p-3">
              <div className="flex flex-wrap justify-between text-xs text-slate-400 mb-2 gap-2">
                <span>Uploads This Month</span>
                <span className="text-slate-300">{(uploadLimit - uploadsRemaining).toLocaleString()} / {uploadLimit.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded bg-slate-800 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={uploadLimit} aria-valuenow={uploadLimit - uploadsRemaining} aria-label="Monthly uploads usage">
                <div
                  className={"h-full transition-all duration-500 " + ((uploadLimit - uploadsRemaining) / uploadLimit >= 0.9 ? 'bg-red-500' : (uploadLimit - uploadsRemaining) / uploadLimit >= 0.8 ? 'bg-amber-500' : 'bg-green-600')}
                  style={{ width: `${Math.min(100, ((uploadLimit - uploadsRemaining) / uploadLimit) * 100).toFixed(2)}%` }}
                />
              </div>
            </div>
          )}
          {conversationCap !== null && monthlyConversations !== null && (
            <div className="w-full bg-slate-800/40 border border-slate-700/60 rounded-lg p-3">
              <div className="flex flex-wrap justify-between text-xs text-slate-400 mb-2 gap-2">
                <span>Conversations (Monthly)</span>
                <span className="text-slate-300">{monthlyConversations.toLocaleString()} / {conversationCap.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded bg-slate-800 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={conversationCap} aria-valuenow={monthlyConversations} aria-label="Monthly conversations usage">
                <div
                  className={"h-full transition-all duration-500 " + ((monthlyConversations / conversationCap) >= 0.95 ? 'bg-red-600' : (monthlyConversations / conversationCap) >= 0.8 ? 'bg-amber-500' : 'bg-indigo-600')}
                  style={{ width: `${Math.min(100, (monthlyConversations / conversationCap) * 100).toFixed(2)}%` }}
                />
              </div>
            </div>
          )}
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            maxLength={100}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="File name (e.g., FAQs, Pricing, About Us)..."
            autoComplete="off"
          />
          <div className="relative">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className={`w-full bg-slate-800/50 border ${wordLimitReached ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'} rounded-lg px-4 py-3 text-base placeholder-slate-500 focus:outline-none focus:ring-2 transition-all pr-24`}
              rows={8}
              placeholder="Paste your content here..."
              style={{ minHeight: '150px', resize: 'vertical' }}
            />
            <div className="absolute top-2 right-3 text-[11px] font-medium tracking-wide">
              {perUploadWordLimit !== null && (
                <span className={wordLimitReached ? 'text-red-400' : 'text-slate-400'}>
                  {wordCount.toLocaleString()} / {perUploadWordLimit.toLocaleString()} words
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleNewUpload}
            disabled={!pastedText.trim() || uploading || !fileName.trim() || wordLimitReached || (uploadsRemaining !== null && uploadsRemaining <= 0)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
          >
            {uploading ? 'Uploading...' : 'Add to Knowledge Base'}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Your Documents</h2>
        {loadingDocs ? (
          <div className="mt-4 text-center py-8 text-slate-400">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="mt-4 text-center py-8 text-slate-400">No documents found. Add your first document above.</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-200 truncate pr-4 flex-1">{doc.filename}</h3>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => startEdit(doc)}
                      className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 rounded transition-all duration-200 border border-blue-600/30"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-2 py-1 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 rounded transition-all duration-200 border border-red-600/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Last updated: {new Date(doc.created_at).toLocaleDateString()}
                </p>
                
                {editingDocId === doc.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      rows={6}
                      style={{ resize: 'vertical' }}
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-sm bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-slate-200 rounded transition-all duration-200 border border-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={uploading}
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white rounded transition-all duration-200"
                      >
                        {uploading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-300 line-clamp-3">
                    {doc.content.substring(0, 200)}{doc.content.length > 200 ? '...' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}