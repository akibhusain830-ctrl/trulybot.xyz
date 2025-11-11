const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { shopifyApp } = require('@shopify/shopify-app-express');
const { MemorySessionStorage } = require('@shopify/shopify-app-session-storage-memory');
const fetch = require('node-fetch');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || `http://localhost:${PORT}`;

// Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(','),
  hostName: new URL(HOST).hostname,
  hostScheme: new URL(HOST).protocol.slice(0, -1),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  },
});

// Configure the Shopify App
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Shopify compatibility
}));

app.use(cors({
  origin: function (origin, callback) {
    // Allow Shopify domains and local development
    if (!origin || 
        origin.includes('.myshopify.com') || 
        origin.includes('admin.shopify.com') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Shopify App
const shopifyApp = require('@shopify/shopify-app-express').shopifyApp({
  api: shopify,
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
  },
  sessionStorage: new MemorySessionStorage(),
  useOnlineTokens: false, // Use offline tokens for background operations
});

app.use(shopifyApp.config.auth.path, shopifyApp.auth.begin());
app.use(shopifyApp.config.auth.callbackPath, shopifyApp.auth.callback(), shopifyApp.redirectToShopifyOrAppRoot());
app.use(shopifyApp.config.webhooks.path, shopifyApp.processWebhooks({ webhookHandlers: {} }));

// Verify requests middleware
app.use('/api/*', shopifyApp.validateAuthenticatedSession());

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>TrulyBot Shopify App</title>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
        .container { max-width: 600px; margin: 0 auto; text-align: center; }
        .logo { width: 120px; height: 120px; margin: 20px auto; background: #2563EB; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 48px; }
        .button { display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px; }
        .features { text-align: left; margin: 40px 0; }
        .feature { margin: 16px 0; padding: 16px; background: #f8f9fa; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🤖</div>
        <h1>TrulyBot for Shopify</h1>
        <p>AI-powered chatbot with intelligent order tracking for your Shopify store.</p>
        
        <div class="features">
          <div class="feature">
            <h3>🚀 Quick Setup</h3>
            <p>Connect your TrulyBot account and start helping customers instantly.</p>
          </div>
          <div class="feature">
            <h3>📦 Order Tracking</h3>
            <p>Customers can track orders, check status, and get delivery updates through chat.</p>
          </div>
          <div class="feature">
            <h3>🎨 Full Customization</h3>
            <p>Manage appearance, messages, and behavior from your TrulyBot dashboard.</p>
          </div>
        </div>
        
        <a href="/setup" class="button">Get Started</a>
        <a href="https://trulybot.xyz" class="button" style="background: #6b7280;">Learn More</a>
      </div>
    </body>
    </html>
  `);
});

// Setup page
app.get('/setup', shopifyApp.ensureInstalledOnShop(), async (req, res) => {
  const session = res.locals.shopify.session;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Setup TrulyBot</title>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; background: #f8f9fa; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .form-group { margin: 20px 0; }
        label { display: block; margin-bottom: 8px; font-weight: 600; }
        input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
        .button { background: #2563EB; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; width: 100%; }
        .button:hover { background: #1d4ed8; }
        .button:disabled { background: #9ca3af; cursor: not-allowed; }
        .success { background: #d1fae5; color: #065f46; padding: 12px; border-radius: 6px; margin: 20px 0; }
        .error { background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 6px; margin: 20px 0; }
        .info { background: #dbeafe; color: #1e40af; padding: 12px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
        .shop-info { background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .hidden { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 Connect TrulyBot</h1>
        
        <div class="shop-info">
          <strong>Store:</strong> ${session.shop}<br>
          <strong>Status:</strong> <span id="connection-status">Not Connected</span>
        </div>
        
        <div class="info">
          To connect your store, you'll need your TrulyBot User ID from your dashboard settings.
        </div>
        
        <form id="setup-form">
          <div class="form-group">
            <label for="user-id">TrulyBot User ID</label>
            <input type="text" id="user-id" name="user-id" placeholder="Enter your TrulyBot User ID" required />
          </div>
          
          <button type="submit" class="button" id="connect-btn">Connect to TrulyBot</button>
        </form>
        
        <div id="success-message" class="success hidden">
          ✅ Successfully connected to TrulyBot! Your chatbot is now active on your store.
        </div>
        
        <div id="error-message" class="error hidden"></div>
      </div>
      
      <script>
        const form = document.getElementById('setup-form');
        const connectBtn = document.getElementById('connect-btn');
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');
        const connectionStatus = document.getElementById('connection-status');
        
        // Check current connection status
        checkConnectionStatus();
        
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const userId = document.getElementById('user-id').value.trim();
          if (!userId) {
            showError('Please enter your TrulyBot User ID');
            return;
          }
          
          connectBtn.disabled = true;
          connectBtn.textContent = 'Connecting...';
          hideMessages();
          
          try {
            const response = await fetch('/api/connect', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ user_id: userId })
            });
            
            const result = await response.json();
            
            if (result.success) {
              showSuccess();
              connectionStatus.textContent = 'Connected ✅';
              form.style.display = 'none';
            } else {
              showError(result.message || 'Connection failed');
            }
          } catch (error) {
            showError('Connection failed: ' + error.message);
          }
          
          connectBtn.disabled = false;
          connectBtn.textContent = 'Connect to TrulyBot';
        });
        
        async function checkConnectionStatus() {
          try {
            const response = await fetch('/api/status');
            const result = await response.json();
            
            if (result.connected) {
              connectionStatus.textContent = 'Connected ✅';
              form.style.display = 'none';
              showSuccess();
            }
          } catch (error) {
            console.log('Status check failed:', error);
          }
        }
        
        function showSuccess() {
          successMessage.classList.remove('hidden');
          errorMessage.classList.add('hidden');
        }
        
        function showError(message) {
          errorMessage.textContent = message;
          errorMessage.classList.remove('hidden');
          successMessage.classList.add('hidden');
        }
        
        function hideMessages() {
          successMessage.classList.add('hidden');
          errorMessage.classList.add('hidden');
        }
      </script>
    </body>
    </html>
  `);
});

// API Routes

// Connect to TrulyBot
app.post('/api/connect', shopifyApp.ensureInstalledOnShop(), async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Get shop information
    const client = new shopify.clients.Graphql({ session });
    const shopInfoQuery = `
      query {
        shop {
          name
          email
          myshopifyDomain
          currencyCode
          timezoneAbbreviation
          plan {
            displayName
          }
        }
      }
    `;
    
    const shopResponse = await client.query({
      data: shopInfoQuery,
    });
    
    const shopInfo = shopResponse.body.data.shop;
    
    // Send connection data to TrulyBot backend
    const connectionPayload = {
      user_id,
      platform: 'shopify',
      store_url: `https://${session.shop}`,
      store_name: shopInfo.name,
      store_email: shopInfo.email,
      access_token: session.accessToken,
      shop_domain: session.shop,
      currency: shopInfo.currencyCode,
      timezone: shopInfo.timezoneAbbreviation,
      plan: shopInfo.plan.displayName,
      scopes: process.env.SCOPES.split(',')
    };
    
    const trulyBotResponse = await fetch(`${process.env.TRULYBOT_API_BASE}/integrations/shopify/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Source': 'shopify-app'
      },
      body: JSON.stringify(connectionPayload)
    });
    
    const trulyBotResult = await trulyBotResponse.json();
    
    if (!trulyBotResult.success) {
      return res.status(400).json({
        success: false,
        message: trulyBotResult.message || 'Failed to connect to TrulyBot'
      });
    }
    
    // Install chatbot script tag
    await installChatbotScript(session, user_id);
    
    console.log(`Shopify store connected: ${session.shop} -> TrulyBot user: ${user_id}`);
    
    res.json({
      success: true,
      message: 'Successfully connected to TrulyBot!'
    });
    
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check connection status
app.get('/api/status', shopifyApp.ensureInstalledOnShop(), async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    
    // Check if script tag exists
    const client = new shopify.clients.Rest({ session });
    const scriptTags = await client.get({
      path: 'script_tags',
    });
    
    const trulyBotScript = scriptTags.body.script_tags.find(tag => 
      tag.src && tag.src.includes('trulybot.xyz')
    );
    
    res.json({
      connected: !!trulyBotScript,
      shop: session.shop
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      connected: false,
      error: 'Failed to check status'
    });
  }
});

// Disconnect from TrulyBot
app.post('/api/disconnect', shopifyApp.ensureInstalledOnShop(), async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    
    // Remove script tag
    await removeChatbotScript(session);
    
    // Notify TrulyBot backend
    await fetch(`${process.env.TRULYBOT_API_BASE}/integrations/shopify/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shop_domain: session.shop,
        store_url: `https://${session.shop}`
      })
    });
    
    res.json({
      success: true,
      message: 'Disconnected from TrulyBot'
    });
    
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect'
    });
  }
});

