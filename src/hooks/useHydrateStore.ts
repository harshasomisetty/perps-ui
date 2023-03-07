import { PoolAccount } from "@/lib/PoolAccount";
import { useGlobalStore } from "@/stores/store";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { getMint } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { AccountMeta, PublicKey } from "@solana/web3.js";
import { useEffect } from "react";
import { Custody, Pool } from "src/types";
import { getTokenAddress, tokenAddressToToken } from "src/types/Token";
export const useHydrateStore = () => {
  const { connection } = useConnection();

  const setPoolData = useGlobalStore((state) => state.setPoolData);

  console.log("in hydrate store");

  function getCustodyInfos(fetchedCustodies, custodyAccounts, pool) {
    let custodyInfos: Record<string, Custody> = {};

    Object.values(fetchedCustodies).forEach((custody, ind) => {
      custodyInfos[custody.mint.toString()] = {
        custodyAccount: new PublicKey(custodyAccounts[ind]),
        pool: pool.account.name,
        mint: custody.mint,
        tokenAccount: custody.tokenAccount,
        decimals: custody.decimals,
        oracle: custody.oracle.oracleAccount,

        // pricing:
        // permissions:
        // fees:
        // borrowRate:
        // assets:
        collectedFees: {
          swapUsd: custody.collectedFees.swapUsd,
          addLiquidityUsd: custody.collectedFees.addLiquidityUsd,
          removeLiquidityUsd: custody.collectedFees.removeLiquidityUsd,
          openPositionUsd: custody.collectedFees.openPositionUsd,
          closePositionUsd: custody.collectedFees.closePositionUsd,
          liquidationUsd: custody.collectedFees.liquidationUsd,
        },
        volumeStats: {
          swapUsd: custody.volumeStats.swapUsd,
          addLiquidityUsd: custody.volumeStats.addLiquidityUsd,
          removeLiquidityUsd: custody.volumeStats.removeLiquidityUsd,
          openPositionUsd: custody.volumeStats.openPositionUsd,
          closePositionUsd: custody.volumeStats.closePositionUsd,
          liquidationUsd: custody.volumeStats.liquidationUsd,
        },
        // longPositions:
        // shortPositions:

        // bump:
        // tokenAccountBump:

        custodyAccount: new PublicKey(custodyAccounts[ind]),
        name: tokenAddressToToken(custody.mint.toString()),
        owned: custody.assets.owned,
        locked: custody.assets.locked,
        targetRatio: Number(pool.account.tokens[ind].targetRatio),

        oiLong: Number(custody.tradeStats.oiLongUsd),
        oiShort: Number(custody.tradeStats.oiShortUsd),

        fees: {
          addLiquidity: Number(custody.fees.addLiquidity),
        },
      };
    });

    return custodyInfos;
  }

  async function updatePoolData() {
    let { perpetual_program } = await getPerpetualProgramAndProvider();

    let fetchedPools = await perpetual_program.account.pool.all();
    console.log("fetchedPools", fetchedPools);

    let poolObjs = {};

    await Promise.all(
      Object.values(fetchedPools).map(async (pool) => {
        let custodyAccounts = (pool.account.tokens as Array<any>).map((token) =>
          token.custody.toString()
        );

        let fetchedCustodies =
          await perpetual_program.account.custody.fetchMultiple(
            custodyAccounts
          );

        console.log("fetchedCustodies", fetchedCustodies[0]);

        let custodyInfos: Record<string, Custody> = getCustodyInfos(
          fetchedCustodies,
          custodyAccounts,
          pool
        );

        let poolAddress = findProgramAddressSync(
          ["pool", pool.account.name],
          perpetual_program.programId
        )[0];

        let tokenNames = Object.values(custodyInfos).map((custody) => {
          return tokenAddressToToken(custody.mint.toString());
        });

        let custodyMetas: AccountMeta[] = [];

        tokenNames.forEach((tokenName) => {
          custodyMetas.push({
            pubkey: custodyInfos[getTokenAddress(tokenName!)]?.custodyAccount,
            isSigner: false,
            isWritable: false,
          });
        });

        tokenNames.forEach((tokenName) => {
          custodyMetas.push({
            pubkey: custodyInfos[getTokenAddress(tokenName!)]?.oracle,
            isSigner: false,
            isWritable: false,
          });
        });

        let lpTokenMint = findProgramAddressSync(
          [Buffer.from("lp_token_mint"), poolAddress.toBuffer()],
          perpetual_program.programId
        )[0];

        const lpData = await getMint(connection, lpTokenMint);

        let poolData: Pool = {
          name: pool.account.name,
          tokens: custodyInfos,
          // aumUsd:
          // bump:
          // lpTokenBump:
          // inceptionTime:
          poolAddress: poolAddress,
          lpTokenMint,
          tokenNames,
          custodyMetas,
          lpDecimals: lpData.decimals,
          lpSupply: lpData.supply,
        };

        let poolObj = new PoolAccount(poolData);

        poolObjs[pool.account.name] = poolObj;
      })
    );

    return poolObjs;
  }

  useEffect(() => {
    (async () => {
      const getPoolInfos = await updatePoolData();

      console.log("fetche the global store in hydrate", getPoolInfos);
      setPoolData(getPoolInfos);
    })();
  }, []);
};
