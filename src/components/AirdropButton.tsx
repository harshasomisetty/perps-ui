import { CustodyAccount } from "@/lib/CustodyAccount";
import { getTokenLabel, TokenE } from "@/lib/Token";
import { DEFAULT_PERPS_USER } from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { checkIfAccountExists } from "@/utils/retrieveData";
import {
  createAssociatedTokenAccountInstruction,
  createMintToCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { useRouter } from "next/router";
import { SolidButton } from "./SolidButton";

interface Props {
  className?: string;
  custody: CustodyAccount;
}
export default function AirdropButton(props: Props) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const router = useRouter();
  let mint = props.custody.mint;

  async function handleAirdrop() {
    if (!publicKey) return;
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
          DEFAULT_PERPS_USER.publicKey, // payer
          100 * 10 ** 9, // amount
          9 // decimals
        )
      );

      await manualSendTransaction(
        transaction,
        publicKey,
        connection,
        signTransaction,
        DEFAULT_PERPS_USER
      );
    }
    // @ts-ignore
    router.reload(window.location.pathname);
  }

  if (props.custody.getTokenE() === TokenE.USDC) {
    return (
      <a
        target="_blank"
        rel="noreferrer"
        href={"https://spl-token-faucet.com/?token-name=USDC-Dev"}
      >
        <SolidButton className="my-6 w-full bg-slate-500 hover:bg-slate-200">
          Airdrop {'"'}
          {getTokenLabel(props.custody.getTokenE())}
          {'"'}
        </SolidButton>
      </a>
    );
  }

  return (
    <SolidButton
      className="my-6 w-full bg-slate-500 hover:bg-slate-200"
      onClick={handleAirdrop}
    >
      Airdrop {'"'}
      {getTokenLabel(props.custody.getTokenE())}
      {'"'}
    </SolidButton>
  );
}
