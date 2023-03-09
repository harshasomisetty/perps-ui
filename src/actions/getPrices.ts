import { CustodyAccount } from "@/lib/CustodyAccount";
import { PositionAccount } from "@/lib/PositionAccount";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  DEFAULT_PERPS_USER,
} from "@/utils/constants";
import { Connection, Transaction } from "@solana/web3.js";
import { IDL } from "@/target/types/perpetuals";

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

export async function getLiquidationPrice(
  connection: Connection,
  position: PositionAccount,
  custody: CustodyAccount
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider();

  let transaction = new Transaction();

  try {
    let getLiqPriceTx = await perpetual_program.methods
      .getLiquidationPrice({})
      .accounts({
        signer: DEFAULT_PERPS_USER.publicKey,
        perpetuals: PERPETUALS_ADDRESS,
        pool: position.pool,
        position: position.address,
        custody: position.custody,
        custodyOracleAccount: custody.oracle.oracleAccount,
      })
      .transaction();

    transaction = transaction.add(getLiqPriceTx);

    let results = await connection.simulateTransaction(transaction, [
      DEFAULT_PERPS_USER,
    ]);

    const index = IDL.instructions.findIndex(
      (f) => f.name === "getLiquidationPrice"
    );
    let logs = this.decodeLogs(result, index);
    console.log("logs");

    let liqPrice = baseToDecimal(results.value.returnData?.data[0]) / 10 ** 8;

    console.log("liq price", liqPrice);
    return liqPrice;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getPnl(
  connection: Connection,
  position: PositionAccount,
  custody: CustodyAccount
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider();

  let transaction = new Transaction();

  try {
    let getPnlTx = await perpetual_program.methods
      .getPnl({})
      .accounts({
        signer: DEFAULT_PERPS_USER.publicKey,
        perpetuals: PERPETUALS_ADDRESS,
        pool: position.pool,
        position: position.address,
        custody: position.custody,
        custodyOracleAccount: custody.oracle.oracleAccount,
      })
      .transaction();

    transaction = transaction.add(getPnlTx);

    let results = await connection.simulateTransaction(transaction, [
      DEFAULT_PERPS_USER,
    ]);

    let pnl = baseToDecimal(results.value.returnData?.data[0]) / 10 ** 8;

    return pnl;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
