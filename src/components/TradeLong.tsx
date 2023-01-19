import { twMerge } from "tailwind-merge";
import { useState } from "react";

import { TokenSelector, Token } from "./TokenSelector";
import { LeverageSlider } from "./LeverageSlider";

interface Props {
  className?: string;
}

export function TradeLong(props: Props) {
  const [payToken, setPayToken] = useState(Token.SOL);
  const [payAmount, setPayAmount] = useState(0);
  const [longToken, setLongToken] = useState(Token.SOL);
  const [longAmount, setLongAmount] = useState(0);
  const [leverage, setLeverage] = useState(1);

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
    </div>
  );
}
