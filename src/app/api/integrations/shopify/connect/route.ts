import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Request validation schema
const connectSchema = z.object({
  user_id: z.string().uuid('Invalid user ID format'),
  platform: z.literal('shopify'),
  store_url: z.string().url('Invalid store URL'),
  store_name: z.string().min(1, 'Store name is required'),
  store_email: z.string().email('Invalid store email'),
  access_token: z.string().min(1, 'Access token is required'),
  shop_domain: z.string().min(1, 'Shop domain is required'),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  plan: z.string().optional(),
  scopes: z.array(z.string()).optional()
});

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).substring(7);
  
  try {
    logger.info('Shopify connect request received', { reqId });
    
    // Parse and validate request body
    const body = await req.json();
    const validatedData = connectSchema.parse(body);
    
    const { 
      user_id, 
      platform, 
      store_url, 
      store_name,
      store_email,
      access_token,
      shop_domain,
      currency,
      timezone,
      plan,
      scopes
    } = validatedData;
    
    // Verify the user exists in our system
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, workspace_id, subscription_status, subscription_tier')
      .eq('id', user_id)
      .single();
    
    if (userError || !user) {
      logger.warn('User not found for Shopify connection', { reqId, user_id });
      return NextResponse.json({
        success: false,
        message: 'User not found. Please ensure you are using the correct User ID from your TrulyBot dashboard.'
      }, { status: 404 });
    }
    
    // Check if subscription allows integrations
    const allowedTiers = ['pro', 'business', 'enterprise'];
    if (!allowedTiers.includes(user.subscription_tier)) {
      logger.warn('Subscription tier does not allow integrations', { 
        reqId, 
        user_id, 
        tier: user.subscription_tier 
      });
      return NextResponse.json({
        success: false,
        message: 'Integration features require a Pro subscription or higher. Please upgrade your plan.'
      }, { status: 403 });
    }
    
    // Test Shopify API connection
    const apiTestResult = await testShopifyAPI(shop_domain, access_token);
    
    if (!apiTestResult.success) {
      logger.error('Shopify API test failed', { 
        reqId, 
        user_id, 
        shop_domain, 
        error: apiTestResult.error 
      });
      return NextResponse.json({
        success: false,
        message: `Shopify API connection failed: ${apiTestResult.error}`
      }, { status: 400 });
    }
    
    // Check if store is already connected
    const { data: existingConnection } = await supabaseAdmin
      .from('store_integrations')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('platform', 'shopify')
      .eq('shop_domain', shop_domain)
      .single();
    
    if (existingConnection && existingConnection.status === 'active') {
      logger.info('Shopify store already connected', { reqId, user_id, shop_domain });
      return NextResponse.json({
        success: true,
        message: 'Store is already connected to TrulyBot.'
      });
    }
    
    // Check store connection limit (1 store per user for all plans)
    const { data: allConnections, error: connectionsError } = await supabaseAdmin
      .from('store_integrations')
      .select('id, platform, store_name, status')
      .eq('user_id', user_id)
      .eq('status', 'active');
    
    if (connectionsError) {
      logger.error('Error checking existing connections', { reqId, user_id, error: connectionsError });
      throw connectionsError;
    }
    
    const activeConnections = allConnections || [];
    
    // If there are already active connections and this is not an update to existing connection
    if (activeConnections.length > 0 && !existingConnection) {
      const connectedStore = activeConnections[0];
      logger.warn('Store connection limit reached', { 
        reqId, 
        user_id, 
        existing_store: connectedStore.store_name,
        platform: connectedStore.platform
      });
      return NextResponse.json({
        success: false,
        message: `You can only connect one store per account. You currently have "${connectedStore.store_name}" (${connectedStore.platform}) connected. Please disconnect your current store first if you want to connect a different one.`
      }, { status: 400 });
    }
    
    // Encrypt access token before storing
    const encryptedAccessToken = await encryptCredential(access_token);
    
    // Save or update integration
    const integrationData = {
      user_id,
      workspace_id: user.workspace_id,
      platform,
      store_url: normalizeUrl(store_url),
      store_name,
      store_email,
      access_token_encrypted: encryptedAccessToken,
      shop_domain,
      status: 'active',
      connected_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
      config: {
        currency: currency || 'INR',
        timezone: timezone || 'UTC',
        plan: plan || 'basic',
        scopes: scopes || [],
        api_version: '2024-10'
      }
    };
    
    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabaseAdmin
        .from('store_integrations')
        .update(integrationData)
        .eq('id', existingConnection.id);
      
      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new connection
      const { error: insertError } = await supabaseAdmin
        .from('store_integrations')
        .insert(integrationData);
      
      if (insertError) {
        throw insertError;
      }
    }
    
    // Log successful connection
    logger.info('Shopify store connected successfully', {
      reqId,
      user_id,
      shop_domain,
      store_name,
      plan
    });
    
    // Send welcome notification
    await sendConnectionNotification(user_id, {
      platform: 'Shopify',
      store_name,
      store_url: store_url
    });
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected your Shopify store to TrulyBot! Your chatbot is now active.',
      data: {
        connected_at: integrationData.connected_at,
        shop_info: {
          domain: shop_domain,
          currency,
          plan
        }
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid request data for Shopify connection', { 
        reqId, 
        errors: error.errors 
      });
      return NextResponse.json({
        success: false,
        message: 'Invalid request data: ' + error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }
    
    logger.error('Shopify connection error', { 
      reqId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json({
      success: false,
      message: 'Internal server error. Please try again later.'
    }, { status: 500 });
  }
}

/**
 * Test Shopify API connection
 */
async function testShopifyAPI(shopDomain: string, accessToken: string) {
  try {
    const testEndpoint = `https://${shopDomain}/admin/api/2024-10/shop.json`;
    
    const response = await fetch(testEndpoint, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'TrulyBot-Integration/1.0'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `API returned ${response.status}: ${response.statusText}`
      };
    }
    
    const data = await response.json();
    
    if (!data.shop) {
      return {
        success: false,
        error: 'Invalid API response'
      };
    }
    
    return {
      success: true,
      shopInfo: data.shop
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Normalize store URL
 */
function normalizeUrl(url: string): string {
  // Remove trailing slash and ensure https
  let normalized = url.trim().replace(/\/+$/, '');
  
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  
  return normalized;
}

/**
 * Encrypt credentials for secure storage
 */
async function encryptCredential(credential: string): Promise<string> {
  // In production, use proper encryption
  // For now, return base64 encoded (replace with actual encryption)
  return Buffer.from(credential).toString('base64');
}

/**
 * Send connection notification
 */
async function sendConnectionNotification(userId: string, storeInfo: any) {
  try {
    // Add notification to user's activity log
    await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: 'integration_connected',
        description: `Connected ${storeInfo.platform} store: ${storeInfo.store_name}`,
        metadata: storeInfo,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    logger.warn('Failed to send connection notification', { userId, error });
  }
}