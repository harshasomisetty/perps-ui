import { LoadingDots } from "../LoadingDots";
import { useWallet } from "@solana/wallet-adapter-react";
import { ExistingPosition } from "./ExistingPosition";
import { NoPositions } from "./NoPositions";
import { useGlobalStore } from "@/stores/store";
import { getPoolSortedPositions } from "@/utils/organizers";
import { LoadingSpinner } from "../Icons/LoadingSpinner";

interface Props {
  className?: string;
}

export function Positions(props: Props) {
  const { publicKey } = useWallet();

  const positionData = useGlobalStore((state) => state.positionData);

  if (positionData.status === "pending") {
    return <LoadingSpinner className="text-4xl" />;
  }

  const positions = getPoolSortedPositions(positionData, publicKey!);

  if (!publicKey) {
    return (
      <div className={props.className}>
        <header className="mb-5 flex items-center space-x-4">
          <div className="font-medium text-white">My Positions</div>
        </header>

        <NoPositions emptyString="No Open Positions" />
      </div>
    );
  }

  return (
    <div className={props.className}>
      <header className="mb-5 flex items-center space-x-4">
        <div className="font-medium text-white">My Positions</div>
        {positionData.status === "pending" && (
          <LoadingDots className="text-white" />
        )}
      </header>
      {positionData.status === "success" &&
        Object.entries(positions).map(([pool, positions]) => {
          return <ExistingPosition positions={positions} key={pool} />;
        })}

      {positionData.status != "success" ||
        (Object.values(positionData.data).length === 0 && (
          <NoPositions emptyString="No Open Positions" />
        ))}
    </div>
  );
}
