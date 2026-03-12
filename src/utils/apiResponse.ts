import { sanitizeApiPayload } from './dataProtection';

export function buildSafeApiResponse<T>(data: T) {
  return {
    ok: true,
    data: sanitizeApiPayload(data),
    generatedAt: new Date().toISOString()
  };
}

export function buildSafeApiError(message: string, status = 500) {
  return {
    ok: false,
    status,
    error: message,
    generatedAt: new Date().toISOString()
  };
}
