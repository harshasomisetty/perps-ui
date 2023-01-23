import { useState } from "react";
import Movement from "@carbon/icons-react/lib/Movement";
import { twMerge } from "tailwind-merge";

import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { Token } from "@/lib/Token";

import { TokenSelector } from "./TokenSelector";
import { LeverageSlider } from "./LeverageSlider";
import { TradeDetails } from "./TradeDetails";
import { SolidButton } from "./SolidButton";
import { TradeLongDetails } from "./TradeLongDetails";

interface Props {
  className?: string;
}

export function TradeLong(props: Props) {
  const [payToken, setPayToken] = useState(Token.SOL);
  const [payAmount, setPayAmount] = useState(0);
  const [longToken, setLongToken] = useState(Token.SOL);
  const [longAmount, setLongAmount] = useState(0);
  const [leverage, setLeverage] = useState(1);

  const allPriceStats = useDailyPriceStats();

  const entryPrice = allPriceStats[payToken]?.currentPrice * payAmount || 0;
  const liquidationPrice = entryPrice * leverage;

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
        onSelectToken={setLongToken}
      />
      <LeverageSlider
        className="mt-6"
        value={leverage}
        onChange={setLeverage}
      />
      <SolidButton className="mt-6 w-full">
        <Movement className="mr-1 h-4 w-4" />
        Enable Leverage
      </SolidButton>
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
          "bg-black/50",
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
