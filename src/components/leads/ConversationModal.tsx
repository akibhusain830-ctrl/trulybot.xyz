'use client';
import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  conversation: Array<{ role: string; text: string }> | null;
  leadId: string;
  notes: string | null;
  onSaveNotes: (notes: string) => Promise<void>;
}

export function ConversationModal({ open, onClose, conversation, notes, onSaveNotes, leadId }: Props) {
  const [localNotes, setLocalNotes] = React.useState(notes || '');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setLocalNotes(notes || '');
  }, [open, notes]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-700 shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Lead Conversation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm">Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!conversation && (
            <div className="text-slate-500 text-sm">No stored conversation snippet.</div>
          )}
          {conversation && conversation.map((m, i) => (
            <div key={i} className="rounded-lg p-3 text-sm border border-slate-700 bg-slate-800/40">
              <div className="text-xs mb-1 uppercase tracking-wide text-slate-400 font-medium">{m.role}</div>
              <div className="text-slate-200 whitespace-pre-wrap">{m.text}</div>
            </div>
          ))}

          <div className="space-y-2 pt-4">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Internal Notes</label>
            <textarea
              value={localNotes}
              onChange={e => setLocalNotes(e.target.value)}
              rows={4}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Add follow-up plan, qualification details, etc."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-sm bg-slate-700 text-slate-200 hover:bg-slate-600"
              >Cancel</button>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  await onSaveNotes(localNotes);
                  setSaving(false);
                }}
                className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="text-[10px] text-slate-500">Lead ID: {leadId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}