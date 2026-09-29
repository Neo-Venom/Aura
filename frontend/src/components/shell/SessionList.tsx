import { groupSessions, type SessionGroup } from '../../lib/dates';
import { SessionRow } from './SessionRow';
import { BreathingOrb } from '../calm/BreathingOrb';
import { en } from '../../copy/en';
import type { ChatSession } from '../../types/api';

const ORDER: SessionGroup[] = ['today', 'yesterday', 'week', 'older'];

export function SessionList({ sessions, loading, searching }: { sessions: ChatSession[] | undefined; loading: boolean; searching: boolean }) {
  if (loading) return <div className="flex justify-center py-6"><BreathingOrb label={en.common.loading} /></div>;
  if (!sessions?.length) {
    return (
      <p className="px-4 py-6 text-sm text-muted" data-testid="session-list-empty">
        {searching ? en.shell.noMatches : en.shell.emptyHistory}
      </p>
    );
  }
  const groups = groupSessions(sessions);
  return (
    <nav aria-label="Past chats" data-testid="session-list" className="space-y-4">
      {ORDER.filter((g) => groups[g].length).map((g) => (
        <div key={g}>
          <h3 className="px-4 pb-1 text-xs font-bold uppercase tracking-wider text-muted">{en.shell.groups[g]}</h3>
          <ul className="space-y-0.5">{groups[g].map((s) => <SessionRow key={s.id} s={s} />)}</ul>
        </div>
      ))}
    </nav>
  );
}
