import { Button } from '../ui-kit/Button';
import { LeafShape } from '../decor/Illustrations';
import { en } from '../../copy/en';

export function ErrorState({ onRetry, body = en.errors.body }: { onRetry?: () => void; body?: string }) {
  return (
    <div data-testid="error-state" role="alert" className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <LeafShape className="h-14 w-14 text-sage" />
      <h2 className="text-lg font-bold">{en.errors.title}</h2>
      <p className="max-w-sm text-muted">{body}</p>
      {onRetry && <Button variant="soft" onClick={onRetry} data-testid="error-retry-button">{en.common.tryAgain}</Button>}
    </div>
  );
}
