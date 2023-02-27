import { PositionRequest } from "@/hooks/usePositions";
import { Custody } from "@/types/Custody";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface StoreState {
  storePositions: PositionRequest;
  setStorePositions: (position: PositionRequest) => void;
  custodies: Custody[];
  setCustodies: (custodies: Custody[]) => void;
  addCustody: (custody: Custody) => void;
}

export const usePositionStore = create<StoreState>()(
  devtools((set, get) => ({
    devtools: false,
    storePositions: {
      status: "pending",
    },
    setStorePositions: (position: PositionRequest) => set({ storePositions: position }),
    custodies: [],
    setCustodies: (custodies: Custody[]) => set({ custodies }),
    addCustody: (custody: Custody) => set((state) => ({custodies: [...state.custodies, custody]})),
  }))
);
