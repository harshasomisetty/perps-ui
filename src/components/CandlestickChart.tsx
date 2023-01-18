import dynamic from "next/dynamic";

import { ChartCurrency } from "./ChartCurrency";
import { DailyStats } from "./DailyStats";

// @ts-ignore
const TradingViewWidget = dynamic<any>(import("react-tradingview-widget"), {
  ssr: false,
});

interface Props {
  className?: string;
}

export function CandlestickChart(props: Props) {
  return (
    <div className={props.className}>
      <div className="mb-8 flex items-center">
        <ChartCurrency />
        <DailyStats className="ml-12" />
      </div>
      <TradingViewWidget autosize symbol="SOLUSD" theme="Dark" />
    </div>
  );
}
