import { Pool } from "@/lib/Pool";
import { getTokenAddress, Token } from "@/lib/Token";
import {
  getPerpetualProgramAndProvider,
  perpetualsAddress,
  transferAuthorityAddress,
} from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { checkIfAccountExists } from "@/utils/retrieveData";
import { BN, Wallet } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { PERPETUALS_PROGRAM_ID } from "@/utils/constants";

export async function addLiquidity(
  pool: Pool,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction,
  connection: Connection,
  payToken: Token,
  amount: number
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  let tempAmount = new BN(1 * LAMPORTS_PER_SOL);

  let lpTokenAccount = await getAssociatedTokenAddress(
    pool.lpTokenMint,
    publicKey
  );

  let fundingAccount = await getAssociatedTokenAddress(
    pool.tokens[getTokenAddress(payToken)]?.mintAccount,
    publicKey
  );

  let transaction = new Transaction();

  try {
    if (!(await checkIfAccountExists(lpTokenAccount, connection))) {
      transaction = transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          lpTokenAccount,
          publicKey,
          pool.lpTokenMint
        )
      );
    }

    let addLiquidityTx = await perpetual_program.methods
      .addLiquidity({ amount: tempAmount })
      .accounts({
        owner: publicKey,
        fundingAccount, // user token account for custody token account
        lpTokenAccount,
        transferAuthority: transferAuthorityAddress,
        perpetuals: perpetualsAddress,
        pool: pool.poolAddress,
        custody: pool.tokens[getTokenAddress(payToken)]?.custodyAccount,
        custodyOracleAccount:
          pool.tokens[getTokenAddress(payToken)]?.oracleAccount,
        custodyTokenAccount:
          pool.tokens[getTokenAddress(payToken)]?.tokenAccount,
        lpTokenMint: pool.lpTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts(pool.custodyMetas)
      .transaction();

    transaction = transaction.add(addLiquidityTx);

    // console.log("add liquidity tx", transaction);
    // console.log("tx keys");
    // for (let i = 0; i < transaction.instructions[0].keys.length; i++) {
    //   console.log(
    //     "key",
    //     i,
    //     transaction.instructions[0].keys[i]?.pubkey.toString()
    //   );
    // }

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
