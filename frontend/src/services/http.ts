import { env } from '../lib/env';
import { readJSON } from '../lib/cn';

export const SESSION_KEY = 'aura.session';

export class ApiError extends Error {
  code: string;
  status: number;
  requestId: string | null;
  constructor(code: string, message: string, status = 0, requestId: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

const token = () => readJSON<{ token: string } | null>(SESSION_KEY, null)?.token ?? null;

export async function apiFetchRaw(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const t = token();
  if (t) headers.set('Authorization', `Bearer ${t}`);
  let res: Response;
  try {
    res = await fetch(`${env.apiBaseUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('network', 'Network unavailable');
  }
  if (!res.ok) {
    let body: { error?: { code?: string; message?: string; request_id?: string } } = {};
    try { body = await res.json(); } catch { /* non-JSON error body */ }
    throw new ApiError(body.error?.code ?? 'internal', body.error?.message ?? res.statusText, res.status, body.error?.request_id ?? null);
  }
  return res;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetchRaw(path, init);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
