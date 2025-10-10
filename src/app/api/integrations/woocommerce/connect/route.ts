import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Request validation schema
const connectSchema = z.object({
  user_id: z.string().uuid('Invalid user ID format'),
  platform: z.literal('woocommerce'),
  store_url: z.string().url('Invalid store URL'),
  api_key: z.string().min(1, 'API key is required'),
  api_secret: z.string().min(1, 'API secret is required'),
  permissions: z.enum(['read', 'write', 'read_write']),
  store_name: z.string().min(1, 'Store name is required'),
  store_email: z.string().email('Invalid store email'),
  plugin_version: z.string().optional()
});

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).substring(7);
  
  try {
    logger.info('WooCommerce connect request received', { reqId });
    
    // Parse and validate request body
    const body = await req.json();
    const validatedData = connectSchema.parse(body);
    
    const { 
      user_id, 
      platform, 
      store_url, 
      api_key, 
      api_secret, 
      permissions,
      store_name,
      store_email,
      plugin_version 
    } = validatedData;
    
    // Verify the user exists in our system
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, workspace_id, subscription_status, subscription_tier')
      .eq('id', user_id)
      .single();
    
    if (userError || !user) {
      logger.warn('User not found for WooCommerce connection', { reqId, user_id });
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
    
    // Test WooCommerce API connection
    const apiTestResult = await testWooCommerceAPI(store_url, api_key, api_secret);
    
    if (!apiTestResult.success) {
      logger.error('WooCommerce API test failed', { 
        reqId, 
        user_id, 
        store_url, 
        error: apiTestResult.error 
      });
      return NextResponse.json({
        success: false,
        message: `WooCommerce API connection failed: ${apiTestResult.error}`
      }, { status: 400 });
    }
    
    // Check if store is already connected
    const { data: existingConnection } = await supabaseAdmin
      .from('store_integrations')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('platform', 'woocommerce')
      .eq('store_url', store_url)
      .single();
    
    if (existingConnection && existingConnection.status === 'active') {
      logger.info('Store already connected', { reqId, user_id, store_url });
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
    
    // Encrypt API credentials before storing
    const encryptedApiKey = await encryptCredential(api_key);
    const encryptedApiSecret = await encryptCredential(api_secret);
    
    // Save or update integration
    const integrationData = {
      user_id,
      workspace_id: user.workspace_id,
      platform,
      store_url: normalizeUrl(store_url),
      store_name,
      store_email,
      api_key_encrypted: encryptedApiKey,
      api_secret_encrypted: encryptedApiSecret,
      permissions,
      plugin_version: plugin_version || '1.0.0',
      status: 'active',
      connected_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
      config: {
        currency: apiTestResult.storeInfo?.currency || 'INR',
        timezone: apiTestResult.storeInfo?.timezone || 'UTC',
        version: apiTestResult.storeInfo?.version || 'unknown'
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
    logger.info('WooCommerce store connected successfully', {
      reqId,
      user_id,
      store_url,
      store_name,
      plugin_version
    });
    
    // Send welcome email/notification (optional)
    await sendConnectionNotification(user_id, {
      platform: 'WooCommerce',
      store_name,
      store_url
    });
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected your WooCommerce store to TrulyBot! Your chatbot is now active.',
      data: {
        connected_at: integrationData.connected_at,
        store_info: apiTestResult.storeInfo
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid request data for WooCommerce connection', { 
        reqId, 
        errors: error.errors 
      });
      return NextResponse.json({
        success: false,
        message: 'Invalid request data: ' + error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }
    
    logger.error('WooCommerce connection error', { reqId, error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({
      success: false,
      message: 'Internal server error. Please try again later.'
    }, { status: 500 });
  }
}

/**
 * Test WooCommerce API connection
 */
async function testWooCommerceAPI(storeUrl: string, apiKey: string, apiSecret: string) {
  try {
    const normalizedUrl = normalizeUrl(storeUrl);
    const testEndpoint = `${normalizedUrl}/wp-json/wc/v3/system_status`;
    
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    const response = await fetch(testEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'User-Agent': 'TrulyBot-Integration/1.0',
        'Accept': 'application/json'
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
    
    // Extract store information
    const storeInfo = {
      currency: data.settings?.currency?.value || 'INR',
      timezone: data.settings?.timezone?.value || 'UTC',
      version: data.environment?.wp_version || 'unknown',
      wc_version: data.environment?.wc_version || 'unknown'
    };
    
    return {
      success: true,
      storeInfo
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