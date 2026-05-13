import { HttpErrorResponse } from '@angular/common/http';

/** Body shape from Spring {@code ApiError} */
export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as ApiErrorBody | string | null | undefined;
    if (body && typeof body === 'object' && typeof body.message === 'string' && body.message.length > 0) {
      return body.message;
    }
    if (typeof body === 'string' && body.trim().length > 0) {
      return body.trim();
    }
  }
  return fallback;
}
