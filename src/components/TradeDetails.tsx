import { twMerge } from "tailwind-merge";

import { Token } from "@/lib/Token";

function formatNumber(num: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

interface Props {
  className?: string;
  collateralToken: Token;
  entryPrice: number;
  fees: number;
  liquidationPrice: number;
  onSubmit?(): void;
}

export function TradeDetails(props: Props) {
  return (
    <div className={twMerge("grid", "grid-cols-2", "gap-4", props.className)}>
      {[
        {
          label: "Collateral in",
          value: props.collateralToken,
        },
        {
          label: "Entry Price",
          value: `$${formatNumber(props.entryPrice)}`,
        },
        {
          label: "Liq. Price",
          value: `$${formatNumber(props.liquidationPrice)}`,
        },
        {
          label: "Fees",
          value: `$${formatNumber(props.fees)}`,
        },
      ].map(({ label, value }, i) => (
        <div
          className={twMerge(
            "border-zinc-700",
            i < 2 && "pb-4",
            i < 2 && "border-b"
          )}
          key={i}
        >
          <div className="text-sm text-zinc-400">{label}</div>
          <div className="text-sm text-white">{value}</div>
        </div>
      ))}
    </div>
  );
}
