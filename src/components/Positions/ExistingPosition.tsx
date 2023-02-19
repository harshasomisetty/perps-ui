import { PoolPositions } from "@/lib/Position";
import { twMerge } from "tailwind-merge";
import { PoolTokens } from "../PoolTokens";
import PoolPositionHeader from "./PoolPositionHeader";
import { PositionColumn } from "./PositionColumn";
import { SinglePosition as PoolPositionRow } from "./PoolPositionRow";

interface Props {
  className?: string;
  poolPositions: PoolPositions;
}

export function ExistingPosition(props: Props) {
  return (
    <div className="mb-4">
      <div
        className={twMerge(
          "border-b",
          "border-zinc-700",
          "flex",
          "items-center",
          "text-xs",
          "text-zinc-500"
        )}
      >
        {/* We cannot use a real grid layout here since we have nested grids.
                Instead, we're going to fake a grid by assinging column widths to
                percentages. */}
        <PoolPositionHeader poolPositions={props.poolPositions} />
      </div>
      {props.poolPositions.positions.map((position, index) => (
        <PoolPositionRow
          className={twMerge(
            "border-zinc-700",
            index < props.poolPositions.positions.length - 1 && "border-b"
          )}
          position={position}
          key={index}
        />
      ))}
    </div>
  );
}
