import { LoadingSpinner } from "@/components/Icons/LoadingSpinner";
import { ExistingPositions } from "@/components/Positions/ExistingPositions";
import { NoPositions } from "@/components/Positions/NoPositions";
import { useGlobalStore } from "@/stores/store";
import { countDictList, getPoolSortedPositions } from "@/utils/organizers";

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
      <ExistingPositions />
    </div>
  );
}
