import { DefaultWallet, PERPETUALS_PROGRAM_ID, perpsUser } from "@/utils/constants";
import { E2EWallet } from "@/utils/DummyWallet";
import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL as PERPETUALS_IDL } from "@/target/types/perpetuals";
import { Custody } from "../types";

export type PositionSide = "long" | "short";

class ViewHelper {
    constructor() {
        
    }
}

export const getEntryPriceAndFee = async (
    connection: Connection,
    poolName: string,
    tokenMint: PublicKey,
    collateral: BN,
    size: BN,
    side: PositionSide,
    poolKey: PublicKey,
    custodyKey: Custody
) => {
    const provider = new AnchorProvider(connection, new DefaultWallet(perpsUser), {
        commitment: "processed",
        skipPreflight: true,
      });

      let program = new Program(
        PERPETUALS_IDL,
        PERPETUALS_PROGRAM_ID,
        provider
      );

    // return await program.methods
    //    // @ts-ignore
    //   .getEntryPriceAndFee({
    //     collateral,
    //     size,
    //     side: side === "long" ? { long: {} } : { short: {} },
    //   })
    //   .accounts({
    //     signer: provider.wallet.publicKey,
    //     perpetuals: PERPETUALS_PROGRAM_ID,
    //     pool: poolKey,
    //     custody: custodyKey.,
    //     custodyOracleAccount: await getCustodyOracleAccountKey(
    //       poolName,
    //       tokenMint
    //     ),
    //   })
    //   .view()
    //   .catch((err) => {
    //     console.error(err);
    //     throw err;
    //   });
}