import dynamic from "next/dynamic";
// @ts-ignore
import { Themes } from "react-tradingview-widget";

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
      <TradingViewWidget autosize symbol="SOLUSD" theme={Themes.DARK} />
    </div>
  );
}
