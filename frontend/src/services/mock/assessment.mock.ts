import { draftStore, type AssessmentService } from '../assessment';
import { currentUserId, db, latency, nowIso, uid } from './db';
import { DASS_BANDS, QUESTIONNAIRE, SUBSCALES } from './seed';
import type { AnswerInput, Band, DimensionResult } from '../../types/api';

const BANDS: Band[] = ['low', 'mild', 'moderate', 'high'];

function score(answers: AnswerInput[]): DimensionResult[] {
  const map = new Map(answers.map((a) => [a.item_id, a.value]));
  const dass = (Object.keys(SUBSCALES) as (keyof typeof SUBSCALES)[]).map((key): DimensionResult => {
    const vals = SUBSCALES[key].map((id) => map.get(id)).filter((v): v is number => typeof v === 'number');
    if (vals.length < 5) return { key, score_pct: 0, band: 'low' };
    const x2 = vals.reduce((a, b) => a + b, 0) * 2;
    const [lo, mi, mo] = DASS_BANDS[key];
    const band: Band = x2 <= lo ? 'low' : x2 <= mi ? 'mild' : x2 <= mo ? 'moderate' : 'high';
    return { key, score_pct: Math.min(100, Math.round((x2 / 42) * 100)), band };
  });
  const single = (key: DimensionResult['key'], item: string): DimensionResult => {
    const v = map.get(item);
    if (typeof v !== 'number') return { key, score_pct: 0, band: 'low' };
    return { key, score_pct: Math.round((v / 3) * 100), band: BANDS[v] };
  };
  return [
    ...dass,
    single('anger', 'sup_anger'),
    single('tiredness', 'sup_tiredness'),
    single('grief', 'sup_grief'),
    single('sadness', 'sup_sadness'),
    single('brightness', 'sup_brightness'),
  ];
}

export const mockAssessmentService: AssessmentService = {
  async getQuestionnaire() {
    await latency();
    return QUESTIONNAIRE;
  },
  async submit(answers) {
    await latency();
    const id = currentUserId();
    const safe = answers.find((a) => a.item_id === 'safe_01')?.value ?? 0;
    const result = { id: uid(), created_at: nowIso(), dimensions: score(answers), show_support_card: safe > 0 };
    db.update((d) => {
      d.assessments[id] = [...(d.assessments[id] ?? []), result];
      d.users[id] = { ...d.users[id], assessment_status: 'completed' };
    });
    return result;
  },
  async skip() {
    await latency();
    const id = currentUserId();
    db.update((d) => {
      if (d.users[id].assessment_status !== 'completed') d.users[id] = { ...d.users[id], assessment_status: 'skipped' };
    });
  },
  async getLatest() {
    await latency();
    const list = db.load().assessments[currentUserId()] ?? [];
    return list[list.length - 1] ?? null;
  },
  saveDraft: (d) => draftStore.save(d),
  loadDraft: () => draftStore.load(),
  clearDraft: () => draftStore.clear(),
};
