import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const reqId = Math.random().toString(36).substring(7);
  
  try {
    logger.info('Get integrations request', { reqId });
    
    // Authenticate user
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's integrations
    const { data: integrations, error: integrationsError } = await supabaseAdmin
      .from('store_integrations')
      .select(`
        id,
        platform,
        store_url,
        store_name,
        store_email,
        shop_domain,
        status,
        config,
        connected_at,
        last_sync_at
      `)
      .eq('user_id', user.id)
      .order('connected_at', { ascending: false });
    
    if (integrationsError) {
      throw integrationsError;
    }
    
    // Get integration statistics
    const { data: stats } = await supabaseAdmin
      .from('integration_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    // Format response
    const formattedIntegrations = (integrations || []).map(integration => ({
      id: integration.id,
      platform: integration.platform,
      store_name: integration.store_name,
      store_url: integration.store_url,
      store_email: integration.store_email,
      shop_domain: integration.shop_domain,
      status: integration.status,
      currency: integration.config?.currency || 'USD',
      plan: integration.config?.plan || 'basic',
      connected_at: integration.connected_at,
      last_sync_at: integration.last_sync_at
    }));
    
    logger.info('Integrations retrieved successfully', { 
      reqId, 
      userId: user.id, 
      count: formattedIntegrations.length 
    });
    
    return NextResponse.json({
      success: true,
      integrations: formattedIntegrations,
      stats: stats || {
        total_integrations: 0,
        active_integrations: 0,
        woocommerce_stores: 0,
        shopify_stores: 0
      }
    });
    
  } catch (error) {
    logger.error('Get integrations error', { 
      reqId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch integrations'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const reqId = Math.random().toString(36).substring(7);
  
  try {
    const { searchParams } = new URL(req.url);
    const integrationId = searchParams.get('id');
    
    if (!integrationId) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }
    
    // Authenticate user
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get integration details
    const { data: integration, error: getError } = await supabaseAdmin
      .from('store_integrations')
      .select('platform, store_name, store_url, shop_domain')
      .eq('id', integrationId)
      .eq('user_id', user.id)
      .single();
    
    if (getError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }
    
    // Update integration status to disconnected
    const { error: updateError } = await supabaseAdmin
      .from('store_integrations')
      .update({
        status: 'disconnected',
        disconnected_at: new Date().toISOString(),
        // Clear sensitive data
        api_key_encrypted: null,
        api_secret_encrypted: null,
        access_token_encrypted: null
      })
      .eq('id', integrationId)
      .eq('user_id', user.id);
    
    if (updateError) {
      throw updateError;
    }
    
    // Log activity
    await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: 'integration_disconnected',
        description: `Disconnected ${integration.platform} store: ${integration.store_name}`,
        metadata: {
          platform: integration.platform,
          store_name: integration.store_name,
          store_url: integration.store_url,
          shop_domain: integration.shop_domain
        }
      });
    
    logger.info('Integration disconnected successfully', {
      reqId,
      userId: user.id,
      integrationId,
      platform: integration.platform,
      storeName: integration.store_name
    });
    
    return NextResponse.json({
      success: true,
      message: 'Integration disconnected successfully'
    });
    
  } catch (error) {
    logger.error('Delete integration error', { 
      reqId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json({
      success: false,
      message: 'Failed to disconnect integration'
    }, { status: 500 });
  }
}