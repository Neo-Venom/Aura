import { apiFetch } from './http';
import type { CrisisResource } from '../types/api';

export interface SafetyService {
  getResources(countryCode: string | null): Promise<CrisisResource[]>;
}

export const httpSafetyService: SafetyService = {
  // TODO(Antigravity): GET /v1/safety/resources?country=XX (public, no auth required)
  getResources: (cc) => apiFetch<CrisisResource[]>(`/v1/safety/resources?country=${encodeURIComponent(cc ?? 'INTL')}`),
};
