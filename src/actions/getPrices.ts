import { Pool } from "@/lib/Pool";
import { getTokenAddress, Token } from "@/lib/Token";
import {
  getPerpetualProgramAndProvider,
  perpetualsAddress,
} from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { Wallet } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export async function getEntryPrice(
  pool: Pool,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps["signAllTransactions"],
  connection: Connection,
  payToken: Token,
  tokenAmount?: number,
  liquidityAmount?: number
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  let lpTokenAccount = await getAssociatedTokenAddress(
    pool.lpTokenMint,
    publicKey
  );

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    pool.tokens[getTokenAddress(payToken)]?.mintAccount!,
    publicKey
  );

  let transaction = new Transaction();

  try {
    let getEntryPriceTx = await perpetual_program.methods
      .getEntryPriceAndFee({
        size,
        side: side === "long" ? { long: {} } : { short: {} },
      })
      .accounts({
        signer: wallet.publicKey,
        perpetuals: perpetualsAddress,
        pool: pool.publicKey,
        custody: pool.tokens[getTokenAddress(payToken)]?.custodyAccount,
        custodyOracleAccount:
          pool.tokens[getTokenAddress(payToken)]?.oracleAccount,
      })
      .transaction();

    transaction = transaction.add(getEntryPriceTx);

    if (transaction.instructions.length > 0) {
      for (let i = 0; i < transaction.instructions[0]!.keys.length; i++) {
        console.log(
          "key",
          i,
          transaction.instructions[0]!.keys[i]?.pubkey.toString()
        );
      }
    }
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
