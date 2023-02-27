import { PositionRequest } from "@/hooks/usePositions";
import { Custody } from "@/types/Custody";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface StoreState {
  storePositions: PositionRequest;
  setStorePositions: (position: PositionRequest) => void;
  custodies: Map<string, Custody>;
  setCustodies: (custodies: Map<string, Custody>) => void;
  addCustody: (custody: Custody) => void;
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
      console.log(">>>>> ")
      const custodies = new Map<string, Custody>(state.custodies);
      custodies.set(custody.mint, custody)
      console.log('custodies :: ', custodies)
      return { custodies: custodies }
    }),
  }))
);
