
import { NextRequest, NextResponse } from 'next/server';
import { AppError, createErrorResponse } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    statusCode: number;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  requestId?: string
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: requestId || crypto.randomUUID(),
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

export function createErrorResponseHandler(
  error: Error | AppError,
  requestId?: string,
  path?: string
): NextResponse<ApiResponse> {
  const errorResponse = createErrorResponse(error, path);
  
  const response: ApiResponse = {
    success: false,
    error: errorResponse.error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: requestId || crypto.randomUUID(),
    },
  };

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  
  return NextResponse.json(response, { status: statusCode });
}

