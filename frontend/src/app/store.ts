import { create } from 'zustand';
import type { InputMode } from '../types/api';

export type ToolKind = 'breathing' | 'grounding';

interface UiState {
  crisisOpen: boolean;
  setCrisisOpen(v: boolean): void;
  mobileNavOpen: boolean;
  setMobileNavOpen(v: boolean): void;
  sidebarCollapsed: boolean;
  toggleSidebar(): void;
  tool: ToolKind | null;
  setTool(t: ToolKind | null): void;
  pending: { sessionId: string; content: string; input_mode: InputMode } | null;
  setPending(p: UiState['pending']): void;
}

export const useUi = create<UiState>((set) => ({
  crisisOpen: false,
  setCrisisOpen: (crisisOpen) => set({ crisisOpen }),
  mobileNavOpen: false,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  tool: null,
  setTool: (tool) => set({ tool }),
  pending: null,
  setPending: (pending) => set({ pending }),
}));
