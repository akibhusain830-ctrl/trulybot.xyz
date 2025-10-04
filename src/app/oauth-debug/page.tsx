// Temporary OAuth debug page
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function OAuthDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };

  useEffect(() => {
    addLog('🔍 OAuth Debug Page Loaded');
    addLog(`Current URL: ${window.location.href}`);
    
    // Check URL parameters
    const error = searchParams?.get('error');
    const code = searchParams?.get('code');
    const authSuccess = searchParams?.get('auth');
    
    addLog(`URL Parameters: error=${error}, code=${!!code}, auth=${authSuccess}`);
    
    // Check current session
    const checkSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          addLog(`❌ Session check error: ${sessionError.message}`);
        } else if (data.session) {
          addLog(`✅ Active session found: ${data.session.user.email}`);
        } else {
          addLog(`❌ No active session found`);
        }
      } catch (err) {
        addLog(`❌ Session check failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    checkSession();
    
    // If there's an error parameter, show it prominently
    if (error) {
      addLog(`🚨 OAUTH ERROR: ${error}`);
    }
    
  }, [searchParams]);

  const testGoogleAuth = async () => {
    addLog('🚀 Testing Google OAuth...');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        addLog(`❌ OAuth initiation error: ${error.message}`);
      } else {
        addLog('✅ OAuth initiated, redirecting to Google...');
      }
    } catch (err) {
      addLog(`❌ OAuth test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 OAuth Debug Console</h1>
      <button 
        onClick={testGoogleAuth}
        style={{ 
          padding: '10px 20px', 
          margin: '10px 0', 
          backgroundColor: '#4285f4', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Google OAuth
      </button>
      
      <button 
        onClick={() => router.push('/')}
        style={{ 
          padding: '10px 20px', 
          margin: '10px', 
          backgroundColor: '#333', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Go to Home
      </button>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '5px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        <h3>Console Logs:</h3>
        {logs.map((log, index) => (
          <div key={index} style={{ 
            padding: '5px 0', 
            borderBottom: '1px solid #ddd',
            fontSize: '12px'
          }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}