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
import { Pool, usePools } from "@/hooks/usePools";
import { twMerge } from "tailwind-merge";
import PoolModal from "@/components/PoolModal";

// create starter react page

export default function Pools() {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();

  const stats = useDailyPriceStats();
  const { pools } = usePools(wallet);

  const [selectedPool, setSelectedPool] = useState<null | Pool>(null);

  // console.log("pools", pools);

  if (!pools) {
    return <p className="text-white">Loading...</p>;
  }

  return (
    <div>
      <div className="flex flex-row items-end space-x-3 text-white">
        <h1 className="text-4xl text-white ">Liquidity Pools</h1>
        <p>TVL: ${0}</p>
      </div>
      {selectedPool && (
        <PoolModal pool={selectedPool} setPool={setSelectedPool} />
      )}
      <table className={twMerge("table-auto", "text-white")}>
        <thead
          className={twMerge(
            "text-xs",
            "text-zinc-500",
            "border-b",
            "border-zinc-700",
            "flex",
            "items-center"
          )}
        >
          <tr>
            <td>Pool name</td>
            <td>Liquidity</td>
            <td>Volume</td>
            <td>Fees</td>
            <td>OI Long</td>
            <td>OI Short</td>
            <td>Your Liquidity</td>
            <td>Your Share</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(pools).map(([poolName, pool]) => (
            <tr
              className="cursor-pointer"
              key={poolName}
              onClick={() => setSelectedPool(selectedPool ? null : pool)}
            >
              <td>{poolName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
