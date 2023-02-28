import useProgram from "@/hooks/useProgram";
import { Pool, PoolObj } from "@/lib/Pool";
import { Position } from "@/lib/Position";
import { getTokenAddress, Token } from "@/lib/Token";
import {
  getPerpetualProgramAndProvider,
  perpetualsAddress,
  perpsUser,
} from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { BN, Wallet } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

function baseToDecimal(base64String: string) {
  const binaryString = atob(base64String)
    .split("")
    .map(function (char) {
      return char.charCodeAt(0).toString(2).padStart(8, "0");
    })
    .join("");

  return parseInt(binaryString, 2);
}

export async function getEntryPrice(
  pool: Pool,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps["signAllTransactions"],
  connection: Connection,
  collateral: number,
  size: number,
  side: string,
  payToken: Token
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  let transaction = new Transaction();

  //   try {
  //     let getEntryPriceTx = await perpetual_program.methods
  //       .getEntryPriceAndFee({
  //         new BN(collateral),
  //         new BN(size),
  //         side: side === "long" ? { long: {} } : { short: {} },
  //       })
  //       .accounts({
  //         signer: publicKey,
  //         perpetuals: perpetualsAddress,
  //         pool: pool.poolAddress,
  //         custody: pool.tokens[getTokenAddress(payToken)]?.custodyAccount,
  //         custodyOracleAccount:
  //           pool.tokens[getTokenAddress(payToken)]?.oracleAccount,
  //       })
  //       .transaction();

  //     transaction = transaction.add(getEntryPriceTx);

  //     if (transaction.instructions.length > 0) {
  //       for (let i = 0; i < transaction.instructions[0]!.keys.length; i++) {
  //         console.log(
  //           "key",
  //           i,
  //           transaction.instructions[0]!.keys[i]?.pubkey.toString()
  //         );
  //       }
  //     }
  //     await manualSendTransaction(
  //       transaction,
  //       publicKey,
  //       connection,
  //       signTransaction
  //     );
  //   } catch (err) {
  //     console.log(err);
  //     throw err;
  //   }
}

export async function getLiquidationPrice(
  wallet: Wallet,
  publicKey: PublicKey,
  connection: Connection,
  poolAddress: PublicKey,
  positionAddress: PublicKey,
  custodyAddress: PublicKey,
  custodyOracleAddress: PublicKey
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider();

  let transaction = new Transaction();

  try {
    let getLiqPriceTx = await perpetual_program.methods
      .getLiquidationPrice({})
      .accounts({
        signer: perpsUser.publicKey,
        perpetuals: perpetualsAddress,
        pool: poolAddress,
        position: positionAddress,
        custody: custodyAddress,
        custodyOracleAccount: custodyOracleAddress,
      })
      .transaction();

    transaction = transaction.add(getLiqPriceTx);

    let results = await connection.simulateTransaction(transaction, [
      perpsUser,
    ]);

    let liqPrice = baseToDecimal(results.value.returnData?.data[0]) / 10 ** 8;

    console.log("liq price", liqPrice);
    return liqPrice;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
