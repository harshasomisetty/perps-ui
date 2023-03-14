import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { SolidButton } from "@/components/SolidButton";
import { TokenSelector } from "@/components/TokenSelector";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SidebarTab } from "../SidebarTab";

import Add from "@carbon/icons-react/lib/Add";
import Subtract from "@carbon/icons-react/lib/Subtract";
import { LpSelector } from "./LpSelector";
import { changeLiquidity } from "src/actions/changeLiquidity";
import AirdropButton from "../AirdropButton";
import { PoolAccount } from "@/lib/PoolAccount";
import { useGlobalStore } from "@/stores/store";
import { getCustodyData } from "@/hooks/storeHelpers/fetchCustodies";
import { getPoolData } from "@/hooks/storeHelpers/fetchPools";

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

  const [liqAmount, setLiqAmount] = useState(0);

  const { wallet, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [payToken, setPayToken] = useState(props.pool.getTokenList()[0]);

  const stats = useGlobalStore((state) => state.priceStats);

  const setPoolData = useGlobalStore((state) => state.setPoolData);
  const setCustodyData = useGlobalStore((state) => state.setCustodyData);

  const userData = useGlobalStore((state) => state.userData);

  // @ts-ignore
  let payTokenBalance = userData.tokenBalances[props.pool.getTokenList()[0]];
  let liqBalance = userData.lpBalances[props.pool.address.toString()];

  let liqRatio =
    Number(props.pool.lpData.supply) /
    10 ** props.pool.lpData.decimals /
    props.pool.getLiquidities(stats)!;

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

    const custodyData = await getCustodyData();
    const poolData = await getPoolData(custodyData);

    setCustodyData(custodyData);
    setPoolData(poolData);

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
                {publicKey && (
                  <div>
                    Balance: {payTokenBalance && payTokenBalance.toFixed(2)}
                  </div>
                )}
              </>
            ) : (
              <>
                {" "}
                <div className="text-sm font-medium text-white">You Remove</div>
                {publicKey && (
                  <div>Balance: {liqBalance && liqBalance.toFixed(2)}</div>
                )}
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
            {publicKey && (
              <div>Balance: {liqBalance && liqBalance.toFixed(2)}</div>
            )}
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
