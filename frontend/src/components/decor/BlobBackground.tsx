import { cn } from '../../lib/cn';

// Colours come from --blob-* tokens so Soft night gets its own dimmer dusk palette.
const BLOBS = [
  { v: '--blob-1', cls: '-left-24 -top-24 h-[28rem] w-[28rem]', delay: '0s' },
  { v: '--blob-2', cls: 'right-[-8rem] top-20 h-[26rem] w-[26rem]', delay: '-6s' },
  { v: '--blob-3', cls: 'bottom-[-10rem] left-[15%] h-[30rem] w-[30rem]', delay: '-12s' },
  { v: '--blob-4', cls: 'bottom-10 right-[10%] h-[18rem] w-[18rem]', delay: '-18s' },
];

export function BlobBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)} data-testid="blob-background">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className={cn('absolute rounded-full blur-3xl animate-drift', b.cls)}
          style={{ animationDelay: b.delay, background: `rgb(var(${b.v}) / var(--blob-alpha))` }}
        />
      ))}
    </div>
  );
}
