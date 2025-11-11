// Production Monitoring & Error Tracking Configuration

import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// Initialize Sentry for production monitoring
export function initializeSentry() {
  if (process.env.NODE_ENV === "production") {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // Sample 10% of transactions in production
      beforeSend(event, hint) {
        // Filter out certain errors
        if (event.exception) {
          const error = hint.originalException;
          
          // Don't send 404 errors (expected)
          if (error instanceof Error && error.message.includes("404")) {
            return null;
          }
          
          // Don't send specific known non-critical errors
          if (event.tags?.error_type === "non_critical") {
            return null;
          }
        }
        
        return event;
      },
    });
  }
}

// Enhanced error reporting with context
export function reportError(
  error: Error,
  context?: {
    userId?: string;
    workspaceId?: string;
    endpoint?: string;
    requestId?: string;
    severity?: "fatal" | "error" | "warning" | "info";
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
) {
  const severity = context?.severity || "error";
  
  logger.error(`[${severity.toUpperCase()}] ${error.message}`, {
    stack: error.stack,
    ...context,
  });

  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, {
      level: severity,
      contexts: {
        request: {
          url: context?.endpoint,
          method: "POST",
          headers: {
            "x-request-id": context?.requestId,
          },
        },
        user: context?.userId ? { user_id: context.userId } : undefined,
        organization: context?.workspaceId ? { workspace_id: context.workspaceId } : undefined,
      },
      tags: {
        component: "api",
        error_type: "application",
        ...context?.tags,
      },
      extra: context?.extra,
    });
  }
}

// Track critical business events
export function trackCriticalEvent(
  eventName: string,
  data: {
    userId?: string;
    workspaceId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    [key: string]: any;
  }
) {
  logger.info(`Critical Event: ${eventName}`, data);

  if (process.env.NODE_ENV === "production") {
    Sentry.captureMessage(eventName, {
      level: "info",
      contexts: {
        event_data: data,
      },
      tags: {
        event_type: "business_critical",
      },
    });
  }

  // Send to external monitoring if configured
  if (process.env.MONITORING_WEBHOOK_URL) {
    fetch(process.env.MONITORING_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        data,
      }),
    }).catch(err => logger.warn("Failed to send monitoring webhook", { error: err }));
  }
}

// Track payment-related events
export function trackPaymentEvent(
  action: "initiated" | "verified" | "failed" | "refunded",
  data: {
    orderId: string;
    paymentId?: string;
    userId: string;
    amount: number;
    currency: string;
    error?: string;
  }
) {
  const eventName = `PAYMENT_${action.toUpperCase()}`;
  
  trackCriticalEvent(eventName, data);

  // Alert on payment failures
  if (action === "failed" && process.env.ALERT_ON_PAYMENT_FAILURE === "true") {
    logger.error("Payment failure detected", { ...data, alert: true });
  }
}

// Track API performance
export function trackApiPerformance(
  endpoint: string,
  duration: number,
  status: number,
  context?: {
    userId?: string;
    workspaceId?: string;
    error?: string;
  }
) {
  // Log slow endpoints
  if (duration > 2000) {
    logger.warn("Slow endpoint detected", {
      endpoint,
      duration,
      status,
      ...context,
    });

    if (process.env.NODE_ENV === "production") {
      Sentry.captureMessage(`Slow Endpoint: ${endpoint}`, {
        level: "warning",
        contexts: {
          performance: {
            duration_ms: duration,
            endpoint,
            status,
          },
        },
        tags: {
          alert: "performance",
        },
      });
    }
  }

  // Log errors
  if (status >= 400) {
    logger.warn("API error", {
      endpoint,
      status,
      duration,
      ...context,
    });
  }
}

// Create monitoring middleware
export function withMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const endpoint = new URL(req.url).pathname;

    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;

      trackApiPerformance(endpoint, duration, response.status);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      reportError(error instanceof Error ? error : new Error(String(error)), {
        endpoint,
        severity: "error",
        extra: { duration },
      });

      throw error;
    }
  };
}

// Middleware to extract monitoring context from request
export function getMonitoringContext(req: NextRequest) {
  return {
    requestId: req.headers.get("x-request-id") || undefined,
    userId: req.headers.get("x-user-id") || undefined,
    workspaceId: req.headers.get("x-workspace-id") || undefined,
  };
}

export default {
  initializeSentry,
  reportError,
  trackCriticalEvent,
  trackPaymentEvent,
  trackApiPerformance,
  withMonitoring,
  getMonitoringContext,
};
