import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { Button } from '../ui-kit/Button';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';

const TINTS = ['bg-apricot/20', 'bg-sage/25', 'bg-lavender/25', 'bg-butter/35', 'bg-sky/30'];

export function GroundingTool() {
  const steps = en.calm.groundingSteps;
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState<string[]>(() => steps.map(() => ''));
  const done = step >= steps.length;

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center animate-rise" data-testid="grounding-complete">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage/30"><Check className="h-6 w-6" aria-hidden="true" /></span>
        <p className="max-w-sm text-lg font-semibold">{en.calm.groundingDone}</p>
        <Button variant="soft" onClick={() => { setStep(0); setNotes(steps.map(() => '')); }} data-testid="grounding-restart-button">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />{en.calm.again}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="grounding-tool">
      <ol className="flex justify-center gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? 'step' : undefined}
            className={cn('h-2 rounded-full transition-[width,background-color] duration-300', i === step ? 'w-8 bg-accent' : i < step ? 'w-2 bg-sage' : 'w-2 bg-line')} />
        ))}
      </ol>
      <div key={step} className={cn('rounded-4xl p-6 animate-rise', TINTS[step])}>
        <p className="font-display text-5xl text-ink" aria-hidden="true">{5 - step}</p>
        <label htmlFor={`grounding-${step}`} className="mt-2 block text-xl font-bold">{steps[step]}</label>
        <p className="mb-3 text-sm text-ink/80">{en.calm.groundingHint}</p>
        <textarea
          id={`grounding-${step}`}
          rows={3}
          value={notes[step]}
          onChange={(e) => setNotes((n) => n.map((v, i) => (i === step ? e.target.value : v)))}
          className="field min-h-[96px] resize-none py-3"
          data-testid={`grounding-input-${step}`}
        />
      </div>
      <div className="flex justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0} data-testid="grounding-back-button">{en.common.back}</Button>
        <Button onClick={() => setStep((s) => s + 1)} data-testid="grounding-next-button">
          {step === steps.length - 1 ? en.calm.finish : en.common.next}
        </Button>
      </div>
    </div>
  );
}
