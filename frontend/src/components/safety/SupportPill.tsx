import { HeartHandshake } from 'lucide-react';
import { useUi } from '../../app/store';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';

export function SupportPill({ className, testId = 'support-pill' }: { className?: string; testId?: string }) {
  const open = useUi((s) => s.setCrisisOpen);
  return (
    <button
      type="button"
      onClick={() => open(true)}
      data-testid={testId}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-2 rounded-full bg-lavender/30 px-4 text-sm font-bold text-ink',
        'transition-[background-color,transform] duration-200 hover:bg-lavender/50 active:scale-[0.98]',
        className,
      )}
    >
      <HeartHandshake className="h-4 w-4" aria-hidden="true" />
      {en.support.pill}
    </button>
  );
}
