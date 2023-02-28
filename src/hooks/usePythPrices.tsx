import { CLUSTER } from '@/utils/constants';
import { PoolConfig } from '@/utils/PoolConfig';
import { getPythProgramKeyForCluster, PriceStatus, PythConnection, PythHttpClient } from '@pythnetwork/client';
import { useConnection } from '@solana/wallet-adapter-react'
import React, { useEffect } from 'react'

export const usePythPrices = () => {
  const { connection } = useConnection();

  useEffect(() => {
    // const pythConnection = new PythConnection(connection, getPythProgramKeyForCluster(CLUSTER))

    (async () => {

      const ok = Array.from(new Set(PoolConfig.getAllPoolConfigs().map(t => t.tokens.map(o => o.symbol)).flat()))
      console.log('ok ::: ', ok)

      console.log('ok.map(f => `.${f}/USD`) :>> ', ok.map(f => `.${f}/USD`));

      const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster(CLUSTER));
      const data = await pythClient.getData();
      console.log('data :>> ', data);
      for (let symbol of data.symbols) {
        const price = data.productPrice.get(symbol)!;
        // Sample output:
        // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading

        if(symbol && ok.map(f => `.${f}/USD`).includes(symbol)) {
          console.log(`${symbol}: $${price.price} \xB1$${price.confidence} Status: ${PriceStatus[price.status]}`);
        }
      }

    })()


    // pythConnection.onPriceChange((product, price) => {
    //   // sample output:
    //   // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
    //   console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence} Status: ${PriceStatus[price.status]}`)
    // })

    // // Start listening for price change events.
    // pythConnection.start()

    return () => {
      // pythConnection.stop()
    }
  }, [connection])


  return (
    <div>usePythPrices</div>
  )
}