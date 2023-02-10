import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { asToken, Token } from "@/lib/Token";

import { TokenSelector } from "../TokenSelector";
import { LeverageSlider } from "../LeverageSlider";
import { TradeDetails } from "./TradeDetails";
import { SolidButton } from "../SolidButton";
import { TradeLongDetails } from "./TradeLongDetails";
import { PoolSelector } from "../PoolSelector";
import { useRouter } from "next/router";
import { Pool } from "@/lib/Pool";

const PLACEHOLDER_POOLS = [
  {
    id: "1",
    tokens: [Token.SOL, Token.Bonk],
    name: "Test pool 1",
  },
  {
    id: "2",
    tokens: [Token.mSOL],
    name: "Test pool 2",
  },
  {
    id: "3",
    tokens: [Token.USDC, Token.ORCA, Token.RAY, Token.USDT],
    name: "Test pool 3",
  },
];

interface Props {
  className?: string;
  pools?: Pool[];
}

export function TradeLong(props: Props) {
  const [payToken, setPayToken] = useState(Token.SOL);
  const [payAmount, setPayAmount] = useState(0);
  const [longAmount, setLongAmount] = useState(0);
  const [leverage, setLeverage] = useState(1);
  const [longToken, setLongToken] = useState(Token.SOL);

  const allPriceStats = useDailyPriceStats();
  const router = useRouter();

  const { pair } = router.query;

  useEffect(() => {
    if (!pair) {
      return;
    }
    setLongToken(asToken(pair.split("-")[0]));
  }, [pair]);

  const entryPrice = allPriceStats[payToken]?.currentPrice * payAmount || 0;
  const liquidationPrice = entryPrice * leverage;

  if (!pair) {
    return <></>;
  }

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
      <div className="mt-4 text-sm font-medium text-white">Your Long</div>
      <TokenSelector
        className="mt-2"
        amount={longAmount}
        token={longToken}
        onChangeAmount={setLongAmount}
        onSelectToken={(token) => {
          setLongToken(token);
          router.push("/trade/" + token + "-USD");
        }}
      />
      <div className="mt-4 text-xs text-zinc-400">Pool</div>
      <PoolSelector className="mt-2" />
      <LeverageSlider
        className="mt-6"
        value={leverage}
        onChange={setLeverage}
      />
      <SolidButton className="mt-6 w-full">Place Order</SolidButton>
      <TradeDetails
        className="mt-4"
        collateralToken={payToken}
        entryPrice={entryPrice}
        liquidationPrice={liquidationPrice}
        fees={0.05}
      />
      <TradeLongDetails
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
        token={longToken}
      />
    </div>
  );
}