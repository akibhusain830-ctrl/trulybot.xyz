
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/secrets';

export const dynamic = 'force-dynamic';

// Enhanced CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  { 
    auth: { persistSession: false },
    global: {
      headers: {
        'x-application-name': 'trulybot-widget'
      }
    }
  }
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

    // Validate userId format (basic validation)
    if (typeof userId !== 'string' || userId.length < 1) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch user's chatbot configuration with timeout and retry logic
    let profile = null;
    let profileError = null;
    
    // Retry logic for database queries
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select(`
            chatbot_name,
            welcome_message,
            accent_color,
            chatbot_logo_url,
            chatbot_theme,
            custom_css,
            subscription_tier,
            id
          `)
          .eq('id', userId)
          .single();
        
        profile = data;
        profileError = error;
        break; // Success, exit retry loop
      } catch (retryError) {
        console.warn(`Database query attempt ${attempt} failed:`, retryError);
        if (attempt === 3) {
          profileError = retryError;
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      
      // Return fallback configuration instead of error
      return NextResponse.json({
        chatbot_name: 'Assistant',
        welcome_message: 'Hello! How can I help you today?',
        accent_color: '#2563EB',
        chatbot_logo_url: null,
        chatbot_theme: 'light',
        custom_css: null,
        subscription_tier: 'basic',
        fallback: true
      }, { 
        status: 200, 
        headers: {
          ...corsHeaders,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

    // Get subscription info to determine available features with retry logic
    let subscription = null;
    let trialData = null;
    
    try {
      const { data: subData } = await supabaseAdmin
        .from('subscriptions')
        .select('plan_name, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      subscription = subData;

      // Check if user is on trial
      const { data: trial } = await supabaseAdmin
        .from('profiles')
        .select('trial_end_date')
        .eq('id', userId)
        .single();
      trialData = trial;
    } catch (error) {
      console.warn('Error fetching subscription info:', error);
      // Continue with fallback
    }

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

    // Build configuration based on subscription tier with null checks
    const widgetConfig: any = {
      tier,
      // Basic features - available to all
      chatbot_name: 'Assistant',
      welcome_message: 'Hello! How can I help you today?',
      accent_color: '#2563EB',
      chatbot_logo_url: null,
      chatbot_theme: 'light',
      custom_css: null,
      subscription_tier: tier,
      fallback: false
    };

    // Pro features - name and welcome message customization
    if (tier === 'pro' || tier === 'ultra') {
      widgetConfig.chatbot_name = profile?.chatbot_name || 'Assistant';
      widgetConfig.welcome_message = profile?.welcome_message || 'Hello! How can I help you today?';
    }

    // Ultra features - full customization
    if (tier === 'ultra') {
      widgetConfig.accent_color = profile?.accent_color || '#2563EB';
      widgetConfig.chatbot_logo_url = profile?.chatbot_logo_url || null;
      widgetConfig.chatbot_theme = profile?.chatbot_theme || 'light';
      widgetConfig.custom_css = profile?.custom_css || null;
    }

    // Validate and sanitize configuration
    if (widgetConfig.accent_color && !/^#[0-9A-Fa-f]{6}$/.test(widgetConfig.accent_color)) {
      widgetConfig.accent_color = '#2563EB';
    }

    if (!['light', 'dark', 'auto'].includes(widgetConfig.chatbot_theme)) {
      widgetConfig.chatbot_theme = 'light';
    }

    if (widgetConfig.chatbot_logo_url) {
      try {
        new URL(widgetConfig.chatbot_logo_url);
      } catch {
        widgetConfig.chatbot_logo_url = null;
      }
    }

    // Sanitize text fields
    widgetConfig.chatbot_name = String(widgetConfig.chatbot_name).slice(0, 100);
    widgetConfig.welcome_message = String(widgetConfig.welcome_message).slice(0, 500);

    return NextResponse.json(widgetConfig, { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Widget config API error:', error);
    
    // Return fallback configuration on any error
    return NextResponse.json({
      chatbot_name: 'Assistant',
      welcome_message: 'Hello! How can I help you today?',
      accent_color: '#2563EB',
      chatbot_logo_url: null,
      chatbot_theme: 'light',
      custom_css: null,
      subscription_tier: 'basic',
      tier: 'basic',
      fallback: true,
      error_handled: true
    }, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
