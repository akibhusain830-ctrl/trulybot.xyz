// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'; // NEW: Import useEffect
import { motion } from 'framer-motion';

// (All the Icon and Card components are the same as before)
const ConversationsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> );
const ResolutionIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg> );
const SpeedIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/></svg> );
const CopyIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> );
const CheckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> );

const KpiCard = ({ title, value, subtitle, icon, delay }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: delay }} className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-6 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center mb-2"><p className="text-sm text-slate-400">{title}</p><div className="text-slate-500">{icon}</div></div>
        <p className="text-4xl font-bold mb-1">{value}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
    </motion.div>
);
const EmbedCodeWidget = ({ delay }) => {
    const codeSnippet = `<script src="https://cdn.anemo.ai/widget.js" data-bot-id="USER-UNIQUE-ID" async defer></script>`;
    const [copyText, setCopyText] = useState('Copy');
    const handleCopy = () => { navigator.clipboard.writeText(codeSnippet); setCopyText('Copied!'); setTimeout(() => setCopyText('Copy'), 2000); };
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: delay }} className="md:col-span-2 lg:col-span-3 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold">Embed Your Chatbot</h3>
            <p className="text-sm text-slate-400 mt-1 mb-4">Paste this snippet into your website's HTML right before the closing `&lt;/body&gt;` tag.</p>
            <div className="bg-black rounded-lg p-4 flex items-center justify-between"><code className="text-sm text-slate-300 overflow-x-auto whitespace-nowrap">{codeSnippet}</code><button onClick={handleCopy} className="ml-4 flex-shrink-0 flex items-center gap-2 bg-slate-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-slate-600 transition-colors">{copyText === 'Copy' ? <CopyIcon /> : <CheckIcon />}{copyText}</button></div>
        </motion.div>
    );
};


export default function DashboardPage() {
    // NEW: State to hold the real data from the backend
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // NEW: useEffect runs when the page loads to fetch the data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/dashboard-stats'); 
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []); // Runs once when the page loads

    if (loading) {
        return <div className="p-8 text-slate-400 animate-pulse">Loading dashboard data...</div>;
    }

  return (
    <div className="p-8">
      <header className="flex justify-between items-center pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, here's a summary of your bot's activity.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* CHANGED: The cards now display real (simulated) data from the API */}
        <KpiCard title="Total Conversations" value={stats?.totalConversations?.toLocaleString() || "0"} subtitle="Last 30 days" icon={<ConversationsIcon />} delay={0.1} />
        <KpiCard title="Resolution Rate" value={`${stats?.resolutionRate || 0}%`} subtitle="Automated" icon={<ResolutionIcon />} delay={0.2} />
        <KpiCard title="Avg. Response Time" value={`${stats?.avgResponseTime || 0}s`} subtitle="Instantaneous" icon={<SpeedIcon />} delay={0.3} />
        
        <EmbedCodeWidget delay={0.4} />
      </div>
    </div>
  );
}