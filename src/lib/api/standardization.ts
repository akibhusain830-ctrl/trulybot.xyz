import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { logger } from '@/lib/logger'

// Standardized API response interfaces
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: Record<string, any>
  }
  meta?: {
    timestamp: string
    requestId: string
    pagination?: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
  }
}

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: Record<string, any>
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

// Success response helpers
export function createSuccessResponse<T>(
  data: T,
  meta?: Partial<ApiResponse['meta']>
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      ...meta,
    },
  }
  
  return NextResponse.json(response, { status: 200 })
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    pageSize: number
    total: number
  }
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize)
  
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      pagination: {
        ...pagination,
        totalPages,
      },
    },
  }
  
  return NextResponse.json(response, { status: 200 })
}

// Error response helpers
export function createErrorResponse(
  error: Error | ApiError | string,
  status = 500,
  code?: string
): NextResponse<ApiResponse> {
  const message = typeof error === 'string' ? error : error.message
  const errorCode = code || (error instanceof Error ? error.constructor.name : 'UnknownError')
  
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code: errorCode,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  }
  
  // Log error for monitoring
  logger.error('API Error', error instanceof Error ? error : new Error(message), {
    status,
    code: errorCode,
  })
  
  return NextResponse.json(response, { status })
}

// Validation middleware
export function withValidation<T>(schema: ZodSchema<T>) {
  return function (
    handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>
  ) {
    return async function (req: NextRequest): Promise<NextResponse> {
      try {
        const body = await req.json().catch(() => ({}))
        const validatedData = schema.parse(body)
        return await handler(req, validatedData)
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.reduce((acc, err) => {
            const path = err.path.join('.')
            acc[path] = err.message
            return acc
          }, {} as Record<string, string>)
          
          return createErrorResponse(
            new ValidationError('Invalid request data', details),
            400,
            'VALIDATION_ERROR'
          )
        }
        
        return createErrorResponse(error as Error)
      }
    }
  }
}

// Query parameter validation
export function withQueryValidation<T>(schema: ZodSchema<T>) {
  return function (
    handler: (req: NextRequest, validatedQuery: T) => Promise<NextResponse>
  ) {
    return async function (req: NextRequest): Promise<NextResponse> {
      try {
        const url = new URL(req.url)
        const queryParams = Object.fromEntries(url.searchParams.entries())
        const validatedQuery = schema.parse(queryParams)
        return await handler(req, validatedQuery)
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.reduce((acc, err) => {
            const path = err.path.join('.')
            acc[path] = err.message
            return acc
          }, {} as Record<string, string>)
          
          return createErrorResponse(
            new ValidationError('Invalid query parameters', details),
            400,
            'QUERY_VALIDATION_ERROR'
          )
        }
        
        return createErrorResponse(error as Error)
      }
    }
  }
}

// Error handling middleware
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    try {
      return await handler(req)
    } catch (error) {
      // Handle known error types
      if (error instanceof ValidationError) {
        return createErrorResponse(error, 400, 'VALIDATION_ERROR')
      }
      
      if (error instanceof AuthenticationError) {
        return createErrorResponse(error, 401, 'AUTHENTICATION_ERROR')
      }
      
      if (error instanceof AuthorizationError) {
        return createErrorResponse(error, 403, 'AUTHORIZATION_ERROR')
      }
      
      if (error instanceof NotFoundError) {
        return createErrorResponse(error, 404, 'NOT_FOUND')
      }
      
      if (error instanceof RateLimitError) {
        return createErrorResponse(error, 429, 'RATE_LIMIT_ERROR')
      }
      
      // Handle unknown errors
      return createErrorResponse(
        'Internal server error',
        500,
        'INTERNAL_SERVER_ERROR'
      )
    }
  }
}

// Combined middleware for comprehensive API handling
export function withApiHandling<TBody = any, TQuery = any>(
  options: {
    bodySchema?: ZodSchema<TBody>
    querySchema?: ZodSchema<TQuery>
    requireAuth?: boolean
  } = {}
) {
  return function (
    handler: (
      req: NextRequest,
      data: { body?: TBody; query?: TQuery }
    ) => Promise<NextResponse>
  ) {
    return withErrorHandling(async (req: NextRequest) => {
      const data: { body?: TBody; query?: TQuery } = {}
      
      // Validate body if schema provided
      if (options.bodySchema) {
        try {
          const body = await req.json().catch(() => ({}))
          data.body = options.bodySchema.parse(body)
        } catch (error) {
          if (error instanceof ZodError) {
            throw new ValidationError('Invalid request body', 
              error.errors.reduce((acc, err) => {
                acc[err.path.join('.')] = err.message
                return acc
              }, {} as Record<string, string>)
            )
          }
          throw error
        }
      }
      
      // Validate query if schema provided
      if (options.querySchema) {
        try {
          const url = new URL(req.url)
          const queryParams = Object.fromEntries(url.searchParams.entries())
          data.query = options.querySchema.parse(queryParams)
        } catch (error) {
          if (error instanceof ZodError) {
            throw new ValidationError('Invalid query parameters',
              error.errors.reduce((acc, err) => {
                acc[err.path.join('.')] = err.message
                return acc
              }, {} as Record<string, string>)
            )
          }
          throw error
        }
      }
      
      // TODO: Add authentication check if required
      if (options.requireAuth) {
        // Implementation depends on your auth system
        // throw new AuthenticationError() if not authenticated
      }
      
      return await handler(req, data)
    })
  }
}
