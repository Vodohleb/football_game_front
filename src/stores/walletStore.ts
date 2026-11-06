import { create } from 'zustand';

interface WalletState {
  balance: number;
  known: boolean;
  setBalance: (balance: number) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  known: false,
  setBalance: (balance) => set({ balance, known: true }),
  reset: () => set({ balance: 0, known: false }),
}));
