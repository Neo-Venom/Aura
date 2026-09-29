import { cn } from '../../lib/cn';

const BLOBS = [
  { color: 'bg-apricot/30', cls: '-left-24 -top-24 h-[28rem] w-[28rem]', delay: '0s' },
  { color: 'bg-lavender/35', cls: 'right-[-8rem] top-20 h-[26rem] w-[26rem]', delay: '-6s' },
  { color: 'bg-sage/25', cls: 'bottom-[-10rem] left-[15%] h-[30rem] w-[30rem]', delay: '-12s' },
  { color: 'bg-butter/40', cls: 'bottom-10 right-[10%] h-[18rem] w-[18rem]', delay: '-18s' },
];

export function BlobBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}>
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className={cn('absolute rounded-full blur-3xl animate-drift', b.color, b.cls)}
          style={{ animationDelay: b.delay }}
        />
      ))}
    </div>
  );
}
