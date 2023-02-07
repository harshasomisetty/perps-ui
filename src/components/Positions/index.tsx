import { twMerge } from "tailwind-merge";

import { usePositions } from "@/hooks/usePositions";

import { LoadingDots } from "../LoadingDots";
import { SinglePosition } from "./SinglePosition";
import { PositionColumn } from "./PositionColumn";
import { PoolTokens } from "../PoolTokens";
import { useWallet } from "@solana/wallet-adapter-react";

interface Props {
  className?: string;
}

export function Positions(props: Props) {
  const { wallet } = useWallet();
  const positions = usePositions(wallet);

  console.log("componenets positions", positions);

  return (
    <div className={props.className}>
      <header className="mb-5 flex items-center space-x-4">
        <div className="font-medium text-white">My Positions</div>
        {positions.status === "pending" && (
          <LoadingDots className="text-white" />
        )}
      </header>
      {positions.status === "success" &&
        positions.data.map((pool) => (
          <div className="mb-4" key={pool.id}>
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
                  <PoolTokens tokens={pool.tokens} />
                  <div className="ml-1 text-sm font-medium text-white">
                    {pool.name}
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
            {pool.positions.map((position, i) => (
              <SinglePosition
                className={twMerge(
                  "border-zinc-700",
                  i < pool.positions.length - 1 && "border-b"
                )}
                position={position}
                key={position.id}
              />
            ))}
          </div>
        ))}
    </div>
  );
}
