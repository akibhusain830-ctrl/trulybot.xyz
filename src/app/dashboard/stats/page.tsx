'use client';

import { useState, useEffect } from 'react';

interface StatsData {
  totalConversations: number;
  resolutionRate: number;
  avgResponseTime: string;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tighter">Stats</h1>
        <p className="text-slate-400 mt-1">View your chatbot performance metrics.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tighter">Stats</h1>
        <p className="text-slate-400 mt-1">View your chatbot performance metrics.</p>
        <div className="mt-8 bg-red-900/20 border border-red-800 rounded-lg p-6">
          <p className="text-red-400">Error loading stats: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold tracking-tighter">Stats</h1>
      <p className="text-slate-400 mt-1">View your chatbot performance metrics.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-slate-300">Total Conversations</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.totalConversations?.toLocaleString()}</p>
          <p className="text-sm text-slate-400 mt-1">All time</p>
        </div>

        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-slate-300">Resolution Rate</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.resolutionRate}%</p>
          <p className="text-sm text-slate-400 mt-1">Successfully resolved</p>
        </div>

        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 className="font-semibold text-slate-300">Avg Response Time</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.avgResponseTime}s</p>
          <p className="text-sm text-slate-400 mt-1">Average response</p>
        </div>
      </div>

      <div className="mt-8 bg-slate-900 rounded-lg p-6 border border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
        <p className="text-slate-400 mb-4">Your chatbot is performing well! Here are some insights:</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-slate-300">High resolution rate indicates effective knowledge base</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-slate-300">Steady conversation volume shows good user engagement</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span className="text-slate-300">Fast response times improve user satisfaction</span>
          </div>
        </div>
      </div>
    </div>
  );
}