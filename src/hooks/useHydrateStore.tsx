import { usePositionStore } from '@/stores/store'
import { Custody } from '@/types/Custody'
import { getPerpetualProgramAndProvider } from '@/utils/constants'
import { PoolConfig } from '@/utils/PoolConfig'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import React, { useEffect } from 'react'

export const useHydrateStore = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const addCustody = usePositionStore(state => state.addCustody);
  const setCustodies = usePositionStore(state => state.setCustodies);
  const custodies = usePositionStore(state => state.custodies);

  useEffect(() => {
    console.log('updated custodies :>> ',custodies);
  }, [custodies])
  

  useEffect(() => {
    const pool = PoolConfig.fromIdsByName('TestPool1', 'devnet');

    const custodies = pool.custodies;
    const subIds: number[] = [];

    (async () => {
      if(!wallet) return
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);
      for (const custody of custodies) {
        const subId = connection.onAccountChange(new PublicKey(custody.custodyAccount), (accountInfo) => {
          const custodyData = perpetual_program.coder.accounts.decode<Custody>('custody', accountInfo.data);
          console.log('custodyData :: ', custodyData)
          addCustody(custodyData)
          setCustodies((new Map()).set(custodyData.mint.toBase58(), custodyData))
        })
        subIds.push(subId)
      }
    })()

    return () => {
      subIds.forEach(subId => {
        console.log(">>>> unsubcribing >>> ");
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [wallet])


  return (
    <div>useHyderateStore</div>
  )
}
