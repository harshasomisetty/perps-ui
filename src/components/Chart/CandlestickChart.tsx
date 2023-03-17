import dynamic from "next/dynamic";
import { getSymbol, TokenE } from "@/lib/Token";
import { ChartCurrency } from "@/components/Chart/ChartCurrency";
import { DailyStats } from "@/components/Chart/DailyStats";

// @ts-ignore
const TradingViewWidget = dynamic<any>(import("react-tradingview-widget"), {
  ssr: false,
});

interface Props {
  className?: string;
  comparisonCurrency: "usd";
  token: TokenE;
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
        <a
          href={`https://www.tradingview.com/symbols/${getSymbol(
            props.token
          )}/?exchange=COINBASE`}
        >
          <p className="text-center text-xs text-white underline">
            {props.token} stock chart by TradingView
          </p>
        </a>
        by TradingView
      </div>
    </div>
  );
}

CandlestickChart.defaultProps = {
  token: TokenE.SOL,
  comparisonCurrency: "usd",
};
