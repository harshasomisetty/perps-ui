import { CustodyAccount } from "@/lib/CustodyAccount";
import { PoolAccount } from "@/lib/PoolAccount";
import { PositionAccount } from "@/lib/PositionAccount";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { automaticSendTransaction } from "@/utils/dispatchTransaction";
import { BN } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

export async function closePosition(
  walletContextState: WalletContextState,
  connection: Connection,
  pool: PoolAccount,
  position: PositionAccount,
  custody: CustodyAccount,
  price: BN
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(
    walletContextState
  );
  let publicKey = walletContextState.publicKey!;

  // TODO: need to take slippage as param , this is now for testing
  const adjustedPrice =
    position.side.toString() == "Long"
      ? price.mul(new BN(50)).div(new BN(100))
      : price.mul(new BN(150)).div(new BN(100));

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    custody.mint,
    publicKey
  );

  let methodBuilder = await perpetual_program.methods
    .closePosition({
      price: adjustedPrice,
    })
    .accounts({
      owner: publicKey,
      receivingAccount: userCustodyTokenAccount,
      transferAuthority: TRANSFER_AUTHORITY,
      perpetuals: PERPETUALS_ADDRESS,
      pool: pool.address,
      position: position.address,
      custody: custody.address,
      custodyOracleAccount: custody.oracle.oracleAccount,
      custodyTokenAccount: custody.tokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    });

  try {
    await automaticSendTransaction(methodBuilder);
  } catch (err) {
    console.log(err);
    throw err;
  }
}
