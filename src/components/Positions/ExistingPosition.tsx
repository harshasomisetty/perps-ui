import { PositionPool } from "@/lib/Position";
import { twMerge } from "tailwind-merge";
import { PoolTokens } from "../PoolTokens";
import { PositionColumn } from "./PositionColumn";
import { SinglePosition } from "./SinglePosition";

interface Props {
  className?: string;
  pool: PositionPool;
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
        <PositionColumn num={1}>
          <div className="flex max-w-fit items-center rounded-t bg-zinc-800 py-1.5 px-2">
            <PoolTokens tokens={props.pool.tokens} />
            <div className="ml-1 text-sm font-medium text-white">
              {props.pool.name}
            </div>
          </div>
        </PositionColumn>
        <PositionColumn num={2}>Leverage</PositionColumn>
        <PositionColumn num={3}>Net Value</PositionColumn>
        <PositionColumn num={4}>Collateral</PositionColumn>
        <PositionColumn num={5}>Entry Price</PositionColumn>
        <PositionColumn num={6}>Mark Price</PositionColumn>
        <PositionColumn num={7}>Liq. Price</PositionColumn>
      </div>
      {props.pool.positions.map((position, i) => (
        <SinglePosition
          className={twMerge(
            "border-zinc-700",
            i < props.pool.positions.length - 1 && "border-b"
          )}
          position={position}
          key={position.id}
        />
      ))}
    </div>
  );
}
