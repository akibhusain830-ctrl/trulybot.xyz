'use client';
import React from 'react';

const COLORS: Record<string, string> = {
  new: 'bg-blue-600/20 text-blue-300 border-blue-600/40',
  incomplete: 'bg-slate-600/20 text-slate-300 border-slate-500/40',
  qualified: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40',
  contacted: 'bg-indigo-600/20 text-indigo-300 border-indigo-600/40',
  discarded: 'bg-red-600/20 text-red-300 border-red-600/40'
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-md border font-medium capitalize ${COLORS[status] || 'bg-slate-700 text-slate-200 border-slate-600'}`}>
      {status}
    </span>
  );
}
