import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { BN } from "@project-serum/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Side, TradeSide } from "@/lib/types";
import { CustodyAccount } from "@/lib/CustodyAccount";
import { PoolAccount } from "@/lib/PoolAccount";
import {
  createAtaIfNeeded,
  unwrapSolIfNeeded,
  wrapSolIfNeeded,
} from "@/utils/transactionHelpers";
import {
  automaticSendTransaction,
  manualSendTransaction,
} from "@/utils/TransactionHandlers";
import { swapTransactionBuilder } from "src/actions/swap";
import { ViewHelper } from "@/utils/viewHelpers";
import { TokenE } from "@/lib/Token";

export async function openPositionBuilder(
  walletContextState: WalletContextState,
  connection: Connection,
  pool: PoolAccount,
  payCustody: CustodyAccount,
  positionCustody: CustodyAccount,
  payAmount: number,
  positionAmount: number,
  price: number,
  side: Side
) {
  // console.log("in open position");
  let { perpetual_program, provider } = await getPerpetualProgramAndProvider(
    walletContextState
  );
  let publicKey = walletContextState.publicKey!;

  // TODO: need to take slippage as param , this is now for testing
  const newPrice =
    side.toString() == "Long"
      ? new BN((price * 10 ** 6 * 115) / 100)
      : new BN((price * 10 ** 6 * 90) / 100);

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    positionCustody.mint,
    publicKey
  );

  let positionAccount = findProgramAddressSync(
    [
      Buffer.from("position"),
      publicKey.toBuffer(),
      pool.address.toBuffer(),
      positionCustody.address.toBuffer(),
      // @ts-ignore
      side.toString() == "Long" ? [1] : [2],
    ],
    perpetual_program.programId
  )[0];

  let preInstructions: TransactionInstruction[] = [];

  // console.log("in tokens not equal open pos");

  let finalPayAmount = payAmount;

  if (payCustody.getTokenE() != positionCustody.getTokenE()) {
    console.log("first swapping in open pos");
    const View = new ViewHelper(connection, provider);
    let swapInfo = await View.getSwapAmountAndFees(
      payAmount,
      pool!,
      payCustody,
      positionCustody
    );

    let swapAmountOut =
      Number(swapInfo.amountOut) / 10 ** positionCustody.decimals;

    let swapFee = Number(swapInfo.feeOut) / 10 ** positionCustody.decimals;

    let recAmt = swapAmountOut - swapFee;

    console.log("rec amt in swap builder", recAmt, swapAmountOut, swapFee);
    // infa
    // swap needs to be returning atleast collateral + pool.fee1

    // TODO: get entry price entry and fee, add that onto the swap builder
    let getEntryPrice = await View.getEntryPriceAndFee(
      recAmt,
      positionAmount,
      side,
      pool!,
      positionCustody!
    );

    let entryFee = Number(getEntryPrice.fee) / 10 ** positionCustody.decimals;

    console.log("entry price in swap builder", entryFee);

    let { methodBuilder: swapBuilder, preInstructions: swapPreInstructions } =
      await swapTransactionBuilder(
        walletContextState,
        connection,
        pool,
        payCustody.getTokenE(),
        positionCustody.getTokenE(),
        payAmount + entryFee + swapFee,
        recAmt
      );
    console.log("make builder into instruction in openPos");

    let ix = await swapBuilder.instruction();
    preInstructions.push(...swapPreInstructions, ix);

    finalPayAmount = recAmt - entryFee;
    console.log("changing finalpayamt", finalPayAmount, payAmount);
  }

  console.log(
    "after tokens not equal :)",
    preInstructions.length,
    positionCustody.getTokenE()
  );

  console.log(
    "in sol not equal open pos",
    preInstructions.length,
    positionCustody.getTokenE() == TokenE.SOL
  );

  if (
    preInstructions.length == 0 &&
    positionCustody.getTokenE() == TokenE.SOL
  ) {
    console.log("in sol not equal open pos");
    let ataIx = await createAtaIfNeeded(
      publicKey,
      publicKey,
      positionCustody.mint,
      connection
    );

    if (ataIx) preInstructions.push(ataIx);

    let wrapInstructions = await wrapSolIfNeeded(
      publicKey,
      publicKey,
      connection,
      payAmount
    );
    if (wrapInstructions) {
      preInstructions.push(...wrapInstructions);
    }
  }

  let postInstructions: TransactionInstruction[] = [];
  let unwrapTx = await unwrapSolIfNeeded(publicKey, publicKey, connection);
  if (unwrapTx) postInstructions.push(...unwrapTx);

  const params: any = {
    price: newPrice,
    collateral: new BN(finalPayAmount * 10 ** positionCustody.decimals),
    size: new BN(positionAmount * 10 ** positionCustody.decimals),
    side: side.toString() == "Long" ? TradeSide.Long : TradeSide.Short,
  };

  console.log(
    "params in number for open postiion",
    positionAmount * 10 ** positionCustody.decimals,
    payAmount * 10 ** payCustody.decimals
  );

  let methodBuilder = perpetual_program.methods.openPosition(params).accounts({
    owner: publicKey,
    fundingAccount: userCustodyTokenAccount,
    transferAuthority: TRANSFER_AUTHORITY,
    perpetuals: PERPETUALS_ADDRESS,
    pool: pool.address,
    position: positionAccount,
    custody: positionCustody.address,
    custodyOracleAccount: positionCustody.oracle.oracleAccount,
    custodyTokenAccount: positionCustody.tokenAccount,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  if (preInstructions) {
    methodBuilder = methodBuilder.preInstructions(preInstructions);
  }

  if (
    payCustody.getTokenE() == TokenE.SOL ||
    positionCustody.getTokenE() == TokenE.SOL
  ) {
    methodBuilder = methodBuilder.postInstructions(postInstructions);
  }

  try {
    // await automaticSendTransaction(methodBuilder, connection);
    let tx = await methodBuilder.transaction();
    await manualSendTransaction(
      tx,
      publicKey,
      connection,
      walletContextState.signTransaction
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function openPosition(
  walletContextState: WalletContextState,
  connection: Connection,
  pool: PoolAccount,
  payToken: TokenE,
  positionToken: TokenE,
  payAmount: number,
  positionAmount: number,
  price: number,
  side: Side
) {
  let payCustody = pool.getCustodyAccount(payToken)!;
  let positionCustody = pool.getCustodyAccount(positionToken)!;

  await openPositionBuilder(
    walletContextState,
    connection,
    pool,
    payCustody,
    positionCustody,
    payAmount,
    positionAmount,
    price,
    side
  );
}
