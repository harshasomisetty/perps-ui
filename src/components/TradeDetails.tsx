import { twMerge } from "tailwind-merge";

import { Token } from "@/hooks/useDailyPriceStats";

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
    <div className={props.className}>
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
            "border-t",
            "border-zinc-700",
            "flex",
            "items-center",
            "justify-between",
            "py-4"
          )}
          key={i}
        >
          <div className="text-xs text-zinc-400">{label}</div>
          <div className="text-sm text-white">{value}</div>
        </div>
      ))}
    </div>
  );
}
