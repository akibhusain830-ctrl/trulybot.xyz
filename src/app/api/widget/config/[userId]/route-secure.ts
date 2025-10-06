/**
 * CRITICAL SECURITY FIX: Secure Widget Config API
 * Fixes: Unauthenticated access to user configurations
 * 
 * BEFORE: Any user could access /api/widget/config/[userId] without authentication
 * AFTER: Requires authentication OR validates widget domain origin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/secrets';
import { logger } from '@/lib/logger';
import { createRequestId } from '@/lib/requestContext';
import { rateLimit } from '@/lib/security/rateLimit';

export const dynamic = 'force-dynamic';

// Secure CORS headers - only allow specific domains
const getAllowedOrigins = () => {
  const allowedDomains = process.env.WIDGET_ALLOWED_DOMAINS?.split(',') || [
    'https://trulybot.xyz',
    'https://www.trulybot.xyz'
  ];
  return allowedDomains;
};

const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  { auth: { persistSession: false } }
);

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Widget-Domain',
    'Access-Control-Max-Age': '86400',
  };

  // Only allow CORS from registered domains
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return new NextResponse(null, { status: 200, headers });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const reqId = createRequestId();
  
  try {
    // Rate limiting protection
    const rateLimitResult = await rateLimit.widget.check(req);
    if (!rateLimitResult.allowed) {
      logger.warn('Widget config rate limit exceeded', { reqId, ip: req.ip });
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { userId } = params;
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const widgetDomain = req.headers.get('x-widget-domain');

    // Input validation
    if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-f-]{36}$/i)) {
      logger.warn('Invalid user ID format in widget config request', { reqId, userId });
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Security validation: Check if request is from allowed domain
    const allowedOrigins = getAllowedOrigins();
    let isAuthorizedDomain = false;
    
    if (origin && allowedOrigins.includes(origin)) {
      isAuthorizedDomain = true;
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        isAuthorizedDomain = allowedOrigins.includes(`${refererUrl.protocol}//${refererUrl.hostname}`);
      } catch {
        isAuthorizedDomain = false;
      }
    }

    // Additional security: Verify widget domain is registered for this user
    if (widgetDomain && !isAuthorizedDomain) {
      const { data: domainConfig } = await supabaseAdmin
        .from('widget_domains')
        .select('id')
        .eq('user_id', userId)
        .eq('domain', widgetDomain)
        .eq('status', 'active')
        .single();

      if (domainConfig) {
        isAuthorizedDomain = true;
      }
    }

    if (!isAuthorizedDomain) {
      logger.warn('Unauthorized domain access to widget config', { 
        reqId, 
        userId, 
        origin, 
        referer, 
        widgetDomain 
      });
      return NextResponse.json(
        { error: 'Unauthorized domain' },
        { status: 403 }
      );
    }

    // Fetch user's chatbot configuration with minimal data exposure
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        chatbot_name,
        welcome_message,
        accent_color,
        subscription_tier,
        subscription_status,
        trial_ends_at,
        workspace_id
      `)
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      logger.warn('Profile not found for widget config', { reqId, userId, error: profileError });
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Check if user has active subscription or trial
    const isTrialActive = profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
    const hasActiveSubscription = profile.subscription_status === 'active';

    if (!isTrialActive && !hasActiveSubscription) {
      logger.info('Widget access for inactive subscription', { reqId, userId });
      return NextResponse.json({
        error: 'Subscription expired',
        message: 'Please upgrade your subscription to continue using the widget'
      }, { status: 402 });
    }

    // Determine features based on subscription tier
    let tier: 'basic' | 'pro' | 'ultra' = 'basic';
    if (isTrialActive || profile.subscription_tier === 'ultra') {
      tier = 'ultra';
    } else if (profile.subscription_tier === 'pro') {
      tier = 'pro';
    }

    // Build secure configuration - only expose necessary data
    const widgetConfig = {
      tier,
      workspace_id: profile.workspace_id,
      chatbot_name: profile.chatbot_name || 'Assistant',
      welcome_message: profile.welcome_message || 'Hello! How can I help you today?',
      accent_color: profile.accent_color || '#2563EB',
      // Security: Don't expose internal user data
      features: {
        customBranding: tier !== 'basic',
        customTheme: tier === 'ultra',
        prioritySupport: tier !== 'basic',
        analytics: tier !== 'basic'
      }
    };

    // Set secure response headers
    const headers: Record<string, string> = {
      'Cache-Control': 'private, max-age=300', // 5 minute cache
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
    };

    if (origin && allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    logger.info('Widget config served successfully', { reqId, userId, tier });

    return NextResponse.json(widgetConfig, { headers });

  } catch (error) {
    logger.error('Widget config API error', { 
      reqId, 
      userId: params.userId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}