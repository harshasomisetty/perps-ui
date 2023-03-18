import { TokenE } from "@/lib/Token";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { automaticSendTransaction } from "@/utils/dispatchTransaction";
import { BN } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, TransactionInstruction } from "@solana/web3.js";
import { PoolAccount } from "@/lib/PoolAccount";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { createAtaIfNeeded, wrapSolIfNeeded } from "@/utils/transactionHelpers";
import { MethodsBuilder } from "@project-serum/anchor/dist/cjs/program/namespace/methods";

export async function buildSwapTransaction(
  walletContextState: WalletContextState,
  connection: Connection,
  pool: PoolAccount,
  topToken: TokenE,
  bottomToken: TokenE,
  amountIn: BN,
  minAmountOut: BN
): Promise<MethodsBuilder> {
  let { perpetual_program } = await getPerpetualProgramAndProvider(
    walletContextState
  );
  let publicKey = walletContextState.publicKey!;

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

  if (receivingCustody.getTokenE() == TokenE.SOL) {
    let wrapInstructions = await wrapSolIfNeeded(
      publicKey,
      publicKey,
      connection,
      Number(amountIn)
    );
    if (wrapInstructions) {
      preInstructions.push(...wrapInstructions);
    }
  }

  const params: any = {
    amountIn,
    minAmountOut,
  };

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

  if (preInstructions) {
    methodBuilder = methodBuilder.preInstructions(preInstructions);
  }

  return methodBuilder;
}

export async function swap(
  walletContextState: WalletContextState,
  connection: Connection,
  pool: PoolAccount,
  topToken: TokenE,
  bottomToken: TokenE,
  amountIn: BN,
  minAmountOut: BN
) {
  let methodBuilder = await buildSwapTransaction(
    walletContextState,
    connection,
    pool,
    topToken,
    bottomToken,
    amountIn,
    minAmountOut
  );

  try {
    await automaticSendTransaction(methodBuilder);
  } catch (err) {
    console.log(err);
    throw err;
  }
}
