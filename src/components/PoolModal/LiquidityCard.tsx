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
import { fetchLPBalance, fetchTokenBalance } from "@/utils/retrieveData";
import router from "next/router";
import AirdropButton from "../AirdropButton";
import { getMint } from "@solana/spl-token";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { PoolAccount } from "@/lib/PoolAccount";

interface Props {
  className?: string;
  pool: PoolAccount;
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

  const [payToken, setPayToken] = useState(props.pool.getTokenList()[0]);

  const stats = useDailyPriceStats();

  useEffect(() => {
    async function fetchData() {
      let tokenBalance = await fetchTokenBalance(
        payToken!,
        publicKey!,
        connection
      );

      setPayTokenBalance(tokenBalance);

      let lpBalance = await fetchLPBalance(
        props.pool.getLpTokenMint(),
        publicKey!,
        connection
      );

      setLiqBalance(lpBalance);

      const mintInfo = await getMint(connection, props.pool.getLpTokenMint());

      setLiqRatio(
        Number(mintInfo.supply) /
          10 ** mintInfo.decimals /
          props.pool.getLiquidities(stats)!
      );
    }
    if (publicKey && Object.values(stats).length > 0 && payToken) {
      fetchData();
    }
  }, [connection, publicKey, props.pool, payToken, stats]);

  async function changeLiq() {
    console.log("before change", tab === Tab.Remove, liqAmount);
    await changeLiquidity(
      props.pool,
      wallet!,
      publicKey!,
      // @ts-ignore
      signTransaction!,
      connection,
      props.pool.getCustodyAccount(payToken!),
      tab === Tab.Add ? tokenAmount : 0,
      tab === Tab.Remove ? liqAmount : 0
    );

    // router.reload(window.location.pathname);
  }

  // async function onChangeAmtLiq(tokenAmtUsd: number) {
  //   setLiqAmount(tokenAmtUsd * liqRatio);
  // }

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

        {props.pool.name == "TestPool1" &&
          Object.values(props.pool.custodies).map((custody) => {
            return (
              <AirdropButton
                key={custody.address.toString()}
                custody={custody}
              />
            );
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
              token={payToken!}
              onChangeAmount={setTokenAmount}
              onSelectToken={setPayToken}
              liqRatio={liqRatio}
              setLiquidity={setLiqAmount}
              tokenList={props.pool.getTokenList()}
              maxBalance={payTokenBalance}
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
            // @ts-ignore
            <TokenSelector
              className="mt-2"
              amount={tokenAmount}
              token={payToken!}
              onSelectToken={setPayToken}
              tokenList={props.pool.getTokenList()}
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
