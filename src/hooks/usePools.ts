import { useEffect, useState } from "react";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { ProgramAccount } from "@project-serum/anchor";
import { Token, tokenAddressToToken } from "@/lib/Token";
import { PublicKey } from "@solana/web3.js";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { Pool, TokenCustody } from "@/lib/Pool";

export function usePools(wallet) {
  const [pools, setPools] = useState<Record<string, Pool>>();
  // const [custodies, setCustodies] = useState<Record<string, Object | Null[]>>(
  //   {}
  // );

  let poolInfos = {};

  useEffect(() => {
    async function fetchPools() {
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

      let fetchedPools = await perpetual_program.account.pool.all();

      await Promise.all(
        Object.values(fetchedPools).map(async (pool) => {
          console.log("pool", pool.account);

          let custodyAccounts = Object.values(pool.account.tokens).map(
            (token) => token.custody.toString()
          );

          console.log("custody accounts", custodyAccounts);

          let fetchedCustodies =
            await perpetual_program.account.custody.fetchMultiple(
              custodyAccounts
            );

          console.log("custody example", fetchedCustodies);
          Object.entries(fetchedCustodies[0].fees).forEach(([key, value]) => {
            console.log(key, Number(value) / 1000000000);
          });

          let custodyInfos: Record<string, TokenCustody> = {};

          Object.values(fetchedCustodies).forEach((custody, ind) => {
            console.log("actual custo", custody.mint.toString());
            console.log("custo account in list", custodyAccounts[ind]);
            custodyInfos[custody.mint.toString()] = {
              custodyAccount: new PublicKey(custodyAccounts[ind]),
              tokenAccount: custody.tokenAccount,
              mintAccount: custody.mint,
              oracleAccount: custody.oracle.oracleAccount,
            };
          });

          let poolAddress = findProgramAddressSync(
            ["pool", pool.account.name],
            perpetual_program.programId
          )[0];

          console.log(
            "account name",
            typeof pool.account.name,
            pool.account.name
          );
          poolInfos[pool.account.name] = {
            poolName: pool.account.name,
            poolAddress: poolAddress,
            lpTokenMint: findProgramAddressSync(
              ["lp_token_mint", poolAddress.toBuffer()],
              perpetual_program.programId
            )[0],
            tokens: custodyInfos,
            tokenNames: Object.values(custodyInfos).map((custody) => {
              return tokenAddressToToken(custody.mintAccount.toString());
            }),
          };
          console.log("pool names", poolInfos[pool.account.name].tokenNames);
        })
      );

      console.log(
        "pushed all pool info",
        poolInfos,
        poolInfos["TestPool1"],
        Object.keys(poolInfos)
      );

      setPools(poolInfos);
    }
    if (!pools) {
      fetchPools();
    }
  }, []);

  console.log("returning pools", pools);

  return { pools };
}
