import { getTokenLabel, tokenAddressToToken } from "src/types/Token";
import { perpsUser } from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { checkIfAccountExists } from "@/utils/retrieveData";
import {
  createAssociatedTokenAccountInstruction,
  createMintToCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useRouter } from "next/router";
import { SolidButton } from "./SolidButton";

interface Props {
  className?: string;
  mint: string;
}
export default function AirdropButton(props: Props) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  let mint = new PublicKey(props.mint);

  const router = useRouter();

  async function handleAirdrop() {
    if (mint.toString() === "So11111111111111111111111111111111111111112") {
      await connection.requestAirdrop(publicKey!, 1 * 10 ** 9);
    } else {
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
          100 * 10 ** 9, // amount
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
    router.reload(window.location.pathname);
  }

  return (
    <SolidButton
      className="my-6 w-full bg-slate-500 hover:bg-slate-200"
      onClick={handleAirdrop}
    >
      Airdrop {'"'}
      {getTokenLabel(tokenAddressToToken(props.mint))}
      {'"'}
    </SolidButton>
  );
}
