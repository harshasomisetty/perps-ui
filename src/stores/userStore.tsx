import { create } from "zustand";

interface UserState {
  userLpTokens: Record<string, number>;
  setUserLpTokens: (lpTokens: Record<string, number>) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  userLpTokens: {},
  setUserLpTokens: (lpTokens: Record<string, number>) =>
    set({ userLpTokens: lpTokens }),
}));
