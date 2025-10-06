
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/secrets';

export const dynamic = 'force-dynamic';

// Add CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  { auth: { persistSession: false } }
);

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch user's chatbot configuration
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        chatbot_name,
        welcome_message,
        accent_color,
        chatbot_logo_url,
        chatbot_theme,
        custom_css,
        subscription_tier
      `)
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Configuration not found' }, 
        { status: 404, headers: corsHeaders }
      );
    }

    // Get subscription info to determine available features
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_name, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Check if user is on trial
    const { data: trialData } = await supabaseAdmin
      .from('profiles')
      .select('trial_end_date')
      .eq('id', userId)
      .single();

    const isOnTrial = trialData?.trial_end_date && new Date(trialData.trial_end_date) > new Date();

    // Determine tier (basic, pro, ultra)
    let tier: 'basic' | 'pro' | 'ultra' = 'basic';
    
    // Trial users get Ultra features
    if (isOnTrial) {
      tier = 'ultra';
    } else if (subscription?.plan_name && subscription.status === 'active') {
      const planName = subscription.plan_name.toLowerCase();
      if (planName.includes('ultra')) tier = 'ultra';
      else if (planName.includes('pro')) tier = 'pro';
    }

    // Build configuration based on subscription tier
    const widgetConfig: any = {
      tier,
      // Basic features - available to all
      chatbot_name: 'Assistant',
      welcome_message: 'Hello! How can I help you today?',
      accent_color: '#2563EB',
    };

    // Pro features - name and welcome message customization
    if (tier === 'pro' || tier === 'ultra') {
      widgetConfig.chatbot_name = profile.chatbot_name || 'Assistant';
      widgetConfig.welcome_message = profile.welcome_message || 'Hello! How can I help you today?';
    }

    // Ultra features - full customization
    if (tier === 'ultra') {
      widgetConfig.accent_color = profile.accent_color || '#2563EB';
      widgetConfig.chatbot_logo_url = profile.chatbot_logo_url || '';
      widgetConfig.chatbot_theme = profile.chatbot_theme || 'default';
      widgetConfig.custom_css = profile.custom_css || '';
    }

    return NextResponse.json(widgetConfig, { headers: corsHeaders });

  } catch (error) {
    console.error('Widget config API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
