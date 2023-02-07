import { twMerge } from "tailwind-merge";
import CloseIcon from "@carbon/icons-react/lib/Close";
import { cloneElement } from "react";

import { TOKEN_LIST, useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { Token, getTokenLabel, getTokenIcon } from "@/lib/Token";

function formatNumber(num: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

interface Props {
  className?: string;
  onClose?(): void;
  onSelectToken?(token: Token): void;
  tokenList?: Token[];
}

export function TokenSelectorList(props: Props) {
  const stats = useDailyPriceStats();

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-20 bg-black/40"
      onClick={props.onClose}
    >
      <div
        className="absolute top-0 bottom-0 left-0 w-[424px] bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between">
          <div className="text-sm font-medium text-white">You Pay</div>
          <button onClick={props.onClose}>
            <CloseIcon className="h-6 w-6 fill-white" />
          </button>
        </header>
        <div className="mt-6">
          {(props.tokenList ? props.tokenList : TOKEN_LIST).map((token) => {
            const icon = getTokenIcon(token);

            return (
              <button
                key={token}
                className={twMerge(
                  "bg-zinc-900",
                  "gap-x-3",
                  "grid-cols-[40px,1fr,max-content]",
                  "grid",
                  "items-center",
                  "p-2.5",
                  "rounded",
                  "w-full",
                  "hover:bg-zinc-800"
                )}
                onClick={() => {
                  props.onSelectToken?.(token);
                  props.onClose?.();
                }}
              >
                {cloneElement(icon, {
                  className: "h-10 w-10",
                })}
                <div className="text-left">
                  <div className="font-semibold text-white">{token}</div>
                  <div className="text-sm text-zinc-500">
                    {getTokenLabel(token)}
                  </div>
                </div>
                {!!stats[token]?.currentPrice && (
                  <div className="text-sm text-white">
                    ${formatNumber(stats[token].currentPrice)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
