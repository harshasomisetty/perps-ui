import { twMerge } from "tailwind-merge";
import { cloneElement } from "react";
import GrowthIcon from "@carbon/icons-react/lib/Growth";
import EditIcon from "@carbon/icons-react/lib/Edit";
import ChevronDownIcon from "@carbon/icons-react/lib/ChevronDown";

import { getTokenIcon, getTokenLabel } from "@/lib/Token";
import { PositionColumn } from "./PositionColumn";
import { PositionValueDelta } from "./PositionValueDelta";
import { Position } from "@/lib/Position";

function formatPrice(num: number) {
  const formatter = new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

interface Props {
  className?: string;
  expanded?: boolean;
  position: Position;
  onClickExpand?(): void;
}

export function PositionInfo(props: Props) {
  const tokenIcon = getTokenIcon(props.position.token);

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
        <div className="text-sm text-white">{props.position.leverage}x</div>
        <div
          className={twMerge(
            "flex",
            "items-center",
            "mt-1",
            "space-x-1",
            props.position.type === "Long"
              ? "text-emerald-400"
              : "text-rose-400"
          )}
        >
          {props.position.type === "Long" ? (
            <GrowthIcon className="h-3 w-3 fill-current" />
          ) : (
            <GrowthIcon className="h-3 w-3 -scale-y-100 fill-current" />
          )}
          <div className="text-sm">
            {props.position.type === "Long" ? "Long" : "Short"}
          </div>
        </div>
      </PositionColumn>
      <PositionColumn num={3}>
        <div className="text-sm text-white">
          ${formatPrice(props.position.value)}
        </div>
        <PositionValueDelta
          className="mt-0.5"
          valueDelta={props.position.valueDelta}
          valueDeltaPercentage={props.position.valueDeltaPercentage}
        />
      </PositionColumn>
      <PositionColumn num={4}>
        <div className="flex items-center">
          <div className="text-sm text-white">
            ${formatPrice(props.position.collateral)}
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
          ${formatPrice(props.position.entryPrice)}
        </div>
      </PositionColumn>
      <PositionColumn num={6}>
        <div className="text-sm text-white">
          ${formatPrice(props.position.markPrice)}
        </div>
      </PositionColumn>
      <PositionColumn num={7}>
        <div className="flex items-center justify-between pr-2">
          <div className="text-sm text-white">
            ${formatPrice(props.position.liquidationPrice)}
          </div>
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
      </PositionColumn>
    </div>
  );
}
