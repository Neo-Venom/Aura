import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useSessionMutations } from './useSessions';
import { useUi } from '../../app/store';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';
import type { ChatSession } from '../../types/api';

const itemCls = 'flex min-h-[44px] cursor-pointer items-center gap-2 rounded-2xl px-3 text-sm font-semibold outline-none data-[highlighted]:bg-soft';

export function SessionRow({ s }: { s: ChatSession }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const closeNav = useUi((u) => u.setMobileNavOpen);
  const { rename, remove } = useSessionMutations();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(s.title);
  const [confirm, setConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);
  useEffect(() => setTitle(s.title), [s.title]);

  const commit = () => {
    const t = title.trim();
    if (t && t !== s.title) rename.mutate({ id: s.id, title: t });
    else setTitle(s.title);
    setEditing(false);
  };

  const onDelete = async () => {
    await remove.mutateAsync(s.id);
    if (sessionId === s.id) navigate('/app/chat');
  };

  return (
    <li className="group relative" data-testid={`session-row-${s.id}`}>
      {editing ? (
        <input
          ref={inputRef}
          value={title}
          aria-label={en.common.rename}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setTitle(s.title); setEditing(false); } }}
          className="field !min-h-[44px] !rounded-full"
          data-testid={`session-rename-input-${s.id}`}
          maxLength={80}
        />
      ) : (
        <NavLink
          to={`/app/chat/${s.id}`}
          onClick={() => closeNav(false)}
          data-testid={`session-link-${s.id}`}
          className={({ isActive }) => cn(
            'flex min-h-[44px] items-center rounded-full py-2 pl-4 pr-12 text-sm transition-colors duration-200',
            isActive ? 'bg-soft font-bold' : 'hover:bg-soft/70',
          )}
        >
          <span className="truncate">{s.title}</span>
        </NavLink>
      )}
      {!editing && (
        <Menu.Root>
          <Menu.Trigger
            aria-label={`${en.shell.chatOptions}: ${s.title}`}
            data-testid={`session-menu-${s.id}`}
            className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted opacity-100 transition-opacity hover:bg-line hover:text-ink lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Content align="end" sideOffset={4} className="z-50 min-w-[160px] rounded-3xl bg-surface p-1.5 shadow-lift animate-in fade-in-0 zoom-in-95">
              <Menu.Item className={itemCls} onSelect={() => setEditing(true)} data-testid={`session-rename-${s.id}`}>
                <Pencil className="h-4 w-4" aria-hidden="true" />{en.common.rename}
              </Menu.Item>
              <Menu.Item className={itemCls} onSelect={() => setConfirm(true)} data-testid={`session-delete-${s.id}`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />{en.common.delete}
              </Menu.Item>
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>
      )}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={en.shell.deleteTitle}
        body={en.shell.deleteBody}
        confirmLabel={en.common.delete}
        onConfirm={onDelete}
        testId="delete-chat-dialog"
      />
    </li>
  );
}
