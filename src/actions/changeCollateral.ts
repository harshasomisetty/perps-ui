import { PoolAccount } from "@/lib/PoolAccount";
import { PositionAccount } from "@/lib/PositionAccount";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { automaticSendTransaction } from "@/utils/dispatchTransaction";
import { BN } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, TransactionInstruction } from "@solana/web3.js";
import { Tab } from "@/lib/types";
import { TokenE } from "@/lib/Token";
import { wrapSolIfNeeded } from "@/utils/transactionHelpers";
import { WalletContextState } from "@solana/wallet-adapter-react";

export async function changeCollateral(
  walletContextState: WalletContextState,
  connection: Connection,
  pool: PoolAccount,
  position: PositionAccount,
  collateral: BN,
  tab: Tab
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(
    walletContextState
  );

  let publicKey = walletContextState.publicKey!;

  let custody = pool.getCustodyAccount(position.token)!;

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    custody.mint,
    publicKey
  );

  let preInstructions: TransactionInstruction[] = [];

  let methodBuilder;
  if (tab == Tab.Add) {
    if (position.token == TokenE.SOL) {
      let wrapInstructions = await wrapSolIfNeeded(
        publicKey,
        publicKey,
        connection,
        Number(collateral)
      );
      if (wrapInstructions) {
        preInstructions.push(...wrapInstructions);
      }
    }

    methodBuilder = perpetual_program.methods
      .addCollateral({
        collateral,
      })
      .accounts({
        owner: publicKey,
        fundingAccount: userCustodyTokenAccount, // user token account for custody token account
        transferAuthority: TRANSFER_AUTHORITY,
        perpetuals: PERPETUALS_ADDRESS,
        pool: pool.address,
        position: position.address,
        custody: custody.address,
        custodyOracleAccount: custody.oracle.oracleAccount,
        custodyTokenAccount: custody.tokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      });
  } else {
    let collateralUsd = collateral;
    methodBuilder = perpetual_program.methods
      .removeCollateral({
        collateralUsd,
      })
      .accounts({
        owner: publicKey,
        receivingAccount: userCustodyTokenAccount,
        transferAuthority: TRANSFER_AUTHORITY,
        perpetuals: PERPETUALS_ADDRESS,
        pool: pool.address,
        position: position.address,
        custody: custody.address,
        custodyOracleAccount: custody.oracle.oracleAccount,
        custodyTokenAccount: custody.tokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      });
  }

  if (preInstructions)
    methodBuilder = methodBuilder.preInstructions(preInstructions);

  try {
    await automaticSendTransaction(methodBuilder);
  } catch (err) {
    console.log(err);
    throw err;
  }
}
