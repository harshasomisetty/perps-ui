import { Custody } from '@/types/Custody'
import { getPerpetualProgramAndProvider } from '@/utils/constants'
import { PoolConfig } from '@/utils/PoolConfig'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import React, { useEffect } from 'react'


export const useHydrateStore = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(() => {
    const pool = PoolConfig.fromIdsByName('TestPool1', 'devnet');

    const custodies = pool.custodies;
    const subIds: number[] = [];

    (async () => {
      if(!wallet) return
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);
      for (const custody of custodies) {
        const subId = connection.onAccountChange(new PublicKey(custody.custodyAccount), (accountInfo) => {
          const custodyData = perpetual_program.account.custody.coder.state.decode<Custody>(accountInfo.data);
        })
        subIds.push(subId)
      }
    })()

    return () => {
      subIds.forEach(subId => {
        console.log(">>>> here >>> ");
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [wallet])


  return (
    <div>useHyderateStore</div>
  )
}
