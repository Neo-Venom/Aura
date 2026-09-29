import { cn } from '../../lib/cn';

// Small "thinking" orb (also used as the loading indicator). No spinners anywhere.
export function BreathingOrb({ size = 28, className, label }: { size?: number; className?: string; label?: string }) {
  return (
    <span
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role={label ? 'status' : undefined}
      aria-label={label}
      data-testid="breathing-orb"
    >
      <span className="absolute inset-0 rounded-full blur-[3px] animate-orb" style={{ background: 'var(--orb-mini-halo)' }} />
      <span className="absolute inset-[22%] rounded-full animate-orb" style={{ animationDelay: '-0.4s', background: 'var(--orb-mini-core)' }} />
    </span>
  );
}
