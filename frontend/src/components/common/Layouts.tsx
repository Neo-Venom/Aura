import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../decor/Illustrations';
import { BlobBackground } from '../decor/BlobBackground';
import { SupportPill } from '../safety/SupportPill';
import { en } from '../../copy/en';

export function OnboardingLayout({ children, headerExtra }: { children: ReactNode; headerExtra?: ReactNode }) {
  return (
    <div className="relative min-h-dvh-screen">
      <BlobBackground className="opacity-70" />
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <Logo to="/" />
        <div className="flex items-center gap-2">{headerExtra}<SupportPill testId="support-pill-onboarding" /></div>
      </header>
      <main id="main" className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">{children}</main>
    </div>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh-screen">
      <BlobBackground className="opacity-60" />
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
      </header>
      <main id="main" className="mx-auto w-full max-w-3xl px-5 pb-16 sm:px-8">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SiteFooter() {
  const link = 'rounded-full px-2 py-1 font-semibold underline-offset-4 hover:underline';
  return (
    <footer className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8" data-testid="site-footer">
      <p className="text-muted">{en.disclaimer}</p>
      <nav aria-label="Footer" className="flex flex-wrap gap-2">
        <Link to="/crisis" className={link} data-testid="footer-crisis-link">{en.common.support}</Link>
        <Link to="/privacy" className={link} data-testid="footer-privacy-link">{en.common.privacy}</Link>
        <Link to="/terms" className={link} data-testid="footer-terms-link">{en.common.terms}</Link>
      </nav>
    </footer>
  );
}
