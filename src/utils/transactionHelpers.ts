import { checkIfAccountExists } from "@/utils/retrieveData";
import { BN } from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT,
} from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

export async function wrapSolIfNeeded(
  publicKey: PublicKey,
  payer: PublicKey,
  connection: Connection,
  payAmount: number
): Promise<TransactionInstruction[] | null> {
  console.log("in wrap sol if needed");
  let preInstructions: TransactionInstruction[] = [];

  const associatedTokenAccount = await getAssociatedTokenAddress(
    NATIVE_MINT,
    publicKey
  );

  if (!(await checkIfAccountExists(associatedTokenAccount, connection))) {
    console.log("ata doesn't exist");
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAccount,
        publicKey,
        NATIVE_MINT
      )
    );
  }

  const balance = await connection.getBalance(associatedTokenAccount);

  if (balance < payAmount) {
    console.log("balance insufficient");

    preInstructions.push(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: associatedTokenAccount,
        lamports: Math.floor((payAmount - balance) * LAMPORTS_PER_SOL * 1.05),
      })
    );
    preInstructions.push(createSyncNativeInstruction(associatedTokenAccount));
  }
  console.log("all pre instructions", preInstructions);

  return preInstructions.length > 0 ? preInstructions : null;
}
