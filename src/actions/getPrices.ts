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
  if (!base64String) {
    return 0;
  }
  console.log("running baseToDecimal", base64String);
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

  // try {
  //   let getEntryPriceTx = await perpetual_program.methods
  //     .getEntryPriceAndFee({
  //       new BN(collateral),
  //       new BN(size),
  //       side: side === "long" ? { long: {} } : { short: {} },
  //     })
  //     .accounts({
  //       signer: publicKey,
  //       perpetuals: perpetualsAddress,
  //       pool: pool.poolAddress,
  //       custody: pool.tokens[getTokenAddress(payToken)]?.custodyAccount,
  //       custodyOracleAccount:
  //         pool.tokens[getTokenAddress(payToken)]?.oracleAccount,
  //     })
  //     .transaction();

  //   transaction = transaction.add(getEntryPriceTx);
  //       let results = await connection.simulateTransaction(transaction, [
  //   perpsUser,
  // ]);

  // console.log("entry price", results.value.returnData?.data[0]);

  // } catch (err) {
  //   console.log(err);
  //   throw err;
  // }
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

    console.log("get liq price resultsf", results.value.returnData?.data[0]);

    let liqPrice = baseToDecimal(results.value.returnData?.data[0]) / 10 ** 8;

    console.log("liq price", liqPrice);
    return liqPrice;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getPnl(
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
    let getPnlTx = await perpetual_program.methods
      .getPnl({})
      .accounts({
        signer: perpsUser.publicKey,
        perpetuals: perpetualsAddress,
        pool: poolAddress,
        position: positionAddress,
        custody: custodyAddress,
        custodyOracleAccount: custodyOracleAddress,
      })
      .transaction();

    transaction = transaction.add(getPnlTx);

    let results = await connection.simulateTransaction(transaction, [
      perpsUser,
    ]);
    console.log("pnl results", results.value.returnData?.data[0]);

    let pnl = baseToDecimal(results.value.returnData?.data[0]) / 10 ** 8;

    console.log("pnl price", pnl);
    return pnl;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
