// function getCustodyInfos(fetchedCustodies, custodyAccounts, pool) {
//   let custodyInfos: Record<string, Custody> = {};
import { PoolAccount } from "@/lib/PoolAccount";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { Pool } from "@/lib/types";
import { CustodyAccount } from "@/lib/CustodyAccount";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { getMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { ViewHelper } from "@/utils/viewHelpers";

interface FetchPool {
  account: Pool;
  publicKey: PublicKey;
}

export async function getPoolData(
  custodyInfos: Record<string, CustodyAccount>
): Promise<Record<string, PoolAccount>> {
  let { perpetual_program, provider } = await getPerpetualProgramAndProvider();

  // @ts-ignore
  let fetchedPools: FetchPool[] = await perpetual_program.account.pool.all();

  let poolObjs: Record<string, PoolAccount> = {};

  await Promise.all(
    Object.values(fetchedPools)
      .sort((a, b) => a.account.name.localeCompare(b.account.name))
      .map(async (pool: FetchPool) => {
        let lpTokenMint = findProgramAddressSync(
          [Buffer.from("lp_token_mint"), pool.publicKey.toBuffer()],
          perpetual_program.programId
        )[0];

        const lpData = await getMint(provider.connection, lpTokenMint);

        const View = new ViewHelper(provider.connection, provider);

        console.log("trying to fetch aum");
        // let fetchedAum = await View.getAssetsUnderManagement(pool.publicKey);
        // console.log("got aum", Number(fetchedAum));

        let poolData: Pool = {
          name: pool.account.name,
          tokens: pool.account.tokens,
          aumUsd: pool.account.aumUsd,
          bump: pool.account.bump,
          lpTokenBump: pool.account.lpTokenBump,
          inceptionTime: pool.account.inceptionTime,
        };

        poolObjs[pool.publicKey.toString()] = new PoolAccount(
          poolData,
          custodyInfos,
          pool.publicKey,
          lpData
        );
      })
  );

  return poolObjs;
}
