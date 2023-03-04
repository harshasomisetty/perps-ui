import { twMerge } from "tailwind-merge";

import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { Token } from "@/lib/Token";
import { formatNumberCommas } from "@/utils/formatters";

function formatNumber(number: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
  return formatter.format(number);
}

interface DailyStatsProps {
  className?: string;
  token: Token;
}

export function DailyStats(props: DailyStatsProps) {
  const stats = useDailyPriceStats(props.token);

  return (
    <div
      className={twMerge("flex", "items-center", "space-x-5", props.className)}
    >
      <div>
        <div className="text-xs text-zinc-500">Current Price</div>
        <div className="text-sm text-white">
          ${formatNumberCommas(stats.currentPrice)}
        </div>
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
          ${formatNumberCommas(stats.change24hr)}
        </div>
      </div>
    </div>
  );
}
