/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Format an error for logging
 */
export function formatError(error: any): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack}`;
  }
  
  return String(error);
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: any, status: number = 500): Response {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return new Response(
    JSON.stringify({
      error: errorMessage,
      status,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
