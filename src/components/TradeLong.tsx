import { twMerge } from "tailwind-merge";
import { useState } from "react";

import { TokenSelector, Token } from "./TokenSelector";
import { LeverageSlider } from "./LeverageSlider";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";

interface Props {
  className?: string;
  inputPayToken: Token;
  outputPayToken: Token;
}

function getLiqPrice(entry: number, leverage: number) {
  return Math.round((entry * leverage) / 100);
}

export function TradeLong(props: Props) {
  const [payToken, setPayToken] = useState(props.inputPayToken);
  const [payAmount, setPayAmount] = useState(0);
  const [longToken, setLongToken] = useState(props.outputPayToken);
  const [longAmount, setLongAmount] = useState(0);
  const [leverage, setLeverage] = useState(1);

  const stats = useDailyPriceStats(props.inputPaytoken);

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

      <table className="table w-full">
        <tbody>
          <tr>
            <td>Collateral In</td>
            <td>{props.outputPayToken}</td>
          </tr>
          <tr>
            <td>Entry Price</td>
            <td>{stats.currentPrice}</td>
          </tr>
          <tr>
            <td>Liq Price</td>
            <td>{getLiqPrice(stats.currentPrice, leverage)}</td>
          </tr>
          <tr>
            <td>Fees</td>
            <td>PLACEhodler</td>
          </tr>
        </tbody>
      </table>
      <button className="btn-primary btn">Place Trade</button>
    </div>
  );
}
