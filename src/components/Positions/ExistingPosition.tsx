import { PoolPositions } from "@/lib/Position";
import { twMerge } from "tailwind-merge";
import { PoolTokens } from "../PoolTokens";
import PoolPositionHeader from "./PoolPositionHeader";
import { PositionColumn } from "./PositionColumn";
import { SinglePosition as PoolPositionRow } from "./PoolPositionRow";
import { PositionAccount } from "@/lib/PositionAccount";

interface Props {
  className?: string;
  positions: PositionAccount[];
}

export function ExistingPosition(props: Props) {
  console.log("existingPositoins", props);
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
        <PoolPositionHeader positions={props.positions} />
      </div>
      {props.positions.map((position, index) => (
        <PoolPositionRow
          className={twMerge(
            "border-zinc-700",
            index < props.positions.length - 1 && "border-b"
          )}
          position={position}
          key={index}
        />
      ))}
    </div>
  );
}
