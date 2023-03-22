import { TokenE } from "@/lib/Token";
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
import { createAtaIfNeeded, wrapSolIfNeeded } from "@/utils/transactionHelpers";
import {
  automaticSendTransaction,
  manualSendTransaction,
} from "@/utils/TransactionHandlers";
import { swapTransactionBuilder } from "src/actions/swap";

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
  let { perpetual_program } = await getPerpetualProgramAndProvider(
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

  const dispensingCustody = pool.getCustodyAccount(
    positionCustody.getTokenE()
  )!;
  let preInstructions: TransactionInstruction[] = [];

  // console.log("in tokens not equal open pos");
  if (payCustody.getTokenE() != positionCustody.getTokenE()) {
    console.log("first swapping in open pos");
    let { methodBuilder: swapBuilder, preInstructions: swapPreInstructions } =
      await swapTransactionBuilder(
        walletContextState,
        connection,
        pool,
        payCustody.getTokenE(),
        positionCustody.getTokenE(),
        payAmount
      );
    // TODO calculate how much position token value is new payAmount
    // TODO open position using new payAmount
    console.log("make builder into instruction in openPos");

    let ix = await swapBuilder.instruction();
    preInstructions.push(...swapPreInstructions, ix);
  }

  console.log("after tokens not equal :)");

  if (positionCustody.getTokenE() == TokenE.SOL) {
    console.log("wrapping sol if needed");
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

  const params: any = {
    price: newPrice,
    collateral: new BN(payAmount * 10 ** payCustody.decimals),
    size: new BN(positionAmount * 10 ** positionCustody.decimals),
    side: side.toString() == "Long" ? TradeSide.Long : TradeSide.Short,
  };

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
    console.log(" pre instrucitons", preInstructions);
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
