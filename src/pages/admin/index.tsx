import { LoadingDots } from "@/components/LoadingDots";
import { ExistingPosition } from "@/components/Positions/ExistingPosition";
import { NoPositions } from "@/components/Positions/NoPositions";
import { usePositions } from "@/hooks/usePositions";
import { useEffect } from "react";

interface Props {
  className?: string;
}

export default function Admin(props: Props) {
  const { positions } = usePositions();

  return (
    <div className={props.className}>
      <header className="mb-5 flex items-center space-x-4">
        <div className="font-medium text-white">All Positions</div>
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
