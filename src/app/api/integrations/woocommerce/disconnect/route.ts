import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Request validation schema
const disconnectSchema = z.object({
  user_id: z.string().uuid('Invalid user ID format'),
  store_url: z.string().url('Invalid store URL')
});

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).substring(7);
  
  try {
    logger.info('WooCommerce disconnect request received', { reqId });
    
    // Parse and validate request body
    const body = await req.json();
    const validatedData = disconnectSchema.parse(body);
    
    const { user_id, store_url } = validatedData;
    
    // Verify the user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, workspace_id')
      .eq('id', user_id)
      .single();
    
    if (userError || !user) {
      logger.warn('User not found for WooCommerce disconnection', { reqId, user_id });
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }
    
    // Find and update the integration
    const normalizedUrl = normalizeUrl(store_url);
    
    const { data: integration, error: findError } = await supabaseAdmin
      .from('store_integrations')
      .select('id, store_name')
      .eq('user_id', user_id)
      .eq('platform', 'woocommerce')
      .eq('store_url', normalizedUrl)
      .single();
    
    if (findError || !integration) {
      logger.warn('Integration not found for disconnection', { 
        reqId, 
        user_id, 
        store_url: normalizedUrl 
      });
      return NextResponse.json({
        success: false,
        message: 'Store integration not found'
      }, { status: 404 });
    }
    
    // Update integration status to disconnected
    const { error: updateError } = await supabaseAdmin
      .from('store_integrations')
      .update({
        status: 'disconnected',
        disconnected_at: new Date().toISOString(),
        // Clear sensitive data
        api_key_encrypted: null,
        api_secret_encrypted: null
      })
      .eq('id', integration.id);
    
    if (updateError) {
      throw updateError;
    }
    
    // Log the disconnection
    logger.info('WooCommerce store disconnected successfully', {
      reqId,
      user_id,
      store_url: normalizedUrl,
      store_name: integration.store_name
    });
    
    // Add activity log
    await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id,
        activity_type: 'integration_disconnected',
        description: `Disconnected WooCommerce store: ${integration.store_name}`,
        metadata: {
          platform: 'woocommerce',
          store_name: integration.store_name,
          store_url: normalizedUrl
        },
        created_at: new Date().toISOString()
      });
    
    return NextResponse.json({
      success: true,
      message: 'Successfully disconnected from TrulyBot'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid request data for WooCommerce disconnection', { 
        reqId, 
        errors: error.errors 
      });
      return NextResponse.json({
        success: false,
        message: 'Invalid request data: ' + error.errors.map(e => e.message).join(', ')
      }, { status: 400 });
    }
    
    logger.error('WooCommerce disconnection error', { 
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