import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Flower2, LogOut, PanelLeftClose, Plus, Search, Settings, Sun } from 'lucide-react';
import { Logo } from '../decor/Illustrations';
import { Button } from '../ui-kit/Button';
import { Tip } from '../ui-kit/Controls';
import { SupportPill } from '../safety/SupportPill';
import { SessionList } from './SessionList';
import { useDebounced, useSessions } from './useSessions';
import { useProfile } from '../../app/auth';
import { useUi } from '../../app/store';
import { getServices } from '../../services';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';

const NAV = [
  { to: '/app/calm', label: en.shell.calm, icon: Flower2, id: 'nav-calm' },
  { to: '/app/weather', label: en.shell.weather, icon: Sun, id: 'nav-weather' },
  { to: '/app/settings', label: en.shell.settings, icon: Settings, id: 'nav-settings' },
];

export function Sidebar({ mobile }: { mobile?: boolean }) {
  const navigate = useNavigate();
  const { data: me } = useProfile();
  const closeNav = useUi((s) => s.setMobileNavOpen);
  const toggle = useUi((s) => s.toggleSidebar);
  const [q, setQ] = useState('');
  const dq = useDebounced(q.trim());
  const { data, isLoading } = useSessions(dq);
  const name = me?.display_name || me?.email || '';

  return (
    <div className="flex h-full flex-col gap-4 p-4" data-testid={mobile ? 'sidebar-mobile' : 'sidebar'}>
      <div className="flex items-center justify-between pl-2">
        <Logo to="/app/chat" />
        {!mobile && (
          <Tip label={en.shell.collapse}>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label={en.shell.collapse} data-testid="sidebar-collapse-button">
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </Tip>
        )}
      </div>
      <Button
        variant="accent"
        className="w-full justify-start"
        onClick={() => { navigate('/app/chat'); closeNav(false); }}
        data-testid="new-chat-button"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />{en.shell.newChat}
      </Button>
      <label className="relative block">
        <span className="sr-only">{en.shell.search}</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={en.shell.search}
          className="field !min-h-[44px] !rounded-full !pl-10 text-sm"
          data-testid="session-search-input"
        />
      </label>
      <div className="-mx-2 min-h-0 flex-1 overflow-y-auto px-2">
        <SessionList sessions={data?.items} loading={isLoading} searching={!!dq} />
      </div>
      <nav aria-label="App" className="space-y-0.5 border-t border-line pt-3">
        {NAV.map(({ to, label, icon: Icon, id }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => closeNav(false)}
            data-testid={id}
            className={({ isActive }) => cn(
              'flex min-h-[44px] items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors duration-200',
              isActive ? 'bg-soft' : 'hover:bg-soft/70',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />{label}
          </NavLink>
        ))}
      </nav>
      <SupportPill className="w-full justify-center" testId={mobile ? 'support-pill-drawer' : 'support-pill-sidebar'} />
      <div className="flex items-center gap-3 rounded-full bg-soft/60 p-1.5 pl-2">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-butter font-bold text-on-accent" aria-hidden="true">
          {(name[0] ?? 'A').toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold" data-testid="sidebar-user-name">{name}</span>
        <Tip label={en.shell.logout}>
          <Button variant="ghost" size="icon" aria-label={en.shell.logout} onClick={() => getServices().authService.logOut()} data-testid="logout-button">
            <LogOut className="h-4 w-4" />
          </Button>
        </Tip>
      </div>
    </div>
  );
}
