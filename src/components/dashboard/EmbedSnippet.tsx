'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface EmbedSnippetProps {
  userId: string | undefined;
}

const buildEmbedSnippet = (userId: string) => {
  // Always use canonical domain without www
  const origin = typeof window !== 'undefined' 
    ? window.location.origin.replace('://www.', '://')
    : 'https://trulybot.xyz';
  return `<script async src="${origin}/widget/loader.js" data-chatbot-id="${userId}" data-api-url="${origin}"></script>`;
};

export default function EmbedSnippet({ userId }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySnippet = () => {
    if (!userId) return;
    const snippet = buildEmbedSnippet(userId);
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success('Snippet copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-900/50 rounded-lg border border-slate-800">
      <h2 className="text-xl font-semibold">Embed Chatbot on Your Website</h2>
      <p className="text-sm text-slate-400 mt-1">
        Copy and paste this snippet into the `&lt;head&gt;` tag of your website&apos;s HTML.
      </p>
      <div className="mt-4 p-4 bg-slate-950 rounded-md relative">
        <pre className="text-sm text-slate-300 overflow-x-auto">
          <code>
            {userId ? buildEmbedSnippet(userId) : 'Loading snippet...'}
          </code>
        </pre>
        <button
          onClick={handleCopySnippet}
          disabled={!userId}
          className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}