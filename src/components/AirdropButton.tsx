import { getTokenLabel } from "@/lib/Token";
import { perpsUser } from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { checkIfAccountExists } from "@/utils/retrieveData";
import { BN } from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  createMintToCheckedInstruction,
  getAssociatedTokenAddress,
  mintTo,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";

interface Props {
  className?: string;
  mint: string;
  amount?: number;
}
export default function AirdropButton(props: Props) {
  console.log("airdrop props", props);
  let amount = 0;

  let mint = new PublicKey(props.mint);
  if (!props.amount) {
    amount = 10 * 10 ** 9;
  } else {
    amount = props.amount;
  }

  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  console.log("amount", amount);

  async function handleAirdrop() {
    if (mint.toString() === "So11111111111111111111111111111111111111112") {
      // airdrop soll
      await connection.requestAirdrop(publicKey!, amount);
    } else {
      console.log("mitn", mint, props.mint);
      console.log("publicKey", publicKey);
      let transaction = new Transaction();

      let associatedAccount = await getAssociatedTokenAddress(mint, publicKey);

      if (!(await checkIfAccountExists(associatedAccount, connection))) {
        transaction = transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedAccount,
            publicKey,
            mint
          )
        );
      }

      transaction = transaction.add(
        createMintToCheckedInstruction(
          mint, // mint
          associatedAccount, // ata
          perpsUser.publicKey, // payer
          amount,
          9 // decimals
        )
      );

      await manualSendTransaction(
        transaction,
        publicKey,
        connection,
        signTransaction,
        perpsUser
      );
    }
  }

  return (
    <button onClick={handleAirdrop}>Airdrop {getTokenLabel(props.mint)}</button>
  );
}
