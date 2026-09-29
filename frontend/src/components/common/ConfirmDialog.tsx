import { useState } from 'react';
import { Modal } from '../ui-kit/Dialog';
import { Button } from '../ui-kit/Button';
import { en } from '../../copy/en';

interface Props {
  open: boolean;
  onOpenChange(v: boolean): void;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm(): void | Promise<void>;
  requireText?: string;
  testId: string;
}

export function ConfirmDialog({ open, onOpenChange, title, body, confirmLabel, onConfirm, requireText, testId }: Props) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const ok = !requireText || typed.trim() === requireText;

  const confirm = async () => {
    setBusy(true);
    try { await onConfirm(); onOpenChange(false); } finally { setBusy(false); setTyped(''); }
  };

  return (
    <Modal open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTyped(''); }} title={title} description={body} testId={testId}>
      {requireText && (
        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-semibold">{en.settings.typeDelete}</span>
          <input className="field" value={typed} onChange={(e) => setTyped(e.target.value)} data-testid={`${testId}-input`} autoComplete="off" />
        </label>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="soft" onClick={() => onOpenChange(false)} data-testid={`${testId}-cancel`}>{en.common.cancel}</Button>
        <Button variant="danger" onClick={confirm} disabled={!ok || busy} data-testid={`${testId}-confirm`}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
