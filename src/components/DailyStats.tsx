import { twMerge } from "tailwind-merge";

import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { Token } from "@/lib/Token";

function formatNumber(number: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
  return formatter.format(number);
}

interface DailyStatsProps {
  className?: string;
}

export function DailyStats(props: DailyStatsProps) {
  const stats = useDailyPriceStats(Token.SOL);

  return (
    <div
      className={twMerge("flex", "items-center", "space-x-5", props.className)}
    >
      <div>
        <div className="text-xs text-zinc-500">Current Price</div>
        <div className="text-sm text-white">${stats.currentPrice}</div>
      </div>
      <div>
        <div className="text-xs text-zinc-500">24h Change</div>
        <div
          className={twMerge(
            "text-sm",
            stats.change24hr < 0 && "text-rose-400",
            stats.change24hr === 0 && "text-white",
            stats.change24hr > 0 && "text-emerald-400"
          )}
        >
          {formatNumber(stats.change24hr)}
        </div>
      </div>
      <div>
        <div className="text-xs text-zinc-500">24h High</div>
        <div className="text-sm text-white">{formatNumber(stats.high24hr)}</div>
      </div>
      <div>
        <div className="text-xs text-zinc-500">24h Low</div>
        <div className="text-sm text-white">{formatNumber(stats.low24hr)}</div>
      </div>
    </div>
  );
}
