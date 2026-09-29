import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { OnboardingLayout } from '../components/common/Layouts';
import { QuestionCard } from '../components/checkin/QuestionCard';
import { ProgressSun } from '../components/checkin/ProgressSun';
import { Button } from '../components/ui-kit/Button';
import { BreathingOrb } from '../components/calm/BreathingOrb';
import { ErrorState } from '../components/common/ErrorState';
import { SunShape } from '../components/decor/Illustrations';
import { getServices } from '../services';
import { useProfile, useAuth } from '../app/auth';
import { en } from '../copy/en';
import type { Profile, Questionnaire } from '../types/api';

type Step = { kind: 'q'; i: number } | { kind: 'pause'; text: string };

function buildSteps(q: Questionnaire): Step[] {
  const steps: Step[] = [];
  const third = Math.round(q.items.length / 3);
  q.items.forEach((it, i) => {
    if (i === third) steps.push({ kind: 'pause', text: en.checkin.pauses[0] });
    if (i === third * 2) steps.push({ kind: 'pause', text: en.checkin.pauses[1] });
    if (it.section === 'safety') steps.push({ kind: 'pause', text: en.checkin.safetyPause });
    steps.push({ kind: 'q', i });
  });
  return steps;
}

function Pause({ text, onContinue }: { text: string; onContinue(): void }) {
  return (
    <section className="card flex flex-col items-center gap-6 p-10 text-center animate-rise" data-testid="checkin-interstitial">
      <SunShape className="h-16 w-16 text-butter" />
      <p className="max-w-md font-display text-2xl leading-snug sm:text-3xl">{text}</p>
      <Button size="lg" onClick={onContinue} autoFocus data-testid="checkin-interstitial-continue">{en.checkin.continue}</Button>
    </section>
  );
}

export default function Checkin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session } = useAuth();
  const { data: me } = useProfile();
  const { assessmentService, profileService } = getServices();
  const q = useQuery({ queryKey: ['questionnaire'], queryFn: () => assessmentService.getQuestionnaire(), staleTime: Infinity });
  const draft = useMemo(() => assessmentService.loadDraft(), [assessmentService]);
  const [step, setStep] = useState(draft?.step ?? 0);
  const [answers, setAnswers] = useState<Record<string, number | null>>(draft?.answers ?? {});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const advancing = useRef(false);
  const steps = useMemo(() => (q.data ? buildSteps(q.data) : []), [q.data]);
  const cur = steps[step];
  const total = q.data?.items.length ?? 29;
  const qNum = steps.slice(0, step + 1).filter((s) => s.kind === 'q').length;

  const setMeStatus = (status: Profile['assessment_status']) =>
    me && qc.setQueryData<Profile>(['me', session?.user_id], { ...me, assessment_status: status });

  const submit = useCallback(async (all: Record<string, number | null>) => {
    if (!q.data) return;
    setSubmitting(true);
    setFailed(false);
    try {
      const result = await assessmentService.submit(q.data.items.map((it) => ({ item_id: it.id, value: all[it.id] ?? null })));
      qc.setQueryData(['assessment', 'latest', session?.user_id], result);
      qc.invalidateQueries({ queryKey: ['me'] });
      assessmentService.clearDraft();
      navigate('/onboarding/results');
    } catch {
      setFailed(true);
      setSubmitting(false);
    }
  }, [q.data, assessmentService, qc, session?.user_id, navigate]);

  const answer = useCallback((v: number | null) => {
    if (!cur || cur.kind !== 'q' || !q.data || advancing.current) return;
    const next = { ...answers, [q.data.items[cur.i].id]: v };
    setAnswers(next);
    const last = step === steps.length - 1;
    assessmentService.saveDraft({ answers: next, step: last ? step : step + 1, updated_at: new Date().toISOString() });
    advancing.current = true;
    setTimeout(() => {
      advancing.current = false;
      if (last) submit(next);
      else setStep((s) => s + 1);
    }, 220);
  }, [cur, q.data, answers, step, steps.length, assessmentService, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (cur?.kind === 'q' && ['1', '2', '3', '4'].includes(e.key)) answer(Number(e.key) - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cur, answer]);

  const saveLater = async () => {
    assessmentService.saveDraft({ answers, step, updated_at: new Date().toISOString() });
    if (me?.assessment_status !== 'completed') {
      await profileService.updateMe({ assessment_status: 'in_progress' });
      setMeStatus('in_progress');
    }
    navigate('/app/chat');
  };

  const skip = async () => {
    await assessmentService.skip();
    if (me?.assessment_status !== 'completed') setMeStatus('skipped');
    navigate('/app/chat');
  };

  if (q.isError) return <OnboardingLayout><ErrorState onRetry={() => q.refetch()} /></OnboardingLayout>;
  if (!q.data || !cur || submitting) {
    return (
      <OnboardingLayout>
        <div className="flex flex-col items-center gap-4 py-24" data-testid="checkin-loading">
          <BreathingOrb size={56} />
          {submitting && <p className="font-semibold">{en.checkin.finishing}</p>}
        </div>
      </OnboardingLayout>
    );
  }

  const item = cur.kind === 'q' ? q.data.items[cur.i] : null;
  const firstScreen = step === 0 && Object.keys(answers).length === 0;

  return (
    <OnboardingLayout>
      <div className="space-y-6" data-testid="checkin-page">
        <div className="space-y-3">
          <p className="text-center text-sm font-semibold text-muted">{en.checkin.header}</p>
          <ProgressSun value={(qNum - (cur.kind === 'q' ? 1 : 0)) / total} label={en.checkin.progress(qNum, total)} />
          <p className="text-center text-xs text-muted" data-testid="checkin-progress-label">{en.checkin.progress(Math.max(qNum, 1), total)}</p>
        </div>
        {failed && <p role="alert" className="rounded-2xl bg-butter/40 px-4 py-3 text-center text-sm font-semibold">{en.chat.failed}</p>}
        {item ? (
          <QuestionCard key={item.id} item={item} options={q.data.scales[item.scale]} value={answers[item.id]} onAnswer={answer} />
        ) : (
          <Pause key={`pause-${step}`} text={cur.kind === 'pause' ? cur.text : ''} onContinue={() => setStep((s) => s + 1)} />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} data-testid="checkin-back-button">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />{en.common.back}
            </Button>
          ) : <span />}
          <div className="flex flex-wrap gap-2">
            {firstScreen && <Button variant="ghost" onClick={skip} data-testid="checkin-skip-button">{en.checkin.skip}</Button>}
            {!firstScreen && <Button variant="soft" onClick={saveLater} data-testid="checkin-save-later-button">{en.checkin.saveLater}</Button>}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
