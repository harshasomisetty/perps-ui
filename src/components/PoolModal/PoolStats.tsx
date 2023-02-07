import { Pool } from "@/lib/Pool";
import { twMerge } from "tailwind-merge";

interface Props {
  pool: Pool;
}

export default function PoolStats(props: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[
        {
          label: "Liquidity",
          value: `$${124}`,
        },
        {
          label: "Volume",
          value: `$${123}`,
        },
        {
          label: "OI Long",
          value: (
            <>
              {`${123}% `}
              <span className="text-zinc-500"> / hr</span>
            </>
          ),
        },
        {
          label: "OI Short",
          value: `$${123}`,
        },
        {
          label: "Fees",
          value: `$${123}`,
        },
        {
          label: "Your Liquidity",
          value: `$${123}`,
        },
        {
          label: "Your Share",
          value: `$${123}`,
        },
      ].map(({ label, value }, i) => (
        <div className={twMerge("border-zinc-700", "pb-4", "border-t")} key={i}>
          <div className="text-sm text-zinc-400">{label}</div>
          <div className="text-sm text-white">{value}</div>
        </div>
      ))}
    </div>
  );
}
