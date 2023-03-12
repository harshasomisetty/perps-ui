import { twMerge } from "tailwind-merge";
import { cloneElement, useState } from "react";
import GrowthIcon from "@carbon/icons-react/lib/Growth";
import EditIcon from "@carbon/icons-react/lib/Edit";
import ChevronDownIcon from "@carbon/icons-react/lib/ChevronDown";
import { ACCOUNT_URL } from "@/lib/TransactionHandlers";
import NewTab from "@carbon/icons-react/lib/NewTab";

import { getTokenIcon, getTokenLabel } from "@/lib/Token";
import { PositionColumn } from "./PositionColumn";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { formatNumberCommas } from "@/utils/formatters";
import { Side } from "@/lib/types";
import { PositionAccount } from "@/lib/PositionAccount";

interface Props {
  className?: string;
  expanded?: boolean;
  position: PositionAccount;
  pnl: number;
  liqPrice: number;
  onClickExpand?(): void;
}

export default function PositionBasicInfo(props: Props) {
  const tokenIcon = getTokenIcon(props.position.token);
  const stats = useDailyPriceStats(props.position.token);

  function getNetValue(): number {
    // let netValue = 0
    let collateral = props.position.getCollateralUsd();

    // if (props.position.side === Side.Buy) {
    //   netValue = props.position.size * props.position.entryPrice;
    // } else {
    //   netValue = props.position.size * props.position.entryPrice * -1;
    // }

    // console.log("net value", collateral, pnl, collateral + pnl);
    return Number(props.position.getCollateralUsd()) + props.pnl;
  }

  return (
    <div className={twMerge("flex", "items-center", "py-5", props.className)}>
      <PositionColumn num={1}>
        <div
          className={twMerge(
            "gap-x-2",
            "grid-cols-[32px,minmax(0,1fr)]",
            "grid",
            "items-center",
            "overflow-hidden",
            "pl-3"
          )}
        >
          {cloneElement(tokenIcon, {
            className: twMerge(
              tokenIcon.props.className,
              "flex-shrink-0",
              "h-8",
              "w-8"
            ),
          })}
          <div className="pr-2">
            <div className="font-bold text-white">{props.position.token}</div>
            <div className="mt-0.5 truncate text-sm font-medium text-zinc-500">
              {getTokenLabel(props.position.token)}
            </div>
          </div>
        </div>
      </PositionColumn>
      <PositionColumn num={2}>
        <div className="text-sm text-white">
          {props.position.getLeverage()}x
        </div>
        <div
          className={twMerge(
            "flex",
            "items-center",
            "mt-1",
            "space-x-1",
            props.position.side === Side.Long
              ? "text-emerald-400"
              : "text-rose-400"
          )}
        >
          {props.position.side === Side.Long ? (
            <GrowthIcon className="h-3 w-3 fill-current" />
          ) : (
            <GrowthIcon className="h-3 w-3 -scale-y-100 fill-current" />
          )}
          <div className="text-sm">
            {props.position.side === Side.Long ? "Long" : "Short"}
          </div>
        </div>
      </PositionColumn>
      <PositionColumn num={3}>
        <div className="text-sm text-white">
          ${formatNumberCommas(getNetValue())}
        </div>
        {/* <PositionValueDelta
          className="mt-0.5"
          valueDelta={props.position.valueDelta}
          valueDeltaPercentage={props.position.valueDeltaPercentage}
        /> */}
      </PositionColumn>
      <PositionColumn num={4}>
        <div className="flex items-center">
          <div className="text-sm text-white">
            ${formatNumberCommas(props.position.getCollateralUsd())}
          </div>
          <button className="group ml-2">
            <EditIcon
              className={twMerge(
                "fill-zinc-500",
                "h-4",
                "transition-colors",
                "w-4",
                "group-hover:fill-white"
              )}
            />
          </button>
        </div>
      </PositionColumn>
      <PositionColumn num={5}>
        <div className="text-sm text-white">
          ${formatNumberCommas(props.position.getPrice())}
        </div>
      </PositionColumn>
      <PositionColumn num={6}>
        <div className="text-sm text-white">
          ${stats != undefined ? formatNumberCommas(stats.currentPrice) : 0}
        </div>
      </PositionColumn>
      <PositionColumn num={7}>
        <div className="flex items-center justify-between pr-2">
          <div className="text-sm text-white">
            ${formatNumberCommas(props.liqPrice)}
          </div>
          <div className="flex items-center space-x-2">
            <a
              target="_blank"
              rel="noreferrer"
              href={`${ACCOUNT_URL(props.position.address.toString())}`}
            >
              <NewTab className="fill-white" />
            </a>
            <button
              className={twMerge(
                "bg-zinc-900",
                "grid",
                "h-6",
                "place-items-center",
                "rounded-full",
                "transition-all",
                "w-6",
                "hover:bg-zinc-700",
                props.expanded && "-rotate-180"
              )}
              onClick={() => props.onClickExpand?.()}
            >
              <ChevronDownIcon className="h-4 w-4 fill-white" />
            </button>
          </div>
        </div>
      </PositionColumn>
    </div>
  );
}
