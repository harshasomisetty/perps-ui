import { PositionRequest } from "@/hooks/usePositions";
import { PoolAccount } from "@/lib/PoolAccount";
import { Custody } from "src/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface StoreState {
  storePositions: PositionRequest;
  setStorePositions: (position: PositionRequest) => void;
  poolData: Record<string, PoolAccount>;
  setPoolData: (pool: Record<string, PoolAccount>) => void;

  // custodies: Map<string, Custody>;
  // setCustodies: (custodies: Map<string, Custody>) => void;
  // addCustody: (custodyPk: string, custody: Custody) => void;
}

export const useGlobalStore = create<StoreState>()(
  devtools((set, get) => ({
    devtools: false,
    storePositions: {
      status: "pending",
    },
    setStorePositions: (position: PositionRequest) =>
      set({ storePositions: position }),

    poolData: {},
    setPoolData: (poolObjs: Record<string, PoolAccount>) =>
      set({ poolData: poolObjs }),
  }))
);
