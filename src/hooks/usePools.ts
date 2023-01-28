import { useEffect, useState } from "react";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { ProgramAccount } from "@project-serum/anchor";
import { Token } from "@/lib/Token";

export interface TokenCustody {
  mint: string;
  // liquidity: number;
}

export interface Pool {
  poolName: string;
  tokens: TokenCustody[];
  // volume: number;
  // fees: number; // 7 days
  // oiLong: number;
  // oiShort: number;
  // userLiquitiy: number;
  // userShare: number;
}

export function usePools(wallet) {
  const [pools, setPools] = useState<Pool[]>([]);
  // const [custodies, setCustodies] = useState<Record<string, Object | Null[]>>(
  //   {}
  // );

  let poolInfos: Pool[] = [];

  useEffect(() => {
    async function fetchPools() {
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

      let fetchedPools = await perpetual_program.account.pool.all();

      // let poolObject = {
      //   poolName: "Fetch Test pool",
      // };
      // poolInfos.push(poolObject);

      Object.values(fetchedPools).forEach(async (pool) => {
        console.log("print pool", pool.account.tokens);

        let custodyAccounts = [];
        Object.values(pool.account.tokens).forEach((token) => {
          custodyAccounts.push(token.custody.toString());
        });

        var d = new Date();
        var n = d.getTime();
        console.log("time", n);

        let fetchedCustodies =
          await perpetual_program.account.custody.fetchMultiple(
            custodyAccounts
          );
        console.log("custody example", fetchedCustodies);

        var d = new Date();
        var n = d.getTime();
        console.log("time 2", n);

        let custodyInfos: TokenCustody[] = [];

        Object.values(fetchedCustodies).forEach((custody) => {
          custodyInfos.push({
            mint: custody.mint.toString(),
          });
        });

        poolInfos.push({ poolName: pool.account.name, tokens: custodyInfos });
      });

      console.log("pushed all pool info", poolInfos);

      setPools(poolInfos);
    }
    if (pools.length === 0) {
      fetchPools();
    }
  }, []);

  return { pools };
}
