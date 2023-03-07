import { useEffect, useState } from "react";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { getTokenAddress, tokenAddressToToken } from "src/types/Token";
import { PublicKey } from "@solana/web3.js";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { getMint } from "@solana/spl-token";
import { PoolAccount } from "@/lib/PoolAccount";
import { Pool } from "src/types";

export function usePools() {
  const [pools, setPools] = useState<Record<string, PoolAccount>>();

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

          console.log("fetchedCustodies", fetchedCustodies[0]);

          let custodyInfos: Record<string, TokenCustody> = {};

          Object.values(fetchedCustodies).forEach((custody, ind) => {
            custodyInfos[custody.mint.toString()] = {
              custodyAccount: new PublicKey(custodyAccounts[ind]),
              tokenAccount: custody.tokenAccount,
              mintAccount: custody.mint,
              oracleAccount: custody.oracle.oracleAccount,
              name: tokenAddressToToken(custody.mint.toString()),
              owned: custody.assets.owned,
              locked: custody.assets.locked,
              decimals: custody.decimals,
              targetRatio: Number(pool.account.tokens[ind].targetRatio),

              volume: {
                swap: Number(custody.volumeStats.swapUsd),
                addLiquidity: Number(custody.volumeStats.addLiquidityUsd),
                removeLiquidity: Number(custody.volumeStats.removeLiquidityUsd),
                openPosition: Number(custody.volumeStats.openPositionUsd),
                closePosition: Number(custody.volumeStats.closePositionUsd),
                liquidation: Number(custody.volumeStats.liquidationUsd),
              },

              oiLong: Number(custody.tradeStats.oiLongUsd),
              oiShort: Number(custody.tradeStats.oiShortUsd),

              feeStats: {
                swap: Number(custody.collectedFees.swapUsd),
                addLiquidity: Number(custody.collectedFees.addLiquidityUsd),
                removeLiquidity: Number(
                  custody.collectedFees.removeLiquidityUsd
                ),
                openPosition: Number(custody.collectedFees.openPositionUsd),
                closePosition: Number(custody.collectedFees.closePositionUsd),
                liquidation: Number(custody.collectedFees.liquidationUsd),
              },

              fees: {
                addLiquidity: Number(custody.fees.addLiquidity),
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

          const lpData = await getMint(provider.connection, lpTokenMint);

          let poolData: Pool = {
            poolName: pool.account.name,
            poolAddress: poolAddress,
            lpTokenMint,
            tokens: custodyInfos,
            tokenNames,
            custodyMetas,
            lpDecimals: lpData.decimals,
            lpSupply: Number(lpData.supply),
          };

          let poolObj = new PoolAccount(poolData);

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
