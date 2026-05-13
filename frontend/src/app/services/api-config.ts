import { environment } from '../../environments/environment';

/** Resolves to `/api` on same origin, or `{apiBaseUrl}/api` when the API is on another host. */
export function getApiRoot(): string {
  const base = environment.apiBaseUrl.replace(/\/$/, '');
  return base ? `${base}/api` : '/api';
}
