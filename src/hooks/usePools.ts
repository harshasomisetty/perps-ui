import { useEffect, useState } from "react";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { ProgramAccount } from "@project-serum/anchor";
import { Token } from "@/lib/Token";
import { PublicKey } from "@solana/web3.js";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";

export interface TokenCustody {
  custodyAccount: PublicKey;
  tokenAccount: PublicKey;
  tokenMint: PublicKey;
  oracleAccount: PublicKey;
  // liquidity: number;
}

export interface Pool {
  poolName: string;
  poolAddress: PublicKey;
  lpTokenMint: PublicKey;
  tokens: Record<string, TokenCustody>; // string is token mint address
  // volume: number;
  // fees: number; // 7 days
  // oiLong: number;
  // oiShort: number;
  // userLiquitiy: number;
  // userShare: number;
}

export function usePools(wallet) {
  const [pools, setPools] = useState<Record<string, Pool>>();
  // const [custodies, setCustodies] = useState<Record<string, Object | Null[]>>(
  //   {}
  // );

  let poolInfos: Pool[] = [];

  useEffect(() => {
    async function fetchPools() {
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

      let fetchedPools = await perpetual_program.account.pool.all();

      Object.values(fetchedPools).forEach(async (pool) => {
        // console.log("print pool", pool.account.tokens);
        // console.log(
        //   "print pool custody?",
        //   pool.account.tokens[0].custody.toString()
        // );

        let custodyAccounts = Object.values(pool.account.tokens).map((token) =>
          token.custody.toString()
        );

        console.log("custody accounts", custodyAccounts);

        let fetchedCustodies =
          await perpetual_program.account.custody.fetchMultiple(
            custodyAccounts
          );

        console.log("custody example", fetchedCustodies);
        console.log(
          "custody example mint",
          fetchedCustodies[0].tokenAccount.toString()
        );

        let custodyInfos: Record<string, TokenCustody> = {};

        Object.values(fetchedCustodies).forEach((custody, ind) => {
          console.log("actual custo", custody.mint.toString());
          console.log("custo account in list", custodyAccounts[ind]);
          custodyInfos[custody.mint.toString()] = {
            custodyAccount: new PublicKey(custodyAccounts[ind]),
            tokenAccount: custody.tokenAccount,
            tokenMint: custody.mint,
            oracleAccount: custody.oracle.oracleAccount,
          };
        });

        let poolAddress = findProgramAddressSync(
          ["pool", pool.account.name],
          perpetual_program.programId
        )[0];

        poolInfos[pool.account.name] = {
          poolName: pool.account.name,
          poolAddress: poolAddress,
          lpTokenMint: findProgramAddressSync(
            ["lp_token_mint", poolAddress.toBuffer()],
            perpetual_program.programId
          )[0],
          tokens: custodyInfos,
        };
      });

      console.log("pushed all pool info", poolInfos);

      setPools(poolInfos);
    }
    if (!pools) {
      fetchPools();
    }
  }, []);

  return { pools };
}
