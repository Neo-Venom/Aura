import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, RotateCcw, Trash2, UserX } from 'lucide-react';
import { AccentPicker } from '../components/settings/AccentPicker';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui-kit/Button';
import { Segmented, Switch } from '../components/ui-kit/Controls';
import { useProfile, useUpdateProfile } from '../app/auth';
import { getServices } from '../services';
import { COUNTRIES, VOICE_LANGUAGES, en } from '../copy/en';
import type { Profile } from '../types/api';

function Section({ title, children, testId }: { title: string; children: ReactNode; testId: string }) {
  return (
    <section className="card space-y-5 p-6 sm:p-8" aria-labelledby={`${testId}-h`} data-testid={testId}>
      <h2 id={`${testId}-h`} className="text-base font-bold md:text-lg">{title}</h2>
      {children}
    </section>
  );
}

function ProfileSection({ me }: { me: Profile }) {
  const update = useUpdateProfile();
  const [name, setName] = useState(me.display_name ?? '');
  const [country, setCountry] = useState(me.country_code ?? 'INTL');
  useEffect(() => { setName(me.display_name ?? ''); setCountry(me.country_code ?? 'INTL'); }, [me.display_name, me.country_code]);
  const dirty = name.trim() !== (me.display_name ?? '') || country !== (me.country_code ?? 'INTL');
  const save = () => update.mutate({ display_name: name.trim() || null, country_code: country }, { onSuccess: () => toast(en.common.saved) });
  return (
    <Section title={en.settings.profile} testId="settings-profile">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="block text-sm font-bold">{en.settings.displayName}</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} data-testid="settings-name-input" maxLength={60} />
        </label>
        <label className="space-y-1.5">
          <span className="block text-sm font-bold">{en.settings.country}</span>
          <select className="field" value={country} onChange={(e) => setCountry(e.target.value)} data-testid="settings-country-select">
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
      </div>
      <Button onClick={save} disabled={!dirty || update.isPending} data-testid="settings-profile-save">{en.common.save}</Button>
    </Section>
  );
}

function DataSection() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { profileService, chatService, assessmentService } = getServices();
  const [dlg, setDlg] = useState<'chats' | 'account' | null>(null);

  const download = async () => {
    const data = await profileService.exportData();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(en.settings.exported);
  };

  const row = 'w-full justify-start sm:w-auto';
  return (
    <Section title={en.settings.data} testId="settings-data">
      <div className="flex flex-wrap gap-3">
        <Button variant="soft" className={row} onClick={() => { assessmentService.clearDraft(); navigate('/onboarding/checkin'); }} data-testid="settings-retake-checkin">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />{en.settings.retake}
        </Button>
        <Button variant="soft" className={row} onClick={download} data-testid="settings-download-data">
          <Download className="h-4 w-4" aria-hidden="true" />{en.settings.download}
        </Button>
        <Button variant="outline" className={row} onClick={() => setDlg('chats')} data-testid="settings-delete-chats">
          <Trash2 className="h-4 w-4" aria-hidden="true" />{en.settings.deleteChats}
        </Button>
        <Button variant="outline" className={row} onClick={() => setDlg('account')} data-testid="settings-delete-account">
          <UserX className="h-4 w-4" aria-hidden="true" />{en.settings.deleteAccount}
        </Button>
      </div>
      <ConfirmDialog open={dlg === 'chats'} onOpenChange={(v) => setDlg(v ? 'chats' : null)} title={en.settings.deleteChatsTitle}
        body={en.settings.deleteChatsBody} confirmLabel={en.settings.deleteChats} testId="delete-all-chats-dialog"
        onConfirm={async () => { await chatService.deleteAll(); qc.invalidateQueries({ queryKey: ['sessions'] }); qc.removeQueries({ queryKey: ['session'] }); toast(en.settings.chatsDeleted); }} />
      <ConfirmDialog open={dlg === 'account'} onOpenChange={(v) => setDlg(v ? 'account' : null)} title={en.settings.deleteAccountTitle}
        body={en.settings.deleteAccountBody} confirmLabel={en.settings.deleteAccount} requireText="DELETE" testId="delete-account-dialog"
        onConfirm={async () => { await profileService.deleteAccount(); navigate('/'); }} />
    </Section>
  );
}

export default function Settings() {
  const { data: me } = useProfile();
  const update = useUpdateProfile();
  if (!me) return null;
  return (
    <div className="min-h-0 flex-1 overflow-y-auto" data-testid="settings-page">
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl sm:text-5xl animate-rise">{en.settings.title}</h1>
        <ProfileSection me={me} />
        <Section title={en.settings.appearance} testId="settings-appearance">
          <div className="space-y-2">
            <p className="text-sm font-bold">{en.settings.theme}</p>
            <Segmented name={en.settings.theme} testId="settings-theme" value={me.theme_mode} onChange={(v) => update.mutate({ theme_mode: v })}
              options={(['light', 'night', 'system'] as const).map((v) => ({ value: v, label: en.settings.themes[v] }))} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold">{en.settings.accent}</p>
            <AccentPicker value={me.accent} onChange={(v) => update.mutate({ accent: v })} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold">{en.settings.textSize}</p>
            <Segmented name={en.settings.textSize} testId="settings-text-size" value={me.text_size} onChange={(v) => update.mutate({ text_size: v })}
              options={(['sm', 'md', 'lg'] as const).map((v) => ({ value: v, label: en.settings.sizes[v] }))} />
          </div>
        </Section>
        <Section title={en.settings.voice} testId="settings-voice">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="auto-send" className="space-y-0.5">
              <span className="block font-semibold">{en.settings.autoSend}</span>
              <span className="block text-sm text-muted">{en.settings.autoSendHint}</span>
            </label>
            <Switch id="auto-send" testId="settings-auto-send-switch" checked={me.auto_send_voice} onCheckedChange={(v) => update.mutate({ auto_send_voice: v })} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <label htmlFor="voice-language" className="space-y-0.5">
              <span className="block font-semibold">{en.settings.voiceLanguage}</span>
              <span className="block text-sm text-muted">{en.settings.voiceLanguageHint}</span>
            </label>
            <select id="voice-language" className="field !w-auto" value={me.stt_language ?? ''}
              onChange={(e) => update.mutate({ stt_language: e.target.value || null })} data-testid="settings-voice-language-select">
              <option value="">{en.settings.browserDefault}</option>
              {VOICE_LANGUAGES.map((l) => <option key={l.code} value={l.code} lang={l.code}>{l.name}</option>)}
            </select>
          </div>
        </Section>
        <DataSection />
        <Section title={en.settings.legal} testId="settings-legal">
          <div className="flex gap-4">
            <Link to="/privacy" className="font-semibold underline underline-offset-4" data-testid="settings-privacy-link">{en.common.privacy}</Link>
            <Link to="/terms" className="font-semibold underline underline-offset-4" data-testid="settings-terms-link">{en.common.terms}</Link>
            <Link to="/crisis" className="font-semibold underline underline-offset-4" data-testid="settings-crisis-link">{en.common.support}</Link>
          </div>
        </Section>
      </div>
    </div>
  );
}
