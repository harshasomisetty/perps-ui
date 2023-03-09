import { LoadingSpinner } from "@/components/Icons/LoadingSpinner";
import { ExistingPosition } from "@/components/Positions/ExistingPosition";
import { NoPositions } from "@/components/Positions/NoPositions";
import { useGlobalStore } from "@/stores/store";
import { getPoolSortedPositions } from "@/utils/organizers";

interface Props {
  className?: string;
}

export default function Admin(props: Props) {
  const positionData = useGlobalStore((state) => state.positionData);
  const positions = getPoolSortedPositions(positionData);

  return (
    <div className={props.className}>
      <header className="mb-5 flex items-center space-x-4">
        <div className="font-medium text-white">All Positions</div>
        {positionData.status === "pending" && (
          <LoadingSpinner className="text-4xl" />
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
