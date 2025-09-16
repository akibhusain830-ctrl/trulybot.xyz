'use client';
import ChatWidget from '@/components/ChatWidget';

export default function WidgetPage() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <ChatWidget />
    </main>
  );
}
