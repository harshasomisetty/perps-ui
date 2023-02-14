import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

export async function manualSendTransaction(
  transaction: Transaction,
  publicKey: PublicKey,
  connection: Connection,
  signTransaction: any,
  otherSigner?: Keypair
) {
  try {
    console.log("in man send tx");
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash("finalized")
    ).blockhash;

    if (otherSigner) {
      transaction.sign(otherSigner);
    }

    transaction = await signTransaction(transaction);
    const rawTransaction = transaction.serialize();

    let signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
    });
    console.log(
      `sent raw, waiting : https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    await connection.confirmTransaction(signature, "confirmed");
    console.log(
      `sent tx!!! :https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (error) {
    console.log("man error?", error);
  }
}
