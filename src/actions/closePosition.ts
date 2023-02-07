import { Pool } from "@/lib/Pool";
import { getTokenAddress, Token } from "@/lib/Token";
import {
  getPerpetualProgramAndProvider,
  perpetualsAddress,
  PERPETUALS_PROGRAM_ID,
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
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export async function closePosition(
  pool: Pool,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction,
  connection: Connection,
  payToken: Token,
  positionToken: Token,
  price: BN
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  console.log("pool", pool);

  let lpTokenAccount = await getAssociatedTokenAddress(
    pool.lpTokenMint,
    publicKey
  );

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    pool.tokens[getTokenAddress(payToken)]?.mintAccount,
    publicKey
  );

  console.log("tokens", payToken, positionToken);
  let positionAccount = findProgramAddressSync(
    [
      "position",
      publicKey.toBuffer(),
      pool.poolAddress.toBuffer(),
      pool.tokens[getTokenAddress(payToken)]?.custodyAccount.toBuffer(),
      [1],
    ],
    perpetual_program.programId
  )[0];

  //   console.log(
  //     "left and right",
  //     positionAccount.toString(),
  //     "ALxjVHPdhi7LCoVc2CUbVvPFmnWWCcnNcNAQ4emPg2tz"
  //   );

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

    console.log("position account", positionAccount.toString());

    let tx = await perpetual_program.methods
      .closePosition({
        price,
      })
      .accounts({
        owner: publicKey,
        receivingAccount: userCustodyTokenAccount,
        transferAuthority: transferAuthorityAddress,
        perpetuals: perpetualsAddress,
        pool: pool.poolAddress,
        position: positionAccount,
        custody: pool.tokens[getTokenAddress(payToken)]?.custodyAccount,
        custodyOracleAccount:
          pool.tokens[getTokenAddress(payToken)]?.oracleAccount,
        custodyTokenAccount:
          pool.tokens[getTokenAddress(payToken)]?.tokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();
    transaction = transaction.add(tx);

    console.log("close position tx", transaction);
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
