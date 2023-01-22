import React, { useState, useEffect } from "react";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_PROGRAM_ID,
} from "@/utils/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ProgramAccount } from "@project-serum/anchor";
import {
  getTokenGivenAddress,
  Token,
  useDailyPriceStats,
} from "@/hooks/useDailyPriceStats";

// create starter react page

export default function Pools() {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();
  const [pools, setPools] = useState<ProgramAccount<T>[]>([]);
  const [custodies, setCustodies] = useState<Record<string, Object | Null[]>>(
    {}
  );

  const stats = useDailyPriceStats();
  console.log("stats", stats);

  useEffect(() => {
    async function fetchData() {
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

      let poolInfos = await perpetual_program.account.pool.all();

      Object.values(poolInfos).forEach(async (pool) => {
        console.log("print pool", pool.account.tokens);

        let c = [];
        Object.values(pool.account.tokens).forEach((token) => {
          c.push(token.custody.toString());
        });

        let fetchedCusto =
          await perpetual_program.account.custody.fetchMultiple(c);
        console.log("custody example", fetchedCusto[0]);

        setPools(poolInfos);
        setCustodies({
          ...custodies,
          [pool.publicKey.toString()]: fetchedCusto,
        });
      });

      // poolInfos.forEach((pool) => {
      //   pool.tokens.forEach((token) => {
      //     c.push(token.custody.toString());
      //   });
      // });
    }
    if (wallet && publicKey) {
      fetchData();
    }
  }, [wallet, publicKey]);

  if (pools.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <p>Pools page</p>
      <div className="m-2 border p-2">
        {pools.map((pool) => (
          <div>
            <p>{pool.account.name}</p>
            <p>{pool.publicKey.toString()}</p>
            <p>tokens</p>
            {custodies[pool.publicKey.toString()] &&
              custodies[pool.publicKey.toString()].map((custody) => (
                <div>
                  {" "}
                  <p>{getTokenGivenAddress(custody.mint.toString())}</p>
                  <p>
                    Price:{" "}
                    {
                      stats[getTokenGivenAddress(custody.mint.toString())]
                        .currentPrice
                    }
                  </p>
                </div>
              ))}

            {/* {pool.account.tokens.map((token) => ()} */}
          </div>
        ))}
      </div>
    </div>
  );
}
