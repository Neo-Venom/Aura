import { BlobBackground } from '../decor/BlobBackground';
import { Logo } from '../decor/Illustrations';
import { AuthForm } from './AuthForm';
import { en } from '../../copy/en';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const signup = mode === 'signup';
  return (
    <div className="relative flex min-h-dvh-screen flex-col items-center justify-center px-4 py-10">
      <BlobBackground />
      <div className="mb-6"><Logo /></div>
      <main id="main" className="card w-full max-w-md p-7 sm:p-9 animate-rise" data-testid={`${mode}-page`}>
        <h1 className="font-display text-3xl sm:text-4xl">{signup ? en.auth.signupTitle : en.auth.loginTitle}</h1>
        <p className="mb-7 mt-1 text-muted">{signup ? en.auth.signupSub : en.auth.loginSub}</p>
        <AuthForm mode={mode} />
      </main>
      <p className="mt-6 max-w-md text-center text-xs text-muted">{en.disclaimer}</p>
    </div>
  );
}
