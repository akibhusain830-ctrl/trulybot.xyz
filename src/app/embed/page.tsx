'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NextDynamic from 'next/dynamic';

// Disable prerendering for this page since it depends on search params.
export const dynamic = 'force-dynamic';

// Import the existing ChatWidget without altering its UI
const ChatWidget = NextDynamic(() => import('@/components/ChatWidget'), { ssr: false });

export default function EmbedPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: '100vw',
            height: '100vh',
            background: '#23272f',
          }}
        />
      }
    >
      <EmbedContent />
    </Suspense>
  );
}

function EmbedContent() {
  const params = useSearchParams();
  const botId = params?.get('botId') ?? 'demo';

  // ChatWidget expects a <script data-bot-id="..."> to detect botId.
  // We create a tiny data tag at runtime so we don't have to change ChatWidget at all.
  useEffect(() => {
    const tag = document.createElement('script');
    tag.setAttribute('data-bot-id', botId);
    document.body.appendChild(tag);
    return () => {
      try {
        document.body.removeChild(tag);
      } catch {}
    };
  }, [botId]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#23272f',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
      }}
    >
      <ChatWidget />
      <style jsx global>{`
        html,
        body,
        #__next {
          height: 100%;
          background: transparent;
        }
        body {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
