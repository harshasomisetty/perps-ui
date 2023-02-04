import { getTokenAddress, Token, tokenAddressToToken } from "@/lib/Token";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { SolidButton } from "@/components/SolidButton";
import { TokenSelector } from "@/components/TokenSelector";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Pool, usePools } from "@/hooks/usePools";
import { SidebarTab } from "../SidebarTab";

import Add from "@carbon/icons-react/lib/Add";
import Subtract from "@carbon/icons-react/lib/Subtract";
import { LpSelector } from "./LpSelector";
import { changeLiquidity } from "src/actions/changeLiquidity";

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
  const [tokenAmount, setTokenAmount] = useState(0.2);

  const [tab, setTab] = useState(Tab.Remove);

  const [payTokenBalance, setPayTokenBalance] = useState(0);
  const [liqBalance, setLiqBalance] = useState(0);
  const [liqAmount, setLiqAmount] = useState(1);

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
        // get wrapped sol balance
      } else {
        let bro = await getAssociatedTokenAddress(
          new PublicKey(getTokenAddress(payToken)),
          publicKey
        );

        console.log("bro", bro.toString());
        let balance = await connection.getTokenAccountBalance(bro);
        setPayTokenBalance(balance.value.uiAmount);
      }

      let lpTokenAccount = await getAssociatedTokenAddress(
        props.pool.lpTokenMint,
        publicKey
      );
      let balance = await connection.getTokenAccountBalance(lpTokenAccount);
      console.log("lp balalnce", balance.value.uiAmount);
      setLiqBalance(balance.value.uiAmount);
    }
    if (wallet && publicKey) {
      fetchData();
    }
  }, [payToken]);

  async function changeLiq() {
    console.log("before change", tab === Tab.Remove, liqAmount);
    await changeLiquidity(
      props.pool,
      wallet,
      publicKey,
      signTransaction,
      connection,
      payToken,
      tab === Tab.Add ? tokenAmount : 0,
      tab === Tab.Remove ? liqAmount : 0
    );

    // router.reload(window.location.pathname);
  }

  // let addLiquidityTx = await perpetual_program.methods
  //   .addLiquidity({ amount: tempAmount })
  //   .accounts({
  //     owner: publicKey,
  //     fundingAccount, // user token account for custody token account
  //     lpTokenAccount,
  //     transferAuthority: transferAuthorityAddress,
  //     perpetuals: perpetualsAddress,
  //     pool: pool.poolAddress,
  //     custody: pool.tokens[getTokenAddress(payToken)]?.custodyAccount,
  //     custodyOracleAccount:
  //       pool.tokens[getTokenAddress(payToken)]?.oracleAccount,
  //     custodyTokenAccount:
  //       pool.tokens[getTokenAddress(payToken)]?.tokenAccount,
  //     lpTokenMint: pool.lpTokenMint,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //   })
  //   .remainingAccounts(pool.custodyMetas)
  //   .transaction();

  return (
    <div className={props.className}>
      <div
        className={twMerge("bg-zinc-800", "p-4", "rounded", "overflow-hidden")}
      >
        <div className="mb-4 grid grid-cols-2 gap-x-1 rounded bg-black p-1">
          <SidebarTab
            selected={tab === Tab.Add}
            onClick={() => {
              setLiqAmount(0);
              setTokenAmount(0);
              setTab(Tab.Add);
            }}
          >
            <Add className="h-4 w-4" />
            <div>Add</div>
          </SidebarTab>
          <SidebarTab
            selected={tab === Tab.Remove}
            onClick={() => {
              setLiqAmount(0);
              setTokenAmount(0);
              setTab(Tab.Remove);
            }}
          >
            <Subtract className="h-4 w-4" />
            <div>Remove</div>
          </SidebarTab>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-white">You Add</div>
            <div>Balance: {payTokenBalance}</div>
          </div>
          {tab === Tab.Add ? (
            <TokenSelector
              className="mt-2"
              amount={tokenAmount}
              token={payToken}
              onChangeAmount={setTokenAmount}
              onSelectToken={setPayToken}
              tokenList={tokenList}
            />
          ) : (
            <LpSelector
              className="mt-2"
              amount={liqAmount}
              onChangeAmount={setLiqAmount}
            />
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-white">You Receive</div>
            <div>Balance: {liqBalance}</div>
          </div>

          {tab === Tab.Add ? (
            <LpSelector className="mt-2" amount={liqAmount} />
          ) : (
            <TokenSelector
              className="mt-2"
              amount={tokenAmount}
              token={payToken}
              onSelectToken={setPayToken}
              tokenList={tokenList}
            />
          )}
        </div>

        <SolidButton className="mt-6 w-full" onClick={changeLiq}>
          Confirm
        </SolidButton>
      </div>
    </div>
  );
}
