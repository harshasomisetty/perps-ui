import { usePositions } from "@/hooks/usePositions";

import { LoadingDots } from "../LoadingDots";
import { useWallet } from "@solana/wallet-adapter-react";
import { ExistingPosition } from "./ExistingPosition";
import { NoPositions } from "./NoPositions";

interface Props {
  className?: string;
}

export function Positions(props: Props) {
  const { positions } = usePositions();

  return (
    <div className={props.className}>
      <header className="mb-5 flex items-center space-x-4">
        <div className="font-medium text-white">My Positions</div>
        {positions.status === "pending" && (
          <LoadingDots className="text-white" />
        )}
      </header>
      {positions.status === "success" &&
        positions.data.map((pool, index) => (
          <ExistingPosition poolPositions={pool} key={index} />
        ))}

      {positions.status != "success" && <NoPositions />}
    </div>
  );
}
