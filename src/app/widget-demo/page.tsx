// src/app/widget-demo/page.tsx
'use client';

import ChatWidgetLauncher from '@/components/ChatWidgetLauncher';

export default function WidgetDemoPage() {
  return (
    <main style={{ minHeight: '200vh', background: '#0a0a0a', padding: '40px' }}>
      <h1 style={{ color: 'white', fontFamily: 'sans-serif', textAlign: 'center' }}>
        This is a demo page for the anemo.ai chat widget.
      </h1>
      <p style={{ color: '#999', fontFamily: 'sans-serif', textAlign: 'center', maxWidth: '500px', margin: '20px auto' }}>
        Scroll up and down to see the chat bubble stay in place. Click the bubble in the bottom-right corner to open the chat. This is the experience your customers will have.
      </p>
      <ChatWidgetLauncher />
    </main>
  );
}
