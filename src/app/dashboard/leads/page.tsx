'use client';
import React from 'react';
import LeadsTable from '@/components/leads/LeadsTable';

export default function LeadsPage() {
  // Replace with your real workspace selection logic:
  const workspaceId = 'demo'; // or an actual workspace id

  return (
    <main className="min-h-screen px-6 py-10 max-w-7xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Leads Dashboard</h1>
      <LeadsTable workspaceId={workspaceId} />
    </main>
  );
}
