import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/common/Layouts';
import { CrisisContent } from '../components/safety/CrisisModal';
import { useProfile } from '../app/auth';
import { COUNTRIES, en } from '../copy/en';

function guessCountry(): string {
  const region = (navigator.language.split('-')[1] ?? '').toUpperCase();
  const code = region === 'GB' ? 'UK' : region;
  return COUNTRIES.some((c) => c.code === code) ? code : 'INTL';
}

export default function Crisis() {
  const { data } = useProfile();
  return (
    <PublicLayout>
      <section className="card p-6 sm:p-10 animate-rise" data-testid="crisis-page">
        <h1 className="mb-4 font-display text-3xl sm:text-4xl">{en.support.title}</h1>
        <CrisisContent initialCountry={data?.country_code ?? guessCountry()} />
        <Link to="/" className="mt-6 inline-block font-semibold underline underline-offset-4" data-testid="crisis-home-link">{en.legal.home}</Link>
      </section>
    </PublicLayout>
  );
}
