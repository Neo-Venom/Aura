import { Modal } from '../ui-kit/Dialog';
import { BreathingTool } from '../calm/BreathingTool';
import { GroundingTool } from '../calm/GroundingTool';
import { useUi } from '../../app/store';
import { en } from '../../copy/en';

export function ToolSheet() {
  const tool = useUi((s) => s.tool);
  const setTool = useUi((s) => s.setTool);
  return (
    <Modal
      open={!!tool}
      onOpenChange={(v) => !v && setTool(null)}
      title={tool === 'grounding' ? en.calm.groundingTab : en.calm.breathingTab}
      testId="tool-sheet"
    >
      {tool === 'breathing' && <BreathingTool compact />}
      {tool === 'grounding' && <GroundingTool />}
    </Modal>
  );
}
