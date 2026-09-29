import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui-kit/Button';
import { getServices } from '../../services';
import { env } from '../../lib/env';
import { COUNTRIES, en } from '../../copy/en';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-bold">
        {label}{hint && <span className="font-normal text-muted">{hint}</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="px-2 text-sm font-semibold text-accent-strong" data-testid={`${id}-error`}>{error}</p>}
    </div>
  );
}

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { authService } = getServices();
  const signup = mode === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const errors = {
    email: EMAIL_RE.test(email.trim()) ? undefined : en.auth.badEmail,
    password: password.length >= 6 ? undefined : en.auth.shortPassword,
    country: !signup || country ? undefined : en.auth.needCountry,
  };
  const err = (k: keyof typeof errors) => (touched[k] ? errors[k] : undefined);
  const touch = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, country: true });
    if (errors.email || errors.password || errors.country) return;
    setBusy(true);
    setFailed(false);
    try {
      if (signup) await authService.signUp({ email: email.trim(), password, display_name: name.trim() || null, country_code: country });
      else await authService.logIn(email.trim(), password);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" data-testid={`${mode}-form`}>
      {signup && (
        <Field id="name" label={en.auth.name} hint={en.auth.nameHint}>
          <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" data-testid="auth-name-input" />
        </Field>
      )}
      <Field id="email" label={en.auth.email} error={err('email')}>
        <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={touch('email')}
          autoComplete="email" aria-invalid={!!err('email')} aria-describedby={err('email') ? 'email-error' : undefined} data-testid="auth-email-input" />
      </Field>
      <Field id="password" label={en.auth.password} error={err('password')}>
        <div className="relative">
          <input id="password" type={show ? 'text' : 'password'} className="field pr-14" value={password} onChange={(e) => setPassword(e.target.value)}
            onBlur={touch('password')} autoComplete={signup ? 'new-password' : 'current-password'} aria-invalid={!!err('password')}
            aria-describedby={err('password') ? 'password-error' : undefined} data-testid="auth-password-input" />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? en.auth.hidePassword : en.auth.showPassword}
            className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink"
            data-testid="auth-toggle-password">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </Field>
      {signup && (
        <Field id="country" label={en.auth.country} error={err('country')}>
          <select id="country" className="field" value={country} onChange={(e) => setCountry(e.target.value)} onBlur={touch('country')}
            aria-invalid={!!err('country')} data-testid="auth-country-select">
            <option value="" disabled>{en.auth.countryPlaceholder}</option>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
          <p className="px-2 text-xs text-muted">{en.auth.countryHint}</p>
        </Field>
      )}
      {failed && <p role="alert" className="rounded-2xl bg-butter/40 px-4 py-3 text-sm font-semibold" data-testid="auth-error">{en.auth.failed}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy} data-testid="auth-submit-button">
        {signup ? en.auth.signup : en.auth.login}
      </Button>
      {env.enableGoogleLogin && (
        <>
          <div className="flex items-center gap-3 text-sm text-muted"><span className="h-px flex-1 bg-line" />{en.auth.or}<span className="h-px flex-1 bg-line" /></div>
          <Button variant="outline" size="lg" className="w-full" onClick={() => authService.logInWithGoogle()} data-testid="auth-google-button">
            {en.auth.google}
          </Button>
        </>
      )}
      <p className="text-center text-sm">
        <Link to={signup ? '/login' : '/signup'} className="font-semibold underline-offset-4 hover:underline" data-testid="auth-switch-link">
          {signup ? en.auth.toLogin : en.auth.toSignup}
        </Link>
      </p>
    </form>
  );
}
