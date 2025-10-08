'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Disable prerendering for this page since it depends on search params.
export const dynamic = 'force-dynamic';

interface EmbedConfig {
  botId: string;
  color: string;
  greeting: string;
  theme: 'light' | 'dark';
  position?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <div className="text-sm text-gray-600">{message}</div>
      </div>
    </div>
  );
}

function ChatInterface({ config }: { config: EmbedConfig }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const supabaseClient = supabase;

  useEffect(() => {
    // Add initial greeting message
    if (config.greeting && !isInitialized) {
      setMessages([{
        id: '1',
        text: config.greeting,
        isUser: false,
        timestamp: new Date()
      }]);
      setIsInitialized(true);
    }
  }, [config.greeting, isInitialized]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send message to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          botId: config.botId,
          sessionId: `embed-${Date.now()}`, // Simple session ID for embed
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I encountered an error processing your message.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble responding right now. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isDark = config.theme === 'dark';

  return (
    <div 
      className={`flex flex-col h-full ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Header */}
      <div 
        className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}
        style={{ backgroundColor: config.color, color: 'white' }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            🤖
          </div>
          <div>
            <h3 className="font-medium text-sm">TrulyBot Assistant</h3>
            <p className="text-xs opacity-90">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                message.isUser
                  ? isDark 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-gray-100 text-gray-900'
              }`}
              style={message.isUser ? { backgroundColor: config.color } : {}}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
            }`}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.color }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function EmbedContent() {
  const params = useSearchParams();
  const [config, setConfig] = useState<EmbedConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const botId = params?.get('botId');
    if (!botId) {
      setError('Bot ID is required');
      setIsLoading(false);
      return;
    }

    const embedConfig: EmbedConfig = {
      botId,
      color: params?.get('color') ? decodeURIComponent(params.get('color')!) : '#007bff',
      greeting: params?.get('greeting') ? decodeURIComponent(params.get('greeting')!) : 'Hello! How can I help you today?',
      theme: (params?.get('theme') as 'light' | 'dark') || 'light',
      position: params?.get('position') || 'right'
    };

    // Validate color format
    if (!/^#[0-9A-F]{6}$/i.test(embedConfig.color)) {
      embedConfig.color = '#007bff';
    }

    setConfig(embedConfig);
    setIsLoading(false);

    // Notify parent window that embed is ready
    try {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'trulybot:embed:ready',
          botId: embedConfig.botId
        }, '*');
      }
    } catch (e) {
      // Ignore postMessage errors
    }
  }, [params]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!config) {
    return <ErrorDisplay message="Failed to load configuration" />;
  }

  return <ChatInterface config={config} />;
}

export default function EmbedPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>TrulyBot Chat</title>
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>
      </head>
      <body>
        <div style={{ height: '100vh', width: '100vw' }}>
          <Suspense fallback={<LoadingSpinner />}>
            <EmbedContent />
          </Suspense>
        </div>
      </body>
    </html>
  );
}
