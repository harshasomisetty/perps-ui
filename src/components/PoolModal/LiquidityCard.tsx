import { getTokenAddress, Token, tokenAddressToToken } from "@/lib/Token";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { SolidButton } from "@/components/SolidButton";
import { TokenSelector } from "@/components/TokenSelector";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SidebarTab } from "../SidebarTab";

import Add from "@carbon/icons-react/lib/Add";
import Subtract from "@carbon/icons-react/lib/Subtract";
import { LpSelector } from "./LpSelector";
import { changeLiquidity } from "src/actions/changeLiquidity";
import { Pool } from "@/lib/Pool";
import { fetchLPBalance, fetchTokenBalance } from "@/utils/retrieveData";
import router from "next/router";
import AirdropButton from "../AirdropButton";
import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";

interface Props {
  className?: string;
  pool: Pool;
}

enum Tab {
  Add,
  Remove,
}

export default function LiquidityCard(props: Props) {
  const [tokenAmount, setTokenAmount] = useState(0);

  const [tab, setTab] = useState(Tab.Add);

  const [payTokenBalance, setPayTokenBalance] = useState(0);
  const [liqBalance, setLiqBalance] = useState(0);
  const [liqAmount, setLiqAmount] = useState(0);

  const [liqRatio, setLiqRatio] = useState(0);

  const { wallet, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  let tokenList = Object.keys(props.pool?.tokens).map((token) => {
    return tokenAddressToToken(token);
  });

  const [payToken, setPayToken] = useState(tokenList[0]);

  const poolName = router.query.poolName as string;
  const stats = useDailyPriceStats();

  useEffect(() => {
    async function fetchData() {
      let tokenBalance = await fetchTokenBalance(
        payToken,
        publicKey!,
        connection
      );

      setPayTokenBalance(tokenBalance);

      let lpBalance = await fetchLPBalance(
        props.pool.lpTokenMint,
        publicKey!,
        connection
      );

      setLiqBalance(lpBalance);

      const mintInfo = await getMint(connection, props.pool.lpTokenMint);

      setLiqRatio(
        Number(mintInfo.supply) /
          10 ** mintInfo.decimals /
          props.pool.getLiquidities(stats)
      );
    }
    if (publicKey && Object.values(stats).length > 0 && payToken) {
      fetchData();
    }
  }, [payToken, stats]);

  async function changeLiq() {
    console.log("before change", tab === Tab.Remove, liqAmount);
    await changeLiquidity(
      props.pool,
      wallet!,
      publicKey,
      signTransaction,
      connection,
      payToken,
      tab === Tab.Add ? tokenAmount : 0,
      tab === Tab.Remove ? liqAmount : 0
    );

    // router.reload(window.location.pathname);
  }

  // async function onChangeAmtLiq(tokenAmtUsd: number) {
  //   setLiqAmount(tokenAmtUsd * liqRatio);
  // }

  console.log("pool name", poolName);
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

        {poolName == "TestPool1" &&
          Object.keys(props.pool.tokens).map((token) => {
            return <AirdropButton key={token} mint={token} />;
          })}

        <div>
          <div className="flex items-center justify-between">
            {tab === Tab.Add ? (
              <>
                {" "}
                <div className="text-sm font-medium text-white">You Add</div>
                {publicKey && <div>Balance: {payTokenBalance.toFixed(2)}</div>}
              </>
            ) : (
              <>
                {" "}
                <div className="text-sm font-medium text-white">You Remove</div>
                {publicKey && <div>Balance: {liqBalance.toFixed(2)}</div>}
              </>
            )}
          </div>
          {tab === Tab.Add ? (
            <TokenSelector
              className="mt-2"
              amount={tokenAmount}
              token={payToken}
              onChangeAmount={setTokenAmount}
              onSelectToken={setPayToken}
              liqRatio={liqRatio}
              setLiquidity={setLiqAmount}
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
            {publicKey && <div>Balance: {liqBalance.toFixed(2)}</div>}
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
