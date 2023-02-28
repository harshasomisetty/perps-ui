import { usePositionStore } from '@/stores/store'
import { Custody } from '@/types/index'
import { getPerpetualProgramAndProvider } from '@/utils/constants'
import { PoolConfig } from '@/utils/PoolConfig'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import React, { useEffect } from 'react'
import { getEntryPriceAndFee } from '../viewHelpers'

export const useHydrateStore = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const addCustody = usePositionStore(state => state.addCustody);
  const addPool = usePositionStore(state => state.addPool);

  useEffect(() => {
    const pools = PoolConfig.getAllPoolConfigs();
    const subIds: number[] = [];
    (async () => {
      if(!wallet) return
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);
      for (const pool of pools) {
        const accountInfo = await connection.getAccountInfo(pool.poolAddress)
        if(accountInfo) {
          const poolData = perpetual_program.coder.accounts.decode('pool', accountInfo.data);
          addPool(poolData)
        }
        const subId = connection.onAccountChange(new PublicKey(pool.poolAddress), (accountInfo) => {
          const poolData = perpetual_program.coder.accounts.decode('pool', accountInfo.data);
          addPool(poolData)
        })
        subIds.push(subId)
      }
    })()
  
    return () => {
      subIds.forEach(subId => {
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [wallet])
  

  useEffect(() => {
    const pools = PoolConfig.getAllPoolConfigs();

    const custodies = pools.map(t => t.custodies).flat();
    const subIds: number[] = [];
    getEntryPriceAndFee();
    (async () => {
      if(!wallet) return
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);
      for (const custody of custodies) {
        const accountInfo = await connection.getAccountInfo(custody.custodyAccount)
        if(accountInfo) {
          const custodyData = perpetual_program.coder.accounts.decode<Custody>('custody', accountInfo.data);
          addCustody(custodyData)
        }
        const subId = connection.onAccountChange(custody.custodyAccount, (accountInfo) => {
          const custodyData = perpetual_program.coder.accounts.decode<Custody>('custody', accountInfo.data);
          addCustody(custodyData)
        })
        subIds.push(subId)
      }
    })()

    return () => {
      subIds.forEach(subId => {
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [wallet])


  return (
    <div>useHyderateStore</div>
  )
}
