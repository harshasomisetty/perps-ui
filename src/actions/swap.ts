import { getTokenAddress, TokenE } from "src/types/Token";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  PERPETUALS_PROGRAM_ID,
  TRANSFER_AUTHORITY,
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
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export async function swap(
  pool: Pool,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction,
  connection: Connection,
  receivingToken: TokenE,
  dispensingToken: TokenE,
  amountIn: BN,
  minAmountOut: BN
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  console.log(
    "inputs",
    Number(amountIn),
    Number(minAmountOut),
    receivingToken,
    dispensingToken
  );

  console.log("pool", pool);

  let receivingTokenAccount = await getAssociatedTokenAddress(
    pool.tokens[getTokenAddress(receivingToken)]!.mintAccount,
    publicKey
  );

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    pool.tokens[getTokenAddress(dispensingToken)]!.mintAccount,
    publicKey
  );

  console.log("tokens", dispensingToken, receivingToken);

  let transaction = new Transaction();

  try {
    if (!(await checkIfAccountExists(receivingTokenAccount, connection))) {
      transaction = transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          receivingTokenAccount,
          publicKey,
          pool.tokens[getTokenAddress(receivingToken)]!.mintAccount
        )
      );
    }

    const params: any = {
      amountIn,
      minAmountOut,
    };
    let tx = await perpetual_program.methods
      .swap(params)
      .accounts({
        owner: publicKey,
        fundingAccount: userCustodyTokenAccount,
        receivingAccount: receivingTokenAccount,
        transferAuthority: TRANSFER_AUTHORITY,
        perpetuals: PERPETUALS_ADDRESS,
        pool: pool.poolAddress,
        receivingCustody:
          pool.tokens[getTokenAddress(dispensingToken)]?.custodyAccount,
        receivingCustodyOracleAccount:
          pool.tokens[getTokenAddress(dispensingToken)]?.oracleAccount,
        receivingCustodyTokenAccount:
          pool.tokens[getTokenAddress(dispensingToken)]?.tokenAccount,
        dispensingCustody:
          pool.tokens[getTokenAddress(receivingToken)]?.custodyAccount,
        dispensingCustodyOracleAccount:
          pool.tokens[getTokenAddress(receivingToken)]?.oracleAccount,
        dispensingCustodyTokenAccount:
          pool.tokens[getTokenAddress(receivingToken)]?.tokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();
    transaction = transaction.add(tx);

    console.log("open position tx", transaction);
    console.log("tx keys");
    for (let i = 0; i < transaction.instructions[0]!.keys.length; i++) {
      console.log(
        "key",
        i,
        transaction.instructions[0]!.keys[i]?.pubkey.toString()
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
