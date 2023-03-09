import { PositionAccount } from "@/lib/PositionAccount";
import { PublicKey } from "@solana/web3.js";

export function getPoolSortedPositions(
  positions: Record<string, PositionAccount>,
  user?: PublicKey
) {
  let sortedPositions: Record<string, PositionAccount[]> = {};

  console.log("positions in getPoolSortedPositions", positions);

  Object.values(positions).forEach((position: PositionAccount) => {
    if (user && position.owner.toBase58() !== user.toBase58()) {
      return;
    }

    let pool = position.pool.toString();

    if (!sortedPositions[pool]) {
      sortedPositions[pool] = [];
    }

    sortedPositions[pool].push(position);
  });

  return sortedPositions;
}
