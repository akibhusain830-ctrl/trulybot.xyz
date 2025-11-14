'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { StatusBadge } from './StatusBadge';
import { ConversationModal } from './ConversationModal';
import { deleteLead } from '@/lib/api/dashboard';
import { supabase } from '@/lib/supabaseClient'; // Fixed import path

export interface Lead {
  id: string;
  workspace_id: string | null;
  source_bot_id: string;
  email: string | null;
  first_message: string | null;
  status: string;
  origin: string;
  created_at: string;
  intent_keywords: string[] | null;
  meta: any;
  name?: string | null;
  company?: string | null;
}

interface Props {
  workspaceId: string | null; // 'demo' or null or actual workspace id
  escalatedOnly?: boolean;
}

type ConversationCache = Record<string, Array<{ role: string; text: string }> | null>;

// Add this helper function at the top of your component:
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No authentication token');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
};

export default function LeadsTable({ workspaceId, escalatedOnly = false }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [conversationCache, setConversationCache] = useState<ConversationCache>({});
  const [notesCache, setNotesCache] = useState<Record<string, string | null>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      if (workspaceId) params.set('workspaceId', workspaceId);
      if (statusFilter) params.set('status', statusFilter);
      if (escalatedOnly) params.set('escalated', 'true');
      
      const res = await fetch(`/api/leads?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${await (await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch leads');
      setLeads(json.data || []);
      setTotal(json.total || 0);
    } catch (e) {
      console.error('Error fetching leads:', e);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, workspaceId, statusFilter, escalatedOnly]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Update your updateStatus function:
  const updateStatus = async (id: string, newStatus: string) => {
    const snapshot = leads;
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status: newStatus } : l));
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed');
    } catch (e) {
      console.error(e);
      setLeads(snapshot);
    }
  };

  const openConversation = async (lead: Lead) => {
    setActiveLeadId(lead.id);
    setModalOpen(true);
    if (!(lead.id in conversationCache)) {
      const conv = await fetchConversation(lead.id);
      setConversationCache(c => ({ ...c, [lead.id]: conv.conversation }));
      setNotesCache(n => ({ ...n, [lead.id]: conv.notes ?? null }));
    }
  };

  // Update your fetchConversation function:
  async function fetchConversation(id: string) {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/internal/lead-conversation?id=${id}`, { headers });
      if (!res.ok) return { conversation: null, notes: null };
      return res.json();
    } catch (e) {
      console.error('Error fetching conversation:', e);
      return { conversation: null, notes: null };
    }
  }

  // Update your saveNotes function:
  const saveNotes = async (notes: string) => {
    if (!activeLeadId) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/leads/${activeLeadId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ notes })
      });
      if (res.ok) {
        setNotesCache(n => ({ ...n, [activeLeadId]: notes }));
      }
    } catch (e) {
      console.error('Error saving notes:', e);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const headers = await getAuthHeaders();
      const body: any = {};
      if (workspaceId) body.workspaceId = workspaceId;
      if (statusFilter) body.status = statusFilter;
      const res = await fetch('/api/leads/export', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads_export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      setDeletingId(leadId);
      try {
        await deleteLead(leadId);
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
        setTotal(prevTotal => prevTotal - 1); // Decrement total count
      } catch (error: any) {
        console.error('Failed to delete lead:', error);
        // Optionally, show an error message to the user
      } finally {
        setDeletingId(null);
      }
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const activeConversation = activeLeadId ? conversationCache[activeLeadId] || null : null;
  const activeNotes = activeLeadId ? (notesCache[activeLeadId] ?? null) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <h2 className="text-xl font-semibold tracking-tight">Leads</h2>
        <div className="flex gap-3 items-center ml-auto">
          <select
            value={statusFilter}
            onChange={e => { setPage(1); setStatusFilter(e.target.value); }}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="incomplete">Incomplete</option>
            <option value="qualified">Qualified</option>
            <option value="contacted">Contacted</option>
            <option value="discarded">Discarded</option>
          </select>
          <button
            disabled={exporting}
            onClick={exportCsv}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-40"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/70 text-slate-300">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Lead</th>
              <th className="text-left px-4 py-3 font-medium">Workspace</th>
              <th className="text-left px-4 py-3 font-medium">Origin</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Keywords</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            )}
            {!loading && leads.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No leads found.</td></tr>
            )}
            {leads.map(l => (
              <tr key={l.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-slate-100">
                      {l.email || <span className="italic text-slate-400">No email</span>}
                    </span>
                    <span className="text-xs text-slate-400 line-clamp-2 max-w-xs">
                      {l.first_message}
                    </span>
                    {(l.name || l.company) && (
                      <span className="text-[10px] text-slate-500">
                        {(l.name || '')}{l.name && l.company ? ' · ' : ''}{l.company || ''}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {l.workspace_id || <span className="text-slate-500">demo</span>}
                </td>
                <td className="px-4 py-3 capitalize">
                  <span className="text-slate-300">{l.origin}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={l.status} />
                    {l.meta?.needsHumanSupport && (
                      <span className="px-2 py-0.5 rounded-md bg-yellow-800/40 text-[10px] text-yellow-200">
                        needs human support
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {l.intent_keywords && l.intent_keywords.length
                    ? (
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {l.intent_keywords.slice(0,4).map(k => (
                          <span key={k} className="px-1.5 py-0.5 rounded-md bg-slate-700 text-xs text-slate-200">{k}</span>
                        ))}
                      </div>
                    ) : '-'}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(l.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3 space-y-1">
                  <select
                    value={l.status}
                    onChange={e => updateStatus(l.id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 w-full"
                  >
                    <option value="new">new</option>
                    <option value="incomplete">incomplete</option>
                    <option value="qualified">qualified</option>
                    <option value="contacted">contacted</option>
                    <option value="discarded">discarded</option>
                  </select>
                  <button
                    onClick={() => openConversation(l)}
                    className="w-full text-center px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    disabled={deletingId === l.id}
                    className="w-full text-center px-2 py-1 rounded-md bg-red-900/40 hover:bg-red-900/60 text-xs text-red-300 disabled:opacity-50"
                  >
                    {deletingId === l.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="text-slate-400">
            Page {page} of {totalPages} • {total} total
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-md bg-slate-800 text-slate-200 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-md bg-slate-800 text-slate-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConversationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        conversation={activeConversation}
        leadId={activeLeadId || ''}
        notes={activeNotes}
        onSaveNotes={saveNotes}
      />
    </div>
  );
}