import { twMerge } from "tailwind-merge";

import { UsdcIconCircle } from "./UsdcIconCircle";
import { SolanaIconCircle } from "./SolanaIconCircle";

interface Props {
  className?: string;
}

export function ChartCurrency(props: Props) {
  return (
    <div
      className={twMerge("flex", "items-center", "space-x-2", props.className)}
    >
      <div className="relative h-[34px] w-[34px]">
        <SolanaIconCircle
          className={twMerge(
            "absolute",
            "h-6",
            "left-0",
            "rounded-full",
            "top-0",
            "w-6",
            "z-10"
          )}
        />
        <UsdcIconCircle
          className={twMerge(
            "absolute",
            "bottom-0",
            "h-6",
            "right-0",
            "rounded-full",
            "w-6",
            "z-0"
          )}
        />
      </div>
      <div className="text-2xl font-bold text-white">SOL / USDC</div>
    </div>
  );
}
