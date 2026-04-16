import { create } from 'zustand';

import { useScrollStore } from './scrollStore';

interface PortalStore {
  activePortalId: string | null;
  setActivePortal: (activePortalId: string | null) => void;
}

export const usePortalStore = create<PortalStore>((set) => ({
  activePortalId: null,
  setActivePortal: (activePortalId) => {
    // Work timeline reads the same store key that ScrollWrapper uses for the main page.
    // Reset when entering so the first jobs are visible instead of a stale end-of-curve position.
    if (activePortalId === 'work') {
      useScrollStore.getState().setScrollProgress(0);
    }
    set(() => ({ activePortalId }));
  },
}))
