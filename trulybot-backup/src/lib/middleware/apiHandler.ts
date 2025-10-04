import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, DomainError } from '@/lib/errors';
import { logger } from '@/lib/logger';

// Wrapper to standardize error formatting & headers (e.g., rate limit info)
export function withApi(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function wrapped(req: NextRequest): Promise<NextResponse> {
    try {
      return await handler(req);
    } catch (e: any) {
      if (e instanceof DomainError) {
        logger.warn('[DomainError]', { code: e.code, message: e.message });
        return NextResponse.json(createErrorResponse(e, req.nextUrl.pathname).error, { status: e.status });
      }
      logger.error('[UnhandledError]', e?.message, e?.stack);
      const payload = createErrorResponse(e, req.nextUrl.pathname);
      return NextResponse.json(payload.error, { status: payload.error.statusCode });
    }
  };
}
