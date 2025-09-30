// Minimal placeholder for AppError and createErrorResponse
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function createErrorResponse(error: Error, path?: string) {
  return {
    error: {
      message: error.message,
      code: 'INTERNAL_ERROR',
      statusCode: (error as any).statusCode || 500,
      path,
    },
  };
}
