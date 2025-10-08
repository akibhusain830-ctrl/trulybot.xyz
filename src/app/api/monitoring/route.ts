/**
 * Monitoring and Health Dashboard API
 * Provides system insights without affecting existing functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMonitoringDashboard, checkDatabaseHealth } from '@/lib/robustness/monitoring';
import { getFailsafeStatus, resetAllCircuitBreakers } from '@/lib/robustness/failsafe';
import { logger } from '@/lib/logger';

// Simple authentication for monitoring endpoints
function isAuthorizedForMonitoring(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const monitoringKey = process.env.MONITORING_API_KEY;
  
  // If no monitoring key is set, allow access in development
  if (!monitoringKey) {
    return process.env.NODE_ENV === 'development';
  }
  
  return authHeader === `Bearer ${monitoringKey}`;
}

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    if (!isAuthorizedForMonitoring(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';

    switch (action) {
      case 'dashboard':
        // Get comprehensive monitoring data
        const dashboard = getMonitoringDashboard();
        const failsafeStatus = getFailsafeStatus();
        
        return NextResponse.json({
          status: 'success',
          data: {
            monitoring: dashboard,
            failsafe: failsafeStatus,
            system: {
              nodeVersion: process.version,
              platform: process.platform,
              uptime: process.uptime(),
              memoryUsage: process.memoryUsage()
            }
          }
        });

      case 'health':
        // Quick health check
        try {
          await checkDatabaseHealth();
          const healthSummary = getMonitoringDashboard().health;
          
          const overallHealth = Object.values(healthSummary).every(
            service => service.status === 'healthy'
          ) ? 'healthy' : 'degraded';

          return NextResponse.json({
            status: overallHealth,
            checks: healthSummary,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          return NextResponse.json({
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }, { status: 503 });
        }

      case 'metrics':
        // Performance metrics only
        const performance = getMonitoringDashboard().performance;
        return NextResponse.json({
          status: 'success',
          metrics: performance,
          timestamp: new Date().toISOString()
        });

      case 'failsafe':
        // Failsafe system status
        const status = getFailsafeStatus();
        return NextResponse.json({
          status: 'success',
          failsafe: status,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: dashboard, health, metrics, or failsafe' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Monitoring API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    if (!isAuthorizedForMonitoring(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'reset-circuit-breakers':
        // Reset all circuit breakers
        resetAllCircuitBreakers();
        logger.info('Circuit breakers reset via API');
        
        return NextResponse.json({
          status: 'success',
          message: 'All circuit breakers have been reset',
          timestamp: new Date().toISOString()
        });

      case 'trigger-health-check':
        // Trigger a comprehensive health check
        await checkDatabaseHealth();
        
        return NextResponse.json({
          status: 'success',
          message: 'Health check completed',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: reset-circuit-breakers or trigger-health-check' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Monitoring API POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
