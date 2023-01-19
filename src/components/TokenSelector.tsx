import { twMerge } from "tailwind-merge";
import ChevronRightIcon from "@carbon/icons-react/lib/ChevronRight";
import CloseIcon from "@carbon/icons-react/lib/Close";
import { cloneElement, useState } from "react";

import { SolanaIconCircle } from "./SolanaIconCircle";
import { UsdcIconCircle } from "./UsdcIconCircle";
import { MSolIconCircle } from "./MSolIconCircle";
import { STSolIconCircle } from "./STSolIconCircle";
import { RayIconCircle } from "./RayIconCircle";
import { UsdtIconCircle } from "./UsdtIconCircle";
import { OrcaIconCircle } from "./OrcaIconCircle";
import { BonkIconCircle } from "./BonkIconCircle";
import {
  Token,
  TOKEN_LIST,
  useDailyPriceStats,
} from "@/hooks/useDailyPriceStats";

export { Token };

function formatNumber(num: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

function getTokenIcon(token: Token) {
  switch (token) {
    case Token.SOL:
      return <SolanaIconCircle />;
    case Token.USDC:
      return <UsdcIconCircle />;
    case Token.mSOL:
      return <MSolIconCircle />;
    case Token.stSOL:
      return <STSolIconCircle />;
    case Token.RAY:
      return <RayIconCircle />;
    case Token.USDT:
      return <UsdtIconCircle />;
    case Token.ORCA:
      return <OrcaIconCircle />;
    case Token.Bonk:
      return <BonkIconCircle />;
  }
}

function getTokenLabel(token: Token) {
  switch (token) {
    case Token.SOL:
      return "Solana";
    case Token.USDC:
      return "UDC Coin";
    case Token.mSOL:
      return "Marinade Staked SOL";
    case Token.stSOL:
      return "Lido Staked SOL";
    case Token.RAY:
      return "Raydium";
    case Token.USDT:
      return "USDT";
    case Token.ORCA:
      return "Orca";
    case Token.Bonk:
      return "BonkCoin";
  }
}

interface Props {
  className?: string;
  amount: number;
  token: Token;
  onChangeAmount?(amount: number): void;
  onSelectToken?(token: Token): void;
}

export function TokenSelector(props: Props) {
  const stats = useDailyPriceStats();
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <>
      <div
        className={twMerge(
          "grid-cols-[max-content,1fr]",
          "bg-black/50",
          "grid",
          "h-20",
          "items-center",
          "p-4",
          "rounded",
          "w-full",
          props.className
        )}
      >
        <button
          className="flex items-center"
          onClick={() => setSelectorOpen(true)}
        >
          {cloneElement(getTokenIcon(props.token), {
            className: "border border-white/20 h-6 rounded-full w-6",
          })}
          <div className="ml-1 text-2xl text-white">{props.token}</div>
          <ChevronRightIcon className="ml-2 fill-white" />
        </button>
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
              "focus:outline-none"
            )}
            placeholder="0"
            type="number"
            value={props.amount || ""}
            onChange={(e) => {
              const text = e.currentTarget.value;
              const number = parseFloat(text);
              props.onChangeAmount?.(Number.isNaN(number) ? 0 : number);
            }}
          />
          {!!stats[props.token]?.currentPrice && (
            <div className="mt-0.5 text-right text-xs text-zinc-500">
              ${formatNumber(props.amount * stats[props.token].currentPrice)}
            </div>
          )}
        </div>
      </div>
      {selectorOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-20 bg-black/40">
          <div className="absolute top-0 bottom-0 left-0 w-[424px] bg-zinc-900 p-4">
            <header className="flex items-center justify-between">
              <div className="text-sm font-medium text-white">You Pay</div>
              <button onClick={() => setSelectorOpen(false)}>
                <CloseIcon className="h-6 w-6 fill-white" />
              </button>
            </header>
            <div className="mt-6">
              {TOKEN_LIST.map((token) => {
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
                      setSelectorOpen(false);
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
      )}
    </>
  );
}
