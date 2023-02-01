import { useEffect, useState } from "react";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { ProgramAccount } from "@project-serum/anchor";
import { getTokenAddress, Token, tokenAddressToToken } from "@/lib/Token";
import { PublicKey } from "@solana/web3.js";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { Pool, TokenCustody } from "@/lib/Pool";

export function usePools(wallet) {
  const [pools, setPools] = useState<Record<string, Pool>>();

  let poolInfos = {};

  useEffect(() => {
    async function fetchPools() {
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

      let fetchedPools = await perpetual_program.account.pool.all();

      await Promise.all(
        Object.values(fetchedPools).map(async (pool) => {
          let custodyAccounts = Object.values(pool.account.tokens).map(
            (token) => token.custody.toString()
          );

          let fetchedCustodies =
            await perpetual_program.account.custody.fetchMultiple(
              custodyAccounts
            );

          let custodyInfos: Record<string, TokenCustody> = {};

          Object.values(fetchedCustodies).forEach((custody, ind) => {
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

          let tokenNames = Object.values(custodyInfos).map((custody) => {
            return tokenAddressToToken(custody.mintAccount.toString());
          });

          let custodyMetas = [];

          for (let token in tokenNames) {
            let custody = tokens[getTokenAddress(token)]?.custodyAccount;
            let custodyOracleAccount =
              pool.tokens[getTokenAddress(token)]?.oracleAccount;

            custodyMetas.push({
              pubkey: custody,
              isSigner: false,
              isWritable: false,
            });

            custodyMetas.push({
              pubkey: custodyOracleAccount,
              isSigner: false,
              isWritable: false,
            });
          }

          poolInfos[pool.account.name] = {
            poolName: pool.account.name,
            poolAddress: poolAddress,
            lpTokenMint: findProgramAddressSync(
              ["lp_token_mint", poolAddress.toBuffer()],
              perpetual_program.programId
            )[0],
            tokens: custodyInfos,
            tokenNames,
            custodyMetas,
          };
        })
      );

      setPools(poolInfos);
    }
    if (!pools) {
      fetchPools();
    }
  }, []);

  return { pools };
}
