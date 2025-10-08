import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/protectedRoute';
import { securityMonitoringService } from '@/lib/security/securityMonitoringService';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Authenticate and check admin permissions
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult;

    // Create Supabase client for admin operations
    const supabase = createServerSupabaseClient();

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'owner'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const timeRange = (url.searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d') || '24h';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    // Get security metrics
    const metrics = await securityMonitoringService.getSecurityMetrics(timeRange);

    // Get recent security events
    const recentEvents = await securityMonitoringService.getRecentSecurityEvents(limit);

    // Get active alerts
    const activeAlerts = await securityMonitoringService.getActiveSecurityAlerts();

    // Calculate security score (simple implementation)
    const securityScore = calculateSecurityScore(metrics, activeAlerts);

    return NextResponse.json({
      success: true,
      data: {
        timeRange,
        securityScore,
        metrics,
        recentEvents,
        activeAlerts,
        pagination: {
          page,
          limit,
          total: recentEvents.length
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[SecurityDashboard] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate and check admin permissions
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult;

    // Create Supabase client for admin operations
    const supabase = createServerSupabaseClient();

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'owner'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, alertId, notes } = body;

    if (action === 'acknowledge_alert' && alertId) {
      // Acknowledge security alert
      const { error } = await supabase
        .from('security_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user.id,
          resolution_notes: notes || null
        })
        .eq('id', alertId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to acknowledge alert' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    }

    if (action === 'resolve_alert' && alertId) {
      // Resolve security alert
      const { error } = await supabase
        .from('security_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolution_notes: notes || null
        })
        .eq('id', alertId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to resolve alert' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Alert resolved successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[SecurityDashboard] Error handling POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate a simple security score based on metrics and alerts
 */
function calculateSecurityScore(metrics: any, alerts: any[]): {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  factors: string[];
} {
  let score = 100;
  const factors: string[] = [];

  if (!metrics) {
    return {
      score: 0,
      level: 'critical',
      factors: ['Unable to calculate security metrics']
    };
  }

  // Deduct points for active critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const highAlerts = alerts.filter(a => a.severity === 'high').length;
  const mediumAlerts = alerts.filter(a => a.severity === 'medium').length;

  score -= criticalAlerts * 30;
  score -= highAlerts * 20;
  score -= mediumAlerts * 10;

  if (criticalAlerts > 0) factors.push(`${criticalAlerts} critical alerts`);
  if (highAlerts > 0) factors.push(`${highAlerts} high-severity alerts`);
  if (mediumAlerts > 2) factors.push(`${mediumAlerts} medium-severity alerts`);

  // Deduct points for failed authentication attempts
  const failedAuths = metrics.authenticationEvents?.failed || 0;
  const totalAuths = metrics.authenticationEvents?.total || 1;
  const failureRate = failedAuths / totalAuths;

  if (failureRate > 0.1) {
    score -= Math.min(failureRate * 100, 20);
    factors.push(`High authentication failure rate (${(failureRate * 100).toFixed(1)}%)`);
  }

  // Deduct points for rate limit violations
  const rateLimitViolations = metrics.rateLimitViolations?.total || 0;
  if (rateLimitViolations > 10) {
    score -= Math.min(rateLimitViolations / 2, 15);
    factors.push(`${rateLimitViolations} rate limit violations`);
  }

  // Deduct points for security events
  const securityEvents = metrics.securityEvents?.total || 0;
  if (securityEvents > 20) {
    score -= Math.min(securityEvents / 10, 10);
    factors.push(`${securityEvents} security events`);
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, Math.round(score));

  // Determine security level
  let level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  if (score >= 90) level = 'excellent';
  else if (score >= 75) level = 'good';
  else if (score >= 50) level = 'fair';
  else if (score >= 25) level = 'poor';
  else level = 'critical';

  if (factors.length === 0) {
    factors.push('No significant security issues detected');
  }

  return { score, level, factors };
}