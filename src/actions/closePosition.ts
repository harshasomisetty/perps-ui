import { CustodyAccount } from "@/lib/CustodyAccount";
import { PoolAccount } from "@/lib/PoolAccount";
import { PositionAccount } from "@/lib/PositionAccount";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { manualSendTransaction } from "@/utils/dispatchTransaction";
import { BN, Wallet } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export async function closePosition(
  pool: PoolAccount,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps["signAllTransactions"],
  connection: Connection,
  position: PositionAccount,
  custody: CustodyAccount,
  price: BN
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  // TODO: need to take slippage as param , this is now for testing
  const adjustedPrice =
    position.side.toString() == "Long"
      ? price.mul(new BN(50)).div(new BN(100))
      : price.mul(new BN(150)).div(new BN(100));

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    custody.mint,
    publicKey
  );

  let transaction = new Transaction();

  try {
    let tx = await perpetual_program.methods
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
      })
      .transaction();
    transaction = transaction.add(tx);

    await manualSendTransaction(
      transaction,
      publicKey,
      connection,
      signTransaction
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
}
