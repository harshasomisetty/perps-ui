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
  pool: PoolObj,
  wallet: Wallet,
  publicKey: PublicKey,
  connection: Connection,
  position: Position
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider();

  console.log("position", position);
  let transaction = new Transaction();

  try {
    let getLiqPriceTx = await perpetual_program.methods
      .getLiquidationPrice({})
      .accounts({
        signer: perpsUser.publicKey,
        perpetuals: perpetualsAddress,
        pool: position.poolAddress,
        position: position.positionAccountAddress,
        custody: pool.tokens[getTokenAddress(position.token)]?.custodyAccount,
        custodyOracleAccount:
          pool.tokens[getTokenAddress(position.token)]?.oracleAccount,
      })
      .transaction();

    transaction = transaction.add(getLiqPriceTx);

    let results = await connection.simulateTransaction(transaction, [
      perpsUser,
    ]);
    console.log("results", results.value.returnData?.data[0]);

    let base64String = results.value.returnData?.data[0];

    const binaryString = atob(base64String)
      .split("")
      .map(function (char) {
        return char.charCodeAt(0).toString(2).padStart(8, "0");
      })
      .join("");

    const decimalNumber = parseInt(binaryString, 2);

    console.log(decimalNumber);
    // TODO Check if this liq price conversion is correct
    let liqPrice = decimalNumber / 10 ** 8;

    console.log("liq price", liqPrice);
    return liqPrice;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
