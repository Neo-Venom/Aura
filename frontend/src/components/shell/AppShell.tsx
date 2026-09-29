import { Outlet } from 'react-router-dom';
import { Menu, PanelLeftOpen } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ToolSheet } from '../chat/ToolSheet';
import { Sheet } from '../ui-kit/Dialog';
import { Button } from '../ui-kit/Button';
import { Tip } from '../ui-kit/Controls';
import { Logo } from '../decor/Illustrations';
import { SupportPill } from '../safety/SupportPill';
import { useUi } from '../../app/store';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';

export function AppShell() {
  const { mobileNavOpen, setMobileNavOpen, sidebarCollapsed, toggleSidebar } = useUi();
  return (
    <div className="flex h-dvh-screen overflow-hidden bg-canvas">
      <aside
        aria-label="Sidebar"
        inert={sidebarCollapsed}
        className={cn(
          'hidden shrink-0 overflow-hidden border-r border-line/70 bg-surface/60 transition-[width] duration-300 ease-out lg:block',
          sidebarCollapsed ? 'w-0 border-r-0' : 'w-[280px]',
        )}
      >
        <div className="h-full w-[280px]"><Sidebar /></div>
      </aside>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen} title="Menu" testId="mobile-nav">
        <Sidebar mobile />
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-line/70 px-3 py-2 lg:hidden" data-testid="mobile-header">
          <Button variant="ghost" size="icon" aria-label={en.shell.openMenu} onClick={() => setMobileNavOpen(true)} data-testid="mobile-menu-button">
            <Menu className="h-5 w-5" />
          </Button>
          <Logo to="/app/chat" className="sm:mr-auto" />
          <SupportPill testId="support-pill-header" className="px-3 text-xs sm:text-sm" />
        </header>
        {sidebarCollapsed && (
          <div className="hidden p-3 lg:block">
            <Tip label={en.shell.expand}>
              <Button variant="ghost" size="icon" aria-label={en.shell.expand} onClick={toggleSidebar} data-testid="sidebar-expand-button">
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            </Tip>
          </div>
        )}
        <main id="main" className="relative flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <ToolSheet />
    </div>
  );
}
