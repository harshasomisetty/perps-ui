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
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Side, TradeSide } from "@/lib/types";
import { CustodyAccount } from "@/lib/CustodyAccount";
import { PoolAccount } from "@/lib/PoolAccount";
import { wrapSolIfNeeded } from "@/utils/transactionHelpers";
import { automaticSendTransaction } from "@/utils/dispatchTransaction";
import { buildSwapTransaction } from "src/actions/swap";

export async function openPosition(
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
  let { perpetual_program } = await getPerpetualProgramAndProvider(
    walletContextState
  );

  console.log("in open pos");
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

  // TODO SWAP IF PAY != POSITION TOKEN
  let swapBuilder;
  let ix;

  console.log("pre if");

  let preInstructions: TransactionInstruction[] = [];

  if (payCustody.getTokenE() != positionCustody.getTokenE()) {
    console.log("in swap needed");
    swapBuilder = await buildSwapTransaction(
      walletContextState,
      connection,
      pool,
      payCustody.getTokenE(),
      positionCustody.getTokenE(),
      new BN(payAmount * 10 ** payCustody.decimals),
      new BN(positionAmount * 10 ** positionCustody.decimals)
    );
    // calculate how much position token value is new payAmount
    // open position using new payAmount

    ix = await swapBuilder.instruction();
    preInstructions.push(ix);
  }

  if (positionCustody.getTokenE() == TokenE.SOL) {
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
  }

  try {
    await automaticSendTransaction(methodBuilder);
  } catch (err) {
    console.log(err);
    throw err;
  }
}
