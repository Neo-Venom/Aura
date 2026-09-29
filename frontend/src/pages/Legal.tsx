import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/common/Layouts';
import { en } from '../copy/en';

function LegalPage({ title, testId }: { title: string; testId: string }) {
  return (
    <PublicLayout>
      <section className="card p-8 sm:p-10" data-testid={testId}>
        <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-4 text-muted">{en.legal.placeholder}</p>
        <Link to="/" className="mt-6 inline-block font-semibold underline underline-offset-4" data-testid={`${testId}-home-link`}>{en.legal.home}</Link>
      </section>
    </PublicLayout>
  );
}

export const Privacy = () => <LegalPage title={en.legal.privacyTitle} testId="privacy-page" />;
export const Terms = () => <LegalPage title={en.legal.termsTitle} testId="terms-page" />;
