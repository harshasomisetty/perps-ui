import { TokenE } from "@/lib/Token";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import {
  automaticSendTransaction,
  manualSendTransaction,
} from "@/utils/dispatchTransaction";
import { checkIfAccountExists } from "@/utils/retrieveData";
import { BN, Wallet } from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { PoolAccount } from "@/lib/PoolAccount";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { createAtaIfNeeded } from "@/utils/transactionHelpers";

export async function buildSwapTransaction(
  walletContextState: WalletContextState,
  connection: Connection,
  pool: PoolAccount,
  topToken: TokenE,
  bottomToken: TokenE,
  amountIn: BN,
  minAmountOut: BN
): Promise<Transaction> {
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

  let transaction = new Transaction();

  let ataIx = await createAtaIfNeeded(
    publicKey,
    publicKey,
    dispensingCustody.mint,
    connection
  );

  if (ataIx) transaction = transaction.add(ataIx);

  let ataIx1 = await createAtaIfNeeded(
    publicKey,
    publicKey,
    receivingCustody.mint,
    connection
  );

  if (ataIx1) transaction = transaction.add(ataIx1);

  // if (!(await checkIfAccountExists(receivingAccount, connection))) {
  //   transaction = transaction.add(
  //     createAssociatedTokenAccountInstruction(
  //       publicKey,
  //       receivingAccount,
  //       publicKey,
  //       dispensingCustody.mint
  //     )
  //   );
  // }

  // if (!(await checkIfAccountExists(fundingAccount, connection))) {
  //   transaction = transaction.add(
  //     createAssociatedTokenAccountInstruction(
  //       publicKey,
  //       fundingAccount,
  //       publicKey,
  //       receivingCustody.mint
  //     )
  //   );
  // }

  if (receivingCustody.getTokenE() == TokenE.SOL) {
    // assert tokenAmount is not 0

    console.log("pay token name is sol", receivingCustody.getTokenE());

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
    if (balance < Number(amountIn)!) {
      console.log("balance insufficient");
      transaction = transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: associatedTokenAccount,
          lamports: Number(amountIn)!,
        }),
        createSyncNativeInstruction(associatedTokenAccount)
      );
    }
  }

  const params: any = {
    amountIn,
    minAmountOut,
  };

  let swapTx = await perpetual_program.methods
    .swap(params)
    .accounts({
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
    })
    .transaction();
  transaction = transaction.add(swapTx);

  return transaction;
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
