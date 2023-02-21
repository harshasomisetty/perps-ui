import { PositionRequest } from '@/hooks/usePositions';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface StoreState {
    storePositions: PositionRequest,
    setStorePositions: (position: PositionRequest) => void
}

const store = (set: Function): StoreState => ({
    storePositions: {
        status: "pending",
    },
    setStorePositions: (position: PositionRequest) => set({ storePositions: position })
})

export const useAppStore = create(process.env.NODE_ENV == 'production'? store : devtools(store));
