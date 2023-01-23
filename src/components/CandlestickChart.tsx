import dynamic from "next/dynamic";

import { Token } from "@/lib/Token";

import { ChartCurrency } from "./ChartCurrency";
import { DailyStats } from "./DailyStats";

// @ts-ignore
const TradingViewWidget = dynamic<any>(import("react-tradingview-widget"), {
  ssr: false,
});

function getSymbol(
  token: Token.SOL,
  comparisonCurrency: "usd" | "eur" | Token.USDC | Token.USDT
) {
  switch (token) {
    case Token.SOL: {
      switch (comparisonCurrency) {
        case "usd":
          return "SOLUSD";
        case "eur":
          return "SOLEUR";
        case Token.USDC:
          return "SOLUSDC";
        case Token.USDT:
          return "SOLUSDT";
      }
    }
  }
}

interface Props {
  className?: string;
  comparisonCurrency: "usd" | "eur" | Token.USDC | Token.USDT;
  token: Token.SOL;
}

export function CandlestickChart(props: Props) {
  return (
    <div className={props.className}>
      <div className="mb-8 flex items-center">
        <ChartCurrency
          comparisonCurrency={props.comparisonCurrency}
          token={props.token}
        />
        <DailyStats className="ml-12" />
      </div>
      <div className="h-[350px] md:h-[500px]">
        <TradingViewWidget
          autosize
          symbol={getSymbol(props.token, props.comparisonCurrency)}
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
