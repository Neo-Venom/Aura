import { SunShape } from '../decor/Illustrations';

export function ProgressSun({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className="relative h-8" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label} data-testid="checkin-progress">
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
      <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-butter transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      <span className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-500 ease-out" style={{ left: `${pct}%` }} aria-hidden="true">
        <SunShape className="h-8 w-8 text-apricot" />
      </span>
    </div>
  );
}
