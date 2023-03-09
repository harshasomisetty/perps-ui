import { PoolAccount } from "@/lib/PoolAccount";
import { getTokenAddress, TokenE } from "@/lib/Token";
import { getAssociatedTokenAddress, Mint } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export async function checkIfAccountExists(
  account: PublicKey,
  connection: Connection
): Promise<boolean> {
  let bal = await connection.getBalance(account);
  if (bal > 0) {
    return true;
  } else {
    return false;
  }
}

export async function fetchTokenBalance(
  payToken: TokenE,
  publicKey: PublicKey,
  connection: Connection
): Promise<number> {
  let tokenATA = await getAssociatedTokenAddress(
    new PublicKey(getTokenAddress(payToken)),
    publicKey
  );
  let balance = 0;

  if (await checkIfAccountExists(tokenATA, connection)) {
    balance = (await connection.getTokenAccountBalance(tokenATA)).value
      .uiAmount!;
  }

  let solBalance = (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL;

  if (payToken === TokenE.SOL) {
    return balance + solBalance;
  }
  return balance;
}

export async function fetchLPBalance(
  address: PublicKey,
  publicKey: PublicKey,
  connection: Connection
): Promise<number> {
  let lpTokenAccount = await getAssociatedTokenAddress(address, publicKey);
  if (!(await checkIfAccountExists(lpTokenAccount, connection))) {
    return 0;
  } else {
    let balance = await connection.getTokenAccountBalance(lpTokenAccount);
    return balance.value.uiAmount!;
  }
}

export function getLiquidityBalance(
  pool: PoolAccount,
  userLpTokens: Record<string, number>,
  stats: Record<string, any>
): number {
  let userLpBalance = userLpTokens[pool.address.toString()];
  let lpSupply = Number(pool.lpData.supply) / 10 ** pool.lpData.decimals;
  let userLiquidity = (userLpBalance! / lpSupply) * pool.getLiquidities(stats)!;

  if (Number.isNaN(userLiquidity)) {
    return 0;
  }

  return userLiquidity;
}

export function getLiquidityShare(
  pool: PoolAccount,
  userLpTokens: Record<string, number>
): number {
  let userLpBalance = userLpTokens[pool.address.toString()];
  let lpSupply = Number(pool.lpData.supply) / 10 ** pool.lpData.decimals;

  let userShare = (userLpBalance! / lpSupply) * 100;

  if (Number.isNaN(userShare)) {
    return 0;
  }
  return userShare;
}
