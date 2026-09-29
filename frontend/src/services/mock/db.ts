import { readJSON, uid, writeJSON } from '../../lib/cn';
import { sleep } from '../../lib/stream';
import { ApiError } from '../http';
import { authStore } from '../auth';
import type { AssessmentResult, ChatMessage, ChatSession, Profile } from '../../types/api';

// NOTE: localStorage simulates the database. Passwords are never stored in mock mode.
export interface MockDB {
  users: Record<string, Profile>;
  sessions: Record<string, ChatSession[]>;
  messages: Record<string, ChatMessage[]>;
  assessments: Record<string, AssessmentResult[]>;
}

const DB_KEY = 'aura.mockdb';

export const db = {
  load: (): MockDB => readJSON<MockDB>(DB_KEY, { users: {}, sessions: {}, messages: {}, assessments: {} }),
  save: (d: MockDB) => writeJSON(DB_KEY, d),
  update<T>(fn: (d: MockDB) => T): T {
    const d = db.load();
    const out = fn(d);
    db.save(d);
    return out;
  },
};

export function currentUserId(): string {
  const s = authStore.get();
  if (!s) throw new ApiError('unauthorized', 'Not signed in', 401);
  return s.user_id;
}

export const latency = () => sleep(120 + Math.random() * 180);
export const nowIso = () => new Date().toISOString();
export { uid };
