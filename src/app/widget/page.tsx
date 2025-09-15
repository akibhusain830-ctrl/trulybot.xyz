'use client';

import { useState } from 'react';

export default function WidgetPage() {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Widget</h2>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Type something..."
        className="border p-2 w-full"
      />
    </div>
  );
}
