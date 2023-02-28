import { usePositionStore } from '@/stores/store'
import React, { useMemo } from 'react'

export const useCustodies = () => {
  const selectedPool = usePositionStore(state => state.selectedPool);
  const custodies = usePositionStore(state => state.custodies);

  return useMemo(() => {
    const custodyAccounts = selectedPool.custodies.map(f => f.custodyAccount.toBase58())
    return custodyAccounts.map(f => custodies.get(f))
  }, [selectedPool])
}

