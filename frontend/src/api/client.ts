import axios, { isAxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 90_000, // Render's free tier can take ~1 min to wake up
});

/** Every failed request becomes this one shape, so views can switch on `code`. */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

export function toApiError(err: unknown): ApiError {
  if (isAxiosError<ErrorBody>(err)) {
    const body = err.response?.data?.error;
    if (body?.code) {
      return new ApiError(body.code, body.message ?? 'Request failed', err.response?.status, body.details);
    }
    if (!err.response) {
      return new ApiError('NETWORK_ERROR', 'Could not reach the server. Check your connection and try again.');
    }
    return new ApiError('INTERNAL_ERROR', `Request failed with status ${err.response.status}`, err.response.status);
  }
  return new ApiError('INTERNAL_ERROR', err instanceof Error ? err.message : 'Unexpected error');
}

// Normalise errors once here instead of in every caller.
apiClient.interceptors.response.use(undefined, (err: unknown) => Promise.reject(toApiError(err)));
