import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";

import { Token } from "@/hooks/useDailyPriceStats";
import { getTokenIcon } from "./TokenSelector";

export { Token };

function formatPrice(num: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

function formatFees(num: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

interface Props {
  availableLiquidity: number;
  borrowFee: number;
  className?: string;
  entryPrice: number;
  exitPrice: number;
  token: Token;
}

export function TradeLongDetails(props: Props) {
  const icon = getTokenIcon(props.token);

  return (
    <div className={props.className}>
      <header className="mb-4 flex items-center">
        <div className="text-sm font-medium text-white">Long</div>
        {cloneElement(icon, {
          className: twMerge(icon.props.className, "h-4", "ml-1.5", "w-4"),
        })}
        <div className="ml-0.5 text-sm font-semibold text-white">
          {props.token}
        </div>
      </header>
      {[
        {
          label: "Entry Price",
          value: `$${formatPrice(props.entryPrice)}`,
        },
        {
          label: "Exit Price",
          value: `$${formatPrice(props.exitPrice)}`,
        },
        {
          label: "Borrow Price",
          value: (
            <>
              {`${formatFees(props.borrowFee)}% `}
              <span className="text-zinc-500"> / hr</span>
            </>
          ),
        },
        {
          label: "Available Liquidity",
          value: `$${formatPrice(props.availableLiquidity)}`,
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
