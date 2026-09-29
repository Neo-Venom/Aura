import { useEffect } from 'react';
import { useProfile } from './auth';
import { readJSON, writeJSON } from '../lib/cn';

type Prefs = { theme_mode: 'light' | 'night' | 'system'; accent: string; text_size: string };
const KEY = 'aura.prefs';

function apply(p: Prefs) {
  const el = document.documentElement;
  const night = p.theme_mode === 'night'
    || (p.theme_mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  el.dataset.theme = night ? 'night' : 'light';
  el.dataset.accent = p.accent;
  el.dataset.text = p.text_size;
}

export function ThemeSync() {
  const { data } = useProfile();
  const prefs: Prefs = data
    ? { theme_mode: data.theme_mode, accent: data.accent, text_size: data.text_size }
    : readJSON<Prefs>(KEY, { theme_mode: 'light', accent: 'apricot', text_size: 'md' });

  useEffect(() => {
    apply(prefs);
    if (data) writeJSON(KEY, prefs);
    if (prefs.theme_mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => apply(prefs);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.theme_mode, prefs.accent, prefs.text_size, !!data]);

  return null;
}
