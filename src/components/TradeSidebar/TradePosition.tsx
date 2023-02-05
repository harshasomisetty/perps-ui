import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { asToken, Token } from "@/lib/Token";

import { TokenSelector } from "../TokenSelector";
import { LeverageSlider } from "../LeverageSlider";
import { TradeDetails } from "./TradeDetails";
import { SolidButton } from "../SolidButton";
import { TradePositionDetails } from "./TradePositionDetails";
import { PoolSelector } from "../PoolSelector";
import { useRouter } from "next/router";
import { Pool } from "@/lib/Pool";
import { Tab } from ".";
import { openPosition } from "src/actions/openPosition";
import { usePools } from "@/hooks/usePools";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface Props {
  className?: string;
  side: Tab;
}

export function TradePosition(props: Props) {
  const [payToken, setPayToken] = useState(Token.SOL);
  const [positionToken, setPositionToken] = useState(Token.SOL);

  const [payAmount, setPayAmount] = useState(0.05);
  const [positionAmount, setPositionAmount] = useState(0.1);

  const [leverage, setLeverage] = useState(1);

  const { publicKey, signTransaction, wallet } = useWallet();
  const { connection } = useConnection();

  const { pools } = usePools(wallet);
  const [pool, setPool] = useState<Pool | null>(null);

  const allPriceStats = useDailyPriceStats();
  const router = useRouter();

  const { pair } = router.query;

  async function handleTrade() {
    console.log("in handle trade", pool);
    await openPosition(
      pool,
      wallet,
      publicKey,
      signTransaction,
      connection,
      payToken,
      positionToken,
      new BN(payAmount * LAMPORTS_PER_SOL),
      new BN(positionAmount * LAMPORTS_PER_SOL),
      new BN(allPriceStats[payToken]?.currentPrice * LAMPORTS_PER_SOL),
      props.side
    );

    // router.reload(window.location.pathname);
  }

  useEffect(() => {
    if (!pair) {
      return;
    }
    // @ts-ignore
    setPositionToken(asToken(pair.split("-")[0]));
  }, [pair]);

  // useEffect(() => {
  //   console.log("use effect pool", pools);
  //   if (pools && Object.values(pools).length > 0) {
  //     setPool(Object.values(pools)[0].tokens);
  //   }
  // }, [pools]);

  const entryPrice = allPriceStats[payToken]?.currentPrice * payAmount || 0;
  const liquidationPrice = entryPrice * leverage;

  if (!pair) {
    return <p>Pair not loaded</p>;
  }

  if (pools === undefined) {
    return <p>single Pool not loaded</p>;
  } else if (pool === null) {
    setPool(Object.values(pools)[0]);
    return <p>multiple Pools not loaded</p>;
  } else {
    return (
      <div className={props.className}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-white">You Pay</div>
        </div>
        <TokenSelector
          className="mt-2"
          amount={payAmount}
          token={payToken}
          onChangeAmount={setPayAmount}
          onSelectToken={setPayToken}
        />
        <div className="mt-4 text-sm font-medium text-white">
          Your {props.side}
        </div>
        <TokenSelector
          className="mt-2"
          amount={positionAmount}
          token={positionToken}
          onChangeAmount={setPositionAmount}
          onSelectToken={(token) => {
            setPositionToken(token);
            router.push("/trade/" + token + "-USD");
          }}
        />
        <div className="mt-4 text-xs text-zinc-400">Pool</div>
        <PoolSelector
          className="mt-2"
          pool={pool}
          onSelectPool={setPool}
          pools={pools}
        />
        <LeverageSlider
          className="mt-6"
          value={leverage}
          onChange={setLeverage}
        />
        <SolidButton className="mt-6 w-full" onClick={handleTrade}>
          Place Order
        </SolidButton>
        <TradeDetails
          className="mt-4"
          collateralToken={payToken}
          entryPrice={entryPrice}
          liquidationPrice={liquidationPrice}
          fees={0.05}
        />
        <TradePositionDetails
          availableLiquidity={3871943.82}
          borrowFee={0.0052}
          className={twMerge(
            "-mb-4",
            "-mx-4",
            "bg-zinc-900",
            "mt-4",
            "pb-5",
            "pt-4",
            "px-4"
          )}
          entryPrice={16.4}
          exitPrice={16.4}
          token={positionToken}
          side={props.side}
        />
      </div>
    );
  }
}
