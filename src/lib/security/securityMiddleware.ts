import { NextRequest, NextResponse } from 'next/server';
import { securityMonitoringService } from './securityMonitoringService';

export interface SecurityMiddlewareConfig {
  logAllRequests?: boolean;
  logSensitiveEndpoints?: string[];
  detectAnomalies?: boolean;
  enableRateLimitLogging?: boolean;
  alertOnSuspiciousActivity?: boolean;
}

export class SecurityMiddleware {
  private config: SecurityMiddlewareConfig;

  constructor(config: SecurityMiddlewareConfig = {}) {
    this.config = {
      logAllRequests: false,
      logSensitiveEndpoints: [
        '/api/auth/',
        '/api/payments/',
        '/api/user/',
        '/api/settings',
        '/api/subscription/',
        '/api/knowledge/',
        '/api/chat'
      ],
      detectAnomalies: true,
      enableRateLimitLogging: true,
      alertOnSuspiciousActivity: true,
      ...config
    };
  }

  /**
   * Main security middleware function
   */
  async processRequest(
    req: NextRequest,
    response: NextResponse,
    user?: any,
    requestId?: string
  ): Promise<void> {
    try {
      const startTime = Date.now();
      const clientIp = this.getClientIp(req);
      const userAgent = req.headers.get('user-agent') || '';
      const endpoint = req.nextUrl.pathname;
      const method = req.method;

      // Check if this is a sensitive endpoint
      const isSensitiveEndpoint = this.config.logSensitiveEndpoints?.some(
        pattern => endpoint.startsWith(pattern)
      );

      // Log security events based on configuration
      if (this.config.logAllRequests || isSensitiveEndpoint) {
        await this.logRequestEvent(req, user, requestId, clientIp, userAgent);
      }

      // Detect suspicious patterns
      if (this.config.detectAnomalies && user?.id) {
        await this.detectSuspiciousActivity(user.id, clientIp, userAgent, endpoint);
      }

      // Monitor response for security indicators
      await this.monitorResponse(response, req, user, requestId);

      // Log response time for performance monitoring
      const responseTime = Date.now() - startTime;
      if (responseTime > 5000) { // Log slow responses
        await securityMonitoringService.logSecurityEvent({
          eventType: 'slow_response',
          severity: 'low',
          userId: user?.id,
          ipAddress: clientIp,
          endpoint,
          method,
          requestId,
          eventData: {
            responseTime,
            threshold: 5000
          }
        });
      }
    } catch (error) {
      console.error('[SecurityMiddleware] Error processing request:', error);
    }
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    eventType: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'session_refresh' | 'password_reset',
    req: NextRequest,
    userId?: string,
    email?: string,
    success: boolean = true,
    failureReason?: string,
    requestId?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      const clientIp = this.getClientIp(req);
      const userAgent = req.headers.get('user-agent') || '';
      
      // Detect if this looks suspicious
      const suspicious = await this.detectSuspiciousAuth(
        eventType,
        clientIp,
        userAgent,
        userId,
        email
      );

      await securityMonitoringService.logAuthenticationEvent({
        eventType,
        userId,
        email,
        ipAddress: clientIp,
        userAgent,
        sessionId: this.extractSessionId(req),
        requestId,
        success,
        failureReason,
        eventData: additionalData,
        suspicious,
        requiresReview: suspicious || (eventType === 'login_failure' && !success)
      });

      // Log high-priority auth events as security events
      if (!success || suspicious || eventType === 'password_reset') {
        await securityMonitoringService.logSecurityEvent({
          eventType: `auth_${eventType}`,
          severity: suspicious ? 'high' : success ? 'low' : 'medium',
          userId,
          ipAddress: clientIp,
          userAgent,
          endpoint: req.nextUrl.pathname,
          method: req.method,
          requestId,
          eventData: {
            authEventType: eventType,
            success,
            failureReason,
            suspicious,
            ...additionalData
          }
        });
      }
    } catch (error) {
      console.error('[SecurityMiddleware] Error logging auth event:', error);
    }
  }

  /**
   * Log rate limit violation
   */
  async logRateLimitViolation(
    req: NextRequest,
    limitType: 'per_user' | 'per_ip' | 'per_endpoint' | 'burst' | 'concurrent',
    currentCount: number,
    limitThreshold: number,
    windowDurationSeconds: number,
    userId?: string,
    requestId?: string
  ): Promise<void> {
    try {
      const clientIp = this.getClientIp(req);
      
      await securityMonitoringService.logRateLimitViolation({
        userId,
        ipAddress: clientIp,
        endpoint: req.nextUrl.pathname,
        limitType,
        currentCount,
        limitThreshold,
        windowDurationSeconds,
        userAgent: req.headers.get('user-agent') || undefined,
        sessionId: this.extractSessionId(req),
        requestId,
        requestData: {
          method: req.method,
          referer: req.headers.get('referer'),
          origin: req.headers.get('origin')
        }
      });
    } catch (error) {
      console.error('[SecurityMiddleware] Error logging rate limit violation:', error);
    }
  }

  /**
   * Log data access for audit trail
   */
  async logDataAccess(
    tableName: string,
    operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT_SENSITIVE',
    recordId?: string,
    userId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    endpoint?: string,
    requestId?: string,
    reason?: string
  ): Promise<void> {
    try {
      await securityMonitoringService.logAuditTrail({
        tableName,
        operation,
        recordId,
        userId,
        oldValues,
        newValues,
        endpoint,
        requestId,
        reason
      });
    } catch (error) {
      console.error('[SecurityMiddleware] Error logging data access:', error);
    }
  }

  /**
   * Create security alert
   */
  async createAlert(
    alertType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    title: string,
    description: string,
    userId?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      await securityMonitoringService.createSecurityAlert({
        alertType,
        severity,
        title,
        description,
        userId,
        ...additionalData
      });
    } catch (error) {
      console.error('[SecurityMiddleware] Error creating alert:', error);
    }
  }

  /**
   * Get security dashboard data
   */
  async getSecurityDashboard(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<any> {
    try {
      return await securityMonitoringService.getSecurityMetrics(timeRange);
    } catch (error) {
      console.error('[SecurityMiddleware] Error getting security dashboard:', error);
      return null;
    }
  }

  /**
   * Detect suspicious authentication patterns
   */
  private async detectSuspiciousAuth(
    eventType: string,
    ipAddress: string,
    userAgent: string,
    userId?: string,
    email?: string
  ): Promise<boolean> {
    try {
      // Check for rapid login attempts from same IP
      if (eventType === 'login_attempt' || eventType === 'login_failure') {
        // This would typically check a cache/database for recent attempts
        // For now, return false but log the attempt for future analysis
        return false;
      }

      // Check for login from unusual location/device
      if (eventType === 'login_success' && userId) {
        // In production, compare with user's historical patterns
        return false;
      }

      return false;
    } catch (error) {
      console.error('[SecurityMiddleware] Error detecting suspicious auth:', error);
      return false;
    }
  }

  /**
   * Log general request events
   */
  private async logRequestEvent(
    req: NextRequest,
    user?: any,
    requestId?: string,
    clientIp?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Don't log static assets or health checks
      const endpoint = req.nextUrl.pathname;
      if (endpoint.startsWith('/_next/') || 
          endpoint.startsWith('/static/') ||
          endpoint === '/api/health') {
        return;
      }

      await securityMonitoringService.logSecurityEvent({
        eventType: 'api_request',
        severity: 'low',
        userId: user?.id,
        ipAddress: clientIp,
        userAgent,
        endpoint,
        method: req.method,
        requestId,
        eventData: {
          query: Object.fromEntries(req.nextUrl.searchParams),
          referer: req.headers.get('referer'),
          origin: req.headers.get('origin')
        }
      });
    } catch (error) {
      console.error('[SecurityMiddleware] Error logging request event:', error);
    }
  }

  /**
   * Detect suspicious activity patterns
   */
  private async detectSuspiciousActivity(
    userId: string,
    ipAddress: string,
    userAgent: string,
    endpoint: string
  ): Promise<void> {
    try {
      // Check for anomalies in user behavior
      const anomalies = await securityMonitoringService.detectUserAnomalies(userId);
      
      for (const anomaly of anomalies) {
        await securityMonitoringService.logSecurityEvent({
          eventType: 'user_anomaly_detected',
          severity: anomaly.severity,
          userId,
          ipAddress,
          userAgent,
          endpoint,
          eventData: {
            anomalyType: anomaly.type,
            description: anomaly.description,
            details: anomaly.details
          }
        });

        // Create alert for high-severity anomalies
        if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
          await securityMonitoringService.createSecurityAlert({
            alertType: 'user_anomaly',
            severity: anomaly.severity,
            title: `User Anomaly Detected: ${anomaly.type}`,
            description: anomaly.description,
            userId
          });
        }
      }
    } catch (error) {
      console.error('[SecurityMiddleware] Error detecting suspicious activity:', error);
    }
  }

  /**
   * Monitor response for security indicators
   */
  private async monitorResponse(
    response: NextResponse,
    req: NextRequest,
    user?: any,
    requestId?: string
  ): Promise<void> {
    try {
      const status = response.status;
      const clientIp = this.getClientIp(req);

      // Log error responses for security analysis
      if (status >= 400) {
        const severity = status >= 500 ? 'medium' : 'low';
        
        await securityMonitoringService.logSecurityEvent({
          eventType: 'error_response',
          severity,
          userId: user?.id,
          ipAddress: clientIp,
          endpoint: req.nextUrl.pathname,
          method: req.method,
          requestId,
          eventData: {
            statusCode: status,
            userAgent: req.headers.get('user-agent')
          }
        });
      }

      // Check for potential security headers
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy'
      ];

      const missingHeaders = securityHeaders.filter(
        header => !response.headers.get(header)
      );

      if (missingHeaders.length > 0) {
        await securityMonitoringService.logSecurityEvent({
          eventType: 'missing_security_headers',
          severity: 'low',
          endpoint: req.nextUrl.pathname,
          eventData: {
            missingHeaders,
            statusCode: status
          }
        });
      }
    } catch (error) {
      console.error('[SecurityMiddleware] Error monitoring response:', error);
    }
  }

  /**
   * Extract client IP address
   */
  private getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return req.headers.get('x-real-ip') ||
           req.headers.get('cf-connecting-ip') ||
           req.ip ||
           'unknown';
  }

  /**
   * Extract session ID from request
   */
  private extractSessionId(req: NextRequest): string | undefined {
    // Try to get session ID from cookies or headers
    const sessionCookie = req.cookies.get('supabase-auth-token');
    return sessionCookie?.value?.substring(0, 32); // First 32 chars as session identifier
  }

  /**
   * Process response for security monitoring
   */
  async processResponse(
    request: NextRequest, 
    response: NextResponse, 
    responseTime: number
  ): Promise<void> {
    try {
      const statusCode = response.status;
      const userAgent = request.headers.get('user-agent') || '';
      const endpoint = request.nextUrl.pathname;
      const method = request.method;

      // Log slow responses
      if (responseTime > 5000) {
        await securityMonitoringService.logSecurityEvent({
          eventType: 'slow_response',
          severity: 'medium',
          eventData: {
            endpoint,
            method,
            responseTime,
            userAgent,
            threshold: 5000
          },
          ipAddress: this.getClientIp(request),
          userAgent,
          endpoint
        });
      }

      // Log error responses
      if (statusCode >= 400) {
        await securityMonitoringService.logSecurityEvent({
          eventType: 'error_response',
          severity: statusCode >= 500 ? 'high' : 'medium',
          eventData: {
            endpoint,
            method,
            statusCode,
            responseTime,
            userAgent
          },
          ipAddress: this.getClientIp(request),
          userAgent,
          endpoint
        });
      }

      // Log successful high-value operations
      if (statusCode === 200 && this.isHighValueEndpoint(endpoint)) {
        await securityMonitoringService.logSecurityEvent({
          eventType: 'high_value_access',
          severity: 'low',
          eventData: {
            endpoint,
            method,
            responseTime,
            userAgent
          },
          ipAddress: this.getClientIp(request),
          userAgent,
          endpoint
        });
      }

    } catch (error) {
      console.error('Error in security response processing:', error);
    }
  }

  /**
   * Check if endpoint is high-value (requires special monitoring)
   */
  private isHighValueEndpoint(endpoint: string): boolean {
    const highValuePatterns = [
      '/api/payments',
      '/api/subscriptions',
      '/api/billing',
      '/api/admin',
      '/api/security',
      '/api/users/profile',
      '/api/knowledge',
      '/api/documents'
    ];

    return highValuePatterns.some(pattern => endpoint.startsWith(pattern));
  }
}

export const securityMiddleware = new SecurityMiddleware();