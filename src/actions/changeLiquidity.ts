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
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

export async function changeLiquidity(
  pool: Pool,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction,
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

    console.log("custodies", pool.custodyMetas);
    if (tokenAmount) {
      console.log("in add liq", tokenAmount);
      let amount;
      if (payToken === Token.SOL) {
        amount = new BN(tokenAmount * LAMPORTS_PER_SOL);
      } else {
        amount = new BN(tokenAmount * 10e5);
      }
      let addLiquidityTx = await perpetual_program.methods
        .addLiquidity({ amount })
        .accounts({
          owner: publicKey,
          fundingAccount: userCustodyTokenAccount, // user token account for custody token account
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
    } else {
      console.log("in remove liq", liquidityAmount);
      let lpAmount = new BN(liquidityAmount * 10e6);
      console.log("lpAmount", lpAmount.toString());
      let removeLiquidityTx = await perpetual_program.methods
        .removeLiquidity({ lpAmount })
        .accounts({
          owner: publicKey,
          receivingAccount: userCustodyTokenAccount, // user token account for custody token account
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
      transaction = transaction.add(removeLiquidityTx);
    }

    console.log("add liquidity tx", transaction);
    console.log("tx keys");
    for (let i = 0; i < transaction.instructions[0].keys.length; i++) {
      console.log(
        "key",
        i,
        transaction.instructions[0].keys[i]?.pubkey.toString()
      );
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
