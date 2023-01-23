import dynamic from "next/dynamic";

import { ChartCurrency } from "./ChartCurrency";
import { DailyStats } from "./DailyStats";
import { Token } from "./TokenSelector";

// @ts-ignore
const TradingViewWidget = dynamic<any>(import("react-tradingview-widget"), {
  ssr: false,
});

function getSymbol(
  token: Token.SOL,
  comparisonCurrency: "usd" | "eur" | Token.USDC | Token.USDT
) {
  switch (comparisonCurrency) {
    case "usd":
      return Token[token] + "USD";
    case "eur":
      return Token[token] + "EUR";
    case Token.USDC:
      return Token[token] + "USDC";
    case Token.USDT:
      return Token[token] + "USDT";
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
      <TradingViewWidget
        autosize
        symbol={getSymbol(props.token, props.comparisonCurrency)}
        theme="Dark"
      />
    </div>
  );
}

CandlestickChart.defaultProps = {
  token: Token.SOL,
  comparisonCurrency: "usd",
};
