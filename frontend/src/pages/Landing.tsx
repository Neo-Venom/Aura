import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BlobBackground } from '../components/decor/BlobBackground';
import { CloudShape, LeafShape, Logo, SunShape, WaveShape } from '../components/decor/Illustrations';
import { SiteFooter } from '../components/common/Layouts';
import { en } from '../copy/en';

const TILE_STYLE = [
  { bg: 'bg-butter/35', Icon: SunShape, color: 'text-apricot' },
  { bg: 'bg-lavender/30', Icon: CloudShape, color: 'text-surface' },
  { bg: 'bg-sage/25', Icon: LeafShape, color: 'text-sage' },
];

function HeroArt() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]" aria-hidden="true">
      <div className="absolute inset-[8%] rounded-full bg-butter/50 blur-2xl" />
      <div className="absolute inset-[14%] rounded-full bg-gradient-to-br from-butter via-apricot/70 to-lavender/70 shadow-lift animate-drift" />
      <SunShape className="absolute left-[8%] top-[4%] h-24 w-24 text-butter animate-drift [animation-delay:-8s]" />
      <CloudShape className="absolute right-[-2%] top-[20%] h-20 w-32 text-surface drop-shadow-sm animate-drift [animation-delay:-4s]" />
      <LeafShape className="absolute bottom-[6%] left-[4%] h-20 w-20 text-sage animate-drift [animation-delay:-14s]" />
      <WaveShape className="absolute bottom-[12%] right-[2%] h-12 w-28 text-sky animate-drift [animation-delay:-10s]" />
    </div>
  );
}

export default function Landing() {
  return (
    <div className="relative min-h-dvh-screen overflow-x-hidden">
      <BlobBackground />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <Link to="/login" className="inline-flex min-h-[44px] items-center rounded-full px-4 font-semibold hover:bg-surface/70" data-testid="header-login-link">
          {en.auth.login}
        </Link>
      </header>
      <main id="main">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:pt-16">
          <div className="space-y-7">
            <h1 className="font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl animate-rise" data-testid="landing-headline">
              {en.landing.headline}
            </h1>
            <p className="max-w-xl text-base text-muted md:text-lg animate-rise [animation-delay:80ms]">{en.landing.sub}</p>
            <div className="flex flex-wrap items-center gap-5 animate-rise [animation-delay:160ms]">
              <Link to="/signup" data-testid="landing-start-button"
                className="group inline-flex min-h-[56px] items-center gap-2 rounded-full bg-accent-strong px-8 text-lg font-bold text-white shadow-lift transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.98]">
                {en.landing.cta}<ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link to="/login" data-testid="landing-login-link" className="rounded-full px-2 py-2 font-semibold underline-offset-4 hover:underline">
                {en.landing.haveAccount}
              </Link>
            </div>
          </div>
          <HeroArt />
        </section>
        <section aria-label="What Aura offers" className="mx-auto grid w-full max-w-6xl gap-5 px-5 pb-10 sm:px-8 md:grid-cols-3">
          {en.landing.tiles.map((t, i) => {
            const { bg, Icon, color } = TILE_STYLE[i];
            return (
              <article key={t.title} className={`rounded-4xl ${bg} p-7 animate-rise ${i === 1 ? 'md:translate-y-6' : ''}`}
                style={{ animationDelay: `${240 + i * 90}ms` }} data-testid={`feature-tile-${i}`}>
                <Icon className={`mb-5 h-12 w-12 ${color}`} />
                <h2 className="text-lg font-bold">{t.title}</h2>
                <p className="mt-1 text-ink/80">{t.body}</p>
              </article>
            );
          })}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
