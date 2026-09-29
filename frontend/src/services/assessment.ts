import { apiFetch } from './http';
import { readJSON, writeJSON } from '../lib/cn';
import type { AnswerInput, AssessmentResult, Questionnaire } from '../types/api';

export interface CheckinDraft { answers: Record<string, number | null>; step: number; updated_at: string }

export interface AssessmentService {
  getQuestionnaire(): Promise<Questionnaire>;
  submit(answers: AnswerInput[]): Promise<AssessmentResult>;
  skip(): Promise<void>;
  getLatest(): Promise<AssessmentResult | null>;
  saveDraft(draft: CheckinDraft): void;
  loadDraft(): CheckinDraft | null;
  clearDraft(): void;
}

// Drafts are local-only in every adapter.
export const draftStore = {
  key: () => `aura.checkinDraft.${readJSON<{ user_id: string } | null>('aura.session', null)?.user_id ?? 'anon'}`,
  save(d: CheckinDraft) { writeJSON(this.key(), d); },
  load(): CheckinDraft | null { return readJSON<CheckinDraft | null>(this.key(), null); },
  clear() { localStorage.removeItem(this.key()); },
};

export const httpAssessmentService: AssessmentService = {
  // TODO(Antigravity): GET /v1/assessment/questionnaire
  getQuestionnaire: () => apiFetch<Questionnaire>('/v1/assessment/questionnaire'),
  // TODO(Antigravity): POST /v1/assessment/submit { instrument_version, answers } -> AssessmentResult
  submit: (answers) => apiFetch<AssessmentResult>('/v1/assessment/submit', { method: 'POST', body: JSON.stringify({ answers }) }),
  // TODO(Antigravity): POST /v1/assessment/skip
  skip: () => apiFetch<void>('/v1/assessment/skip', { method: 'POST' }),
  // TODO(Antigravity): GET /v1/assessment/latest -> AssessmentResult | null
  getLatest: () => apiFetch<AssessmentResult | null>('/v1/assessment/latest'),
  saveDraft: (d) => draftStore.save(d),
  loadDraft: () => draftStore.load(),
  clearDraft: () => draftStore.clear(),
};
