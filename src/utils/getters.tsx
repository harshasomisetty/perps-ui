import { PoolAccount } from "@/lib/PoolAccount";

export function getLiquidityBalance(
  pool: PoolAccount,
  userLpTokens: Record<string, number>,
  stats: Record<string, any>
): number {
  let userLpBalance = userLpTokens[pool.poolAddress.toString()];
  let lpSupply = Number(pool.lpSupply) / 10 ** pool.lpDecimals;
  let userLiquidity = (userLpBalance / lpSupply) * pool.getLiquidities(stats);

  if (Number.isNaN(userLiquidity)) {
    return 0;
  }

  return userLiquidity;
}

export function getLiquidityShare(
  pool: PoolAccount,
  userLpTokens: Record<string, number>
): number {
  let userLpBalance = userLpTokens[pool.poolAddress.toString()];
  let lpSupply = Number(pool.lpSupply) / 10 ** pool.lpDecimals;

  let userShare = (userLpBalance / lpSupply) * 100;

  if (Number.isNaN(userShare)) {
    return 0;
  }
  return userShare;
}
