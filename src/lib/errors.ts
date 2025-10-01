// Legacy simple errors (kept for backward compatibility) ------------------
export class RateLimitError extends Error { constructor(message = 'Too many requests') { super(message); this.name = 'RateLimitError'; } }
export class AuthenticationError extends Error { constructor(message = 'Authentication failed') { super(message); this.name = 'AuthenticationError'; } }
export class AuthorizationError extends Error { constructor(message = 'Not authorized') { super(message); this.name = 'AuthorizationError'; } }
export class AppError extends Error { statusCode: number; constructor(message: string, statusCode = 500) { super(message); this.statusCode = statusCode; } }

// New unified domain error hierarchy --------------------------------------
export class DomainError extends Error {
  status: number;
  code: string;
  meta?: Record<string, any>;
  constructor(message: string, status = 400, code = 'BAD_REQUEST', meta?: Record<string, any>) {
    super(message);
    this.status = status;
    this.code = code;
    this.meta = meta;
  }
}
export class AuthError extends DomainError { constructor(message = 'Unauthorized') { super(message, 401, 'UNAUTHORIZED'); } }
export class NotFoundError extends DomainError { constructor(message = 'Not found') { super(message, 404, 'NOT_FOUND'); } }
export class PlanLimitError extends DomainError { constructor(message = 'Plan limit exceeded', meta?: Record<string, any>) { super(message, 403, 'PLAN_LIMIT', meta); } }
export class ValidationError extends DomainError { constructor(message = 'Validation failed', meta?: Record<string, any>) { super(message, 422, 'VALIDATION_FAILED', meta); } }
export class InternalError extends DomainError { constructor(message = 'Internal server error', meta?: Record<string, any>) { super(message, 500, 'INTERNAL_ERROR', meta); } }
export class UnifiedRateLimitError extends DomainError { constructor(message = 'Too many requests') { super(message, 429, 'RATE_LIMITED'); } }

export function createErrorResponse(error: Error | DomainError, path?: string) {
  const anyErr: any = error as any;
  const status = anyErr.status || anyErr.statusCode || 500;
  const code = anyErr.code || 'INTERNAL_ERROR';
  return {
    error: {
      message: error.message,
      code,
      statusCode: status,
      path,
      meta: anyErr.meta || undefined
    }
  };
}
