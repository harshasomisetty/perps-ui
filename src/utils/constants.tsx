import { PublicKey } from "@solana/web3.js";
import { Program, Wallet } from "@project-serum/anchor";

import { Perpetuals, IDL as PERPETUALS_IDL } from "@/target/types/perpetuals";
import * as PerpetualsJson from "@/target/idl/perpetuals.json";
import { getProvider } from "@/utils/provider";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";

export const PERPETUALS_PROGRAM_ID = new PublicKey(
  PerpetualsJson["metadata"]["address"]
);

export async function getPerpetualProgramAndProvider(wallet: Wallet) {
  let provider = await getProvider(wallet);
  let perpetual_program = new Program(
    PERPETUALS_IDL,
    PERPETUALS_PROGRAM_ID,
    provider
  );
  return { perpetual_program, provider };
}

export const transferAuthorityAddress = findProgramAddressSync(
  ["transfer_authority"],
  PERPETUALS_PROGRAM_ID
)[0];

export const perpetualsAddress = findProgramAddressSync(
  ["perpetuals"],
  PERPETUALS_PROGRAM_ID
)[0];
