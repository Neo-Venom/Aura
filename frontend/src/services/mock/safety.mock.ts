import type { SafetyService } from '../safety';
import { latency } from './db';
import { RESOURCES } from './seed';

export const mockSafetyService: SafetyService = {
  async getResources(cc) {
    await latency();
    const list = RESOURCES.filter((r) => r.country_code === cc);
    return list.length ? list : RESOURCES.filter((r) => r.country_code === 'INTL');
  },
};