// Helper function to install chatbot script
async function installChatbotScript(session, userId) {
  try {
    const client = new shopify.clients.Rest({ session });
    
    // Remove existing script tags first
    await removeChatbotScript(session);
    
    // Install new script tag
    const scriptTag = await client.post({
      path: 'script_tags',
      data: {
        script_tag: {
          event: 'onload',
          src: `${process.env.TRULYBOT_API_BASE}/widget/shopify.js?userId=${userId}&shop=${session.shop}`,
          display_scope: 'online_store'
        }
      }
    });
    
    console.log(`Script tag installed for shop: ${session.shop}`);
    return scriptTag.body.script_tag;
    
  } catch (error) {
    console.error('Failed to install script tag:', error);
    throw error;
  }
}

// Helper function to remove chatbot script
async function removeChatbotScript(session) {
  try {
    const client = new shopify.clients.Rest({ session });
    
    // Get all script tags
    const scriptTags = await client.get({
      path: 'script_tags',
    });
    
    // Find and remove TrulyBot script tags
    for (const tag of scriptTags.body.script_tags) {
      if (tag.src && tag.src.includes('trulybot.xyz')) {
        await client.delete({
          path: `script_tags/${tag.id}`,
        });
        console.log(`Removed script tag ${tag.id} for shop: ${session.shop}`);
      }
    }
    
  } catch (error) {
    console.error('Failed to remove script tags:', error);
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TrulyBot Shopify App running on ${HOST}`);
  console.log(`📋 Setup URL: ${HOST}/setup`);
});