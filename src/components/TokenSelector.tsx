import { twMerge } from "tailwind-merge";
import ChevronRightIcon from "@carbon/icons-react/lib/ChevronRight";
import { cloneElement, useState } from "react";

import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { TokenE, getTokenIcon } from "@/lib/Token";
import { TokenSelectorList } from "./TokenSelectorList";
import { SolidButton } from "./SolidButton";

function formatNumber(num: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

function displayOnlyNumbersAndDecimals(text: string) {
  const sanitizedText = text.replace(/(\.)|(\D+)/g, "");

  // Ensure there is at most one decimal point
  const decimalCount = (sanitizedText.match(/\./g) || []).length;
  const hasDecimal = decimalCount > 0;
  const hasMultipleDecimals = decimalCount > 1;
  if (hasMultipleDecimals) {
    return NaN;
  } else if (hasDecimal) {
    const splitText = sanitizedText.split(".");
    if (splitText[1] && splitText[1].length > 2) {
      return parseFloat(splitText[0] + "." + splitText[1].slice(0, 2));
    } else {
      return parseFloat(sanitizedText);
    }
  }

  // Parse the sanitized string to a float
  return parseFloat(sanitizedText);
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
  liqRatio: number;
  setLiquidity?: (amount: number) => void;
  tokenList?: TokenE[];
  maxBalance?: number;
}

export function TokenSelector(props: Props) {
  const stats = useDailyPriceStats();
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
              props.onChangeAmount?.(parseFloat(text));

              //   "all nujbers ratio",
              //   (Number(text) * stats[props.token].currentPrice) *
              //     props.liqRatio
              // )

              // TODO liquidity should be subtract fees
              // console.log("liq ration", props.liqRatio);

              props.setLiquidity?.(
                Number(
                  (
                    Number(text) *
                    stats[props.token].currentPrice *
                    props.liqRatio
                  ).toFixed(2)
                )
              );
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
