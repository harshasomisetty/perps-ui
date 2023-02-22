import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { Pool } from "@/lib/Pool";
import { twMerge } from "tailwind-merge";

interface Props {
  pool: Pool;
  className?: string;
}

export default function PoolStats(props: Props) {
  const stats = useDailyPriceStats();

  if (Object.keys(stats).length === 0) {
    return <>Loading stats</>;
  } else {
    return (
      <div
        className={twMerge(
          "grid",
          "grid-cols-4",
          "gap-x-4",
          "gap-y-8",
          props.className
        )}
      >
        {[
          {
            label: "Liquidity",
            value: `$${props.pool.getLiquidities(stats)}`,
          },
          {
            label: "Volume",
            value: `{}`,
          },
          {
            label: "OI Long",
            value: (
              <>
                {`{}% `}
                <span className="text-zinc-500"> / hr</span>
              </>
            ),
          },
          {
            label: "OI Short",
            value: `{}`,
          },
          {
            label: "Fees",
            value: `{}`,
          },
          {
            label: "Your Liquidity",
            value: `{}`,
          },
          {
            label: "Your Share",
            value: `{}`,
          },
        ].map(({ label, value }, i) => (
          <div
            className={twMerge("border-zinc-700", "border-t", "pt-3")}
            key={i}
          >
            <div className="text-sm text-zinc-400">{label}</div>
            <div className="text-sm text-white">{value}</div>
          </div>
        ))}
      </div>
    );
  }
}
