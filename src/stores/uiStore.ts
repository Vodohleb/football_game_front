import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  reducedMotion: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  reducedMotion: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
