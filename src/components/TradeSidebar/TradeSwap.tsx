import { useEffect, useState } from "react";

import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { Token } from "@/lib/Token";

import { TokenSelector } from "../TokenSelector";
import { SolidButton } from "../SolidButton";
import { TradeSwapDetails } from "./TradeSwapDetails";

interface Props {
  className?: string;
}

export function TradeSwap(props: Props) {
  const [payToken, setPayToken] = useState(Token.SOL);
  const [payAmount, setPayAmount] = useState(0);
  const [receiveToken, setReceiveToken] = useState(Token.SOL);
  const [receiveAmount, setReceiveAmount] = useState(0);

  const allPriceStats = useDailyPriceStats();

  useEffect(() => {
    const payTokenPrice = allPriceStats[payToken]?.currentPrice || 0;
    const receiveTokenPrice = allPriceStats[receiveToken]?.currentPrice || 0;

    const conversionRatio = payTokenPrice / receiveTokenPrice;

    const receiveAmount = payAmount * conversionRatio;
    setReceiveAmount(receiveAmount);
  }, [payAmount, payToken, receiveToken, allPriceStats]);

  useEffect(() => {
    const payTokenPrice = allPriceStats[payToken]?.currentPrice || 0;
    const receiveTokenPrice = allPriceStats[receiveToken]?.currentPrice || 0;

    const conversionRatio = receiveTokenPrice / payTokenPrice;

    const payAmount = receiveAmount * conversionRatio;
    setPayAmount(payAmount);
  }, [receiveAmount, payToken, receiveToken, allPriceStats]);

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
      <div className="mt-4 text-sm font-medium text-white">You Receive</div>
      <TokenSelector
        className="mt-2"
        amount={receiveAmount}
        token={receiveToken}
        onChangeAmount={setReceiveAmount}
        onSelectToken={setReceiveToken}
      />
      <SolidButton className="mt-6 w-full">Place Order</SolidButton>
      <TradeSwapDetails
        availableLiquidity={3871943.82}
        className="mt-4"
        fees={12.3}
        payToken={payToken}
        payTokenPrice={allPriceStats[payToken]?.currentPrice || 0}
        receiveToken={receiveToken}
        receiveTokenPrice={allPriceStats[receiveToken]?.currentPrice || 0}
      />
    </div>
  );
}
