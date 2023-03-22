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

export async function createAtaIfNeeded(
  publicKey: PublicKey,
  payer: PublicKey,
  mint: PublicKey,
  connection: Connection
): Promise<TransactionInstruction | null> {
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mint,
    publicKey
  );

  console.log("creating ata", associatedTokenAccount.toString());
  if (!(await checkIfAccountExists(associatedTokenAccount, connection))) {
    console.log("ata doesn't exist");
    return createAssociatedTokenAccountInstruction(
      payer,
      associatedTokenAccount,
      publicKey,
      mint
    );
  }

  return null;
}

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

  // let ataIx = await createAtaIfNeeded(
  //   publicKey,
  //   payer,
  //   NATIVE_MINT,
  //   connection
  // );
  // if (ataIx) preInstructions.push(ataIx);

  const balance =
    (await connection.getBalance(associatedTokenAccount)) / LAMPORTS_PER_SOL;

  if (balance < payAmount) {
    console.log("balance insufficient");

    preInstructions.push(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: associatedTokenAccount,
        lamports: Math.floor((payAmount - balance) * LAMPORTS_PER_SOL * 1.1),
      })
    );
    preInstructions.push(createSyncNativeInstruction(associatedTokenAccount));
  }

  return preInstructions.length > 0 ? preInstructions : null;
}
