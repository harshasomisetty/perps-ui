import { twMerge } from "tailwind-merge";
import { cloneElement } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import ChevronDownIcon from "@carbon/icons-react/lib/ChevronDown";

import { Token } from "@/lib/Token";

import { UsdcIconCircle } from "./UsdcIconCircle";
import { SolanaIconCircle } from "./SolanaIconCircle";
import { UsdtIconCircle } from "./UsdtIconCircle";
import { ChartCurrencyDropdownItem } from "./ChartCurrencyDropdownItem";
import { RayIconCircle } from "./RayIconCircle";

interface Props {
  className?: string;
  comparisonCurrency: "usd" | "eur" | Token.USDC | Token.USDT;
  token: Token.SOL;
}

function getCurrencyIcon(currency: Props["comparisonCurrency"]) {
  switch (currency) {
    case "usd":
      return (
        <div
          className={twMerge(
            "bg-white/20",
            "border-white/30",
            "border",
            "grid",
            "place-items-center",
            "rounded-full"
          )}
        >
          <div className="text-sm">$</div>
        </div>
      );
    case "eur":
      return (
        <div
          className={twMerge(
            "bg-white/20",
            "border-white/30",
            "border",
            "grid",
            "place-items-center",
            "rounded-full"
          )}
        >
          <div className="text-sm">€</div>
        </div>
      );
    case Token.USDC:
      return <UsdcIconCircle />;
    case Token.USDT:
      return <UsdtIconCircle />;
  }
}

export function ChartCurrency(props: Props) {
  const currencyIcon = getCurrencyIcon(props.comparisonCurrency);
  const tokenIcon = getTokenIcon(props.token);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={twMerge(
          "flex",
          "group",
          "items-center",
          "space-x-2",
          props.className
        )}
      >
        <div className="relative h-[34px] w-[34px]">
          {cloneElement(tokenIcon, {
            className: twMerge(
              tokenIcon.props.className,
              "absolute",
              "h-6",
              "left-0",
              "top-0",
              "w-6",
              "z-10"
            ),
          })}
          {cloneElement(currencyIcon, {
            className: twMerge(
              currencyIcon.props.className,
              "absolute",
              "bottom-0",
              "h-6",
              "right-0",
              "w-6",
              "z-0"
            ),
          })}
        </div>
        <div className="text-4xl font-bold text-white">
          {props.token} / {props.comparisonCurrency.toLocaleUpperCase()}
        </div>
        <div
          className={twMerge(
            "border-zinc-700",
            "border",
            "grid",
            "h-6",
            "place-items-center",
            "rounded-full",
            "transition-colors",
            "w-6",
            "group-hover:border-white"
          )}
        >
          <ChevronDownIcon className="h-4 w-4 fill-white" />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="flex flex-col rounded bg-zinc-800 shadow-2xl">
          <DropdownMenu.Arrow className="fill-zinc-800" />
          <ChartCurrencyDropdownItem href="/trade/sol-usd" label="SOL / USD" />
          <ChartCurrencyDropdownItem
            href="/trade/sol-usdc"
            label="SOL / USDC"
          />
          <ChartCurrencyDropdownItem
            href="/trade/sol-usdt"
            label="SOL / USDT"
          />
          <ChartCurrencyDropdownItem href="/trade/sol-eur" label="SOL / EUR" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
