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

    let signature = await connection.sendRawTransaction(rawTransaction);
    console.log("sent raw, waiting");
    await connection.confirmTransaction(signature, "confirmed");
    console.log("sent tx!!!");
  } catch (error) {
    console.log("man error?", error);
  }
}
