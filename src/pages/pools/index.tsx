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
            <table className="table">
              <thead>
                <tr>
                  <td>Token name</td>
                  <td>Liquidity</td>
                  <td>Price</td>
                  <td>Amount</td>
                  <td>Target Weight</td>
                  <td>Utilization</td>
                  <td>Fee</td>
                </tr>
              </thead>{" "}
              <tbody>
                {custodies[pool.publicKey.toString()] &&
                  custodies[pool.publicKey.toString()].map(function (custody) {
                    let token = getTokenGivenAddress(custody.mint.toString());

                    return (
                      <tr>
                        <td>{token}</td>
                        <td>
                          {stats[token].currentPrice *
                            Number(custody.assets.owned)}
                        </td>
                        <td>{stats[token].currentPrice}</td>
                        <td>{Number(custody.assets.owned)}</td>
                        <td>Target Weight</td>
                        <td>Utilization</td>
                        <td>Fee</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {/* {pool.account.tokens.map((token) => ()} */}
          </div>
        ))}
      </div>
    </div>
  );
}
