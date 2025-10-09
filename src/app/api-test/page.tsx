'use client';

import React, { useEffect, useState } from 'react';

const TestApiCall = () => {
  const [output, setOutput] = useState('Loading...');
  const [parsed, setParsed] = useState<any>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botId: 'demo',
            messages: [
              { role: 'user', content: 'How do I start my free trial?' }
            ],
            stream: true
          })
        });

        if (!res.ok) {
          setOutput(`Error: ${res.status} ${res.statusText}`);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setOutput('No reader available');
          return;
        }

        let result = '';
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = new TextDecoder().decode(value);
            result += chunk;
          }
        }

        // Look for button marker
        const buttonMarker = '__BUTTONS__';
        const buttonPos = result.indexOf(buttonMarker);
        
        if (buttonPos !== -1) {
          const text = result.substring(0, buttonPos).trim();
          const buttonData = result.substring(buttonPos + buttonMarker.length).trim();
          
          try {
            const buttons = JSON.parse(buttonData);
            setParsed({ text, buttons });
            
            setOutput(`
              Raw Response: ${result}
              
              Text: ${text}
              
              Button Data: ${buttonData}
              
              Parsed Buttons: ${JSON.stringify(buttons, null, 2)}
            `);
          } catch (e) {
            setOutput(`
              Raw Response: ${result}
              
              Text: ${text}
              
              Button Data: ${buttonData}
              
              Parse Error: ${e instanceof Error ? e.message : String(e)}
            `);
          }
        } else {
          setOutput(`Raw Response (no buttons): ${result}`);
        }
      } catch (e) {
        setOutput(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    };
    
    fetchTest();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Test Results</h1>
      <pre style={{ 
        whiteSpace: 'pre-wrap', 
        backgroundColor: '#f0f0f0', 
        padding: '10px',
        borderRadius: '4px',
        overflow: 'auto',
        maxHeight: '400px'
      }}>{output}</pre>
      
      {parsed && (
        <div style={{ marginTop: '30px' }}>
          <h2>Button Preview</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {parsed.buttons.map((btn: any, i: number) => (
              <a
                key={i}
                href={btn.url}
                style={{
                  backgroundColor: btn.type === 'primary' ? '#2563EB' : '#374151',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                {btn.text}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestApiCall;