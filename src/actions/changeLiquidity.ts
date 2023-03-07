import { getTokenAddress, TokenE } from "src/types/Token";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { checkIfAccountExists } from "@/utils/retrieveData";
import { BN } from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Wallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export async function changeLiquidity(
  pool: Pool,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps["signAllTransactions"],
  connection: Connection,
  payToken: TokenE,
  tokenAmount?: number,
  liquidityAmount?: number
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  let lpTokenAccount = await getAssociatedTokenAddress(
    pool.lpTokenMint,
    publicKey
  );

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    pool.tokens[getTokenAddress(payToken)]?.mintAccount!,
    publicKey
  );

  let transaction = new Transaction();

  try {
    if (!(await checkIfAccountExists(lpTokenAccount, connection))) {
      transaction = transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          lpTokenAccount,
          publicKey,
          pool.lpTokenMint
        )
      );
    }

    if (payToken == TokenE.SOL) {
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
      if (balance < tokenAmount * LAMPORTS_PER_SOL) {
        console.log("balance insufficient");
        transaction = transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: associatedTokenAccount,
            lamports: tokenAmount * LAMPORTS_PER_SOL,
          }),
          createSyncNativeInstruction(associatedTokenAccount)
        );
      }
    }

    console.log("custodies", pool.custodyMetas);
    if (tokenAmount) {
      console.log("in add liq", tokenAmount);
      let amount;
      if (payToken === TokenE.SOL) {
        amount = new BN(tokenAmount * LAMPORTS_PER_SOL);
      } else {
        amount = new BN(
          tokenAmount * 10 ** pool.tokens[getTokenAddress(payToken)]?.decimals
        );
      }
      console.log(
        "sending add",
        pool.tokens[getTokenAddress(payToken)]?.oracleAccount.toString()
      );
      let addLiquidityTx = await perpetual_program.methods
        .addLiquidity({ amount })
        .accounts({
          owner: publicKey,
          fundingAccount: userCustodyTokenAccount, // user token account for custody token account
          lpTokenAccount,
          transferAuthority: TRANSFER_AUTHORITY,
          perpetuals: PERPETUALS_ADDRESS,
          pool: pool.poolAddress,
          custody: pool.tokens[getTokenAddress(payToken)]?.custodyAccount,
          custodyOracleAccount:
            pool.tokens[getTokenAddress(payToken)]?.oracleAccount,
          custodyTokenAccount:
            pool.tokens[getTokenAddress(payToken)]?.tokenAccount,
          lpTokenMint: pool.lpTokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .remainingAccounts(pool.custodyMetas)
        .transaction();
      transaction = transaction.add(addLiquidityTx);
    } else if (liquidityAmount) {
      let lpAmount = new BN(liquidityAmount * 10 ** pool.lpDecimals);
      let removeLiquidityTx = await perpetual_program.methods
        .removeLiquidity({ lpAmount })
        .accounts({
          owner: publicKey,
          receivingAccount: userCustodyTokenAccount, // user token account for custody token account
          lpTokenAccount,
          transferAuthority: TRANSFER_AUTHORITY,
          perpetuals: PERPETUALS_ADDRESS,
          pool: pool.poolAddress,
          custody: pool.tokens[getTokenAddress(payToken)]?.custodyAccount,
          custodyOracleAccount:
            pool.tokens[getTokenAddress(payToken)]?.oracleAccount,
          custodyTokenAccount:
            pool.tokens[getTokenAddress(payToken)]?.tokenAccount,
          lpTokenMint: pool.lpTokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .remainingAccounts(pool.custodyMetas)
        .transaction();
      transaction = transaction.add(removeLiquidityTx);
    }

    console.log("add liquidity tx", transaction);
    console.log("tx keys");

    if (transaction.instructions.length > 0) {
      for (let i = 0; i < transaction.instructions[0]!.keys.length; i++) {
        console.log(
          "key",
          i,
          transaction.instructions[0]!.keys[i]?.pubkey.toString()
        );
      }
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
