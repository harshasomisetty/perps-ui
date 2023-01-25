import { useEffect, useState } from "react";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { ProgramAccount } from "@project-serum/anchor";

export function usePools(wallet) {
  const [pools, setPools] = useState<ProgramAccount<T>[]>([]);
  const [custodies, setCustodies] = useState<Record<string, Object | Null[]>>(
    {}
  );

  useEffect(() => {
    async function fetchPools() {
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

        setCustodies({
          ...custodies,
          [pool.publicKey.toString()]: fetchedCusto,
        });
      });

      setPools(poolInfos);
    }
    fetchPools();
  });

  return { pools, custodies };
}
