'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ChatWidget from '@/components/ChatWidget';

function WidgetContent() {
  const searchParams = useSearchParams();

  const chatbotId = searchParams?.get('id') || '';
  const chatbotName = searchParams?.get('name') || 'Assistant';
  const welcomeMessage = searchParams?.get('message') || 'Hello! How can I help?';
  const accentColor = searchParams?.get('color') || '#2563EB';


  if (!chatbotId) {
    return <div>Invalid widget configuration</div>;
  }

  return (
    <div style={{ height: '100vh', background: '#f8fafc' }}>
      <ChatWidget />
    </div>
  );
}

export default function WidgetPage() {
  return (
    <Suspense fallback={<div>Loading widget...</div>}>
      <WidgetContent />
    </Suspense>
  );
}
