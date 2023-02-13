import { perpsUser } from "@/utils/constants";
import { BN } from "@project-serum/anchor";
import { getAssociatedTokenAddress, mintTo } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

interface Props {
  className?: string;
  mint: PublicKey;
  amount?: number;
}
export default function AirdropButton(props: Props) {
  let amount = 0;
  if (!props.amount) {
    amount = 10 * 10 ** 9;
  } else {
    amount = props.amount;
  }

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  async function handleAirdrop() {
    let associatedAccount = await getAssociatedTokenAddress(
      props.mint,
      publicKey
    );

    await mintTo(
      connection,
      perpsUser,
      props.mint,
      associatedAccount,
      perpsUser,
      amount
    );
  }

  return <button onClick={handleAirdrop}>Airdrop</button>;
}
