import { PositionRequest } from "@/hooks/usePositions";
import { Custody } from "@/types/Custody";
import { CLUSTER, DEFAULT_POOL } from "@/utils/constants";
import { PoolConfig } from "@/utils/PoolConfig";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface StoreState {
  storePositions: PositionRequest;
  setStorePositions: (position: PositionRequest) => void;
  custodies: Map<string, Custody>;
  setCustodies: (custodies: Map<string, Custody>) => void;
  addCustody: (custody: Custody) => void;
  selectedPool: PoolConfig;
  setSelectedPool: (pool: PoolConfig) => void;
}

export const usePositionStore = create<StoreState>()(
  devtools((set, get) => ({
    devtools: false,
    storePositions: {
      status: "pending",
    },
    setStorePositions: (position: PositionRequest) => set({ storePositions: position }),
    custodies: new Map<string, Custody>(),
    setCustodies: (custodies: Map<string, Custody>) => set({ custodies }),
    addCustody: (custody: Custody) => set((state) => {
      const custodies = new Map<string, Custody>(state.custodies);
      custodies.set(custody.mint.toBase58(), custody)
      return { custodies: custodies }
    }),
    selectedPool: PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER),
    setSelectedPool: (pool: PoolConfig) => set({ selectedPool: pool })
  }),
    {
      serialize: {
        options: {
          map: true
        }
      } as any
    }
  )
);
