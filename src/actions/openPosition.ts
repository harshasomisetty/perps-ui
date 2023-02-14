import { Pool } from "@/lib/Pool";
import { Side, TradeSide } from "@/lib/Position";
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
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export async function openPosition(
  pool: Pool,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction,
  connection: Connection,
  payToken: Token,
  positionToken: Token,
  payAmount: BN,
  positionAmount: BN,
  price: BN,
  side: Side
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  // TODO: need to take slippage as param , this is now for testing
  const newPrice =
    side.toString() == "Long"
      ? price.mul(new BN(115)).div(new BN(100))
      : price.mul(new BN(90)).div(new BN(100));
  console.log(
    "inputs",
    Number(payAmount),
    Number(positionAmount),
    Number(price),
    Number(newPrice),
    payToken,
    side,
    side.toString()
  );

  console.log("pool", pool);

  // let lpTokenAccount = await getAssociatedTokenAddress(
  //   pool.lpTokenMint,
  //   publicKey
  // );

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    pool.tokens[getTokenAddress(payToken)]?.mintAccount,
    publicKey
  );

  // check if usercustodytoken account exists
  if (!(await checkIfAccountExists(userCustodyTokenAccount, connection))) {
    console.log("user custody token account does not exist");
  }

  console.log("tokens", payToken, positionToken);
  let positionAccount = findProgramAddressSync(
    [
      "position",
      publicKey.toBuffer(),
      pool.poolAddress.toBuffer(),
      pool.tokens[getTokenAddress(payToken)]?.custodyAccount.toBuffer(),
      side.toString() == "Long" ? [1] : [2],
    ],
    perpetual_program.programId
  )[0];

  // console.log(
  //   "left and right",
  //   positionAccount.toString(),
  //   "ALxjVHPdhi7LCoVc2CUbVvPFmnWWCcnNcNAQ4emPg2tz"
  // );

  let transaction = new Transaction();

  try {
    // wrap sol if needed
    if (payToken == Token.SOL) {
      console.log("pay token name is sol", payToken);

      const associatedTokenAccount = await getAssociatedTokenAddress(
        NATIVE_MINT,
        publicKey
      );

      if (!(await checkIfAccountExists(associatedTokenAccount, connection))) {
        console.log("sol ata does not exist", NATIVE_MINT.toString());

        transaction = transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenAccount,
            publicKey,
            NATIVE_MINT
          )
        );
      }

      // get balance of associated token account
      console.log("sol ata exists");
      const balance = await connection.getBalance(associatedTokenAccount);
      if (balance < payAmount.toNumber()) {
        console.log("balance insufficient");
        transaction = transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: associatedTokenAccount,
            lamports: LAMPORTS_PER_SOL,
          }),
          createSyncNativeInstruction(associatedTokenAccount)
        );
      }
    }

    console.log("position account", positionAccount.toString());

    const params: any = {
      price: newPrice,
      collateral: payAmount,
      size: positionAmount,
      side: side.toString() == "Long" ? TradeSide.Long : TradeSide.Short,
    };
    let tx = await perpetual_program.methods
      .openPosition(params)
      .accounts({
        owner: publicKey,
        fundingAccount: userCustodyTokenAccount,
        transferAuthority: transferAuthorityAddress,
        perpetuals: perpetualsAddress,
        pool: pool.poolAddress,
        position: positionAccount,
        custody: pool.tokens[getTokenAddress(payToken)]?.custodyAccount,
        custodyOracleAccount:
          pool.tokens[getTokenAddress(payToken)]?.oracleAccount,
        custodyTokenAccount:
          pool.tokens[getTokenAddress(payToken)]?.tokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();
    transaction = transaction.add(tx);

    console.log("open position tx", transaction);
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
