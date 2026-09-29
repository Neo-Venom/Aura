import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        className: 'font-sans',
        style: {
          background: 'rgb(var(--c-surface))',
          color: 'rgb(var(--c-ink))',
          border: '1px solid rgb(var(--c-line))',
          borderRadius: '999px',
          boxShadow: 'var(--shadow-soft)',
          fontFamily: 'Nunito, sans-serif',
        },
      }}
    />
  );
}
