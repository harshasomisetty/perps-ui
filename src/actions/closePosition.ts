import { Pool, PoolObj } from "@/lib/Pool";
import { Side } from "@/lib/Position";
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
  pool: PoolObj,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction,
  connection: Connection,
  payToken: Token,
  positionToken: Token,
  positionAccountAddress: String,
  side: Side,
  price: BN
) {
  console.log("in close postion");
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  console.log("pool", pool);
  console.log("side:", side);

  // TODO: need to take slippage as param , this is now for testing
  console.log("side", side.toString());
  const adjustedPrice =
    side.toString() == "Long"
      ? price.mul(new BN(50)).div(new BN(100))
      : price.mul(new BN(150)).div(new BN(100));
  console.log(
    "price, adjustedPrice, apiPrice:",
    price.toString(),
    adjustedPrice.toString(),
    price.toString()
  );

  // let lpTokenAccount = await getAssociatedTokenAddress(
  //   pool.lpTokenMint,
  //   publicKey
  // );

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    pool.tokens[getTokenAddress(payToken)]!.mintAccount,
    publicKey
  );
  console.log("tokens", payToken, positionToken);

  // let positionAccount = findProgramAddressSync(
  //   [
  //     "position",
  //     publicKey.toBuffer(),
  //     pool.poolAddress.toBuffer(),
  //     pool.tokens[getTokenAddress(payToken)]?.custodyAccount.toBuffer(),
  //     side == 'Long' ? [1] : [2],
  //   ],
  //   perpetual_program.programId
  // )[0];

  //   console.log(
  //     "left and right",
  //     positionAccount.toString(),
  //     "ALxjVHPdhi7LCoVc2CUbVvPFmnWWCcnNcNAQ4emPg2tz"
  //   );

  let transaction = new Transaction();

  try {
    const positionAccount = new PublicKey(positionAccountAddress);

    console.log("position account", positionAccount.toString());

    let tx = await perpetual_program.methods
      .closePosition({
        price: adjustedPrice,
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
    // for (let i = 0; i < transaction.instructions[0]!.keys.length; i++) {
    //   console.log(
    //     "key",
    //     i,
    //     transaction.instructions[0]!.keys[i]?.pubkey.toString()
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
