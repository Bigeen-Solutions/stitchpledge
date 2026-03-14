import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeStoreId: string | null;
  theme: 'light' | 'dark';
  pendingCommandIds: string[];
  
  // Actions
  toggleSidebar: () => void;
  setStoreId: (id: string) => void;
  addPendingCommand: (id: string) => void;
  removePendingCommand: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeStoreId: null,
  theme: 'light',
  pendingCommandIds: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setStoreId: (id) => set({ activeStoreId: id }),
  addPendingCommand: (id) => set((state) => ({ 
    pendingCommandIds: [...state.pendingCommandIds, id] 
  })),
  removePendingCommand: (id) => set((state) => ({ 
    pendingCommandIds: state.pendingCommandIds.filter(cid => cid !== id) 
  })),
}));
