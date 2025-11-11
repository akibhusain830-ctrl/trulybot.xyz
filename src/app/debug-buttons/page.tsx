'use client';

import React, { useEffect, useState } from 'react';

const ButtonsDebugger = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [parsedButtons, setParsedButtons] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testParse = async () => {
    try {
      // Simple test case
      const testResponse = `This is a test response.\n\n__BUTTONS__[{"text":"Start Free Trial","url":"/start-trial","type":"primary"},{"text":"Go to Dashboard","url":"/dashboard","type":"secondary"}]`;
      setResponse(testResponse);
      
      const buttonMarker = '__BUTTONS__';
      const buttonStart = testResponse.indexOf(buttonMarker);
      
      if (buttonStart !== -1) {
        const finalText = testResponse.substring(0, buttonStart).trim();
        const buttonData = testResponse.substring(buttonStart + buttonMarker.length);
        
        console.log('Debug: finalText =', finalText);
        console.log('Debug: buttonData =', buttonData);
        
        try {
          const buttons = JSON.parse(buttonData.trim());
          setParsedButtons(buttons);
          console.log('Debug: parsed buttons =', buttons);
        } catch (e) {
          console.error('Button parse error:', e);
          setError('Failed to parse buttons: ' + e);
        }
      } else {
        setError('No buttons found in response');
      }
    } catch (e) {
      setError('Error: ' + e);
    }
  };

  useEffect(() => {
    testParse();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px', margin: '20px' }}>
      <h3>Buttons Debugger</h3>
      
      <div>
        <h4>Original Response:</h4>
        <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#eee', padding: '10px' }}>{response}</pre>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <h4>Error:</h4>
          <pre>{error}</pre>
        </div>
      )}
      
      {parsedButtons && (
        <div style={{ marginTop: '20px' }}>
          <h4>Parsed Buttons:</h4>
          <pre>{JSON.stringify(parsedButtons, null, 2)}</pre>
          
          <h4>Rendered Buttons:</h4>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {parsedButtons.map((button, i) => (
              <a
                key={i}
                href={button.url}
                style={{
                  backgroundColor: button.type === 'primary' ? '#2563EB' : '#374151',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                }}
              >
                {button.text}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonsDebugger;