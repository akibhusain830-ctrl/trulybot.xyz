import { NextRequest, NextResponse } from 'next/server';
import { BotAnalyticsService } from '@/lib/analytics/service';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/summary
 * Returns analytics summary for the user's workspace
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's profile and workspace
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.workspace_id) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Get analytics summary
    const summary = await BotAnalyticsService.getAnalyticsSummary(profile.workspace_id);

    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Analytics summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics summary' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/summary
 * Track a custom analytics event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, session_id, metadata } = body;

    // Get authenticated user
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's workspace
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.workspace_id) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Track the event
    await BotAnalyticsService.trackEvent({
      session_id: session_id || `manual_${Date.now()}`,
      workspace_id: profile.workspace_id,
      user_id: user.id,
      event_type,
      metadata
    });

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    logger.error('Analytics tracking API error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}