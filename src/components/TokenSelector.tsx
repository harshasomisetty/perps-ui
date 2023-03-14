import { twMerge } from "tailwind-merge";
import ChevronRightIcon from "@carbon/icons-react/lib/ChevronRight";
import { cloneElement, useState } from "react";

import { TokenE, getTokenIcon } from "@/lib/Token";
import { TokenSelectorList } from "./TokenSelectorList";
import { useGlobalStore } from "@/stores/store";

function formatNumber(num: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

function decimalTrim(num: number) {
  return parseFloat(num.toFixed(4));
}

interface Props {
  className?: string;
  amount: number;
  token: TokenE;
  onChangeAmount?(amount: number): void;
  onSelectToken?(token: TokenE): void;
  tokenList?: TokenE[];
  maxBalance?: number;
}

export function TokenSelector(props: Props) {
  const stats = useGlobalStore((state) => state.priceStats);
  const [selectorOpen, setSelectorOpen] = useState(false);

  if (props.token === undefined) {
    return (
      <div
        className={twMerge(
          "grid-cols-[max-content,1fr]",
          "bg-zinc-900",
          "grid",
          "h-20",
          "items-center",
          "p-4",
          "rounded",
          "w-full",
          props.className
        )}
      >
        <p>no Tokens</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={twMerge(
          "grid-cols-[max-content,1fr]",
          "bg-zinc-900",
          "grid",
          "h-20",
          "items-center",
          "p-4",
          "rounded",
          "w-full",
          props.className
        )}
      >
        <div className="flex items-center">
          <button
            className="group flex items-center"
            onClick={() => setSelectorOpen(true)}
          >
            {cloneElement(getTokenIcon(props.token), {
              className: "h-6 rounded-full w-6",
            })}
            <div className="ml-1 text-2xl text-white">{props.token}</div>
            <ChevronRightIcon className="ml-2 fill-gray-500 transition-colors group-hover:fill-white" />
          </button>
          {props.maxBalance && (
            <button
              className={twMerge(
                "h-min",
                "w-min",
                "bg-purple-500",
                "rounded",
                "py-1",
                "px-2",
                "text-white"
              )}
              onClick={() => props.onChangeAmount(props.maxBalance)}
            >
              Max
            </button>
          )}
        </div>
        <div>
          <input
            className={twMerge(
              "bg-transparent",
              "h-full",
              "text-2xl",
              "text-right",
              "text-white",
              "top-0",
              "w-full",
              "focus:outline-none",
              typeof props.onChangeAmount === "function"
                ? "cursor-pointer"
                : "cursor-none",
              typeof props.onChangeAmount === "function"
                ? "pointer-events-auto"
                : "pointer-events-none"
            )}
            placeholder="0"
            type="number"
            value={decimalTrim(props.amount) || ""}
            onChange={(e) => {
              const text = e.currentTarget.value;

              console.log("text", text, parseFloat(text));
              if (text === "0" || isNaN(parseFloat(text))) {
                props.onChangeAmount?.(0);
                console.log("set 0");
              } else {
                props.onChangeAmount?.(parseFloat(text));
              }
            }}
          />
          {/* <p>test</p> */}
          {!!stats[props.token]?.currentPrice && (
            <div className="mt-0.5 text-right text-xs text-zinc-500">
              {formatNumber(props.amount * stats[props.token].currentPrice)}
            </div>
          )}
        </div>
      </div>
      {selectorOpen && (
        <TokenSelectorList
          onClose={() => setSelectorOpen(false)}
          onSelectToken={props.onSelectToken}
          tokenList={props.tokenList}
        />
      )}
    </>
  );
}
