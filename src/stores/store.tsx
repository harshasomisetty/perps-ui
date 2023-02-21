import { PositionRequest } from '@/hooks/usePositions';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface StoreState {
    storePositions: PositionRequest,
    setStorePositions: (position: PositionRequest) => void
}

export const useAppStore = create<StoreState>()(
    devtools((set, get) => ({
        devtools: false,
        storePositions: {
            status: "pending",
        },
        setStorePositions: (position: PositionRequest) => set({ storePositions: position })
    }))
)
