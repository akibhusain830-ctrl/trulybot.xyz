import { NextRequest, NextResponse } from 'next/server';

// WooCommerce widget script
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const storeUrl = searchParams.get('storeUrl');
  const currency = searchParams.get('currency') || 'USD';
  const position = searchParams.get('position') || 'bottom-right';
  
  if (!userId) {
    return new NextResponse('Missing userId parameter', { status: 400 });
  }
  
  const widgetScript = `
(function() {
  'use strict';
  
  // TrulyBot WooCommerce Widget
  window.TrulyBot = window.TrulyBot || {};
  
  const config = {
    userId: '${userId}',
    platform: 'woocommerce',
    storeUrl: '${storeUrl}',
    currency: '${currency}',
    position: '${position}',
    apiBase: '${process.env.NEXT_PUBLIC_SITE_URL || 'https://trulybot.xyz'}/api'
  };
  
  let widget = null;
  let isOpen = false;
  let userConfig = null;
  
  // Load widget configuration
  async function loadConfig() {
    try {
      const response = await fetch(config.apiBase + '/widget/config/' + config.userId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      if (response.ok) {
        userConfig = await response.json();
        console.log('TrulyBot: Configuration loaded');
      } else {
        console.warn('TrulyBot: Failed to load configuration');
        userConfig = getDefaultConfig();
      }
    } catch (error) {
      console.warn('TrulyBot: Configuration error:', error);
      userConfig = getDefaultConfig();
    }
  }
  
  function getDefaultConfig() {
    return {
      chatbot_name: 'TrulyBot Assistant',
      welcome_message: 'Hello! How can I help you today?',
      accent_color: '#2563EB',
      chatbot_theme: 'light'
    };
  }
  
  // Create widget HTML
  function createWidget() {
    const widgetHTML = \`
      <div id="trulybot-widget" style="
        position: fixed;
        \${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        bottom: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <!-- Widget Button -->
        <div id="trulybot-button" style="
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: \${userConfig.accent_color};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          color: white;
          font-size: 24px;
        " onclick="TrulyBot.toggle()">
          <span id="trulybot-button-icon">💬</span>
        </div>
        
        <!-- Widget Chat Window -->
        <div id="trulybot-chat" style="
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          position: absolute;
          bottom: 80px;
          \${config.position.includes('right') ? 'right: 0;' : 'left: 0;'}
          display: none;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        ">
          <!-- Header -->
          <div style="
            background: \${userConfig.accent_color};
            color: white;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">\${userConfig.chatbot_name}</h3>
              <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Online now</p>
            </div>
            <button onclick="TrulyBot.close()" style="
              background: none;
              border: none;
              color: white;
              font-size: 20px;
              cursor: pointer;
              padding: 0;
              opacity: 0.8;
            ">×</button>
          </div>
          
          <!-- Messages -->
          <div id="trulybot-messages" style="
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f9fafb;
          ">
            <div class="message bot-message" style="
              margin-bottom: 16px;
              display: flex;
              align-items: flex-start;
            ">
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: \${userConfig.accent_color};
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                font-size: 16px;
                color: white;
              ">🤖</div>
              <div style="
                background: white;
                padding: 12px 16px;
                border-radius: 18px;
                border-bottom-left-radius: 4px;
                max-width: 250px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
              ">\${userConfig.welcome_message}</div>
            </div>
          </div>
          
          <!-- Input -->
          <div style="
            padding: 16px 20px;
            border-top: 1px solid #e5e7eb;
            background: white;
          ">
            <div style="
              display: flex;
              align-items: center;
              background: #f3f4f6;
              border-radius: 24px;
              padding: 8px 16px;
            ">
              <input 
                id="trulybot-input" 
                type="text" 
                placeholder="Type a message..." 
                style="
                  flex: 1;
                  border: none;
                  outline: none;
                  background: none;
                  font-size: 14px;
                  padding: 8px 0;
                "
                onkeypress="if(event.key==='Enter') TrulyBot.sendMessage()"
              />
              <button onclick="TrulyBot.sendMessage()" style="
                background: \${userConfig.accent_color};
                border: none;
                color: white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 8px;
              ">→</button>
            </div>
          </div>
        </div>
      </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    widget = document.getElementById('trulybot-widget');
  }
  
  // Widget functions
  window.TrulyBot.toggle = function() {
    const chat = document.getElementById('trulybot-chat');
    const button = document.getElementById('trulybot-button');
    const icon = document.getElementById('trulybot-button-icon');
    
    if (isOpen) {
      chat.style.display = 'none';
      icon.textContent = '💬';
      isOpen = false;
    } else {
      chat.style.display = 'flex';
      icon.textContent = '×';
      isOpen = true;
      document.getElementById('trulybot-input').focus();
    }
  };
  
  window.TrulyBot.close = function() {
    const chat = document.getElementById('trulybot-chat');
    const icon = document.getElementById('trulybot-button-icon');
    
    chat.style.display = 'none';
    icon.textContent = '💬';
    isOpen = false;
  };
  
  window.TrulyBot.sendMessage = async function() {
    const input = document.getElementById('trulybot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    try {
      // Send message to TrulyBot API
      const response = await fetch(config.apiBase + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          botId: config.userId,
          messages: [
            { role: 'user', content: message }
          ],
          context: {
            platform: 'woocommerce',
            store_url: config.storeUrl,
            currency: config.currency
          }
        })
      });
      
      removeTypingIndicator(typingId);
      
      if (response.ok) {
        const data = await response.json();
        let botReply = data.reply || data.message || 'Sorry, I could not process your request.';
        
        // Handle order tracking requests
        if (message.toLowerCase().includes('order') || message.toLowerCase().includes('track')) {
          const orderResult = await handleOrderTracking(message);
          if (orderResult) {
            botReply = orderResult;
          }
        }
        
        addMessage(botReply, 'bot');
      } else {
        addMessage('Sorry, I\\'m having trouble connecting right now. Please try again.', 'bot');
      }
    } catch (error) {
      removeTypingIndicator(typingId);
      addMessage('Sorry, there was an error. Please try again.', 'bot');
      console.error('TrulyBot: Message error:', error);
    }
  };
  
  async function handleOrderTracking(message) {
    // Extract order number from message
    const orderMatch = message.match(/(?:order|#)\\s*([A-Za-z0-9-]+)/i);
    if (!orderMatch) return null;
    
    const orderNumber = orderMatch[1];
    
    try {
      const response = await fetch(config.apiBase + '/integrations/woocommerce/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: config.userId,
          order_id: orderNumber
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.order) {
          const order = data.order;
          return \`📦 **Order #\${order.order_number}**
          
**Status:** \${order.status_label}
**Total:** \${order.currency} \${order.total}
**Date:** \${new Date(order.date_created).toLocaleDateString()}

\${order.items.length > 0 ? 
  '**Items:**\\n' + order.items.map(item => \`• \${item.name} (x\${item.quantity})\`).join('\\n') 
  : ''
}

\${order.tracking_info.length > 0 ? 
  '**Tracking:** ' + order.tracking_info.map(t => \`\${t.provider}: \${t.number}\`).join(', ')
  : ''
}\`;
        }
      }
    } catch (error) {
      console.error('Order tracking error:', error);
    }
    
    return null;
  }
  
  function addMessage(text, sender) {
    const messages = document.getElementById('trulybot-messages');
    const isBot = sender === 'bot';
    
    const messageHTML = \`
      <div class="message \${sender}-message" style="
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
        \${isBot ? '' : 'flex-direction: row-reverse;'}
      ">
        \${isBot ? \`
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: \${userConfig.accent_color};
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 16px;
            color: white;
          ">🤖</div>
        \` : ''}
        <div style="
          background: \${isBot ? 'white' : userConfig.accent_color};
          color: \${isBot ? '#374151' : 'white'};
          padding: 12px 16px;
          border-radius: 18px;
          border-bottom-\${isBot ? 'left' : 'right'}-radius: 4px;
          max-width: 250px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          \${isBot ? '' : 'margin-right: 12px;'}
          white-space: pre-wrap;
        ">\${text}</div>
      </div>
    \`;
    
    messages.insertAdjacentHTML('beforeend', messageHTML);
    messages.scrollTop = messages.scrollHeight;
  }
  
  function addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const messages = document.getElementById('trulybot-messages');
    
    const typingHTML = \`
      <div id="\${id}" class="message bot-message" style="
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
      ">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: \${userConfig.accent_color};
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 16px;
          color: white;
        ">🤖</div>
        <div style="
          background: white;
          padding: 12px 16px;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        ">
          <div style="
            display: flex;
            gap: 4px;
            align-items: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #9ca3af;
              animation: typing 1.4s infinite;
            "></div>
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #9ca3af;
              animation: typing 1.4s infinite 0.2s;
            "></div>
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #9ca3af;
              animation: typing 1.4s infinite 0.4s;
            "></div>
          </div>
        </div>
      </div>
    \`;
    
    messages.insertAdjacentHTML('beforeend', typingHTML);
    messages.scrollTop = messages.scrollHeight;
    
    return id;
  }
  
  function removeTypingIndicator(id) {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  }
  
  // Add typing animation CSS
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.5;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }
  \`;
  document.head.appendChild(style);
  
  // Initialize widget
  async function init() {
    await loadConfig();
    createWidget();
    console.log('TrulyBot: Widget initialized for WooCommerce');
  }
  
  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}