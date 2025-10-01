// Minimal placeholder logger
// Lightweight logger abstraction with environment-based silencing.
// In production: only error logs emit to console (to reduce noise / bundle eval cost).
// In development: all levels passthrough.

type LogMethod = (...args: any[]) => void;

interface Logger {
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
}

export interface LogContext {
  userId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  path?: string
  method?: string
  statusCode?: number
  duration?: number
  [key: string]: any
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class EnhancedLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? JSON.stringify(context) : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${contextStr}`
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true
    if (level === 'debug' && this.isProduction) return false
    return true
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return
    console.debug(this.formatMessage('debug', message, context))
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return
    console.info(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return
    
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : { error: String(error) }
    
    const fullContext = { ...context, ...errorDetails }
    console.error(this.formatMessage('error', message, fullContext))
  }

  // Business logic logging
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${path}`, {
      method,
      path,
      ...context,
    })
  }

  apiResponse(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    
    this[level](`API Response: ${method} ${path} ${statusCode} (${duration}ms)`, {
      method,
      path,
      statusCode,
      duration,
      ...context,
    })
  }

  userAction(action: string, userId: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      action,
      userId,
      ...context,
    })
  }
}

export const logger = new EnhancedLogger()

// Helper for capturing and formatting unexpected errors consistently.
export function logException(context: string, error: unknown) {
  if (error instanceof Error) {
    logger.error(`${context}:`, error);
  } else {
    logger.error(`${context}:`, undefined, { error });
  }
}
