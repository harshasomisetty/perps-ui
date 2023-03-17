import { PoolAccount } from "@/lib/PoolAccount";
import { PositionAccount } from "@/lib/PositionAccount";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
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
import { Tab } from "@/lib/types";
import { TokenE } from "@/lib/Token";
import { checkIfAccountExists } from "@/utils/retrieveData";

export async function changeCollateral(
  publicKey: PublicKey,
  wallet: Wallet,
  connection: Connection,
  signTransaction: SignerWalletAdapterProps["signAllTransactions"],
  pool: PoolAccount,
  position: PositionAccount,
  collateral: BN,
  tab: Tab
) {
  try {
    let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

    let custody = pool.getCustodyAccount(position.token)!;

    let userCustodyTokenAccount = await getAssociatedTokenAddress(
      custody.mint,
      publicKey
    );

    let transaction = new Transaction();

    if (tab == Tab.Add) {
      if (position.token == TokenE.SOL) {
        // assert tokenAmount is not 0

        console.log("pay token name is sol", custody.getTokenE());

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
        if (balance < Number(collateral)) {
          console.log("balance insufficient");
          transaction = transaction.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: associatedTokenAccount,
              lamports: Number(collateral)!,
            }),
            createSyncNativeInstruction(associatedTokenAccount)
          );
        }
      }

      let addCollateralTx = await perpetual_program.methods
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
        })
        .transaction();

      transaction = transaction.add(addCollateralTx);
    } else {
      let collateralUsd = collateral;
      let removeCollateralTx = await perpetual_program.methods
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
        })
        .transaction();
      transaction = transaction.add(removeCollateralTx);
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
