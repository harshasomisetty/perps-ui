import React, { useState, useEffect } from "react";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_PROGRAM_ID,
} from "@/utils/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ProgramAccount } from "@project-serum/anchor";

// create starter react page

export default function Pools() {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();
  const [pools, setPools] = useState<ProgramAccount<T>[]>([]);

  useEffect(() => {
    async function fetchData() {
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

      let poolInfos = await perpetual_program.account.pool.all();

      setPools(poolInfos);
      console.log(poolInfos);
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
      <div className="table">
        <thead>
          <tr>
            <td>name</td>
            <td>address</td>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <tr>
              <td>{pool.account.name}</td>
              <td>{pool.publicKey.toString()}</td>
            </tr>
          ))}
        </tbody>
      </div>
    </div>
  );
}
