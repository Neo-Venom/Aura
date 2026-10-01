import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '../ui-kit/Button';
import { Segmented } from '../ui-kit/Controls';
import { CalmSoundPlayer } from './CalmSoundPlayer';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';

type Kind = 'in' | 'out' | 'hold';
type Phase = { kind: Kind; secs: number; from: number; to: number };
const LOW = 0.55;
const PRESETS: Record<'gentle' | 'box', Phase[]> = {
  gentle: [{ kind: 'in', secs: 4, from: LOW, to: 1 }, { kind: 'out', secs: 6, from: 1, to: LOW }],
  box: [
    { kind: 'in', secs: 4, from: LOW, to: 1 }, { kind: 'hold', secs: 4, from: 1, to: 1 },
    { kind: 'out', secs: 4, from: 1, to: LOW }, { kind: 'hold', secs: 4, from: LOW, to: LOW },
  ],
};
const TICK = 100;

function phaseAt(phases: Phase[], ms: number) {
  const cycle = phases.reduce((a, p) => a + p.secs * 1000, 0);
  let t = ms % cycle;
  for (const p of phases) {
    const d = p.secs * 1000;
    if (t < d) {
      const e = 0.5 - Math.cos(Math.PI * (t / d)) / 2;
      return { phase: p, scale: p.from + (p.to - p.from) * e };
    }
    t -= d;
  }
  return { phase: phases[0], scale: LOW };
}

const label: Record<Kind, string> = { in: en.calm.inhale, out: en.calm.exhale, hold: en.calm.hold };
const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function BreathingTool({ compact }: { compact?: boolean }) {
  const [preset, setPreset] = useState<'gentle' | 'box'>('gentle');
  const [minutes, setMinutes] = useState<'1' | '2' | '5'>('1');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const total = Number(minutes) * 60_000;
  const done = elapsed >= total;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + TICK), TICK);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => { if (done) setRunning(false); }, [done]);

  const reset = () => { setRunning(false); setElapsed(0); };
  const started = elapsed > 0;
  const { phase, scale } = phaseAt(PRESETS[preset], elapsed);
  const size = compact ? 200 : 260;

  return (
    <div className="flex flex-col items-center gap-6" data-testid="breathing-tool">
      <div className="flex flex-wrap justify-center gap-3">
        <Segmented
          name="Breathing pattern" testId="breathing-preset" value={preset}
          onChange={(v) => { setPreset(v); reset(); }}
          options={[{ value: 'gentle', label: en.calm.presets.gentle }, { value: 'box', label: en.calm.presets.box }]}
        />
        <Segmented
          name="Duration" testId="breathing-duration" value={minutes}
          onChange={(v) => { setMinutes(v); reset(); }}
          options={(['1', '2', '5'] as const).map((m) => ({ value: m, label: en.calm.minutes(Number(m)) }))}
        />
      </div>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: 'var(--orb-halo)' }} aria-hidden="true" />
        <div
          aria-hidden="true"
          data-testid="breathing-orb-large"
          className="absolute inset-0 rounded-full"
          style={{
            transform: `scale(${started ? scale : 0.7})`,
            transition: `transform ${TICK}ms linear`,
            background: 'var(--orb-gradient)',
            boxShadow: 'var(--orb-glow)',
          }}
        />
        <p className="relative z-10 font-display text-2xl text-on-accent" aria-live="polite" data-testid="breathing-phase-text">
          {done ? '' : started ? label[phase.kind] : en.calm.ready}
        </p>
      </div>
      <CalmSoundPlayer />
      {done ? (
        <p className="animate-rise text-center text-lg font-semibold" data-testid="breathing-complete">{en.calm.complete}</p>
      ) : (
        <p className={cn('text-sm tabular-nums text-muted', !started && 'invisible')} data-testid="breathing-remaining">{mmss(total - elapsed)}</p>
      )}
      <div className="flex gap-3">
        {done ? (
          <Button onClick={() => { setElapsed(0); setRunning(true); }} data-testid="breathing-again-button">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />{en.calm.again}
          </Button>
        ) : (
          <Button onClick={() => setRunning((r) => !r)} data-testid="breathing-toggle-button" className="min-w-[140px]">
            {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {running ? en.calm.pause : started ? en.calm.resume : en.calm.start}
          </Button>
        )}
      </div>
    </div>
  );
}
