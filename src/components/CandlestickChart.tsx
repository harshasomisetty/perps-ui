import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

let tvScriptLoadingPromise: Promise<any> | undefined = undefined;

interface Props {
  className?: string;
}

export function CandlestickChart(props: Props) {
  const onLoadScriptRef = useRef<(() => any) | null>(null);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    function createWidget() {
      if (
        document.getElementById("tradingview_381af") &&
        "TradingView" in window
      ) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: "COINBASE:SOLUSD",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview_381af",
        });
      }
    }

    return () => {
      onLoadScriptRef.current = null;
    };
  }, []);

  return (
    <div
      className={twMerge(
        "tradingview-widget-container",
        "grid",
        "grid-rows-[1fr,max-content]",
        props.className
      )}
    >
      <div id="tradingview_381af" />
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/symbols/SOLUSD/?exchange=COINBASE"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="blue-text">Solana chart</span>
        </a>{" "}
        by TradingView
      </div>
    </div>
  );
}
