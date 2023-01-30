import { getTokenAddress, Token, tokenAddressToToken } from "@/lib/Token";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { SolidButton } from "@/components/SolidButton";
import { TokenSelector } from "@/components/TokenSelector";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Pool, usePools } from "@/hooks/usePools";
import { manualSendTransaction } from "@/utils/manualTransaction";
import BN from "bn.js";
import { checkIfAccountExists } from "@/utils/retrieveData";
import { addLiquidity } from "src/actions/addLiquidity";
import { SidebarTab } from "../SidebarTab";

import Add from "@carbon/icons-react/lib/Add";
import Subtract from "@carbon/icons-react/lib/Subtract";

interface Props {
  className?: string;
  pool: Pool;
  //   amount: number;
  //   token: Token;
  //   onChangeAmount?(amount: number): void;
  //   onSelectToken?(token: Token): void;
}

enum Tab {
  Add,
  Remove,
}

export default function LiquidityCard(props: Props) {
  const [payToken, setPayToken] = useState(Token.SOL);
  const [payAmount, setPayAmount] = useState(1);

  const [tab, setTab] = useState(Tab.Add);

  const [payTokenBalance, setPayTokenBalance] = useState(0);

  const { wallet, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  let tokenList = Object.keys(props.pool?.tokens).map((token) => {
    return tokenAddressToToken(token);
  });

  useEffect(() => {
    async function fetchData() {
      if (payToken === Token.SOL) {
        let balance = await connection.getBalance(publicKey);
        setPayTokenBalance(balance / LAMPORTS_PER_SOL);
      } else {
        let bro = await getAssociatedTokenAddress(
          new PublicKey(getTokenAddress(payToken)),
          publicKey
        );

        console.log("bro", bro.toString());
        let balance = await connection.getTokenAccountBalance(bro);
        setPayTokenBalance(balance.value.uiAmount);
      }
    }
    if (wallet && publicKey) {
      fetchData();
    }
  }, [payToken]);

  async function addLiq() {
    await addLiquidity(
      props.pool,
      wallet,
      publicKey,
      signTransaction,
      connection,
      payToken,
      payAmount
    );

    // router.reload(window.location.pathname);
  }

  return (
    <div className={props.className}>
      <div
        className={twMerge("bg-zinc-800", "p-4", "rounded", "overflow-hidden")}
      >
        <div className="mb-4 grid grid-cols-2 gap-x-1 rounded bg-black p-1">
          <SidebarTab
            selected={tab === Tab.Add}
            onClick={() => setTab(Tab.Add)}
          >
            <Add className="h-4 w-4" />
            <div>Add</div>
          </SidebarTab>
          <SidebarTab
            selected={tab === Tab.Remove}
            onClick={() => setTab(Tab.Remove)}
          >
            <Subtract className="h-4 w-4" />
            <div>Remove</div>
          </SidebarTab>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-white">You Add</div>
          <div>Balance: {payTokenBalance}</div>
        </div>
        <TokenSelector
          className="mt-2"
          amount={payAmount}
          token={payToken}
          onChangeAmount={setPayAmount}
          onSelectToken={setPayToken}
          tokenList={tokenList}
        />
        <div className="mt-4 text-sm font-medium text-white">You Receive</div>

        <div
          className={twMerge(
            "grid-cols-[max-content,1fr]",
            "bg-zinc-900",
            "grid",
            "h-20",
            "items-center",
            "p-4",
            "rounded",
            "w-full",
            props.className
          )}
        >
          LP Tokens
        </div>

        <SolidButton className="mt-6 w-full" onClick={addLiq}>
          Confirm
        </SolidButton>
      </div>
    </div>
  );
}
