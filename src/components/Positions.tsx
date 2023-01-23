import { twMerge } from "tailwind-merge";

import { usePositions } from "@/hooks/usePositions";

import { LoadingDots } from "./LoadingDots";
import { Position } from "./Position";
import { PositionColumn } from "./PositionColumn";

interface Props {
  className?: string;
}

export function Positions(props: Props) {
  const positions = usePositions();

  return (
    <div className={props.className}>
      <header className="mb-5 flex items-center space-x-4">
        <div className="font-medium text-white">My Positions</div>
        {positions.status === "pending" && (
          <LoadingDots className="text-white" />
        )}
      </header>
      {positions.status === "success" && (
        <>
          {/* We cannot use a real grid layout here since we have nested grids.
              Instead, we're going to fake a grid by assinging column widths to
              percentages. */}
          <div
            className={twMerge(
              "border-b",
              "border-zinc-700",
              "flex",
              "items-center",
              "pb-3",
              "text-xs",
              "text-zinc-500"
            )}
          >
            <PositionColumn num={1}>Position</PositionColumn>
            <PositionColumn num={2}>Leverage</PositionColumn>
            <PositionColumn num={3}>Net Value</PositionColumn>
            <PositionColumn num={4}>Collateral</PositionColumn>
            <PositionColumn num={5}>Entry Price</PositionColumn>
            <PositionColumn num={6}>Mark Price</PositionColumn>
            <PositionColumn num={7}>Liq. Price</PositionColumn>
          </div>
          {positions.data.map((position) => (
            <Position position={position} key={position.id} />
          ))}
        </>
      )}
    </div>
  );
}
