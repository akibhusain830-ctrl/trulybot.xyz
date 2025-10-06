
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const widgetScript = `
(function() {
  // Get chatbot ID from script tag
  const script = document.currentScript || document.querySelector('script[data-chatbot-id]');
  const chatbotId = script?.getAttribute('data-chatbot-id');
  const apiUrl = script?.getAttribute('data-api-url') || '${process.env.NEXT_PUBLIC_APP_URL || 'https://trulybot.xyz'}';
  
  if (!chatbotId) {
    console.error('TrulyBot: data-chatbot-id is required');
    return;
  }

  // Fetch user settings dynamically
  async function loadWidget() {
    try {
      const response = await fetch(\`\${apiUrl}/api/widget/config/\${chatbotId}\`);
      const config = await response.json();
      
      if (config.error) {
        console.error('TrulyBot: Failed to load configuration');
        return;
      }

      // Create widget with dynamic settings
      createWidget(config);
    } catch (error) {
      console.error('TrulyBot: Failed to load widget', error);
    }
  }

  function createWidget(config) {
    // Create chat bubble
    const bubble = document.createElement('button');
    bubble.innerHTML = '💬';
    bubble.style.cssText = \`
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: \${config.accent_color || '#2563EB'};
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      transition: transform 0.2s;
    \`;
    
    bubble.onmouseover = () => bubble.style.transform = 'scale(1.1)';
    bubble.onmouseout = () => bubble.style.transform = 'scale(1)';
    
    bubble.onclick = () => openChat(config);
    
    document.body.appendChild(bubble);
  }

  function openChat(config) {
    // Create chat iframe with dynamic settings
    const iframe = document.createElement('iframe');
    iframe.src = \`\${apiUrl}/widget?id=\${chatbotId}&name=\${encodeURIComponent(config.chatbot_name || 'Assistant')}&message=\${encodeURIComponent(config.welcome_message || 'Hello! How can I help?')}&color=\${encodeURIComponent(config.accent_color || '#2563EB')}\`;
    iframe.style.cssText = \`
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 400px;
      height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10000;
      background: white;
    \`;
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = \`
      position: fixed;
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      border: none;
      background: rgba(0,0,0,0.1);
      border-radius: 50%;
      cursor: pointer;
      z-index: 10001;
    \`;
    closeBtn.onclick = () => {
      document.body.removeChild(iframe);
      document.body.removeChild(closeBtn);
    };
    
    document.body.appendChild(iframe);
    document.body.appendChild(closeBtn);
  }

  // Load widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();
`;

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
