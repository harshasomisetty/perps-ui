import { useEffect, useState } from "react";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { getTokenAddress, tokenAddressToToken } from "@/lib/Token";
import { PublicKey } from "@solana/web3.js";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { Pool, TokenCustody } from "@/lib/Pool";
import { getMint } from "@solana/spl-token";

export function usePools() {
  const [pools, setPools] = useState<Record<string, Pool>>();

  let poolInfos = {};

  useEffect(() => {
    async function fetchPools() {
      let { perpetual_program, provider } =
        await getPerpetualProgramAndProvider();

      let fetchedPools = await perpetual_program.account.pool.all();
      console.log("fetchedPools", fetchedPools);

      await Promise.all(
        Object.values(fetchedPools).map(async (pool) => {
          let custodyAccounts = (pool.account.tokens as Array<any>).map(
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
              name: tokenAddressToToken(custody.mint.toString()),
              amount: custody.assets.owned,
              decimals: custody.decimals,
              minRatio: Number(pool.account.tokens[ind].minRatio),
              maxRatio: Number(pool.account.tokens[ind].maxRatio),
            };
          });

          // fetchedCustodies.forEach((custody) => {
          //   console.log(
          //     "custody assets",
          //     Number(custody.assets.owned) / 10 ** custody.decimals
          //   );
          // });

          let poolAddress = findProgramAddressSync(
            ["pool", pool.account.name],
            perpetual_program.programId
          )[0];

          let tokenNames = Object.values(custodyInfos).map((custody) => {
            return tokenAddressToToken(custody.mintAccount.toString());
          });

          let custodyMetas = [];

          tokenNames.forEach((tokenName) => {
            let custody =
              custodyInfos[getTokenAddress(tokenName)]?.custodyAccount;

            custodyMetas.push({
              pubkey: custody,
              isSigner: false,
              isWritable: false,
            });
          });

          tokenNames.forEach((tokenName) => {
            let custodyOracleAccount =
              custodyInfos[getTokenAddress(tokenName)]?.oracleAccount;
            custodyMetas.push({
              pubkey: custodyOracleAccount,
              isSigner: false,
              isWritable: false,
            });
          });

          let lpTokenMint = findProgramAddressSync(
            ["lp_token_mint", poolAddress.toBuffer()],
            perpetual_program.programId
          )[0];

          const lpDecimals = (await getMint(provider.connection, lpTokenMint))
            .decimals;

          poolInfos[pool.account.name] = {
            poolName: pool.account.name,
            poolAddress: poolAddress,
            lpTokenMint,
            tokens: custodyInfos,
            tokenNames,
            custodyMetas,
            lpDecimals,
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
