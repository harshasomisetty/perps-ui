import { TokenE } from "@/lib/Token";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { BN } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, TransactionInstruction } from "@solana/web3.js";
import { PoolAccount } from "@/lib/PoolAccount";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { createAtaIfNeeded, wrapSolIfNeeded } from "@/utils/transactionHelpers";
import { MethodsBuilder } from "@project-serum/anchor/dist/cjs/program/namespace/methods";
import {
  automaticSendTransaction,
  manualSendTransaction,
} from "@/utils/TransactionHandlers";

export async function buildSwapTransaction(
  walletContextState: WalletContextState,
  connection: Connection,
  pool: PoolAccount,
  topToken: TokenE,
  bottomToken: TokenE,
  amtInNumber: number,
  minAmtOutNumber?: number
  // @ts-ignore
): Promise<MethodsBuilder> {
  let { perpetual_program } = await getPerpetualProgramAndProvider(
    walletContextState
  );
  let publicKey = walletContextState.publicKey!;

  console.log("build swap 1");

  const receivingCustody = pool.getCustodyAccount(topToken)!;
  let fundingAccount = await getAssociatedTokenAddress(
    receivingCustody.mint,
    publicKey
  );

  const dispensingCustody = pool.getCustodyAccount(bottomToken)!;

  let receivingAccount = await getAssociatedTokenAddress(
    dispensingCustody.mint,
    publicKey
  );

  console.log("build swap 2");
  let preInstructions: TransactionInstruction[] = [];

  let ataIx = await createAtaIfNeeded(
    publicKey,
    publicKey,
    dispensingCustody.mint,
    connection
  );

  if (ataIx) preInstructions.push(ataIx);

  let ataIx1 = await createAtaIfNeeded(
    publicKey,
    publicKey,
    receivingCustody.mint,
    connection
  );

  if (ataIx1) preInstructions.push(ataIx1);

  console.log("build swap 3");
  if (receivingCustody.getTokenE() == TokenE.SOL) {
    let wrapInstructions = await wrapSolIfNeeded(
      publicKey,
      publicKey,
      connection,
      amtInNumber
    );
    if (wrapInstructions) {
      preInstructions.push(...wrapInstructions);
    }
  }
  console.log("build swap 4");

  let minAmountOut;
  if (minAmtOutNumber) {
    minAmountOut = new BN(minAmtOutNumber * 10 ** dispensingCustody.decimals)
      .mul(new BN(90))
      .div(new BN(100));
  } else {
    minAmountOut = new BN(amtInNumber * 10 ** dispensingCustody.decimals)
      .mul(new BN(90))
      .div(new BN(100));
  }

  let amountIn = new BN(amtInNumber * 10 ** dispensingCustody.decimals);
  console.log("min amoutn out", Number(minAmountOut));

  const params: any = {
    amountIn,
    minAmountOut,
  };

  console.log(
    "amout ins",
    amtInNumber,
    Number(amountIn),
    dispensingCustody.decimals,
    dispensingCustody.getTokenE()
  );

  let methodBuilder = perpetual_program.methods.swap(params).accounts({
    owner: publicKey,
    fundingAccount: fundingAccount,
    receivingAccount: receivingAccount,
    transferAuthority: TRANSFER_AUTHORITY,
    perpetuals: PERPETUALS_ADDRESS,
    pool: pool.address,

    receivingCustody: receivingCustody.address,
    receivingCustodyOracleAccount: receivingCustody.oracle.oracleAccount,
    receivingCustodyTokenAccount: receivingCustody.tokenAccount,

    dispensingCustody: dispensingCustody.address,
    dispensingCustodyOracleAccount: dispensingCustody.oracle.oracleAccount,
    dispensingCustodyTokenAccount: dispensingCustody.tokenAccount,

    tokenProgram: TOKEN_PROGRAM_ID,
  });
  console.log("build swap 5");

  if (preInstructions) {
    methodBuilder = methodBuilder.preInstructions(preInstructions);
  }
  console.log("build swap 6");

  return methodBuilder;
}

export async function swap(
  walletContextState: WalletContextState,
  connection: Connection,
  pool: PoolAccount,
  topToken: TokenE,
  bottomToken: TokenE,
  amtInNumber: number,
  minAmtOutNumber?: number
) {
  let methodBuilder = await buildSwapTransaction(
    walletContextState,
    connection,
    pool,
    topToken,
    bottomToken,
    amtInNumber,
    minAmtOutNumber
  );

  let publicKey = walletContextState.publicKey!;
  console.log("made swap buidler in SWAP");

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
