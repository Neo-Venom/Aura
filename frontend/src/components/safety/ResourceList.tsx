import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Phone, ExternalLink, Globe } from 'lucide-react';
import { getServices } from '../../services';
import { BreathingOrb } from '../calm/BreathingOrb';
import { COUNTRIES, en } from '../../copy/en';
import type { CrisisResource } from '../../types/api';

export const useResources = (country: string | null) =>
  useQuery({
    queryKey: ['resources', country ?? 'INTL'],
    queryFn: () => getServices().safetyService.getResources(country),
    staleTime: Infinity,
  });

const bigBtn = 'inline-flex min-h-[48px] items-center gap-2 rounded-full bg-terracotta px-5 font-bold text-white transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.98]';
const linkBtn = 'inline-flex min-h-[48px] items-center gap-2 rounded-full bg-soft px-5 font-semibold text-ink transition-colors duration-200 hover:bg-line';

function ResourceItem({ r }: { r: CrisisResource }) {
  return (
    <li className="rounded-3xl border border-line bg-surface p-5" data-testid={`crisis-resource-${r.id}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold">{r.name}</h3>
        <span className="rounded-full bg-mint/40 px-3 py-0.5 text-xs font-semibold text-ink">{r.hours}</span>
      </div>
      <p className="mt-1 text-muted">{r.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {r.phone && (
          <a href={`tel:${r.phone.replace(/\s+/g, '')}`} className={bigBtn} data-testid={`crisis-call-${r.id}`}>
            <Phone className="h-4 w-4" aria-hidden="true" />{en.support.call} {r.phone}
          </a>
        )}
        {r.sms && (
          <a href={`sms:${r.sms.replace(/\s+/g, '')}`} className={bigBtn} data-testid={`crisis-text-${r.id}`}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />{en.support.text} {r.sms}
          </a>
        )}
        {r.url && (
          <a href={r.url} target="_blank" rel="noreferrer" className={linkBtn} data-testid={`crisis-link-${r.id}`}>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />{en.support.visit}
          </a>
        )}
      </div>
    </li>
  );
}

export function ResourceList({ country, onCountryChange, compact }: { country: string | null; onCountryChange?: (c: string) => void; compact?: boolean }) {
  const { data, isLoading } = useResources(country);
  const emergency = data?.filter((r) => r.is_emergency) ?? [];
  const lines = data?.filter((r) => !r.is_emergency && r.country_code !== 'INTL') ?? [];

  return (
    <div className="space-y-4" data-testid="crisis-resource-list">
      {!compact && (
        <div className="rounded-3xl bg-butter/35 p-5">
          <p className="font-semibold">{en.support.emergency}</p>
          {emergency.map((r) => (
            <a key={r.id} href={`tel:${r.phone ?? ''}`} className={`${bigBtn} mt-3`} data-testid="crisis-emergency-call">
              <Phone className="h-4 w-4" aria-hidden="true" />{en.support.call} {r.phone}
            </a>
          ))}
        </div>
      )}
      {onCountryChange && (
        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">{en.support.countryLabel}</span>
          <select
            className="field !min-h-[44px] !w-auto !py-0"
            value={country ?? 'INTL'}
            onChange={(e) => onCountryChange(e.target.value)}
            data-testid="crisis-country-select"
          >
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
      )}
      {isLoading ? <BreathingOrb label={en.common.loading} /> : (
        <ul className="space-y-3">{lines.map((r) => <ResourceItem key={r.id} r={r} />)}</ul>
      )}
      <div className="rounded-3xl bg-sky/30 p-5" data-testid="crisis-intl-fallback">
        <p className="font-bold">{en.support.intlTitle}</p>
        <p className="text-sm">{en.support.intlBody}</p>
        <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className={`${linkBtn} mt-3 bg-surface`} data-testid="crisis-intl-link">
          <Globe className="h-4 w-4" aria-hidden="true" />{en.support.intlLink}
        </a>
      </div>
    </div>
  );
}
