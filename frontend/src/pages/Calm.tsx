import * as Tabs from '@radix-ui/react-tabs';
import { Flower2, Wind } from 'lucide-react';
import { BreathingTool } from '../components/calm/BreathingTool';
import { GroundingTool } from '../components/calm/GroundingTool';
import { en } from '../copy/en';

const trigger = 'inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-bold transition-[background-color,box-shadow] duration-200 data-[state=active]:bg-surface data-[state=active]:shadow-soft';

export default function Calm() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto" data-testid="calm-page">
      <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10 sm:px-6">
        <header className="space-y-2 animate-rise">
          <h1 className="font-display text-4xl sm:text-5xl">{en.calm.title}</h1>
          <p className="text-base text-muted md:text-lg">{en.calm.sub}</p>
        </header>
        <Tabs.Root defaultValue="breathing" className="space-y-8">
          <Tabs.List aria-label={en.calm.title} className="inline-flex flex-wrap gap-1 rounded-full bg-soft p-1">
            <Tabs.Trigger value="breathing" className={trigger} data-testid="calm-tab-breathing">
              <Wind className="h-4 w-4" aria-hidden="true" />{en.calm.breathingTab}
            </Tabs.Trigger>
            <Tabs.Trigger value="grounding" className={trigger} data-testid="calm-tab-grounding">
              <Flower2 className="h-4 w-4" aria-hidden="true" />{en.calm.groundingTab}
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="breathing" className="card p-6 sm:p-10"><BreathingTool /></Tabs.Content>
          <Tabs.Content value="grounding" className="card p-6 sm:p-10"><GroundingTool /></Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
