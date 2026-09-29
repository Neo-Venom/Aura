import * as D from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';

interface ModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  testId?: string;
  hideTitle?: boolean;
}

const Overlay = () => (
  <D.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
);

const CloseX = ({ testId }: { testId?: string }) => (
  <D.Close
    aria-label={en.common.close}
    data-testid={testId ? `${testId}-close` : undefined}
    className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-soft hover:text-ink"
  >
    <X className="h-5 w-5" />
  </D.Close>
);

export function Modal({ open, onOpenChange, title, description, children, className, testId, hideTitle }: ModalProps) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <Overlay />
        <D.Content
          data-testid={testId}
          aria-describedby={description ? undefined : undefined}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
            'max-h-[90dvh] overflow-y-auto rounded-4xl bg-surface p-6 sm:p-8 shadow-lift',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-200',
            className,
          )}
        >
          <D.Title className={cn('font-display text-2xl pr-10', hideTitle && 'sr-only')}>{title}</D.Title>
          {description ? <D.Description className="mt-2 text-muted">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
          <div className={cn(!hideTitle && 'mt-5')}>{children}</div>
          <CloseX testId={testId} />
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export function Sheet({ open, onOpenChange, title, children, className, testId, side = 'left' }: ModalProps & { side?: 'left' | 'bottom' }) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <Overlay />
        <D.Content
          data-testid={testId}
          className={cn(
            'fixed z-50 bg-surface shadow-lift outline-none duration-300',
            side === 'left'
              ? 'inset-y-0 left-0 w-[85vw] max-w-[320px] rounded-r-4xl data-[state=open]:animate-in data-[state=open]:slide-in-from-left'
              : 'inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-4xl p-6 pb-safe data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom',
            className,
          )}
        >
          <D.Title className="sr-only">{title}</D.Title>
          <D.Description className="sr-only">{title}</D.Description>
          {children}
          <CloseX testId={testId} />
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
