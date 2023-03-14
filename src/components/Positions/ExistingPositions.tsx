import { twMerge } from "tailwind-merge";
import { useGlobalStore } from "@/stores/store";
import { countDictList, getPoolSortedPositions } from "@/utils/organizers";
import { PublicKey } from "@solana/web3.js";
import { NoPositions } from "@/components/Positions/NoPositions";
import PoolPositionHeader from "@/components/Positions/PoolPositionHeader";
import PoolPositionRow from "@/components/Positions/PoolPositionRow";

interface Props {
  className?: string;
  publicKey?: PublicKey;
}

export function ExistingPositions(props: Props) {
  const positionData = useGlobalStore((state) => state.positionData);

  let positions;

  if (props.publicKey) {
    positions = getPoolSortedPositions(positionData, props.publicKey);
  } else {
    positions = getPoolSortedPositions(positionData);
  }

  if (countDictList(positions) === 0) {
    return <NoPositions emptyString="No Open Positions" />;
  }

  return (
    <>
      {Object.entries(positions).map(([pool, positions]) => (
        <div className="mb-4" key={pool}>
          <p>test</p>
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
            <PoolPositionHeader positions={positions} />
          </div>
          {positions.map((position, index) => (
            // eslint-disable-next-line react/jsx-no-undef
            <PoolPositionRow
              className={twMerge(
                "border-zinc-700",
                index < positions.length - 1 && "border-b"
              )}
              position={position}
              key={index}
            />
          ))}
        </div>
      ))}
    </>
  );
}
