import React, { useState, useEffect } from "react";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_PROGRAM_ID,
} from "@/utils/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ProgramAccount } from "@project-serum/anchor";
import {
  tokenAddressToToken,
  useDailyPriceStats,
} from "@/hooks/useDailyPriceStats";
import { usePools } from "@/hooks/usePools";

// create starter react page

export default function Pools() {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();

  const stats = useDailyPriceStats();
  const { pools, custodies } = usePools(wallet);

  if (pools.length === 0) {
    return <p>Loading...</p>;
  }
  if (custodies.length === 0) {
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
                    let token = tokenAddressToToken(custody.mint.toString());

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
