import { getTokenAddress, Token } from "@/lib/Token";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export async function checkIfAccountExists(
  account: PublicKey,
  connection: Connection
): Promise<boolean> {
  // console.log("connection print", connection);
  let bal = await connection.getBalance(account);
  if (bal > 0) {
    return true;
  } else {
    return false;
  }
}

export async function fetchTokenBalance(
  payToken: Token,
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
      .uiAmount;
  }

  let solBalance = (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL;

  if (payToken === Token.SOL) {
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
    return balance.value.uiAmount;
  }
}
