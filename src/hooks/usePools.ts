import { useEffect, useState } from "react";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { getTokenAddress, tokenAddressToToken } from "@/lib/Token";
import { PublicKey } from "@solana/web3.js";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { Pool, PoolObj, TokenCustody } from "@/lib/Pool";
import { getMint } from "@solana/spl-token";

export function usePools() {
  const [pools, setPools] = useState<Record<string, PoolObj>>();

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

          console.log("fetchedCustodies", fetchedCustodies);

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

              volume: {
                swap: Number(custody.volumeStats.swap),
                addLiquidity: Number(custody.volumeStats.addLiquidity),
                removeLiquidity: Number(custody.volumeStats.removeLiquidity),
                openPosition: Number(custody.volumeStats.openPosition),
                closePosition: Number(custody.volumeStats.closePosition),
                liquidation: Number(custody.volumeStats.liquidation),
              },

              oiLong: Number(custody.tradeStats.oiLong),
              oiShort: Number(custody.tradeStats.oiShort),

              fees: {
                swap: Number(custody.feesStats.swap),
                addLiquidity: Number(custody.feesStats.addLiquidity),
                removeLiquidity: Number(custody.feesStats.removeLiquidity),
                openPosition: Number(custody.feesStats.openPosition),
                closePosition: Number(custody.feesStats.closePosition),
                liquidation: Number(custody.feesStats.liquidation),
              },
            };
          });

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

          let poolData: Pool = {
            poolName: pool.account.name,
            poolAddress: poolAddress,
            lpTokenMint,
            tokens: custodyInfos,
            tokenNames,
            custodyMetas,
            lpDecimals,
          };

          let poolObj = new PoolObj(poolData);

          poolInfos[pool.account.name] = poolObj;
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
