import { PositionRequest } from "@/hooks/storeHelpers/fetchPositions";
import { PositionAccount } from "@/lib/PositionAccount";
import { PublicKey } from "@solana/web3.js";

export function getPoolSortedPositions(
  positionData: PositionRequest,
  user?: PublicKey
) {
  let sortedPositions: Record<string, PositionAccount[]> = {};

  if (
    positionData.status === "success" &&
    Object.values(positionData.data).length > 0
  ) {
    Object.values(positionData.data).forEach((position: PositionAccount) => {
      console.log("in loop", position);
      if (user && position.owner.toBase58() !== user.toBase58()) {
        return;
      }

      let pool = position.pool.toString();

      if (!sortedPositions[pool]) {
        sortedPositions[pool] = [];
      }

      sortedPositions[pool].push(position);
    });
  }

  return sortedPositions;
}
