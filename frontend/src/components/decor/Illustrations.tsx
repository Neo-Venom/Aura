import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

type P = { className?: string };

export const SunShape = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
    <circle cx="32" cy="32" r="13" fill="currentColor" />
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x="30" y="4" width="4" height="10" rx="2" fill="currentColor" opacity="0.7" transform={`rotate(${i * 45} 32 32)`} />
    ))}
  </svg>
);

export const LeafShape = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
    <path d="M12 52C12 28 28 12 54 10c-2 26-18 42-42 42Z" fill="currentColor" opacity="0.85" />
    <path d="M14 50C24 38 34 28 46 20" stroke="white" strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const CloudShape = ({ className }: P) => (
  <svg viewBox="0 0 96 64" className={className} aria-hidden="true" fill="none">
    <path d="M24 54h50a16 16 0 0 0 1-32 22 22 0 0 0-42-4A18 18 0 0 0 24 54Z" fill="currentColor" opacity="0.85" />
  </svg>
);

export const WaveShape = ({ className }: P) => (
  <svg viewBox="0 0 96 48" className={className} aria-hidden="true" fill="none">
    <path d="M4 20c10-10 20-10 30 0s20 10 30 0 18-10 28 0" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M4 36c10-10 20-10 30 0s20 10 30 0 18-10 28 0" stroke="currentColor" strokeOpacity="0.5" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

export function Logo({ className, to = '/' }: P & { to?: string }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2 rounded-full', className)} data-testid="logo-link" aria-label="Aura home">
      <span className="relative inline-flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-butter/70 blur-[2px]" />
        <span className="relative h-5 w-5 rounded-full bg-apricot" />
      </span>
      <span className="font-display text-2xl leading-none">Aura</span>
    </Link>
  );
}
