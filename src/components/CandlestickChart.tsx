import dynamic from "next/dynamic";

import { Token } from "@/lib/Token";

import { ChartCurrency } from "./ChartCurrency";
import { DailyStats } from "./DailyStats";

// @ts-ignore
const TradingViewWidget = dynamic<any>(import("react-tradingview-widget"), {
  ssr: false,
});

function getSymbol(token: Token) {
  switch (token) {
    case Token.Bonk:
      return "BONKUSDT";
    case Token.ORCA:
      return "ORCAUSD";
    case Token.RAY:
      return "RAYUSD";
    case Token.SOL:
      return "SOLUSD";
    case Token.USDC:
      return "USDCUSD";
    case Token.USDT:
      return "USDTUSD";
    case Token.mSOL:
      return "MSOLUSD";
    case Token.stSOL:
      return "STSOLUSDT";
  }
}

interface Props {
  className?: string;
  comparisonCurrency: "usd";
  token: Token;
}

export function CandlestickChart(props: Props) {
  return (
    <div className={props.className}>
      <div className="mb-8 flex items-center">
        <ChartCurrency
          comparisonCurrency={props.comparisonCurrency}
          token={props.token}
        />
        <DailyStats className="ml-12" token={props.token} />
      </div>
      <div className="h-[350px] md:h-[500px]">
        <TradingViewWidget
          autosize
          symbol={getSymbol(props.token)}
          theme="Dark"
        />
      </div>
    </div>
  );
}

CandlestickChart.defaultProps = {
  token: Token.SOL,
  comparisonCurrency: "usd",
};
