import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import CloseIcon from "@carbon/icons-react/lib/Close";
import OverflowMenuHorizontalIcon from "@carbon/icons-react/lib/OverflowMenuHorizontal";
import EditIcon from "@carbon/icons-react/lib/Edit";

import { Position } from "@/hooks/usePositions";
import { SolidButton } from "./SolidButton";
import { PositionColumn } from "./PositionColumn";
import { PositionValueDelta } from "./PositionValueDelta";

function formatPrice(num: number) {
  const formatter = new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

interface Props {
  className?: string;
  position: Position;
}

export function PositionAdditionalInfo(props: Props) {
  return (
    <div
      className={twMerge(
        "bg-zinc-900",
        "overflow-hidden",
        "flex",
        "items-center",
        props.className
      )}
    >
      <PositionColumn num={1}>
        <div />
      </PositionColumn>
      <PositionColumn num={2}>
        <div className="text-xs text-zinc-500">Time</div>
        <div className="mt-1 text-sm text-white">
          {format(props.position.timestamp, "p")}
        </div>
      </PositionColumn>
      <PositionColumn num={3}>
        <div className="text-xs text-zinc-500">PnL</div>
        <PositionValueDelta
          className="mt-0.5"
          valueDelta={props.position.pnlDelta}
          valueDeltaPercentage={props.position.pnlDeltaPercent}
          formatValueDelta={formatPrice}
        />
      </PositionColumn>
      <PositionColumn num={4}>
        <div className="text-xs text-zinc-500">Size</div>
        <div className="mt-1 flex items-center">
          <div className="text-sm text-white">
            ${formatPrice(props.position.size)}
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
        <div className="text-xs text-zinc-500">Liq. Threshold</div>
        <div className="mt-1 text-sm text-white">
          ${formatPrice(props.position.liquidationThreshold)}
        </div>
      </PositionColumn>
      <div
        className="flex items-center justify-end pr-2"
        style={{ width: "32%" }}
      >
        <SolidButton className="h-9 w-36">
          <CloseIcon className="mr-2 h-4 w-4" />
          <div>Close Position</div>
        </SolidButton>
        <button
          className={twMerge(
            "bg-zinc-900",
            "grid",
            "h-6",
            "ml-4",
            "place-items-center",
            "rounded-full",
            "transition-all",
            "w-6",
            "hover:bg-zinc-700"
          )}
        >
          <OverflowMenuHorizontalIcon className="h-4 w-4 fill-white" />
        </button>
      </div>
    </div>
  );
}
