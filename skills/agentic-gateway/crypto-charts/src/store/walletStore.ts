import { create } from 'zustand';

interface WalletState {
  isPremium: boolean;
  siwsToken: string | null;
  setPremium: (v: boolean) => void;
  setSiwsToken: (t: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isPremium: false,
  siwsToken: null,
  setPremium: (isPremium) => set({ isPremium }),
  setSiwsToken: (siwsToken) => set({ siwsToken }),
}));
